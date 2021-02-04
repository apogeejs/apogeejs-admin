import apogeeutil from "/apogeeutil/apogeeUtilLib.js";

import {EventManager} from "/apogeebase/apogeeBaseLib.js";
import CommandManager from "/apogeeapp/commands/CommandManager.js";
import ReferenceManager from "/apogeeapp/references/ReferenceManager.js";
import WorkspaceManager from "/apogeeapp/WorkspaceManager.js";

/** @private */
let apogeeInstance = null;

//======================================
//class definition
//======================================

/** This is the main class of the apogee application. 
 * This constuctor should not be called externally, the static creation method 
 * should be used. This is a singlet.
 * 
 * @param appConfigManager - An instance of an AppConfigManager on configure the application.
 * 
 * @private */
export default class Apogee {

    constructor(appConfigManager) {

        //mixin initialization
        this.eventManagerMixinInit();
        
        //make sure we define this once
        if(apogeeInstance != null) {
            throw new Error("Error: There is already an Apogee app instance - the Apogee class is a singleton.");
        }
        else {
            apogeeInstance = this;
        }
        
        this.appConfigManager = appConfigManager;
        
        //---------------------------------
        //construct the base app structures
        //---------------------------------
        
        //workspace manager
        this.workspaceManager = null;
        
        //component generators
        this.componentClasses = {};
        this.standardComponents = [];
        //these are a list of names of components that go in the "added component" list
        this.additionalComponents = [];
        
        //default settings
        this.appSettings = {};
        
        //reference manager
        this.referenceManager = new ReferenceManager(this);
        
        //command manager
        this.commandManager = new CommandManager(this);

        //subscribe to app events
        this.subscribeToAppEvents()
        
        //----------------------------------
        //configure the application
        //----------------------------------
        var appConfigPromise = this.appConfigManager.getConfigPromise(this);
        
        appConfigPromise.then(() => this.initApp()).catch(errorMsg => apogeeUserAlert("Fatal error configuring application: " + errorMsg));
        
    }

    /** This subscribes to all events needed by this class. On close, all listeners will be removed. This will 
     * be called to add back the need app events. */
    subscribeToAppEvents() {
        //subscribe to events
        this.addListener("workspaceDirty",() => this._setWorkspaceIsDirty());
    }

    //======================================
    // static singleton methods
    //======================================

    /** This retrieves an existing instance. It does not create an instance. */
    static getInstance() {
        return apogeeInstance;
    }

    // /** This function initializes the default classes for the application. */
    // static setBaseClassLists(standardComponents, additionalComponents, errorComponentClass) {
    //     Apogee.standardComponents = standardComponents;
    //     Apogee.additionalComponents = additionalComponents;
    //     Apogee.errorComponentClass = errorComponentClass;
    // }

    //==================================
    // Workspace Management
    //==================================

    /** This method returns the active WorkspaceManager object. */
    getWorkspaceManager() {
        return this.workspaceManager;
    }

    createWorkspaceManager() {
        return new WorkspaceManager(this);
    }

    /** This method returns the active model object. */
    getModelManager() {
        if(this.workspaceManager) {
            return this.workspaceManager.getModelManager();
        }
        else {
            return null;
        }
    }

    /** This method returns the active model object. */
    getModel() {
        if(this.workspaceManager) {
            return this.workspaceManager.getModelManager().getModel();
        }
        else {
            return null;
        }
    }

    /** This method makes an empty workspace object. This can be used to set the initial workspace
     * manager or to give the new instance of the workspace manager. However, if the workspace manager
     * is being updated it must have the same ID as the existing workspace manager or else an exception
     * will be thrown.
     */
    setWorkspaceManager(workspaceManager) {
        //we can only have one workspace of a given id
        if((this.workspaceManager)&&(this.workspaceManager.getId() != workspaceManager.getId())) {
            throw new Error("There is already an open workspace");
        }
        this.workspaceManager = workspaceManager;
        return true;
    }

    /** This method closes the active workspace. */
    clearWorkspaceManager() {
        //remove the workspace from the app
        this.workspaceManager = null;
        
        return true;
    }

