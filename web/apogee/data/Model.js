import apogeeutil from "/apogeeutil/apogeeUtilLib.js";
import {EventManager,FieldObject} from "/apogeeutil/apogeeBaseLib.js";
import ContextManager from "/apogee/lib/ContextManager.js";
import ContextHolder from "/apogee/datacomponents/ContextHolder.js";
import Parent from "/apogee/datacomponents/Parent.js";

/** This is the model. 
 * -instanceToCopy - if the new instance should be a copy of an existing instance, this
 * argument should be populated. The copy will have the same field values but it will be unlocked 
 * and by default the update fields will be cleared. The event listeners are also cleared.
 * - keepUpdatedFixed - If this argument is set to true, the updated field values will be maintained.
 * */
export default class Model extends FieldObject {

    constructor(runContext,instanceToCopy,keepUpdatedFixed) {
        //base init
        super("model",instanceToCopy,keepUpdatedFixed);

        //mixin initialization
        this.eventManagerMixinInit();
        //this is a root for the context
        this.contextHolderMixinInit(true);
        this.parentMixinInit(instanceToCopy);

        this.runContext = runContext;

        //==============
        //Fields
        //==============
        //Initailize these if this is a new instance
        if(!instanceToCopy) {
            this.setField("name",Model.DEFAULT_MODEL_NAME);
            this.setField("impactsMap",{});
            //create the member map, with the model included
            let memberMap = {};
            memberMap[this.getId()] = this;
            this.setField("memberMap",memberMap);
        }

        //==============
        //Working variables
        //==============
        this.workingImpactsMap = null;
        this.workingMemberMap = null;
        this.workingChangeMap = {};

        //add a change map entry for this object
        this.workingChangeMap[this.getId()] = {action: instanceToCopy ? "updated" : "created", instance: this};

        // This is a queue to hold actions while one is in process.
        this.actionInProgress = false;
        this.messengerActionList = [];
        this.consecutiveActionCount = 0;
        this.activeConsecutiveActionLimit = Model.CONSECUTIVE_ACTION_INITIAL_LIMIT;
    }

    /** This method returns a mutable copy of this instance. If the instance is already mutable
     * it will be returned rather than making a new one.  */
    getMutableModel() {
        if(this.getIsLocked()) {
            //create a new instance that is a copy of this one
            let newModel = new Model(this.runContext,this);

            //update the member map for the new model
            let newMemberMap = {};
            let oldMemberMap = newModel.getField("memberMap");
            Object.assign(newMemberMap,oldMemberMap);
            newMemberMap[newModel.getId()] = newModel;
            newModel.setField("memberMap",newMemberMap);

            return newModel;
        }
        else {
            //return this instance since it si already unlocked
            return this;
        }
    }

    /** This gets a copy of the model where any unlocked members are replaced with new instance copies.
     * This ensures if we look up a mutable member from here we get a different instance from what was 
     * in our original model instance. */
    getCleanCopy(newRunContext) {
        let newModel = new Model(newRunContext,this);

        //update the member map for the new model
        let oldMemberMap = this.getField("memberMap");

        newModel._populateWorkingMemberMap();
        newModel.workingMemberMap[newModel.getId()] = newModel;

        for(let memberId in oldMemberMap) {
            let member = oldMemberMap[memberId];
            if((member != this)&&(!member.getIsLocked())) {
                //create a new copy of the member and register it.
                let newMember = new member.constructor(member.getName(),member);
                newModel.workingMemberMap[newMember.getId()] = newMember;
            }
        }

        return newModel;
    }

    /** This method locks all member instances and the model instance. */
    lockAll() {
        //clear up working fields
        this.workingChangeMap = null;

        //make sure the other working fields have been saved
        if(this.workingImpactsMap) this.finalizeImpactsMap();
        if(this.workingMemberMap) this.finalizeMemberMap();

        //member map includes all members and the model
        let memberMap = this.getField("memberMap");
        for(let id in memberMap) {
            //this will lock the model too
            //we maybe shouldn't be modifying the members in place, but we will do it anyway
            memberMap[id].lock();
        }
    }

    /** This completes any lazy initialization. This must be done before the model and the members are locked. 
     * Any member not yet initialized would be a lazy initialize function that was neever called. */
    completeLazyInitialization() {
        //member map includes all members and the model
        let memberMap = this.getField("memberMap");
        for(let id in memberMap) {
            let member = memberMap[id];
            if(member.lazyInitializeIfNeeded) {
                member.lazyInitializeIfNeeded();
            }
        }
    }

    /** This shoudl be called after all dependencies have been updated to store the
     * impacts map (We kept a mutable working copy during construction for efficiency)  */
    finalizeImpactsMap() {
        if(this.workingImpactsMap) {
            this.setField("impactsMap",this.workingImpactsMap);
            this.workingImpactsMap = null;
        } 
    }

    finalizeMemberMap() {
        if(this.workingMemberMap) {
            this.setField("memberMap",this.workingMemberMap);
            this.workingMemberMap = null;
        }
    }

    /** This returns a map of the changes to the model. It is only valid while the 
     * model instance is unlocked. */
    getChangeMap() {
        return this.workingChangeMap;
    }

    /** This function should be used to execute any action that is run asynchronously with the current
     * action. The action is run on a model and it is uncertain whether the existing model will still be 
     * current when this new action is run. An example of when this is used is to populate a data table in
     * response to a json request completing.  */
    doFutureAction(actionData) {
        //run this action asynchronously
        this.runContext.doAsynchActionCommand(this.getId(),actionData);
    }

