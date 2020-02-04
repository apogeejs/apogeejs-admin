import apogeeui from "/apogeeui/apogeeui.js";
import TreeEntry from "/apogeeui/treecontrol/TreeEntry.js";

import {updateWorkspaceProperties} from "/apogeeview/commandseq/updateworkspaceseq.js";
import ReferenceView from "/apogeeview/references/ReferenceView.js";
import ModelView from "/apogeeview/ModelView.js";

/** This class manages the user interface for a workspace object. */
export default class WorkspaceView {

    constructor(workspaceManager,appView) {

        //yes these
        this.workspaceManager = workspaceManager;
        this.app = workspaceManager.getApp();
        this.appView = appView;

        this.treeEntry = null;

        this.init();
    }

    getTreeEntry() {
        return this.treeEntry;
    }

    getTabFrame() {
        return this.appView.getTabFrame();
    }

    getApp() {
        return this.app;
    }

    setName(name) {
        this.treeEntry.setLabel(name);
    }

    //====================================
    // Workspace Management
    //====================================

    setViewJsonState(workspaceJson) { 
        let tabFrame = this.appView.getTabFrame();
        let modelManager = this.workspaceManager.getModelManager();
        let model = modelManager.getModel();
        if(workspaceJson.openTabs) {
            workspaceJson.openTabs.map(memberName => {
                var openTabMember = model.getMemberByFullName(memberName);
                if(openTabMember) {
                    var openTabComponent = this.nodelManager.getComponent(openTabMember);
                    openTabComponent.createTabDisplay();
                }
            });
            if(workspaceJson.activeTabMember) {
                var activeTabMember = model.getMemberByFullName(workspaceJson.activeTabMember);
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
            json.openTabs = openTabs.map(tabId => this.modelManager.getMemberNameFromId(tabId));
        }
        var activeTabId = tabFrame.getActiveTab();
        if(activeTabId) {
            json.activeTabMember = this.modelManager.getMemberNameFromId(activeTabId);
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

        //model manager
        this.modelView = new ModelView(this,this.workspaceManager.getModelManager());
        let modelTreeEntry = this.modelView.getTreeEntry();
        this.treeEntry.addChild(modelTreeEntry);

        //reference mamageger
        this.referenceView = new ReferenceView(this.app,this.workspaceManager.getReferenceManager());
        let refTreeEntry = this.referenceView.getTreeEntry();
        this.treeEntry.addChild(refTreeEntry);
    }

    createTreeEntry() {
        //generally we expct the workspace not to exist yet. We will update this when it opens.
        let modelManager = this.workspaceManager.getModelManager();
        let model = modelManager.getModel();
        var labelText = model ? model.getName() : Workspace_OPENING_NAME; //add the name
        var iconUrl = this.getIconUrl();
        var menuItemCallback = () => this.getMenuItems();
        var isRoot = true;
        return new TreeEntry(labelText, iconUrl, null, menuItemCallback,isRoot);
    }

    /** This method returns the icon url for the component. */
    getIconUrl() {
        return apogeeui.getResourcePath(WorkspaceView.ICON_RES_PATH);
    }

    getMenuItems() {
        //menu items
        var menuItemList = [];

        //add the standard entries
        var itemInfo = {};
        itemInfo.title = "Edit Properties";
        itemInfo.callback = () => updateWorkspaceProperties(this);
        menuItemList.push(itemInfo);

        //DEV ENTRY
        itemInfo = {};
        itemInfo.title = "Print Dependencies";
        itemInfo.callback = () => this.showDependencies();
        menuItemList.push(itemInfo);

        return menuItemList;
    }


}

let Workspace_OPENING_NAME = "opening...";

WorkspaceView.ICON_RES_PATH = "/componentIcons/workspace.png";   