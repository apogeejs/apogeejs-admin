import FieldObject from "/apogeeutil/FieldObject.js";

import ReferenceManager from "/apogeeapp/references/ReferenceManager.js";
import ModelManager from "/apogeeapp/ModelManager.js";


/** This class manages the workspace. */
export default class WorkspaceManager extends FieldObject {

    constructor(app,instanceToCopy,keepUpdatedFixed) {
        super("workspace",instanceToCopy,keepUpdatedFixed);

        this.app = app;
        
        //==============
        //Fields
        //==============
        //Initailize these if this is a new instance
        if(!instanceToCopy) {
            let modelManager = new ModelManager(this.app);
            this.setField("modelManager",modelManager);

            let referenceManager = new ReferenceManager(this.app);
            this.setField("referenceManager",referenceManager);
        }
        
        //==============
        //Working variables
        //==============
        //I am calling this working even though it has an extended lifetime
        //this will be updated when the file changes
        //TBR when we work more on file saving
        this.fileMetadata = null;

        this.viewStateCallback = null;
        this.cachedViewState = null;

        //listen to the workspace dirty event from the app
        this.app.addListener("workspaceDirty",() => this.setIsDirty());
    }

    //====================================
    // Workspace Management
    //====================================

    /** This gets the application instance. */
    getApp() {
        return this.app;
    }

    /** This method returns a mutable copy of this instance. If the instance is already mutable
     * it will be returned rather than making a new one.  */
    getMutableWorkspaceManager() {
        if(this.getIsLocked()) {
            //create a new instance that is a copy of this one
            return WorkspaceManager(this.app,this);
        }
        else {
            //return this instance since it si already unlocked
            return this;
        }
    }

    /** This method locks this workspace instance and all the contained object instances. */
    lockAll() {
        //we maybe shouldn't be modifying the members in place, but we will do it anyway
        this.getReferenceManager().lock();
        this.getModelManager().lock();
        this.lock();
    }

    getReferenceManager() {
        return this.getField("referenceManager");
    }

    /** This method returns an unlocked reference manager instance. If the current
     * reference manager is unlocked it will return that. Otherwise it will return
     * a new unlocked instance that will also be set as the current instance. */
    getMutableReferenceManager() {
        let oldReferenceManager = getReferenceManager();
        if(oldReferenceManager.getIsLocked()) {
            //create a new instance that is a copy of this one
            let newReferenceManager = new ReferenceManager(this.app,referenceManager);
            this.setField("referenceManager",newReferenceManager);
            return newReferenceManager;
        }
        else {
            //return this instance since it si already unlocked
            return oldReferenceManager;
        }
    }

    getModelManager() {
        return this.getField("modelManager");
    }

    /** This method returns an unlocked model manager instance. If the current
     * model manager is unlocked it will return that. Otherwise it will return
     * a new unlocked instance that will also be set as the current instance. */
    getMutableModelManager() {
        let oldModelManager = getModelManager();
        if(oldModelManager.getIsLocked()) {
            //create a new instance that is a copy of this one
            let newModelManager = new ModelManager(this.app,referenceManager);
            this.setField("modelManager",newModelManager);
            return newModelManager;
        }
        else {
            //return this instance since it si already unlocked
            return oldModelManager;
        }
    }

    getIsDirty() {
        return this.isDirty;
        
    }
    
    setIsDirty() {
        this.isDirty = true;
    }
    
    clearIsDirty() {
        this.isDirty = false;
    }

    
    
    //====================================
    // asynch run context methods
    //====================================
    runFutureCommand(commandData) {
        let activeWorkspaceManager = this.app.getWorkspaceManager();
        this.app.executeCommand(activeWorkspaceManager,commandData);
    }

    getModelRunContext() {
        let modelRunContext = {};
        modelRunContext.runFutureAction = function(modelId,action) {
            //create a command to run this action
            let modelActionCommand = {};
            modelActionCommand.type = "modelActionCommand";
            modelActionCommand.modelId = modelId;
            modelActionCommand.action = action;

            //execut this command as a future command
            this.runFutureCommand(modelActionCommand);
        }

        return modelRunContext;
    }

    //====================================
    // configuration
    //====================================

    /** This retrieves the file metadata used to save the file. */
    getFileMetadata() {
        return this.fileMetadata;
    }

