import base from "/apogeeutil/base.js";
import EventManager from "/apogeeutil/EventManagerClass.js";

import CommandManager from "/apogeeapp/app/commands/CommandManager.js";
import ReferenceManager from "/apogeeapp/app/references/ReferenceManager.js";
import "/apogeeapp/app/commandConfig.js";
import {addComponent, addAdditionalComponent} from "/apogeeapp/app/commandseq/addcomponentseq.js";
import {closeWorkspace} from "/apogeeapp/app/commandseq/closeworkspaceseq.js";
import {createWorkspace} from "/apogeeapp/app/commandseq/createworkspaceseq.js";
import {importWorkspace} from "/apogeeapp/app/commandseq/importworkspaceseq.js";
import {exportWorkspace} from "/apogeeapp/app/commandseq/exportworkspaceseq.js";
import {openWorkspace} from "/apogeeapp/app/commandseq/openworkspaceseq.js";
import {saveWorkspace} from "/apogeeapp/app/commandseq/saveworkspaceseq.js";


import JsonTableComponent from "/apogeeapp/app/components/JsonTableComponent.js";
import FunctionComponent from "/apogeeapp/app/components/FunctionComponent.js";
import FolderComponent from "/apogeeapp/app/components/FolderComponent.js";
import CanvasFolderComponent from "/apogeeapp/app/components/CanvasFolderComponent.js";
import FolderFunctionComponent from "/apogeeapp/app/components/FolderFunctionComponent.js";
import DynamicForm from "/apogeeapp/app/components/DynamicForm.js";
import FormDataComponent from "/apogeeapp/app/components/FormDataComponent.js";
import CustomComponent from "/apogeeapp/app/components/CustomComponent.js";
import CustomDataComponent from "/apogeeapp/app/components/CustomDataComponent.js";


