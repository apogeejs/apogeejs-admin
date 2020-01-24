import {addComponent, addAdditionalComponent} from "/apogeeapp/app/commandseq/addcomponentseq.js";
import {closeWorkspace} from "/apogeeapp/app/commandseq/closeworkspaceseq.js";
import {createWorkspace} from "/apogeeapp/app/commandseq/createworkspaceseq.js";
import {importWorkspace} from "/apogeeapp/app/commandseq/importworkspaceseq.js";
import {exportWorkspace} from "/apogeeapp/app/commandseq/exportworkspaceseq.js";
import {openWorkspace} from "/apogeeapp/app/commandseq/openworkspaceseq.js";
import {saveWorkspace} from "/apogeeapp/app/commandseq/saveworkspaceseq.js";

import apogeeui from "/apogeeapp/ui/apogeeui.js";
import TabFrame from "/apogeeapp/ui/tabframe/TabFrame.js";
import Menu from "/apogeeapp/ui/menu/Menu.js";
import SplitPane from "/apogeeapp/ui/splitpane/SplitPane.js";
import DisplayAndHeader from "/apogeeapp/ui/displayandheader/DisplayAndHeader.js";

import "/apogeeapp/ui/configurablepanel/ConfigurablePanelInit.js";

export default class ApogeeView {

    constructor(app, containerId) {
        this.app = app;
        this.treePane = null;
        this.tabFrame = null;
        this.createUI(containerId);
    }

    getTreePane() {
        return this.treePane;
    }

    getTabFrame() {
        return this.tabFrame;
    }
    
    //=================================
    // User Interface Creation Methods
    //=================================

