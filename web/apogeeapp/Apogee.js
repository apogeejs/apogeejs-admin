import base from "/apogeeutil/base.js";

import EventManager from "/apogeeutil/EventManagerClass.js";
import CommandManager from "/apogeeapp/commands/CommandManager.js";
import ReferenceManager from "/apogeeapp/references/ReferenceManager.js";
import "/apogeeapp/commandConfig.js";

import JsonTableComponent from "/apogeeapp/components/JsonTableComponent.js";
import FunctionComponent from "/apogeeapp/components/FunctionComponent.js";
import FolderComponent from "/apogeeapp/components/FolderComponent.js";
import FolderFunctionComponent from "/apogeeapp/components/FolderFunctionComponent.js";
//import DynamicForm from "/apogeeapp/components/DynamicForm.js";
//import FormDataComponent from "/apogeeapp/components/FormDataComponent.js";
//import CustomComponent from "/apogeeapp/components/CustomComponent.js";
//import CustomDataComponent from "/apogeeapp/components/CustomDataComponent.js";
import ErrorComponent from "/apogeeapp/components/ErrorComponent.js";

import EsModuleEntry from "/apogeeapp/references/EsModuleEntry.js";
import NpmModuleEntry from "/apogeeapp/references/NpmModuleEntry.js";
import JsScriptEntry from "/apogeeapp/references/JsScriptEntry.js";
import CssEntry from "/apogeeapp/references/CssEntry.js";

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
export default class Apogee extends EventManager {

    constructor(appConfigManager) {
        super();
        
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
        this.commandManager = new CommandManager(this,this);
        
        //load the standard component generators
        //(for now this is not configurable. This is called first so loaded modules
        //in config can self load after the defaults)
        this.loadComponentClasses();
        
        //----------------------------------
        //configure the application
        //----------------------------------
        var appConfigPromise = this.appConfigManager.getConfigPromise(this);
        
        appConfigPromise.then(() => this.initApp()).catch(errorMsg => alert("Fatal error configuring application!"));
        
    }

    //======================================
    // static singleton methods
    //======================================

    /** This retrieves an existing instance. It does not create an instance. */
    static getInstance() {
        return apogeeInstance;
    }

    //======================================
    // public methods
    //======================================

    /** This method returns the app settings json. */
    getAppSettings() {
        return this.appSettings;
    }

    /** This mehod return the application ReferenceManager. */
    getAppReferenceManager() {
        return this.referenceManager;
    }

    /** This method registers a new component. It will be exposed when the user
     * requests to create a new component */
    registerComponent(componentClass) {
        var name = componentClass.uniqueName;
    //just replace - but existing ones will not change!
    //    if(this.componentClasses[name]) {
    //        var replace = confirm("There is already a registered component with this name. Would you like to continue?");
    //        if(!replace) return;
    //    }

        this.componentClasses[name] = componentClass;
        if(this.additionalComponents.indexOf(name) < 0) {
            this.additionalComponents.push(name);
        }
    }

    /** This method registers a new component. It will be exposed when the user
     * requests to create a new component */
    unregisterComponent(componentClass) {
        //implement this
    }

    /** This method returns a component generator of a given name. */
    getComponentClass(name) {
        return this.componentClasses[name];
    }

    getStandardComponentNames() {
        return this.standardComponents;
    }

    getAdditionalComponentNames() {
        return this.additionalComponents;
    }

    getcomponentClasses() {
        return this.componentClasses;
    }

    getFolderComponentClass() {
        return FolderComponent;
    }


    /** This method sets the file access object. */
    setFileAccessObject(fileAccessObject) {
        this.fileAccessObject = fileAccessObject;
    }

    /** This method retrieves the file access object for the application. */
    getFileAccessObject() {
        return this.fileAccessObject;
    }

    /** This method returns the active WorkspaceManager object. */
    getWorkspaceManager() {
        return this.workspaceManager;
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

    //====================================
    // Command Management
    //====================================

    /** This method should be called to execute commands. */
    executeCommand(command) {
        this.commandManager.executeCommand(command);
    }

    /** This method is intended for the UI for the undo/redo functionality */
    getCommandManager() {
        return this.commandManager;
    }

    //==================================
    // Workspace Management
    //==================================

    /** This method makes an empty workspace object. This throws an exception if
     * the workspace can not be opened.
     */
    setWorkspaceManager(workspaceManager) {
        
        //we can only have one workspace of a given name!
        if(this.workspaceManager) {
            throw base.createError("There is already an open workspace",false);
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
     * 
     * @private
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
        
        var onLoadReferenceError = errorMsg => alert("Error setting application level modules - some functionality may not be available: " + errorMsg);
        
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
        
        //open the initial workspace
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
            
            workspaceFilePromise.then(openInitialWorkspace).catch(errorMsg => alert("Error downloading initial workspace: " + errorMsg));
        }
        
    }


    /** This method adds the standard components to the app. 
     * @private */
    loadComponentClasses() {
        //standard components
        this.registerStandardComponent(JsonTableComponent);
        this.registerStandardComponent(FolderComponent);
        this.registerStandardComponent(FunctionComponent);
        this.registerStandardComponent(FolderFunctionComponent);
        //this.registerStandardComponent(DynamicForm);
        //this.registerStandardComponent(FormDataComponent);
        
        //additional components
        //this.registerComponent(CustomComponent);
        //this.registerComponent(CustomDataComponent);

        //load the error class, but not as either a standard or additional component
        this.componentClasses[ErrorComponent.uniqueName] = ErrorComponent;
    }

    /** This method registers a component. 
     * @private */
    registerStandardComponent(componentClass) {
        var name = componentClass.uniqueName;
        if(this.componentClasses[name]) {
            var replace = confirm("There is already a registered component with this name. Would you like to continue?");
            if(!replace) return;
        }

    //we should maybe warn if another component bundle is being overwritten 
        this.componentClasses[name] = componentClass;
        if(this.standardComponents.indexOf(name) < 0) {
            this.standardComponents.push(name);
        }
    }

    /** This method returns the reference entry type classes which will be used in the app. */
    getReferenceClassArray() {
        let referenceClassArray = [];
        if(__APOGEE_ENVIRONMENT__ == "WEB") referenceClassArray.push(EsModuleEntry);
        if(__APOGEE_ENVIRONMENT__ == "NODE") referenceClassArray.push(NpmModuleEntry);
        referenceClassArray.push(JsScriptEntry);
        referenceClassArray.push(CssEntry);
        return referenceClassArray;
    }

}


Apogee.DEFAULT_Workspace_NAME = "workspace";
