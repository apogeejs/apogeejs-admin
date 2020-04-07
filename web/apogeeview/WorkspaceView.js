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
        this.modelView = null;

        this.treeEntry = null;

        this.init();

        this.app.addListener("workspaceManager_updated",workspaceManager => this.onWorkspaceUpdated(workspaceManager));

        //Thisis used to retieve UI state to save when the app is being saved
        this.workspaceManager.setViewStateCallback(() => this.getViewState());
    }

    getTreeEntry() {
        return this.treeEntry;
    }

    getTabFrame() {
        return this.appView.getTabFrame();
    }

    getModelView() {
        return this.modelView;
    }

    getApp() {
        return this.app;
    }

    getWorkspaceManager() {
        return this.workspaceManager;
    }

    getAppView() {
        return this.appView;
    }

    /** This sets the name label on the workspace. The name comes from the model, however, we will display it on the workspace object. */
    setName(name) {
        this.treeEntry.setLabel(name);
    }

    /** This method takes any actions on workspace close. */
    close() {
        if(this.modelView) {
            this.modelView.closeWorkspace();
        }
        if(this.referenceView) {
            this.referenceView.closeWorkspace();
        }
    }

    onWorkspaceUpdated(workspaceManager) {
        this.workspaceManager = workspaceManager;
        this.workspaceManager.setViewStateCallback(() => this.getViewState());
    }

    //====================================
    // properties and display
    //====================================

    /** Thie methor retrieves a serialized UI state, to be used during save. */
    getViewState() {
        if(this.treeEntry) {
            return {treeState: this.treeEntry.getState()};
        }
    }

    init() {
        this.treeEntry = this.createTreeEntry();

        //model manager
        this.modelView = new ModelView(this,this.workspaceManager.getModelManager());
        let modelTreeEntry = this.modelView.getTreeEntry();
        this.treeEntry.addChild(modelTreeEntry);

        //reference mamageger
        this.referenceView = new ReferenceView(this.app,this.workspaceManager.getReferenceManager());
        let refTreeEntry = this.referenceView.getTreeEntry();
        this.treeEntry.addChild(refTreeEntry);

        //set the view state
        let viewState = this.workspaceManager.getCachedViewState();
        if((viewState)&&(viewState.treeState !== undefined)) {
            this.treeEntry.setState(viewState.treeState)
        }
        else {
            this.treeEntry.setState(TreeEntry.EXPANDED);
        }
    }

    createTreeEntry() {
        //generally we expct the workspace not to exist yet. We will update this when it opens.
        let modelManager = this.workspaceManager.getModelManager();
        let model = modelManager.getModel();
        var labelText = model ? model.getName() : Workspace_OPENING_NAME; //add the name
        var iconUrl = apogeeui.getResourcePath(WorkspaceView.ICON_RES_PATH);
        var menuItemCallback = () => this.getMenuItems();
        var isRoot = true;
        return new TreeEntry(labelText, iconUrl, null, menuItemCallback,isRoot);
    }

    getMenuItems() {
        //menu items
        var menuItemList = [];

        //add the standard entries
        var itemInfo = {};
        itemInfo.title = "Edit Properties";
        itemInfo.callback = () => updateWorkspaceProperties(this.getWorkspaceManager());
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