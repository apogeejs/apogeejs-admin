import {addComponent, addAdditionalComponent} from "/apogeeview/commandseq/addcomponentseq.js";
import {closeWorkspace} from "/apogeeview/commandseq/closeworkspaceseq.js";
import {createWorkspace} from "/apogeeview/commandseq/createworkspaceseq.js";
import {importWorkspace} from "/apogeeview/commandseq/importworkspaceseq.js";
import {exportWorkspace} from "/apogeeview/commandseq/exportworkspaceseq.js";
import {openWorkspace} from "/apogeeview/commandseq/openworkspaceseq.js";
import {saveWorkspace} from "/apogeeview/commandseq/saveworkspaceseq.js";

import WorkspaceView from "/apogeeview/WorkspaceView.js";

import {uiutil,TabFrame,Menu,SplitPane,TreeControl,DisplayAndHeader} from "/apogeeui/apogeeUiLib.js";

import {Apogee,componentInfo} from "/apogeeapp/apogeeAppLib.js";

export default class ApogeeView {

    /** This creates the app view, which in turn creates the contained app.
     * - containerId - This is the DOM element ID in which the app view should be created. If this is set
     * to null (or other false value) the UI will not be created.
     * - appConfigManager - This is the app config managerm which defines some needed functionality. 
     */
    constructor(containerId,appConfigManager) {
        this.treePane = null;
        this.tabFrame = null;
        this.workspaceView = null;
        this.containerId = containerId;
        this.app = new Apogee(appConfigManager);
        
        if(containerId) {
            this.loadUI(containerId);
        }

        //subscribe to events
        this.app.addListener("workspaceManager_created",workspaceManager => this.onWorkspaceCreated(workspaceManager));
        this.app.addListener("workspaceManager_deleted",workspaceManager => this.onWorkspaceClosed(workspaceManager));
        this.app.addListener("component_updated",component => this.onComponentUpdated(component));
    }

    getTreePane() {
        return this.treePane;
    }

    getTabFrame() {
        return this.tabFrame;
    }

    getWorkspaceView() {
        return this.workspaceView;
    }

    getApp() {
        return this.app;
    }

    //================================
    // TargetEvent handlers
    //================================

    onWorkspaceCreated(workspaceManager) {
        if(this.workspaceView != null) {
            //discard an old view if there is one
            this.onWorkspaceClosed();
        }

        //create the new workspace view
        this.workspaceView = new WorkspaceView(workspaceManager,this);

        //load the tree entry, if needed
        if(this.containerId) {
            let treeEntry = this.workspaceView.getTreeEntry();
            this.tree.setRootEntry(treeEntry);
        }
    }

    onWorkspaceClosed(workspaceManager) {
        //close any old workspace view
        if(this.workspaceView) {
            this.workspaceView.close();
            this.workspaceView = null;
        }

        //clear the tree
        if(this.containerId) {
            this.tree.clearRootEntry();
        }
    }

    //=================================
    // User Interface Creation Methods
    //=================================

    /** This method creates the app ui. 
     * @private */
    loadUI(containerId) {
        
        var windowElements = uiutil.initWindows(containerId);
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

        //tree view
        this.tree = new TreeControl();
        uiutil.removeAllChildren(this.treePane);
        this.treePane.appendChild(this.tree.getElement());
        
        //----------------------
        //create the tab frame
        //----------------------
        this.tabFrame = new TabFrame();
        this.splitPane.getRightPaneContainer().appendChild(this.tabFrame.getElement());
        
        //add listener for displaying the active tab
        this.tabFrame.addListener(uiutil.SHOWN_EVENT,tab => this.onTabShown(tab));
        this.tabFrame.addListener(uiutil.HIDDEN_EVENT,tab => this.onTabHidden(tab));

        //-----------------------
        // Create the width resize listener (for now I am putting it in app - refering to both panes)
        //-----------------------

        this.splitPane.addListener("move",() => this.onSplitPaneResize());
        window.addEventListener("resize",() => this.onWindowResize());

    }

    //------------------------------
    // Active Tab display name handling logic
    // This is not good. I need to clean a few things up.
    // - the id is the component id. If we geet tabs for other things we will need a more general id
    // - by the same token, we should have a way of getting the display name from the tab itself, as part of the tab interface.
    //------------------------------
    onTabHidden(tab) {
        this.activeTabIconDisplay.style.display = "none";
        this.activeTabTitleDisplay.style.display = "none";
    }

