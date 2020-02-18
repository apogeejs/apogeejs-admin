import base from "/apogeeutil/base.js";
import EventManager from "/apogeeutil/EventManagerClass.js";
import {doAction} from "/apogee/actions/action.js";
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
        this.contextHolderMixinInit(this);
        
        // This is a queue to hold actions while one is in process.
        this.actionInProgress = false;
        this.messengerActionList = []
        this.consecutiveActionCount = 0;
        this.activeConsecutiveActionLimit = Model.CONSECUTIVE_ACTION_INITIAL_LIMIT;
        this.name = Model.DEFAULT_MODEL_NAME;
        
        this.owner = optionalContextOwner ? optionalContextOwner : null;

        this.updated = {};

        this.fieldUpdated("name");
    }

    /** This method returns the root object - implemented from RootHolder.  */
    setName(name) {
        this.name = name;
        this.fieldUpdated("name");
    }

    /** This method returns the root object - implemented from RootHolder.  */
    getName() {
        return this.name;
    }

    /** This method returns the root object - implemented from RootHolder.  */
    getRoot() {
        return this.rootFolder;
    }

    /** This method sets the root object - implemented from RootHolder.  */
    setRoot(member) {
        this.rootFolder = member;
    }

    /** This allows for a model to have a parent. For a normal model this should be null. 
     * This is used for finding variables in scope. */
    getOwner() {
        return this.owner;
    }

    /** This method updates the dependencies of any children in the model. */
    updateDependeciesForModelChange(recalculateList) {
        if(this.rootFolder) {
            this.rootFolder.updateDependeciesForModelChange(recalculateList);
        }
    }

    /** This method removes any data from this model on closing. */
    onClose() {
        this.rootFolder.onClose();
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
        if(startElement === undefined) startElement = 0;
        if(path[startElement] === this.rootFolder.getName()) {
            if(startElement === path.length-1) {
                return this.rootFolder;
            }
            else {
                startElement++;
                return this.rootFolder.lookupChildFromPathArray(path,startElement);
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
        if(!this.owner) {
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
        var rootFolderJson = this.rootFolder.toJson();
        return Model.createWorkpaceJsonFromFolderJson(this.name,rootFolderJson);
    }

    //-------------------------
    // Update Event Methods
    // - NOTE - these are repeated from Member. We should make common base class or add ins for this, along with some other things, like name
    //-------------------------

    getUpdated() {
        return this.updated;
    }

    clearUpdated() {
        this.updated = {};
    }

    fieldUpdated(field) {
        this.updated[field] = true;
    }

    isFieldUpdated(field) {
        return this.updated[field] ? true : false;
    }

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

//add components to this class
base.mixin(Model,ContextHolder);
base.mixin(Model,Owner);
base.mixin(Model,RootHolder);

let memberGenerators = {};

Model.DEFAULT_MODEL_NAME = "Workspace";
Model.ROOT_FOLDER_NAME = "Main";

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

