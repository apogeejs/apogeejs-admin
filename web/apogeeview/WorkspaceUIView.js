import apogeeutil from "/apogeeutil/apogeeUtilLib.js";

import apogeeui from "/apogeeui/apogeeui.js";
import TreeEntry from "/apogeeui/treecontrol/TreeEntry.js";
import TreeControl from "/apogeeui/treecontrol/TreeControl.js";

import {updateWorkspaceProperties} from "/apogeeview/commandseq/updateworkspaceseq.js";

/** This class manages the user interface for a workspace object. */
export default class WorkspaceUIView {

    constructor(workspaceUI,appView) {

        //yes these
        this.workspaceUI = workspaceUI;
        this.appView = appView;

        //tab frame
        this.tabFrame = this.appView.getTabFrame();

        //tree view
        this.tree = new TreeControl();
        let treePane = this.appView.getTreePane();
        apogeeui.removeAllChildren(treePane);
        treePane.appendChild(this.tree.getElement());

        this.treeEntry = null;
    }

    getTabFrame() {
        return this.tabFrame;
    }

    //====================================
    // Workspace Management
    //====================================

     
    loadView(rootFolderComponent,referenceManager) {
        this.treeEntry = this.createTreeEntry();
        this.treeEntry.setState(TreeEntry.EXPANDED);
        this.tree.setRootEntry(this.treeEntry);
        this.treeEntry.addChild(rootFolderComponent.getTreeEntry(true));
        this.treeEntry.addChild(referenceManager.getTreeEntry(true));
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

    /** This method handles updates to the workspace.
     * @protected */    
    workspaceUpdated(eventInfo) {

        if((apogeeutil.isFieldUpdated(eventInfo.updated,"name"))) {
            //update name
            if(this.treeEntry) {
                this.treeEntry.setLabel(this.workspaceUI.getWorkspace().getName());
            }
        }
    }

    //====================================
    // properties and display
    //====================================

    createTreeEntry() {
        //menu item callback
        var labelText = this.workspaceUI.getWorkspace().getName(); //add the name
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

WorkspaceUIView.ICON_RES_PATH = "/componentIcons/workspace.png";   