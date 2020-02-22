import base from "/apogeeutil/base.js";
import FieldObject from "/apogeeutil/FieldObject.js";
import EventManager from "/apogeeutil/EventManagerClass.js";
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
export default class Model extends EventManager {

    constructor(optionalContextOwner) {
        //base init
        super();

        //mixin initialization
        this.contextHolderMixinInit();
        this.fieldObjectMixinInit();
        
        // This is a queue to hold actions while one is in process.
        this.actionInProgress = false;
        this.messengerActionList = [];
        this.consecutiveActionCount = 0;
        this.activeConsecutiveActionLimit = Model.CONSECUTIVE_ACTION_INITIAL_LIMIT;

        //&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&
        //fields
        this.setField("name",Model.DEFAULT_MODEL_NAME);
        //"rootFolder"
        if(optionalContextOwner) {
            this.setField("owner",optionalContextOwner);
        }

        this.setField("impactsMap",{});
        //&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&

        this.workingImpactsMap = null;
    }

    /** This method returns the root object - implemented from RootHolder.  */
    setName(name) {
        this.setField("name",name);
    }

    /** This method returns the root object - implemented from RootHolder.  */
    getName() {
        return this.getField("name");
    }

    /** This method returns the root object - implemented from RootHolder.  */
    getRoot() {
        return this.getField("rootFolder");
    }

    /** This method sets the root object - implemented from RootHolder.  */
    setRoot(member) {
        this.setField("rootFolder",member);
    }

    /** This allows for a model to have a parent. For a normal model this should be null. 
     * This is used for finding variables in scope. */
    getOwner() {
        return this.getField("owner");
    }

    /** This method updates the dependencies of any children in the model. */
    updateDependeciesForModelChange(recalculateList) {
        let rootFolder = this.getField("rootFolder");
        if(rootFolder) {
            rootFolder.updateDependeciesForModelChange(recalculateList);
        }
    }

    /** This method removes any data from this model on closing. */
    onClose() {
        let rootFolder = this.getField("rootFolder");
        if(rootFolder) {
            rootFolder.onClose();
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
    getPossesionNameBase() {
        //the name starts over at a new model
        return "";
    }

    /** This method looks up a member by its full name. */
    getMemberByPathArray(path,startElement) {
        let rootFolder = this.getField("rootFolder");
        if(startElement === undefined) startElement = 0;
        if((rootFolder)&&(path[startElement] === rootFolder.getName())) {
            if(startElement === path.length-1) {
                return rootFolder;
            }
            else {
                startElement++;
                return rootFolder.lookupChildFromPathArray(path,startElement);
            }
        }
        else {
            return null;
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
        this.setField("impactsMap",this.workingImpactsMap);
        this.workingImpactsMap = null;
    }

    
    /** This method adds a data member to the imapacts list for this node.
     * The return value is true if the member was added and false if it was already there. 
     * @private */
    addToImpactsList(depedentMember,member) {
        //don't let a member impact itself
        if(member === depedentMember) return;

        let workingMemberImpactsList = this.getWorkingMemberImpactsList(member.getId());

        //add to the list iff it is not already there
        if(workingMemberImpactsList.indexOf(depedentMember) === -1) {
            workingMemberImpactsList.push(depedentMember);
            return true;
        }
        else {
            return false;
        }
    }

    /** This method removes a data member from the imapacts list for this node. 
     * @private */
    removeFromImpactsList(depedentMember,member) {

        let workingMemberImpactsList = this.getWorkingMemberImpactsList(member.getId());

        //it should appear only once
        for(var i = 0; i < this.impactsList.length; i++) {
            if(workingMemberImpactsList[i] == depedentMember) {
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
            this.populateWorkingImpactsMap();
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
    populateWorkingImpactsMap() {
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

    /** This method creates a headless model json from a folder json. It
     * is used in the folder function. */
    static createWorkpaceJsonFromFolderJson(name,folderJson) {
        //create a model json from the root folder json
        var modelJson = {};
        modelJson.fileType = Model.SAVE_FILE_TYPE;
        modelJson.version = Model.SAVE_FILE_VERSION;
        modelJson.name = name;
        modelJson.data = folderJson;
        return modelJson;
    }

    /** This saves the model */
    toJson() {
        let name = this.getField("name");
        let rootFolder = this.getField("rootFolder");
        let rootFolderJson;
        if(rootFolder) {
            rootFolderJson = rootFolder.toJson();
        }
        return Model.createWorkpaceJsonFromFolderJson(name,rootFolderJson);
    }

    //-------------------------
    // Update Event Methods
    // - NOTE - these are repeated from Member. We should make common base class or add ins for this, along with some other things, like name
    //-------------------------

    getId() {
        //right now we only allow for one model manager
        return 1;
    }

    getTargetType() {
        return "model";
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
base.mixin(Model,ContextHolder);
base.mixin(Model,Owner);
base.mixin(Model,RootHolder);
base.mixin(Model,FieldObject);

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
    "data": {
        "name": Model.ROOT_FOLDER_NAME,
        "type": "apogee.Folder"
    }
}