    /** This method returns the root object - implemented from RootHolder.  */
    setName(name) {
        this.setField("name",name);
    }

    /** This method returns the root object - implemented from RootHolder.  */
    getName() {
        return this.getField("name");
    }

    /** This method updates the dependencies of any children
     * based on an object being added. */
    updateDependeciesForModelChange(additionalUpdatedMembers) {
        //call update in children
        let childIdMap = this.getChildIdMap();
        for(var name in childIdMap) {
            var childId = childIdMap[name];
            let child = this.lookupMemberById(childId);
            if((child)&&(child.isDependent)) {
                child.updateDependeciesForModelChange(this,additionalUpdatedMembers);
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
    // Parent Methods
    //------------------------------

    /** this method gets the hame the children inherit for the full name. */
    getPossesionNameBase(model) {
        //the name starts over at a new model
        return "";
    }

    //------------------------------
    //ContextHolder methods
    //------------------------------

    /** This method retrieve creates the loaded context manager. */
    createContextManager() {
        //set the context manager
        var contextManager = new ContextManager(this);

        //add an entry for this folder. This is for multiple folders in the model base
        //which as of the time of this comment we don't have but plan on adding
        //(at which time this comment will probably be left in by accident...)
        var myEntry = {};
        myEntry.contextHolderAsParent = true;
        contextManager.addToContextList(myEntry);
        
        return contextManager;
    }

    //============================
    // MemberMap Functions
    //============================

    lookupMemberById(memberId) {
        let memberMap = this._getMemberMap()
        return memberMap[memberId];
    }

    /** This method returns a mutable member for the given ID. If the member is already unlocked, that member will be
     * returned. Otherwise a copy of the member will be made and stored as the active instance for the member ID.  */
    getMutableMember(memberId) {
        if(this.getIsLocked()) throw new Error("The model must be unlocked to get a mutable member.");

        let member = this.lookupMemberById(memberId);
        if(member) {
            if(member.getIsLocked()) {
                //create a unlocked copy of the member
                let newMember = new member.constructor(member.getName(),member);

                //update the saved copy of this member in the member map
                this.registerMember(newMember);
                return newMember;
            }
            else {
                return member;
            }
        }
        else {
            return null;
        }
    }

    registerMember(member) {
        if(!this.workingMemberMap) {
            this._populateWorkingMemberMap();
        }

        let memberId = member.getId();

        //update the change map for this member change
        let changeMapEntry = this.workingChangeMap[memberId];
        if(!changeMapEntry) {
            //if it already existed we don't need to change it (that means it was a create and we want to keep that)
            //otherwise add a new entry
            if(this.workingMemberMap[memberId]) {
                //this is an update
                this.workingChangeMap[memberId] = {action: "updated", instance: member};
            }
            else {
                //this is a create
                this.workingChangeMap[memberId] = {action: "created", instance: member};
            }
        }

        //add or update the member in the working member map
        this.workingMemberMap[memberId] = member;
    }

    unregisterMember(member) {
        if(!this.workingMemberMap) {
            this._populateWorkingMemberMap();
        }

        let memberId = member.getId();

        //update the change map for this member change
        let changeMapEntry = this.workingChangeMap[memberId];
        if(changeMapEntry) {
            if(changeMapEntry.action == "updated") {
                changeMapEntry.action = "deleted";
            }
            else if(changeMapEntry.action == "created") {
                //these cancel! however, we will keep the entry around and label
                //it as "transient", in case we get another entry for this member
                //I don't think we should get on after delete, but just in case
                changeMapEntry.action = "transient";
            }
            else if(changeMapEntry.action == "transient") {
                //no action
            }
            else {
                //this shouldn't happen. We will just mark it as delete
                changeMapEntry.action = "deleted"
            }
        }
        else {
            changeMapEntry = {action: "deleted", instance: member};
            this.workingChangeMap[memberId] = changeMapEntry;
        }

        //remove the member entry
        delete this.workingMemberMap[memberId];
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
        let childIdMap = this.getField("childIdMap");
        for(var name in childIdMap) {
            var childId = childIdMap[name];
            let child = this.lookupMemberById(childId);
            if(child) {
                json.children[name] = child.toJson(this);
            }
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
        json.children[folderJson.name] = folderJson;

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
apogeeutil.mixin(Model,EventManager);
apogeeutil.mixin(Model,ContextHolder);
apogeeutil.mixin(Model,Parent);

let memberGenerators = {};

Model.DEFAULT_MODEL_NAME = "Workspace";
Model.ROOT_FOLDER_NAME = "main";

/** This is the supported file type. */
Model.SAVE_FILE_TYPE = "apogee model";

/** This is the supported file version. */
Model.SAVE_FILE_VERSION = 0.3;

Model.CONSECUTIVE_ACTION_INITIAL_LIMIT = 500;

Model.EMPTY_MODEL_JSON = {
    "fileType": Model.SAVE_FILE_TYPE,
    "version": Model.SAVE_FILE_VERSION,
    "name": Model.DEFAULT_MODEL_NAME,
    "children": {
        "main": {
            "name": Model.ROOT_FOLDER_NAME,
            "type": "apogee.Folder"
        }
    }
}

