import apogeeui from "/apogeeui/apogeeui.js";
import TreeEntry from "/apogeeui/treecontrol/TreeEntry.js";

import {updateWorkspaceProperties} from "/apogeeview/commandseq/updateworkspaceseq.js";
import ReferenceView from "/apogeeView/references/ReferenceView.js";

/** This class manages the user interface for a workspace object. */
export default class WorkspaceUIView {

    constructor(workspaceUI,appView) {

        //yes these
        this.workspaceUI = workspaceUI;
        this.app = workspaceUI.getApp();
        this.appView = appView;

        this.treeEntry = null;

        //I want a better checking and handling of the root folder being loaded, just once
        this.rootFolderLoaded = true;

        this.init();

        //subscribe to events
        this.workspaceUI.addListener("created",target => this.targetCreated(target));
        this.workspaceUI.addListener("updated",target => this.targetUpdated(target));
        this.workspaceUI.addListener("deleted",target => this.targetDeleted(target));
    }

    getTreeEntry() {
        return this.treeEntry;
    }

    getTabFrame() {
        return this.appView.getTabFrame();
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
        if(target.getTargetType() == "workspace") {
            this.onWorkspaceUpdated(target);
        }
    }

    targetDeleted(eventData) {
        let target = eventData.target;
        if(target.getTargetType() == "workspace") {
            this.onWorkspaceClosed(target);
        }
    }

    /** This is called on component created events. We only 
     * want to respond to the root folder event here.
     */
    onComponentCreated(component) {
        //discard an old view if there is one
        let parentMember = component.getParent();
        if(!parentMember) {

            //make sure we don't already have one??!!
            if(this.rootFolderLoaded) throw new Error("Root folder already loaded!")

            this.loadRootFolder(rootFolderComponent);
        }
    }

    onWorkspaceUpdated(workspaceUI) {

        //TBD - should I change the local workspace UI object? I will want to if it is replaced at each update
        //then I might need to do more... (root folder update, etc)

        if((workspaceUI.fieldUpdated("name"))&&(this.treeEntry)) {
            this.treeEntry.setLabel(workspaceUI.getWorkspace().getName());
        }
    }

    onWorkspaceClosed(workspaceUI) {
        //we need to make sure the tab frame is cleared of anything the workspace put in it (soemthing else may be using it too)
    }

    //====================================
    // Workspace Management
    //====================================
     
    loadRootFolder(rootFolderComponent) {
        //our workspace is loaded. make sure out name is correct
        this.treeEntry.setLabel(this.workspaceUI.getWorkspace().getName());
        //add the root folder component
        this.treeEntry.addChild(rootFolderComponent.getTreeEntry(true));
        this.rootFolderLoaded = true;
    }

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

        //reference mamageger
        this.referenceView = new ReferenceView(this.app,this.workspaceUI.getReferenceManager());
        let refTreeEntry = this.referenceView.getTreeEntry();
        this.treeEntry.addChild(refTreeEntry);
    }

    createTreeEntry() {
        //generally we expct the workspace not to exist yet. We will update this when it opens.
        let workspace = this.workspaceUI.getWorkspace();
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