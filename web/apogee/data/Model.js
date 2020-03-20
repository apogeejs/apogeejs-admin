import base from "/apogeeutil/base.js";
import FieldObject from "/apogeeutil/FieldObject.js";
import EventManager from "/apogeeutil/EventManager.js";
import ContextManager from "/apogee/lib/ContextManager.js";
import ContextHolder from "/apogee/datacomponents/ContextHolder.js";
import Owner from "/apogee/datacomponents/Owner.js";
import RootHolder from "/apogee/datacomponents/RootHolder.js";

/** This is the model. Typically owner should be null. It
 * is used for creating virtual models. 
 * - optionalJson - For new models this can be empty. If we are deserializing an existing
 * model, the json for it goes here.
 * - optionalContextOwner - This is used if the model should be placed in a context. This is 
 * used for the virtual model created for folder functions, so the folder function can 
 * access variables from the larger model.
 * */
export default class Model extends FieldObject {

    constructor(optionalContextOwner) {
        //base init
        super("model");

        //mixin initialization
        this.eventManagerMixinInit();
        this.contextHolderMixinInit();
        
        // This is a queue to hold actions while one is in process.
        this.actionInProgress = false;
        this.messengerActionList = [];
        this.consecutiveActionCount = 0;
        this.activeConsecutiveActionLimit = Model.CONSECUTIVE_ACTION_INITIAL_LIMIT;

        //&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&
        //fields
        this.setField("name",Model.DEFAULT_MODEL_NAME);
        if(optionalContextOwner) {
            this.setField("owner",optionalContextOwner);
        }

        this.setField("impactsMap",{});

        //create the member map, with the model included
        let memberMap = {};
        memberMap[this.getId()] = this;
        this.setField("memberMap",memberMap);

        //this holds the base objects, mapped by name
        this.setField("childMap",{});
        //&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&

        //&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&
        //Working
        this.workingImpactsMap = null;
        this.workingMemberMap = null;
        //&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&
    }

    /** This method returns the root object - implemented from RootHolder.  */
    setName(name) {
        this.setField("name",name);
    }

    /** This method returns the root object - implemented from RootHolder.  */
    getName() {
        return this.getField("name");
    }

    /** this method gets the table map. */
    getChildMap() {
        return this.getField("childMap");
    }

    // Must be implemented in extending object
    /** This method looks up a child from this folder.  */
    lookupChild = function(name) {
        //check look for object in this folder
        let childMap = this.getField("childMap");
        return childMap[name];
    }

    /** This method adds the child to this parent. 
    * It will fail if the name already exists.  */
    addChild = function(model,child) {
        //check if it exists first
        let name = child.getName();
        let childMap = this.getField("childMap");
        if(childMap[name]) {
            //already exists! not fatal since it is not added to the model yet,
            throw base.createError("There is already an object with the given name.",false);
        }

        //make a copy of the child map to modify
        let newChildMap = {};
        Object.assign(newChildMap,childMap);

        //add object
        newChildMap[name] = child;
        this.setField("childMap",newChildMap);
    }

    /** This method removes this child from this parent.  */
    removeChild = function(model,child) {
        //make sure this is a child of this object
        var owner = child.getOwner(model);
        if((!owner)||(owner !== this)) return;
        
        //remove from folder
        var name = child.getName();
        let childMap = this.getField("childMap");
        //make a copy of the child map to modify
        let newChildMap = {};
        Object.assign(newChildMap,childMap);
        
        delete(newChildMap[name]);
        this.setField("childMap",newChildMap);
    }

    /** This allows for a model to have a parent. For a normal model this should be null. 
     * This is used for finding variables in scope. */
    getOwner(model) {
        return this.getField("owner");
    }

    /** This method updates the dependencies of any children
     * based on an object being added. */
    updateDependeciesForModelChange(additionalUpdatedMembers) {
        //call update in children
        let childMap = this.getField("childMap");
        for(var key in childMap) {
            var child = childMap[key];
            if(child.isDependent) {
                child.updateDependeciesForModelChange(this,additionalUpdatedMembers);
            }
        }
    }

    /** This method removes any data from this model on closing. */
    onClose() {
        //call update in children
        let childMap = this.getField("childMap");
        for(var key in childMap) {
            var child = childMap[key];
            if(child.onClose) {
                child.onClose();
            }
        }
    }

    //------------------------------
    // Queded Action Methods
    //------------------------------

    /** This function triggers the action for the queued action to be run when the current thread exits. */
    isActionInProgress() {
        return this.actionInProgress;
    }

    setActionInProgress(inProgress) {
        this.actionInProgress = inProgress;
    }

    saveMessengerAction(actionInfo) {
        this.messengerActionList.push(actionInfo);
    }

