import base from "/apogeeutil/base.js";

import EventManager from "/apogeeutil/EventManagerClass.js";
import CommandManager from "/apogeeapp/app/commands/CommandManager.js";
import ReferenceManager from "/apogeeapp/app/references/ReferenceManager.js";
import "/apogeeapp/app/commandConfig.js";

import JsonTableComponent from "/apogeeapp/app/components/JsonTableComponent.js";
import FunctionComponent from "/apogeeapp/app/components/FunctionComponent.js";
import FolderComponent from "/apogeeapp/app/components/FolderComponent.js";
import FolderFunctionComponent from "/apogeeapp/app/components/FolderFunctionComponent.js";
import DynamicForm from "/apogeeapp/app/components/DynamicForm.js";
import FormDataComponent from "/apogeeapp/app/components/FormDataComponent.js";
import CustomComponent from "/apogeeapp/app/components/CustomComponent.js";
import CustomDataComponent from "/apogeeapp/app/components/CustomDataComponent.js";

import ApogeeView from "/apogeeapp/app/ApogeeView.js";

/** @private */
let apogeeInstance = null;

//======================================
//class definition
//======================================

/** This is the main class of the apogee application. 
 * This constuctor should not be called externally, the static creation method 
 * should be used. This is a singlet.
 * 
 * @param containerId - The DOM element ID for the app container
 * @param appConfigManager - An instance of an AppConfigManager on configure the application.
 * 
 * @private */
export default class Apogee extends EventManager {

    constructor(containerId,appConfigManager) {
        super();
        
        //make sure we define this once
        if(apogeeInstance != null) {
            throw new Error("Error: There is already an Apogee app instance - the Apogee class is a singleton.");
        }
        else {
            apogeeInstance = this;
        }
        
        this.appConfigManager = appConfigManager;
        this.containerId = containerId;
        
        //---------------------------------
        //construct the base app structures
        //---------------------------------
        
        //workspace
        this.workspaceUI = null;
        
        //component generators
        this.componentGenerators = {};
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
        this.loadComponentGenerators();
        
        //----------------------------------
        //configure the application
        //----------------------------------
        var appConfigPromise = this.appConfigManager.getConfigPromise(this);
        
        appConfigPromise.then(() => this.initApp()).catch(errorMsg => alert("Fatal error configuring application!"));
        
    }

    //======================================
    // static singleton methods
    //======================================


    /** This creates and returns an app instance. The app is a singleton. This call
     * should only be made once. The containerId is the DOM element ID in which the
     * app UI is created. If this is left as undefined the UI will not be created. This
     * is used when creating an alternate UI such as with the web app. 
     *
     * @param containerId - The DOM element ID for the app container
     * @param appConfigManager - An instance of an AppConfigManager on configure the application.
     *   
     */
    static createApp(containerId,appConfigManager) {
        return new Apogee(containerId,appConfigManager);
    }

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

    /** This returns the app level view element. */
    getAppView() {
        return this.appView;
    }

    /** This method registers a new component. It will be exposed when the user
     * requests to create a new component */
    registerComponent(componentGenerator) {
        var name = componentGenerator.uniqueName;
    //just replace - but existing ones will not change!
    //    if(this.componentGenerators[name]) {
    //        var replace = confirm("There is already a registered component with this name. Would you like to continue?");
    //        if(!replace) return;
    //    }

        this.componentGenerators[name] = componentGenerator;
        if(this.additionalComponents.indexOf(name) < 0) {
            this.additionalComponents.push(name);
        }
    }

    /** This method registers a new component. It will be exposed when the user
     * requests to create a new component */
    unregisterComponent(componentGenerator) {
        //implement this
    }

    /** This method returns a component generator of a given name. */
    getComponentGenerator(name) {
        return this.componentGenerators[name];
    }

    getStandardComponentNames() {
        return this.standardComponents;
    }

    getAdditionalComponentNames() {
        return this.additionalComponents;
    }

    getComponentGenerators() {
        return this.componentGenerators;
    }

    getFolderGenerator() {
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

    /** This method returns the active WorkspaceUI object. */
    getWorkspaceUI() {
        return this.workspaceUI;
    }

    /** This method returns the active Workspace object. */
    getWorkspace() {
        if(this.workspaceUI) {
            return this.workspaceUI.getWorkspace();
        }
        else {
            return null;
        }
    }

    /** This method returns true if the workspcae contains unsaved data. */
    getWorkspaceIsDirty() {
        if(this.workspaceUI) {
            return this.workspaceUI.getIsDirty();
        }
        else {
            return false;
        }
    }

    /** This method clears the workspace dirty flag. */
    clearWorkspaceIsDirty() {
        if(this.workspaceUI) {
            return this.workspaceUI.clearIsDirty();
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

    /** This method makes an empty workspace ui object. This throws an exception if
     * the workspace can not be opened.
     */
    setWorkspaceUI(workspaceUI) {
        
        //we can only have one workspace of a given name!
        if(this.workspaceUI) {
            throw base.createError("There is already an open workspace",false);
        }
        
        workspaceUI.setApp(this,this.appView);
        this.workspaceUI = workspaceUI;
        
        return true;
    }

    /** This method closes the active workspace. */
    clearWorkspaceUI() {
        //remove the workspace from the app
        this.workspaceUI = null;
        
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
        
        //create the UI - if a container ID is passed in
        if(this.containerId) {
            this.appView = new ApogeeView(this,this.containerId);
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
    loadComponentGenerators() {
        //standard components
        this.registerStandardComponent(JsonTableComponent);
        this.registerStandardComponent(FolderComponent);
        this.registerStandardComponent(FunctionComponent);
        this.registerStandardComponent(FolderFunctionComponent);
        this.registerStandardComponent(DynamicForm);
        this.registerStandardComponent(FormDataComponent);
        
        //additional components
        this.registerComponent(CustomComponent);
        this.registerComponent(CustomDataComponent);
    }

    /** This method registers a component. 
     * @private */
    registerStandardComponent(componentGenerator) {
        var name = componentGenerator.uniqueName;
        if(this.componentGenerators[name]) {
            var replace = confirm("There is already a registered component with this name. Would you like to continue?");
            if(!replace) return;
        }

    //we should maybe warn if another component bundle is being overwritten 
        this.componentGenerators[name] = componentGenerator;
        if(this.standardComponents.indexOf(name) < 0) {
            this.standardComponents.push(name);
        }
    }

}


Apogee.DEFAULT_WORKSPACE_NAME = "workspace";