    //====================================
    // Command Management
    //====================================

    /** This method should be called to execute commands. */
    executeCommand(command) {
        return this.commandManager.executeCommand(command);
    }

    /** This method is intended for the UI for the undo/redo functionality */
    getCommandManager() {
        return this.commandManager;
    }

    /** This method returns true if the workspcae contains unsaved data. */
    getWorkspaceIsDirty() {
        if(this.workspaceManager) {
            return this.workspaceManager.getIsDirty();
        }
        else {
            return false;
        }
    }

    /** This method clears the workspace dirty flag. */
    clearWorkspaceIsDirty() {
        if(this.workspaceManager) {
            return this.workspaceManager.clearIsDirty();
        }
        else {
            return false;
        }
    }

    /** This method returns true if the workspcae contains unsaved data. 
     * @private */
    _setWorkspaceIsDirty() {
        if(this.workspaceManager) {
            return this.workspaceManager.setIsDirty();
        }
        else {
            return false;
        }
    }

    
    //======================================
    // configuration methods methods
    //======================================

    /** This method returns the app settings json. */
    getAppSettings() {
        return this.appSettings;
    }

    /** This mehod return the application ReferenceManager. */
    getAppReferenceManager() {
        return this.referenceManager;
    }

    /** This method sets the file access object. */
    setFileAccessObject(fileAccessObject) {
        this.fileAccessObject = fileAccessObject;
    }

    /** This method retrieves the file access object for the application. */
    getFileAccessObject() {
        return this.fileAccessObject;
    }



    //==================================
    // App Initialization
    //==================================

    /** This should be called to set any settings, if there are any. If there are
     * no settings, this may be omitted.
     * 
     * configJson format:
     * {
     *   "settings": { (settings json - settings keys with associated settings value) },
     *   "references": [ (array of references - same format as refernces in workspace.) ]
     * }
     * 
     * References may include self-installing modules, for example a custom file
     * access method or custom components. See info on self installing modules.
     */ 
    getConfigurationPromise(configJson) {   
        if(!configJson) return;
        
        //set the settings JSON
        this.appSettings = configJson.settings;
        if(!this.appSettings) this.appSettings = {};
        
        //load references
        var openEntriesPromise;
        if(configJson.references) {
            openEntriesPromise = this.referenceManager.getOpenEntriesPromise(configJson.references);
        }
        else {
            //instant resolve promise (with no meaningful return)
            openEntriesPromise = Promise.resolve();
        }
        
        var onLoadReferenceError = errorMsg => apogeeUserAlert("Error setting application level modules - some functionality may not be available: " + errorMsg);
        
        //if there is an error loading the promise, print a mesage and continue.
        return openEntriesPromise.catch(onLoadReferenceError);
    }
        
    /** This completes application initialization after any settings have been set. 
     * @private
     * */    
    initApp() {
        
        //file accessor - load the default if it wasn't loaded in cofiguration
        if(!this.fileAccessObject) {
            this.fileAccessObject = this.appConfigManager.getDefaultFileAccessObject(this);
        }
        
        //open the initial workspace or create a new workspace
        var workspaceFilePromise = this.appConfigManager.getInitialWorkspaceFilePromise(this);
        if(workspaceFilePromise) {
            var workspaceFileMetadata = this.appConfigManager.getInitialWorkspaceFileMetadata(this);
            
            var openInitialWorkspace = workspaceText => {
                let workspaceJson = JSON.parse(workspaceText);

                //open workspace
                var commandData = {};
                commandData.type = "openWorkspace";
                commandData.workspaceJson = workspaceJson;
                commandData.fileMetadata = workspaceFileMetadata;

                this.executeCommand(commandData);
            };
            
            workspaceFilePromise.then(openInitialWorkspace).catch(errorMsg => apogeeUserAlert("Error downloading initial workspace: " + errorMsg));
        }
        else {
            var commandData = {};
            commandData.type = "openWorkspace";
            
            this.executeCommand(commandData);
        }
        
    }
}

//add mixins to this class
apogeeutil.mixin(Apogee,EventManager);


Apogee.DEFAULT_Workspace_NAME = "workspace";