    /** This method creates the app ui. 
     * @private */
    createUI(containerId) {
        
        var windowElements = apogeeui.initWindows(containerId);
        var topContainer = windowElements.baseElement;
        
        var mainContainer = new DisplayAndHeader(DisplayAndHeader.FIXED_PANE,
                null,
                DisplayAndHeader.FIXED_PANE,
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
        this.splitPane = new SplitPane(
                SplitPane.SCROLLING_PANE,
                SplitPane.FIXED_PANE
            );
        mainContainer.getBody().appendChild(this.splitPane.getOuterElement());

        //---------------------
        //load the tree pane
        //---------------------
        this.treePane = this.splitPane.getLeftPaneContainer();
        
        //----------------------
        //create the tab frame
        //----------------------
        this.tabFrame = new TabFrame();
        this.splitPane.getRightPaneContainer().appendChild(this.tabFrame.getElement());
        
        //add listener for displaying the active tab
        this.tabFrame.addListener(apogeeui.SHOWN_EVENT,tab => this.onTabShown(tab));
        this.tabFrame.addListener(apogeeui.HIDDEN_EVENT,tab => this.onTabHidden(tab));

        //-----------------------
        // Create the width resize listener (for now I am putting it in app - refering to both panes)
        //-----------------------

        this.splitPane.addListener("move",() => this.onSplitPaneResize());
        window.addEventListener("resize",() => this.onWindowResize());

    }

    /** This method creates the app ui. 
     * @private */
    onTabHidden(tab) {
        this.activeTabIconDisplay.style.display = "none";
        this.activeTabTitleDisplay.style.display = "none";
    }

    onTabShown(tab) {
        let workspaceUI = this.app.getWorkspaceUI();
        if(!workspaceUI) return;
        
        var id = tab.getId();
        var component = workspaceUI.getComponentById(id);
        if(component) {
            this.activeTabIconDisplay.src = component.getIconUrl();
            this.activeTabTitleDisplay.innerHTML = component.getDisplayName(true);
            this.activeTabIconDisplay.style.display = "";
            this.activeTabTitleDisplay.style.display = "";
        }
    }

    //---------------------------------
    // Width resize events - for tab frame and tree frame
    //---------------------------------

    onSplitPaneResize() {
        this.triggerResizeWait();
    }

    onWindowResize() {
        this.triggerResizeWait();
    }

    triggerResizeWait() {
        //only do the slow resizde timer if we have listeners
        if(!this.hasListeners("frameWidthResize")) return;

        //create a new timer if we don't already have one
        if(!this.resizeWaitTimer) {
            this.resizeWaitTimer =  setTimeout(() => this.resizeTimerExpired(),RESIZE_TIMER_PERIOD_MS);
        }
    }

    resizeTimerExpired() {
        this.resizeWaitTimer = null;
        this.app.dispatchEvent("frameWidthResize",null);
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
        var menuBar = apogeeui.createElementWithClass("div","menu_bar");
        var menuBarLeft = apogeeui.createElementWithClass("div","menu_bar_left",menuBar);
        var menuBarRight = apogeeui.createElementWithClass("div","menu_bar_right",menuBar);

        //Workspace menu
        name = "Workspace";
        this.workspaceMenu = Menu.createMenu(name);
        menuBarLeft.appendChild(this.workspaceMenu.getElement());
        menus[name] = this.workspaceMenu;
        
        //populate the workspace menu on the fly - depends on workspace state
        var getWorkspaceMenuCallback = () => this.getWorkspaceMenuItems();
        this.workspaceMenu.setAsOnTheFlyMenu(getWorkspaceMenuCallback);
        
        //Edit menu
        name = "Edit";
        this.editMenu = Menu.createMenu(name);
        menuBarLeft.appendChild(this.editMenu.getElement());
        menus[name] = this.editMenu;
        
        //populate the workspace menu on the fly - depends on workspace state
        var getEditMenuCallback = () => this.getEditMenuItems();
        this.editMenu.setAsOnTheFlyMenu(getEditMenuCallback);
        
        //FOR NOW REMOVE GLOBAL COMPONENT AND IMPORT MENUS
        // //Components Menu
        // name = "Components";
        // menu = Menu.createMenu(name);
        // menuBarLeft.appendChild(menu.getElement());
        // menus[name] = menu;
        
        // //add create child elements
        // menu.setMenuItems(this.getAddChildMenuItems());
        
        // //libraries menu
        // name = "Import/Export";
        // menu = Menu.createMenu(name);
        // menuBarLeft.appendChild(menu.getElement());
        // menus[name] = menu;
        
        // var importCallback = () => importWorkspace(this,this.fileAccessObject,FolderComponent);
        // menu.addCallbackMenuItem("Import as Folder",importCallback);
        
        // var import2Callback = () => importWorkspace(this,this.fileAccessObject,FolderFunctionComponent);
        // menu.addCallbackMenuItem("Import as Folder Function",import2Callback);
        
        // var exportCallback = () => exportWorkspace(this,this.fileAccessObject);
        // menu.addCallbackMenuItem("Export as Workspace",exportCallback);
        
        //allow the implementation to add more menus or menu items
        if(this.addToMenuBar) {
            this.addToMenuBar(menuBar,menus);
        }
        
        //add the active tab display
        this.activeTabIconDisplay = apogeeui.createElementWithClass("img","tab-icon-display",menuBarRight);
        this.activeTabIconDisplay.style.display = "none";
        this.activeTabTitleDisplay = apogeeui.createElementWithClass("div","tab-title-display",menuBarRight);
        this.activeTabTitleDisplay.style.display = "none";
        return menuBar;
        
    }

    /** This method gets the workspace menu items. This is created on the fly because the
     * items will change depending on the state of the workspace. */
    getWorkspaceMenuItems() {
        
        let menuItems = [];
        let menuItem;

        let fileAccessObject = this.app.getFileAccessObject();
        
        menuItem = {};
        menuItem.title = "New";
        menuItem.callback = () => createWorkspace(this.app);
        menuItems.push(menuItem);
        
        menuItem = {};
        menuItem.title = "Open";
        menuItem.callback = () => openWorkspace(this.app,fileAccessObject);
        menuItems.push(menuItem);

        let workspaceUI = this.app.getWorkspaceUI();
        if(workspaceUI) {
            var fileMetadata = workspaceUI.getFileMetadata();

            if(fileAccessObject.directSaveOk(fileMetadata)) {
                menuItem = {};
                menuItem.title = "Save";
                menuItem.callback = () => saveWorkspace(this.app,fileAccessObject,true);
                menuItems.push(menuItem);
            }

            menuItem = {};
            menuItem.title = "Save as";
            menuItem.callback = () => saveWorkspace(this.app,fileAccessObject,false);
            menuItems.push(menuItem);
        }  

        menuItem = {};
        menuItem.title = "Close";
        menuItem.callback = () => closeWorkspace(this.app);
        menuItems.push(menuItem);
        
        return menuItems;
    }

    /** This method gets the workspace menu items. This is created on the fly because the
     * items will change depending on the state of the workspace. */
    getEditMenuItems() {
        
        var menuItems = [];
        var menuItem;

        let commandManager = this.app.getCommandManager();
        let commandHistory = commandManager.getCommandHistory();
        
        //populate the undo menu item
        var undoLabel;
        var undoCallback;
        var nextUndoDesc = commandHistory.getNextUndoDesc();
        if(nextUndoDesc === null) {
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
            undoCallback = () => commandHistory.undo();
        }
        menuItem = {};
        menuItem.title = undoLabel;
        menuItem.callback = undoCallback;
        menuItems.push(menuItem);
        
        //populate the redo menu item
        var redoLabel;
        var redoCallback;
        var nextRedoDesc = commandHistory.getNextRedoDesc();
        if(nextRedoDesc === null) {
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
            redoCallback = () => commandHistory.redo();
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

        let standardComponents = this.app.getStandardComponentNames();
        let componentGenerators = this.app.getComponentGenerators();
        
        var menuItemList = [];
        
        for(var i = 0; i < standardComponents.length; i++) {
            let key = standardComponents[i];
            let generator = componentGenerators[key];
            
            let menuItem = {};
            menuItem.title = "Add " + generator.displayName;
            menuItem.callback = () => addComponent(this.app,generator,optionalInitialProperties,optionalBaseMemberValues,optionalBaseComponentValues);
            menuItemList.push(menuItem);
        }

        //add the additional component item
        let menuItem = {};
        menuItem.title = "Other Components...";
        menuItem.callback = () => addAdditionalComponent(this.app,optionalInitialProperties,optionalBaseMemberValues,optionalBaseMemberValues);
        menuItemList.push(menuItem);

        return menuItemList;
    }

}

const RESIZE_TIMER_PERIOD_MS = 500;