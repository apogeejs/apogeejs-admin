import {closeWorkspace} from "/apogeeview/commandseq/closeworkspaceseq.js";
import {createWorkspace} from "/apogeeview/commandseq/createworkspaceseq.js";
import {openWorkspace} from "/apogeeview/commandseq/openworkspaceseq.js";
import {saveWorkspace} from "/apogeeview/commandseq/saveworkspaceseq.js";

import WorkspaceView from "/apogeeappview/WorkspaceView.js";

import {uiutil,TabFrame,Menu,SplitPane,TreeControl,DisplayAndHeader,showSimpleActionDialog} from "/apogeeui/apogeeUiLib.js";

import {Apogee} from "/apogeeapp/apogeeAppLib.js";

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
            this._loadUI(containerId);
        }

        this._subscribeToAppEvents();
    }

    getTreePane() {
        return this.treePane;
    }

    getTabFrame() {
        return this.tabFrame;
    }

    getApp() {
        return this.app;
    }

    ///** This method should be implemented if custom menus or menu items are desired. */
    //addToMenuBar(menuBar,menus);

    //==============================
    // Private Methods
    //==============================

    //---------------------------------
    // User Interface Creation Methods
    //---------------------------------

    /** This method creates the app ui. 
     * @private */
    _loadUI(containerId) {
        
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
        var menuBar = this._createMenuBar();
        mainContainer.getHeader().appendChild(menuBar);
        
        //----------------------
        //create the split pane
        //----------------------
        this.splitPane = new SplitPane(
                SplitPane.SCROLLING_PANE,
                SplitPane.FIXED_PANE
            );
        let contentOutsideMenuBar = this.splitPane.getOuterElement();
        //adding this class puts the content at lower z-index than menu bar.
        contentOutsideMenuBar.classList.add("content_outside_menu_bar");
        mainContainer.getBody().appendChild(contentOutsideMenuBar);

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
        this.tabFrame.addListener(uiutil.SHOWN_EVENT,tab => this._onTabShown(tab));
        this.tabFrame.addListener(uiutil.HIDDEN_EVENT,tab => this._onTabHidden(tab));

        //-----------------------
        // Create the width resize listener (for now I am putting it in app - refering to both panes)
        //-----------------------

        this.splitPane.addListener("move",() => this._onSplitPaneResize());
        window.addEventListener("resize",() => this._onWindowResize());

        //-------------------------------
        // disable drag globally
        //---------------------------------

        //disable dragging globally by stapping drag start in window during capture
        let preventAction = (event) => {
            event.preventDefault();
        }
        window.addEventListener("dragstart",preventAction,true);
    }

    //-----------------------------------
    // workspace event handling
    //-----------------------------------

    /** This method subscribes to workspace events to update the UI. It is called out as a separate method
     * because we must reload it each time the app is created. */
    _subscribeToAppEvents() {
        //subscribe to events
        this.app.addListener("workspaceManager_created",workspaceManager => this._onWorkspaceCreated(workspaceManager));
        this.app.addListener("workspaceManager_deleted",workspaceManager => this._onWorkspaceClosed(workspaceManager));
        this.app.addListener("component_updated",component => this._onComponentUpdated(component));
    }

    _onWorkspaceCreated(workspaceManager) {
        if(this.workspaceView != null) {
            //discard an old view if there is one
            this._onWorkspaceClosed();
        }

        //create the new workspace view
        this.workspaceView = new WorkspaceView(workspaceManager,this);

        //load the tree entry, if needed
        if(this.containerId) {
            let treeEntry = this.workspaceView.getTreeEntry();
            this.tree.setRootEntry(treeEntry);
        }
    }

    _onWorkspaceClosed(workspaceManager) {
        //close any old workspace view
        if(this.workspaceView) {
            this.workspaceView.close();
            this.workspaceView = null;
        }

        //clear the tree
        if(this.containerId) {
            this.tree.clearRootEntry();
        }

        //rather than rely on people to clear their own workspace handlers from the app
        //I clear them all here
        //I haven't decided the best way to do this. In the app? Here? I see problems
        //with all of them.
        //for now I clear all here and then resubscribe to events here and in the app, since those
        //objects live on.
        this.app.clearListenersAndHandlers();
        this.app.subscribeToAppEvents();
        this._subscribeToAppEvents();
    }

    /** This is called whenever a component in the model, or the model, changes. If the display name
     * of that component changes, we update the tab display name. This is also not very general. I should
     * clean it up to allow other things besides components to have tabs. I should probably make a tab event that
     * its title changes, or just that it was udpated. */
    _onComponentUpdated(component) {
        //tab id for components is the component id
        if((component.getId() == this.tabFrame.getActiveTab())) {
            //this is pretty messy too... 
            let model = this.app.getModel();
            if((component.isDisplayNameUpdated())||(component.getMember().isFullNameUpdated(model))) {
                let tab = this.tabFrame.getTab(component.getId());
                this._onTabShown(tab);
            }
        }
    }


    //------------------------------
    // Active Tab display name handling logic
    // This is not good. I need to clean a few things up.
    // - the id is the component id. If we geet tabs for other things we will need a more general id
    // - by the same token, we should have a way of getting the display name from the tab itself, as part of the tab interface.
    //------------------------------
    _onTabHidden(tab) {
        this.activeTabIconDisplay.style.display = "none";
        this.activeTabTitleDisplay.style.display = "none";
    }

    _onTabShown(tab) {
        if(!this.workspaceView) return;
        let modelView = this.workspaceView.getModelView();
        if(modelView) {
            var componentId = tab.getId();
            let tabComponentView = modelView.getComponentViewByComponentId(componentId)
            if(tabComponentView) {
                this.activeTabIconDisplay.src = tabComponentView.getIconUrl();
                this.activeTabTitleDisplay.innerHTML = tabComponentView.getDisplayName(true,modelView.getModelManager());
                this.activeTabIconDisplay.style.display = "";
                this.activeTabTitleDisplay.style.display = "";
            }
        }
    }

    //---------------------------------
    // Width resize events - for tab frame and tree frame
    //---------------------------------

    _onSplitPaneResize() {
        this._triggerResizeWait();
    }

    _onWindowResize() {
        this._triggerResizeWait();
    }

    _triggerResizeWait() {
        //only do the slow resizde timer if we have listeners
        if(!this.app.hasListeners("frameWidthResize")) return;

        //create a new timer if we don't already have one
        if(!this.resizeWaitTimer) {
            this.resizeWaitTimer =  setTimeout(() => this._resizeTimerExpired(),RESIZE_TIMER_PERIOD_MS);
        }
    }

    _resizeTimerExpired() {
        this.resizeWaitTimer = null;
        this.app.dispatchEvent("frameWidthResize",null);
    }

    //=================================
    // Menu Functions
    //=================================

    /** This method creates the creates the menu bar, with the attached functionality. 
     * @private */
    _createMenuBar() {
        
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

        //apogee icon
        let apogeeIcon = document.createElement("img");
        apogeeIcon.src = uiutil.getResourcePath("/shortlogo16.png");
        apogeeIcon.className = "menu_bar_icon";
        menuBarLeft.appendChild(apogeeIcon);
        // apogeeIcon.onclick = () => {
        //     this.minimizeContent();
        // }

        //Workspace menu
        name = "File";
        this.workspaceMenu = Menu.createMenu(name);
        //add custom spacing
        let workspaceMenuElement = this.workspaceMenu.getElement();
        workspaceMenuElement.style.marginLeft = "8px";
        workspaceMenuElement.style.marginRight = "2px";
        workspaceMenuElement.style.marginTop = "2px";
        workspaceMenuElement.style.marginBottom = "2px";
        menuBarLeft.appendChild(workspaceMenuElement);
        menus[name] = this.workspaceMenu;
        
        //populate the workspace menu on the fly - depends on workspace state
        var getWorkspaceMenuCallback = () => this._getWorkspaceMenuItems();
        this.workspaceMenu.setAsOnTheFlyMenu(getWorkspaceMenuCallback);
        
        //Edit menu
        name = "Edit";
        this.editMenu = Menu.createMenu(name);
        //add custom spacing
        let editMenuElement = this.editMenu.getElement();
        editMenuElement.style.marginLeft = "8px";
        editMenuElement.style.marginRight = "2px";
        editMenuElement.style.marginTop = "2px";
        editMenuElement.style.marginBottom = "2px";
        menuBarLeft.appendChild(editMenuElement);
        menus[name] = this.editMenu;
        
        //populate the workspace menu on the fly - depends on workspace state
        var getEditMenuCallback = () => this._getEditMenuItems();
        this.editMenu.setAsOnTheFlyMenu(getEditMenuCallback);

        //Edit menu
        name = "Help";
        this.helpMenu = Menu.createMenu(name);
        //add custom spacing
        let helpMenuElement = this.helpMenu.getElement();
        helpMenuElement.style.marginLeft = "8px";
        helpMenuElement.style.marginRight = "2px";
        helpMenuElement.style.marginTop = "2px";
        helpMenuElement.style.marginBottom = "2px";
        menuBarLeft.appendChild(helpMenuElement);
        menus[name] = this.helpMenu;
        
        //populate the workspace menu on the fly - depends on workspace state
        var getHelpMenuCallback = () => this._getHelpMenuItems();
        this.helpMenu.setAsOnTheFlyMenu(getHelpMenuCallback);
        
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
    _getWorkspaceMenuItems() {
        
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
    _getEditMenuItems() {
        
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

    _getHelpMenuItems() {
        var menuItems = [];
        var menuItem;

        //help entry
        menuItem = {};
        menuItem.title = "Apogee Help";
        menuItem.callback = helpCallback;
        menuItems.push(menuItem);
        
        //about entry
        menuItem = {};
        menuItem.title = "About";
        menuItem.callback = aboutCallback;
        menuItems.push(menuItem);
        
        return menuItems;
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

function helpCallback() {
    let title = "Apogee Help";
    let message;
    //if we are in a browser, allow the user to open the link. Otherwise just print it.
    if(__browser__) {
        message = 'For help, please go to the website: <a href="https://www.apogeejs.com" target="_blank">https://www.apogeejs.com</a>'
    }
    else {
        message = 'For help, please go to the website: <b>https://www.apogeejs.com</b>'
    }
    showSimpleActionDialog(title,message,["OK"]);
}

function aboutCallback() {
    let title = "Apogee Programming Environment";
    let message = "Version: " + __apogee_version__;
    showSimpleActionDialog(title,message,["OK"]);
}