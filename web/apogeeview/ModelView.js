import apogeeui from "/apogeeui/apogeeui.js";
import TreeEntry from "/apogeeui/treecontrol/TreeEntry.js";

import JsonTableComponentView from "/apogeeview/componentviews/JsonTableComponentView.js";
import FolderComponentView from "/apogeeview/componentviews/FolderComponentView.js";

/** This class manages the user interface for a workspace object. */
export default class ModelView {

    constructor(workspaceView,modelManager) {

        //yes these
        this.modelManager = modelManager;
        this.workspaceView = workspaceView;

        this.treeEntry = null;

        //I want a better checking and handling of the root folder being loaded, just once
        this.rootFolderLoaded = false;

        this.componentViewMap = {};

        this.init();

        //subscribe to events
        this.modelManager.addListener("created",target => this.targetCreated(target));
        this.modelManager.addListener("updated",target => this.targetUpdated(target));
        this.modelManager.addListener("deleted",target => this.targetDeleted(target));

        //TEMPORARY########################################################################
        this.modelManager.setModelView(this);
        //##################################################################################
    }

    getTreeEntry() {
        return this.treeEntry;
    }

    getTabFrame() {
        return this.workspaceView.getTabFrame();
    }

    getComponentView(componentId) {
        return this.componentViewMap[componentId];
    }

    getApp() {
        return this.workspaceView.getApp();
    }

    //-----------------------------------
    // Save methods
    //-----------------------------------
    
    /** This method will be called to prepare for a workspace save. It lets
     * the UI save its current state. */
    prepareSave() {
        for(let componentId in this.componentViewMap) {
            let componentView = this.componentViewMap[componentId];
            componentView.prepareSave();

        }
    }

    //================================
    // Target Event handlers
    //================================

    targetCreated(eventData) {
        let target = eventData.target;
        if(target.getTargetType() == "component") {
            this.onComponentCreated(target);
        }
    }

    targetUpdated(eventData) {
        let target = eventData.target;
        if(target.getTargetType() == "model") {
            this.onModelUpdated(target);
        }
    }

    targetDeleted(eventData) {
        let target = eventData.target;
        if(target.getTargetType() == "model") {
            this.onModelClosed(target);
        }
        else if(target.getTargetType() == "component") {
            this.onComponentDeleted(target);
        }
    }

    /** This is called on component created events. We only 
     * want to respond to the root folder event here.
     */
    onComponentCreated(component) {

        //create the component view
        let componentViewClass = ModelView.getComponentViewClass(component.componentGenerator.uniqueName);
        let componentView;
        if(componentViewClass) {
            componentView = new componentViewClass(this,component);
        }

        if(!componentView) {
            componentView = new ERROR_COMPONENT_VIEW_CLASS(this,component);
        }

        this.componentViewMap[component.getId()] = componentView;

        //add to the proper parent
        let parentComponent = component.getParentComponent();
        if(parentComponent) {
            let parentComponentView = this.getComponentView(parentComponent.getFullName());
            if(parentComponentView) {
                parentComponentView.addChild(componentView);
            }
        }
        else {
            //this is the root component
            if(this.rootFolderLoaded) {
                //figure out how to handle this!!!
                alert("Root folder already loaded!");
            }
            this.treeEntry.addChild(componentView.getTreeEntry(true));
            this.rootFolderLoaded = true;
        }
    }

    onComponentDeleted(component) {
        let componentView = this.componentViewMap[component.getId()];
        delete this.componentViewMap[component.getId()];

        //add to the proper parent
        let parentComponent = component.getParent();
        if(parentComponent) {
            let parentComponentView = this.getComponentView(parentComponent.getFullName());
            if(parentComponentView) {
                parentComponentView.removeChild(componentView);
            }
        }
        else {
            //this is the root component
            if(rootFolderLoaded) {
                //figure out how to handle this!!!
                alert("Root folder already loaded!");
            }
            this.treeEntry.removeChild(componentView.getTreeEntry(true));
            this.rootFolderLoaded = false;
        }
    }

    onModelUpdated(workspaceManager) {

        //TBD - should I change the local workspace UI object? I will want to if it is replaced at each update
        //then I might need to do more... (root folder update, etc)

        if((modelManager.fieldUpdated("name"))&&(this.treeEntry)) {
            this.workspaceView.setName(model.getWorkspace().getName());
        }
    }

    onModelClosed(workspace) {
        //we need to make sure the tab frame is cleared of anything the workspace put in it (soemthing else may be using it too)
    }

    //====================================
    // Workspace Management
    //====================================

    setViewJsonState(workspaceJson) { 
        let tabFrame = this.appView.getTabFrame();
        let workspace = this.workspaceManager.getWorkspace();
        if(workspaceJson.openTabs) {
            workspaceJson.openTabs.map(memberName => {
                var openTabMember = workspace.getMemberByFullName(memberName);
                if(openTabMember) {
                    var openTabComponent = this.workspaceManager.getComponent(openTabMember);
                    openTabComponent.createTabDisplay();
                }
            });
            if(workspaceJson.activeTabMember) {
                var activeTabMember = workspace.getMemberByFullName(workspaceJson.activeTabMember);
                if(activeTabMember) {
                    tabFrame.setActiveTab(activeTabMember.getId());
                }
            }
        }
    }

    appendViewJsonState(json) {
        let tabFrame = this.appView.getTabFrame();
        var openTabs = tabFrame.getOpenTabs();
        if(openTabs.length > 0) {
            json.openTabs = openTabs.map(tabId => this.workspaceManager.getMemberNameFromId(tabId));
        }
        var activeTabId = tabFrame.getActiveTab();
        if(activeTabId) {
            json.activeTabMember = this.workspaceManager.getMemberNameFromId(activeTabId);
        }
    }

    /** This method gets the workspace object. */
    close() {
        //remove tree entry (if tree active)
        if(this.tree) {
            this.tree.clearRootEntry();
        }
    }

    //====================================
    // properties and display
    //====================================

    init() {
        this.treeEntry = this.createTreeEntry();
        this.treeEntry.setState(TreeEntry.EXPANDED);

        //TEMPORARY COMPONENT VIEW REGISTRATION#################################
        ModelView.registerComponentView(JsonTableComponentView);
        ModelView.registerComponentView(FolderComponentView);
        //######################################################################
    }

    createTreeEntry() {
        var iconUrl = this.getIconUrl();
        var isRoot = true;
        return new TreeEntry(MODEL_FOLDER_LABEL, iconUrl, null, null, isRoot);
    }

    /** This method returns the icon url for the component. */
    getIconUrl() {
        return apogeeui.getResourcePath(ICON_RES_PATH);
    }

    //========================================
    // Static Functions
    //========================================

    static registerComponentView(viewClass) {
        componentClassMap[viewClass.componentName] = viewClass;
    }

    static getComponentViewClass(componentName) {
        return componentClassMap[componentName];
    }

}

let componentClassMap = {};

let MODEL_FOLDER_LABEL = "Model";

let ICON_RES_PATH = "/componentIcons/folder.png";   