    getSavedMessengerAction() {
        if(this.messengerActionList.length > 0) {
            var actionData = {};
            actionData.action = "compoundAction";
            actionData.actions = this.messengerActionList;
            this.messengerActionList = []
            return actionData;
        }
        else {
            return null;
        }
    }

    /** This method should be called for each consecutive queued action. It checks it if there are 
     * too many. If so, it returns true. In so doing, it also backs of the consecutive queued 
     * action count so next time it will take longer. Any call to clearConsecutiveQueuedActionCount
     * will return it to the default initial value.
     */
    checkConsecutiveQueuedActionLimitExceeded() {
        this.consecutiveActionCount++;
        
        //check the limit
        var exceedsLimit = (this.consecutiveActionCount > this.activeConsecutiveActionLimit);
        if(exceedsLimit) {
            //back off limit for next time
            this.activeConsecutiveActionLimit *= 2;
        }
        
        return exceedsLimit;
    }

    /** This should be called wo abort any queued actions. */
    setCalculationCanceled() {
        //reset queued action variables
        this.clearCommandQueue();
        
        alert("The tables are left in improper state because the calculation was aborted. :( ");
    }

    /** This should be called when there is not a queued action. */
    clearConsecutiveQueuedTracking() {
        this.consecutiveActionCount = 0;
        this.activeConsecutiveActionLimit = Model.CONSECUTIVE_ACTION_INITIAL_LIMIT;
    }

    /** This method resets the command queue */
    clearCommandQueue() {
        //reset queued action variables
        this.messengerActionList = [];
        this.clearConsecutiveQueuedTracking();
    }


    //------------------------------
    // Owner Methods
    //------------------------------

    /** this method is implemented for the Owner component/mixin. */
    getModel() {
        return this;
    }

    /** this method gets the hame the children inherit for the full name. */
    getPossesionNameBase(model) {
        //the name starts over at a new model
        return "";
    }

    /** This method looks up a member by its full name.  If the optionalParentMemberList is passed
     * in, it will be populated with any parent members on the path.*/
    lookupChildFromPathArray = function(path,startElement,optionalParentMemberList) {
        if(startElement === undefined) startElement = 0;
        
        var childMember = this.lookupChild(path[startElement]);
        if(!childMember) return undefined;
        
        if(startElement < path.length-1) {
            if((childMember.isParent)||(childMember.isOwner)) {
                let grandChildMember = childMember.lookupChildFromPathArray(path,startElement+1,optionalParentMemberList);
                //record the parent path, if requested
                if((grandChildMember)&&(optionalParentMemberList)) {
                    optionalParentMemberList.push(childMember);
                }
                return grandChildMember;
            }
            else {
                return childMember;
            }
        }
        else {
            return childMember;
        }
    }

    //------------------------------
    //ContextHolder methods
    //------------------------------

    /** This method retrieve creates the loaded context manager. */
    createContextManager() {
        //set the context manager
        var contextManager = new ContextManager(this);
        
        //if no owner is defined for the model - the standard scenario, we will
        //add all global variables as a data entry for the context, so these variables
        //can be called from the model. 
        let owner = this.getField("owner");
        if(!owner) {
            var globalVarEntry = {};
            globalVarEntry.data = __globals__;
            contextManager.addToContextList(globalVarEntry);
        }
        //if there is an owner defined, the context manager for the owner will be used
        //to lokoup variables. This is done for a folder function, so that it has
        //access to other variables in the model.
        
        return contextManager;
    }

    //============================
    // MemberMap Functions
    //============================

    lookupMemberById(memberId) {
        let memberMap = this._getMemberMap()
        return memberMap[memberId];
    }

    registerMember(member) {
        if(!this.workingMemberMap) {
            this._populateWorkingMemberMap();
        }

        this.workingMemberMap[member.getId()] = member;
    }

    finalizeMemberMap() {
        if(this.workingMemberMap) {
            this.setField("memberMap");
            this.workingMemberMap = null;
        }
    }

    _getMemberMap() {
        return this.workingMemberMap ? this.workingMemberMap : this.getField("memberMap");
    }

    /** This method makes a mutable copy of the member map, and places it in the working member map. */
    _populateWorkingMemberMap() {
        let memberMap = this.getField("memberMap");
        let newMemberMap = {};
        Object.assign(newMemberMap,memberMap);
        this.workingMemberMap = newMemberMap;
    }

    //============================
    // Impact List Functions
    //============================

    /** This returns an array of members this member impacts. */
    getImpactsList(member) {
        let impactsMap = this.getField("impactsMap");
        let impactsList = impactsMap[member.getId()];
        if(!impactsList) impactsList = [];
        return impactsList;
    }