    /** This method should be used to update the file metadata for the workspace, such as after the file is saved. */
    setFileMetadata(fileMetadata) {
        this.fileMetadata = fileMetadata;
    }

    //====================================
    // open and save methods
    //====================================

    setViewStateCallback(viewStateCallback) {
        this.viewStateCallback = viewStateCallback;
    }

    getCachedViewState() {
        return this.cachedViewState;
    }

    /** This saves the workspace. It the optionalSavedRootFolder is passed in,
     * it will save a workspace with that as the root folder. */
    toJson(optionalSavedRootFolder) {
        var json = {};
        json.fileType = "apogee app js workspace";

        json.version = WorkspaceManager.FILE_VERSION;

        json.references = this.getReferenceManager().toJson();

        json.code = this.getModelManager().toJson(optionalSavedRootFolder);

        if(this.viewStateCallback) {
            this.cachedViewState = this.viewStateCallback();
            if(this.cachedViewState) json.viewState = this.cachedViewState;
        }

        return json;
    }

    
     /** This method sets the workspace. The argument workspaceJson should be included
      * if the workspace is not empty, such as when opening a existing workspace. It
      * contains the data for the component associated with each model member. For 
      * a new empty workspace the workspaceJson should be omitted. 
      * The argument fileMetadata is the file identifier if the workspace is opened from a file.
      * This will be used for the "save" function to save to an existing file. */
     load(json,fileMetadata) {

        //check file format
        if(json) {
            if(json.version != WorkspaceManager.FILE_VERSION) {
                let msg = "Version mismatch. Expected version " + WorkspaceManager.FILE_VERSION + ", Found version " + workspaceJson.version;
                alert(msg);
                throw new Error(msg);
            }
        }
        else {
            //create aan empty json to load
            json = {};
        }

        //store the file metadata
        this.fileMetadata = fileMetadata;

        let commandResult = {};
        commandResult.cmdDone = true;
        commandResult.target = this;
        synchCommandResult.eventAction = "created";

        //set the view state
        if(json.viewState !== undefined) {
            this.cachedViewState = json.viewState;
        }

        //check for references. If we have references we must load these before loading the model
        if(json.references) {
            //if there are references, load these before loading the model.
            //this is asynchronous so we must load the model in a future command
            let onReferencesLoaded = referenceLoadCommandResult => {
                //load references regardless of success or failure in loading references
                let loadModelCommand = {};
                loadModelCommand.type = "loadModelManager";
                loadModelCommand.json = json.code;
                this.runFutureCommand(loadModelCommand);
            }

            let referenceCommandResults = this.referenceManager.load(this,json.references,onReferencesLoaded);
            if((referenceCommandResults)&&(referenceCommandResults.length > 0)) {
                //save the entries create results to the synchronous command result
                commandResult.childCommandResults = referenceCommandResults;
            }
        }
        else {
            //if there are not references we can load the model directly.
            let modelManager = this.getModelManager();
            let loadModelCommandResult = modelManager.load(this,json.code);
            commandResult.childCommandResults = [loadModelCommandResult];
        }

        return commandResult
    }

    /** This method closes the workspace object. */
    close() {
        //close model manager
        let modelManager = this.getModelManager();
        modelManager.close();

        //close reference manager
        let referenceManager = this.getReferenceManager();
        referenceManager.close();
    }

}

WorkspaceManager.FILE_VERSION = "0.50";


//=====================================
// Command Object
//=====================================

/*** 
 * This command loads the model manager. It is a follow on command to opening a workspace,
 * if there are references present, which must be loaded first.
 * 
 * commandData.type = "loadModelManager"
 * commandData.json = (json for the model/model manager)
 */

let loadmodelmanager = {};

//There is no undo command since this is a follow on to opening a workspace
//loadmodelmanager.createUndoCommand = function(workspaceManager,commandData) {

/** This method loads an existing, unpopulated model manager. It is intended only as
 * a asynchronous follow on command to opening a workspace, once any references have
 * been loaded.
 */
loadmodelmanager.executeCommand = function(workspaceManager,commandData) {
    
    let modelManager = workspaceManager.getModelManager();
    
    return modelManager.load(commandData.json);
}

loadmodelmanager.commandInfo = {
    "type": "loadModelManager",
    "targetType": "modelManager",
    "event": "updated"
}

CommandManager.registerCommand(loadmodelmanager);