apogeeapp.app.dialog = {};

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
        
        //workspaces
        this.workspaceUI = null;
        
        //component generators
        this.componentGenerators = {};
        this.standardComponents = [];
        //these are a list of names of components that go in the "added component" list
        this.additionalComponents = [];
        
        //default settings
        this.appSettings = {};
        
        //reference manager
        this.referenceManager = new ReferenceManager();
        
        //command manager
        this.commandManager = new CommandManager(this);
        
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

    /** This method returns a component generator of a given name. */
    getComponentGenerator(name) {
        return this.componentGenerators[name];
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
        return commandManager;
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
        
        workspaceUI.setApp(this,this.tabFrame,this.treePane);
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
        if(this.containerId !== undefined) {
            this.createUI(this.containerId);
        }
        
        //open the initial workspace
        var workspaceFilePromise = this.appConfigManager.getInitialWorkspaceFilePromise(this);
        if(workspaceFilePromise) {
            var workspaceFileMetadata = this.appConfigManager.getInitialWorkspaceFileMetadata(this);
            
            var openWorkspace = workspaceText => {
                apogeeapp.app.openworkspaceseq.openWorkspace(this,workspaceText,workspaceFileMetadata);
            };
            
            workspaceFilePromise.then(openWorkspace).catch(errorMsg => alert("Error downloading initial workspace."));
        }
        
    }


    /** This method adds the standard components to the app. 
     * @private */
    loadComponentGenerators() {
        //standard components
        this.registerStandardComponent(JsonTableComponent);
        this.registerStandardComponent(FolderComponent);
        this.registerStandardComponent(CanvasFolderComponent);
        this.registerStandardComponent(FunctionComponent);
        this.registerStandardComponent(FolderFunctionComponent);
        this.registerStandardComponent(DynamicForm);
        this.registerStandardComponent(FormDataComponent);

    //TEMP---
    this.registerStandardComponent(CustomComponent);
    this.registerStandardComponent(CustomDataComponent);
    //------------
        
        //additional components
    //    this.registerComponent(CustomComponent);
    //    this.registerComponent(CustomDataComponent);
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

    //=================================
    // User Interface Creation Methods
    //=================================

    /** This method creates the app ui. 
     * @private */
    createUI(containerId) {
        
        var windowElements = apogeeapp.ui.initWindows(containerId);
        var topContainer = windowElements.baseElement;
        
        var mainContainer = new apogeeapp.ui.DisplayAndHeader(apogeeapp.ui.DisplayAndHeader.FIXED_PANE,
                null,
                apogeeapp.ui.DisplayAndHeader.FIXED_PANE,
                null
            );
        topContainer.appendChild(mainContainer.getOuterElement());
        
        //-------------------
        //create menus
        //-------------------
        var menuBar = this.createMenuBar();
        mainContainer.getHeader().appendChild(menuBar);
        
        //----------------------
        //create the split pane
        //----------------------
        var splitPane = new apogeeapp.ui.SplitPane(
                apogeeapp.ui.SplitPane.SCROLLING_PANE,
                apogeeapp.ui.SplitPane.FIXED_PANE
            );
        mainContainer.getBody().appendChild(splitPane.getOuterElement());

        //---------------------
        //load the tree pane
        //---------------------
        this.treePane = splitPane.getLeftPaneContainer();
        
        //----------------------
        //create the tab frame
        //----------------------
        this.tabFrame = new apogeeapp.ui.TabFrame();
        splitPane.getRightPaneContainer().appendChild(this.tabFrame.getElement());
        
        //add listener for displaying the active tab
        this.tabFrame.addListener(apogeeapp.ui.SHOWN_EVENT,tab => this.onTabShown(tab));
        this.tabFrame.addListener(apogeeapp.ui.HIDDEN_EVENT,tab => this.onTabHidden(tab));

    }

    /** This method creates the app ui. 
     * @private */
    onTabHidden(tab) {
        this.activeTabIconDisplay.style.display = "none";
        this.activeTabTitleDisplay.style.display = "none";
    }

    onTabShown(tab) {
        if(!this.workspaceUI) return;
        
        var id = tab.getId();
        var component = this.workspaceUI.getComponentById(id);
        if(component) {
            this.activeTabIconDisplay.src = component.getIconUrl();
            this.activeTabTitleDisplay.innerHTML = component.getMember().getDisplayName(true);
            this.activeTabIconDisplay.style.display = "";
            this.activeTabTitleDisplay.style.display = "";
        }
    }

    //=================================
    // Menu Functions
    //=================================

    /** This method creates the creates the menu bar, with the attached functionality. 
     * @private */
    createMenuBar() {
        
        //-------------------
        //create menus
        //-----------------------
        
        //create the menus
        var menu;
        var name;
        var menus = {};
        
        //creat menu  bar with left elements (menus) and right elements (active tab display)
        var menuBar = apogeeapp.ui.createElementWithClass("div","menu_bar");
        var menuBarLeft = apogeeapp.ui.createElementWithClass("div","menu_bar_left",menuBar);
        var menuBarRight = apogeeapp.ui.createElementWithClass("div","menu_bar_right",menuBar);

        //Workspace menu
        name = "Workspace";
        this.workspaceMenu = apogeeapp.ui.Menu.createMenu(name);
        menuBarLeft.appendChild(this.workspaceMenu.getElement());
        menus[name] = this.workspaceMenu;
        
        //populate the workspace menu on the fly - depends on workspace state
        var getWorkspaceMenuCallback = () => this.getWorkspaceMenuItems();
        this.workspaceMenu.setAsOnTheFlyMenu(getWorkspaceMenuCallback);
        
        //Edit menu
        name = "Edit";
        this.editMenu = apogeeapp.ui.Menu.createMenu(name);
        menuBarLeft.appendChild(this.editMenu.getElement());
        menus[name] = this.editMenu;
        
        //populate the workspace menu on the fly - depends on workspace state
        var getEditMenuCallback = () => this.getEditMenuItems();
        this.editMenu.setAsOnTheFlyMenu(getEditMenuCallback);
        
        //Components Menu
        name = "Components";
        menu = apogeeapp.ui.Menu.createMenu(name);
        menuBarLeft.appendChild(menu.getElement());
        menus[name] = menu;
        
        //add create child elements
        menu.setMenuItems(this.getAddChildMenuItems());
        
        //libraries menu
        name = "Import/Export";
        menu = apogeeapp.ui.Menu.createMenu(name);
        menuBarLeft.appendChild(menu.getElement());
        menus[name] = menu;
        
        var importCallback = () => importWorkspace(this,this.fileAccessObject,apogeeapp.app.FolderComponent);
        menu.addCallbackMenuItem("Import as Folder",importCallback);
        
        var import2Callback = () => importWorkspace(this,this.fileAccessObject,apogeeapp.app.FolderFunctionComponent);
        menu.addCallbackMenuItem("Import as Folder Function",import2Callback);
        
        var exportCallback = () => exportWorkspace(this,this.fileAccessObject);
        menu.addCallbackMenuItem("Export as Workspace",exportCallback);
        
        //allow the implementation to add more menus or menu items
        if(this.addToMenuBar) {
            this.addToMenuBar(menuBar,menus);
        }
        
        //add the active tab display
        this.activeTabIconDisplay = apogeeapp.ui.createElementWithClass("img","tab-icon-display",menuBarRight);
        this.activeTabIconDisplay.style.display = "none";
        this.activeTabTitleDisplay = apogeeapp.ui.createElementWithClass("div","tab-title-display",menuBarRight);
        this.activeTabTitleDisplay.style.display = "none";
        return menuBar;
        
    }

    /** This method gets the workspace menu items. This is created on the fly because the
     * items will change depending on the state of the workspace. */
    getWorkspaceMenuItems() {
        
        var menuItems = [];
        var menuItem;
        
        menuItem = {};
        menuItem.title = "New";
        menuItem.callback = () => createWorkspace(this);
        menuItems.push(menuItem);
        
        menuItem = {};
        menuItem.title = "Open";
        menuItem.callback = () => openWorkspace(this,this.fileAccessObject);
        menuItems.push(menuItem);

        var workspaceUI = this.getWorkspaceUI();
        if(workspaceUI) {
            var fileMetadata = workspaceUI.getFileMetadata();

            if(this.fileAccessObject.directSaveOk(fileMetadata)) {
                menuItem = {};
                menuItem.title = "Save";
                menuItem.callback = () => saveWorkspace(this,this.fileAccessObject,true);
                menuItems.push(menuItem);
            }

            menuItem = {};
            menuItem.title = "Save as";
            menuItem.callback = () => saveWorkspace(this,this.fileAccessObject,false);
            menuItems.push(menuItem);
        }  

        menuItem = {};
        menuItem.title = "Close";
        menuItem.callback = () => closeWorkspace(this);
        menuItems.push(menuItem);
        
        return menuItems;
    }

    /** This method gets the workspace menu items. This is created on the fly because the
     * items will change depending on the state of the workspace. */
    getEditMenuItems() {
        
        var menuItems = [];
        var menuItem;
        
        //populate the undo menu item
        var undoLabel;
        var undoCallback;
        var nextUndoDesc = this.commandManager.getNextUndoDesc();
        if(nextUndoDesc === CommandManager.NO_COMMAND) {
            undoLabel = "-no undo-"
            undoCallback = null;
        }
        else {
            if(nextUndoDesc == "") {
                undoLabel = "Undo"
            }
            else {
                undoLabel = "Undo: " + nextUndoDesc;
            }
            undoCallback = () => this.commandManager.undo();
        }
        menuItem = {};
        menuItem.title = undoLabel;
        menuItem.callback = undoCallback;
        menuItems.push(menuItem);
        
        //populate the redo menu item
        var redoLabel;
        var redoCallback;
        var nextRedoDesc = this.commandManager.getNextRedoDesc();
        if(nextRedoDesc === CommandManager.NO_COMMAND) {
            redoLabel = "-no redo-"
            redoCallback = null;
        }
        else {
            if(nextRedoDesc == "") {
                redoLabel = "Redo"
            }
            else {
                redoLabel = "Redo: " + nextRedoDesc;
            }
            redoCallback = () => this.commandManager.redo();
        }
        menuItem = {};
        menuItem.title = redoLabel;
        menuItem.callback = redoCallback;
        menuItems.push(menuItem);
        
        return menuItems;
    }

    ///** This method should be implemented if custom menus or menu items are desired. */
    //addToMenuBar(menuBar,menus);

    getAddChildMenuItems(optionalInitialProperties,optionalBaseMemberValues,optionalBaseComponentValues) {
        
        var menuItemList = [];
        
        for(var i = 0; i < this.standardComponents.length; i++) {
            let key = this.standardComponents[i];
            let generator = this.componentGenerators[key];
            
            let menuItem = {};
            menuItem.title = "Add " + generator.displayName;
            menuItem.callback = () => addComponent(this,generator,optionalInitialProperties,optionalBaseMemberValues,optionalBaseComponentValues);
            menuItemList.push(menuItem);
        }

        //add the additional component item
        let menuItem = {};
        menuItem.title = "Other Components...";
        menuItem.callback = () => addAdditionalComponent(this,optionalInitialProperties,optionalBaseMemberValues,optionalBaseMemberValues);
        menuItemList.push(menuItem);

        return menuItemList;
    }

}


Apogee.DEFAULT_WORKSPACE_NAME = "workspace";