    /** This shoudl be called after all dependencies have been updated to store the
     * impacts map (We kept a mutable working copy during construction for efficiency)  */
    finalizeImpactsMap() {
        if(this.workingImpactsMap) {
            this.setField("impactsMap",this.workingImpactsMap);
            this.workingImpactsMap = null;
        } 
    }

    
    /** This method adds a data member to the imapacts list for this node.
     * The return value is true if the member was added and false if it was already there. 
     * NOTE: the member ID can be a string or integer. This dependentMemberId should be an int. */
    addToImpactsList(depedentMemberId,memberId) {
        //don't let a member impact itself
        if(memberId === depedentMemberId) return;

        let workingMemberImpactsList = this.getWorkingMemberImpactsList(memberId);

        //add to the list iff it is not already there
        if(workingMemberImpactsList.indexOf(depedentMemberId) === -1) {
            workingMemberImpactsList.push(depedentMemberId);
            return true;
        }
        else {
            return false;
        }
    }

    /** This method removes a data member from the imapacts list for this node. */
    removeFromImpactsList(depedentMemberId,memberId) {

        let workingMemberImpactsList = this.getWorkingMemberImpactsList(memberId);

        //it should appear only once
        for(var i = 0; i < workingMemberImpactsList.length; i++) {
            if(workingMemberImpactsList[i] == depedentMemberId) {
                workingMemberImpactsList.splice(i,1);
                return;
            }
        }
    }
    
    /** This gets a edittable copy of a member impacts list.  */
    getWorkingMemberImpactsList(memberId) {
        //make sure our working impacts map is populated
        //we will use this wile buildign the impacts map and then set the impacts map field
        if(!this.workingImpactsMap) {
            this._populateWorkingImpactsMap();
        }

        let memberImpactsList = this.workingImpactsMap[memberId];
        if(!memberImpactsList) {
            memberImpactsList = [];
            this.workingImpactsMap[memberId] = memberImpactsList;
        }

        return memberImpactsList;
    }

    /** This method will load a mutable copy of the impacts map field to be used
     * when we update the impacts map. We use a working variable since the reconstruction
     * spans many calls to the add/remove function. In the copy, it makes a shallow copy of 
     * each impacts list in the map. */
    _populateWorkingImpactsMap() {
        let impactsMap = this.getField("impactsMap");
        let newImpactsMap = {};
        for(let idString in impactsMap) {
            let impactsList = impactsMap[idString];
            //shallow copy each array
            newImpactsMap[idString] = [...impactsList];
        }
        this.workingImpactsMap = newImpactsMap;
    }

    //============================
    // Save and Load Functions
    //============================

    /** This saves the model */
    toJson() {
        let json = {};
        json.fileType = Model.SAVE_FILE_TYPE;
        json.version = Model.SAVE_FILE_VERSION;

        json.name = this.getField("name");
        json.children = {};
        let childMap = this.getField("childMap");
        for(var key in childMap) {
            var child = childMap[key];
            json.children[key] = child.toJson();
        }

        return json;
    }

    /** This method creates a headless model json from a folder json. It
     * is used in the folder function. */
    static createModelJsonFromFolderJson(name,folderJson) {
        let json = {};
        json.fileType = Model.SAVE_FILE_TYPE;
        json.version = Model.SAVE_FILE_VERSION;

        //let the workspace inherit the folder name
        json.name = name;
        json.children = {};

        //attach a single child named main
        json.children.Main = folderJson;

        return json
    }

    //================================
    // Member generator functions
    //================================

    /** This methods retrieves the member generator for the given type. */
    static getMemberGenerator(type) {
        return memberGenerators[type];
    }

    /** This method registers the member generator for a given named type. */
    static addMemberGenerator(generator) {
        memberGenerators[generator.type] = generator;
    }

}

//add mixins to this class
base.mixin(Model,EventManager);
base.mixin(Model,ContextHolder);
base.mixin(Model,Owner);
base.mixin(Model,RootHolder);

let memberGenerators = {};

Model.DEFAULT_MODEL_NAME = "Workspace";
Model.ROOT_FOLDER_NAME = "Main";

/** This is the supported file type. */
Model.SAVE_FILE_TYPE = "apogee model";

/** This is the supported file version. */
Model.SAVE_FILE_VERSION = 0.2;

Model.CONSECUTIVE_ACTION_INITIAL_LIMIT = 500;

Model.EMPTY_MODEL_JSON = {
    "fileType": "apogee model",
    "version": 0.2,
    "name": Model.DEFAULT_MODEL_NAME,
    "children": {
        "Main": {
            "name": "Main",
            "type": "apogee.Folder"
        }
    }
}

