import base from "/apogeeutil/base.js";
import apogeeutil from "/apogeeutil/apogeeUtilLib.js";
import { Workspace, doAction } from "/apogee/apogeeCoreLib.js";
import EventManager from "/apogeeutil/EventManagerClass.js";

import ReferenceManager from "/apogeeapp/references/ReferenceManager.js";
import ModelManager from "/apogeeapp/ModelManager.js";


/** This class manages the user interface for a workspace object. */
export default class WorkspaceUI extends EventManager {

    constructor(app) {
        super();

        this.app = app;
        
        this.fileMetadata = null;
        this.modelManager = null;
        this.referenceManager = null;

        this.init();

        app.setWorkspaceUI(this);
    }

    //====================================
    // Workspace Management
    //====================================

    /** This gets the application instance. */
    getApp() {
        return this.app;
    }

    getReferenceManager() {
        return this.referenceManager;
    }

    getModelManager() {
        return this.modelManager;
    }

     /** This method sets the workspace. The argument workspaceJson should be included
      * if the workspace is not empty, such as when opening a existing workspace. It
      * contains the data for the component associated with each workspace member. For 
      * a new empty workspace the workspaceJson should be omitted. 
      * The argument fileMetadata is the file identifier if the workspace is opened from a file.
      * This will be used for the "save" function to save to an existing file. */
    load(workspaceJson,fileMetadata) {
                    // //publish result
                    // let asynchCommandResult = {};
                    // asynchCommandResult.cmdDone = true;
                    // asynchCommandResult.target = workspaceUI;
                    // asynchCommandResult.action = "updated";

        if((workspaceJson)&&(workspaceJson.version != WorkspaceUI.FILE_VERSION)) {
            let msg = "Version mismatch. Expected version " + WorkspaceUI.FILE_VERSION + ", Found version " + workspaceJson.version;
            alert(msg);
            throw new Error(msg);
        }

        this.fileMetadata = fileMetadata;

        var workspaceDataJson;
        var workspaceComponentsJson;

        if(workspaceJson) {
            workspaceDataJson = workspaceJson.workspace;
            workspaceComponentsJson = workspaceJson.components;
        }

        let commandResult = this.modelManager.load(workspaceDataJson,workspaceComponentsJson);

        return commandResult;
    }

    /** This method gets the workspace object. */
    close() {
        //close model manager
        this.modelManager.close();

        //close reference manager
        this.referenceManager.close();
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

    // //------------------------------------------
    // // Event Tracking Methods
    // //------------------------------------------

    getUpdated() {
        return this.updated;
    }

    isFieldUpdated(field) {
        return this.updated[field] ? true : false;
    }

    clearUpdated() {
        this.updated = {};
    }

    fieldUpdated(field) {
        this.updated[field] = true;
    }

    getEventId() {
        //for now we have a single fixed id for the workspace
        return "workspace";
    }

    getTargetType() {
        return "workspace";
    }

    //====================================
    // open and save methods
    //====================================

    /** This sets the application. It must be done before the workspace is set on the workspace UI. */
    init() {
        //create the model manager
        this.modelManager = new ModelManager(this);

        //create the reference manager
        this.referenceManager = new ReferenceManager(this.app);

        //initial - creating reference lists
        this.referenceManager.initReferenceLists(this.app.getReferenceClassArray());
        
        //listen to the workspace dirty event from the app
        this.app.addListener("workspaceDirty",() => this.setIsDirty());
    }

    /** This retrieves the file metadata used to save the file. */
    getFileMetadata() {
        return this.fileMetadata;
    }

    /** This method should be used to update the file metadata for the workspace, such as after the file is saved. */
    setFileMetadata(fileMetadata) {
        this.fileMetadata = fileMetadata;
    }

    /** This saves the workspace. It the optionalSavedRootFolder is passed in,
     * it will save a workspace with that as the root folder. */
    toJson(optionalSavedRootFolder) {
        var json = {};
        json.fileType = "apogee app js workspace";

        json.version = WorkspaceUI.FILE_VERSION;

        json.references = this.referenceManager.saveEntries();

        let {workspaceJson, componentsJson} = this.modelManager.toJson(optionalSavedRootFolder);
        json.workspace = workspaceJson;
        json.components = componentsJson;

        return json;
    }

}

WorkspaceUI.FILE_VERSION = "0.50";