    onTabShown(tab) {
        if(!this.workspaceView) return;

        let modelView = this.workspaceView.getModelView();
        let modelManager = modelView.getModelManager();
        
        var componentId = tab.getId();
        let tabComponentView = modelView.getComponentViewByComponentId(componentId)
        if(tabComponentView) {
            this.activeTabIconDisplay.src = tabComponentView.getIconUrl();
            this.activeTabTitleDisplay.innerHTML = tabComponentView.getDisplayName(true,modelManager);
            this.activeTabIconDisplay.style.display = "";
            this.activeTabTitleDisplay.style.display = "";
        }
    }

    /** This is called whenever a component in the model, or the model, changes. If the display name
     * of that component changes, we update the tab display name. This is also not very general. I should
     * clean it up to allow other things besides components to have tabs. I should probably make a tab event that
     * its title changes, or just that it was udpated. */
    onComponentUpdated(component) {
        //tab id for components is the component id
        if((component.getId() == this.tabFrame.getActiveTab())) {
            //this is pretty messy too... 
            let model = this.workspaceView.getModelView().getModelManager().getModel();
            if((component.isDisplayNameUpdated())&&(component.getMember().isFullNameUpdated(model))) {
                let tab = this.tabFrame.getTab(component.getId());
                this.onTabShown(tab);
            }
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
        if(!this.app.hasListeners("frameWidthResize")) return;

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
        var menuBar = uiutil.createElementWithClass("div","menu_bar");
        var menuBarLeft = uiutil.createElementWithClass("div","menu_bar_left",menuBar);
        var menuBarRight = uiutil.createElementWithClass("div","menu_bar_right",menuBar);

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
        
        // var importCallback = () => importWorkspace(this,this.app,this.fileAccessObject,FolderComponent,FolderComponentView);
        // menu.addCallbackMenuItem("Import as Folder",importCallback);
        
        // var import2Callback = () => importWorkspace(this,this.app,this.fileAccessObject,FolderFunctionComponent,FolderFunctionComponentView);
        // menu.addCallbackMenuItem("Import as Folder Function",import2Callback);
        
        // var exportCallback = () => exportWorkspace(this,this.fileAccessObject);
        // menu.addCallbackMenuItem("Export as Workspace",exportCallback);
        
        //allow the implementation to add more menus or menu items
        if(this.addToMenuBar) {
            this.addToMenuBar(menuBar,menus);
        }
        
        //add the active tab display
        this.activeTabIconDisplay = uiutil.createElementWithClass("img","tab-icon-display",menuBarRight);
        this.activeTabIconDisplay.style.display = "none";
        this.activeTabTitleDisplay = uiutil.createElementWithClass("div","tab-title-display",menuBarRight);
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

        let workspaceManager = this.app.getWorkspaceManager();
        if(workspaceManager) {
            var fileMetadata = workspaceManager.getFileMetadata();

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

        let standardComponents = componentConfig.getStandardComponentNames();
        
        var menuItemList = [];
        
        for(var i = 0; i < standardComponents.length; i++) {
            let componentName = standardComponents[i];
            let componentClass = componentInfo.getComponentClass(componentName);
            
            let menuItem = {};
            menuItem.title = "Add " + componentClass.displayName;
            menuItem.callback = () => addComponent(this,this.app,componentClass,optionalInitialProperties,optionalBaseMemberValues,optionalBaseComponentValues);
            menuItemList.push(menuItem);
        }

        //add the additional component item
        let menuItem = {};
        menuItem.title = "Other Components...";
        menuItem.callback = () => addAdditionalComponent(this,this.app,optionalInitialProperties,optionalBaseMemberValues,optionalBaseMemberValues);
        menuItemList.push(menuItem);

        return menuItemList;
    }

    
    //========================================
    // Static Functions
    //========================================

    /** This method is used to register a new component view class for the user interface. */
    static registerComponentView(viewClass) {
        componentClassMap[viewClass.componentName] = viewClass;
    }

    /** This method retrieves a component view class using the component unique name. */
    static getComponentViewClass(componentName) {
        return componentClassMap[componentName];
    }

}


let componentClassMap = {};

const RESIZE_TIMER_PERIOD_MS = 500;