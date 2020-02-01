import apogeeui from "/apogeeui/apogeeui.js";
import TreeEntry from "/apogeeui/treecontrol/TreeEntry.js";

import {updateWorkspaceProperties} from "/apogeeview/commandseq/updateworkspaceseq.js";
import ReferenceView from "/apogeeview/references/ReferenceView.js";
import ModelView from "/apogeeview/ModelView.js";

/** This class manages the user interface for a workspace object. */
export default class WorkspaceUIView {

    constructor(workspaceUI,appView) {

        //yes these
        this.workspaceUI = workspaceUI;
        this.app = workspaceUI.getApp();
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
        let workspace = this.workspaceUI.getWorkspace();
        if(workspaceJson.openTabs) {
            workspaceJson.openTabs.map(memberName => {
                var openTabMember = workspace.getMemberByFullName(memberName);
                if(openTabMember) {
                    var openTabComponent = this.workspaceUI.getComponent(openTabMember);
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
            json.openTabs = openTabs.map(tabId => this.workspaceUI.getMemberNameFromId(tabId));
        }
        var activeTabId = tabFrame.getActiveTab();
        if(activeTabId) {
            json.activeTabMember = this.workspaceUI.getMemberNameFromId(activeTabId);
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
        this.modelView = new ModelView(this,this.workspaceUI.getModelManager());
        let modelTreeEntry = this.modelView.getTreeEntry();
        this.treeEntry.addChild(modelTreeEntry);

        //reference mamageger
        this.referenceView = new ReferenceView(this.app,this.workspaceUI.getReferenceManager());
        let refTreeEntry = this.referenceView.getTreeEntry();
        this.treeEntry.addChild(refTreeEntry);
    }

    createTreeEntry() {
        //generally we expct the workspace not to exist yet. We will update this when it opens.
        let modelManager = this.workspaceUI.getModelManager();
        let workspace = modelManager.getWorkspace();
        var labelText = workspace ? workspace.getName() : WORKSPACE_OPENING_NAME; //add the name
        var iconUrl = this.getIconUrl();
        var menuItemCallback = () => this.getMenuItems();
        var isRoot = true;
        return new TreeEntry(labelText, iconUrl, null, menuItemCallback,isRoot);
    }

    /** This method returns the icon url for the component. */
    getIconUrl() {
        return apogeeui.getResourcePath(WorkspaceUIView.ICON_RES_PATH);
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

let WORKSPACE_OPENING_NAME = "opening...";

WorkspaceUIView.ICON_RES_PATH = "/componentIcons/workspace.png";   