import apogeeui from "/apogeeui/apogeeui.js";
import TreeEntry from "/apogeeui/treecontrol/TreeEntry.js";

import ApogeeView from "/apogeeview/ApogeeView.js"

/** This class manages the user interface for a workspace object. */
export default class ModelView {

    constructor(workspaceView,modelManager) {

        //yes these
        this.modelManager = modelManager;
        this.workspaceView = workspaceView;

        this.treeEntry = null;

        this.componentViewMap = {};

        this.init();

        //subscribe to events
        let app = this.modelManager.getApp();
        app.addListener("component_created",component => this.onComponentCreated(component));
        app.addListener("component_updated",component => this.onComponentUpdated(component));
        app.addListener("component_deleted",component => this.onComponentDeleted(component));
        app.addListener("modelManager_updated",modelManager => this.onModelManagerUpdated(modelManager));

        this.modelManager.setViewStateCallback(() => this.getViewState());
    }

    getTreeEntry() {
        return this.treeEntry;
    }

    getTabFrame() {
        return this.workspaceView.getTabFrame();
    }

    getComponentViewByComponentId(componentId) {
        return this.componentViewMap[componentId];
    }

    getApp() {
        return this.workspaceView.getApp();
    }

    getWorkspaceView() {
        return this.workspaceView;
    }

    getModelManager() {
        return this.modelManager;
    }

    getAppView() {
        return this.workspaceView.getAppView();
    }

    closeWorkspace() {
        for(let viewId in this.componentViewMap) {
            let componentView = this.componentViewMap[viewId];
            componentView.closeWorkspace();
        }
    }

    //================================
    // Event handlers
    //================================


    /** This is called on component created events. We only 
     * want to respond to the root folder event here.
     */
    onComponentCreated(component) {
        //create the component view
        let componentViewClass = ApogeeView.getComponentViewClass(component.constructor.uniqueName);
        let componentView;
        if(componentViewClass) {
            componentView = new componentViewClass(this,component);
        }

        if(!componentView) {
            componentView = new ERROR_COMPONENT_VIEW_CLASS(this,component);
        }

        this.componentViewMap[component.getId()] = componentView;

        //add this entry to the proper parent.
        let parentComponentView = componentView.getParentComponentView();
        if(parentComponentView) {
            parentComponentView.addChild(componentView);
        }
        else {
            //this is a root component
            this.treeEntry.addChild(componentView.getTreeEntry());
        }

        //do view state initialization
        componentView.loadViewStateFromComponent();
    }

    onComponentUpdated(component) {
        let componentView = this.getComponentViewByComponentId(component.getId());
        componentView.componentUpdated(component);
    }

    onComponentDeleted(component) {
        let componentId = component.getId();

        let componentView = this.componentViewMap[componentId];
        if(componentView) {
            componentView.onDelete();
    
            //remove from the parent parent
            let parentComponentView = componentView.getLastAssignedParentComponentView();
            if(parentComponentView) {
                parentComponentView.removeChild(componentView);
            }
            else {
                //this is a root component
                this.treeEntry.removeChild(componentView.getTreeEntry());
            }
        }

        delete this.componentViewMap[componentId];
    }

    onModelManagerUpdated(modelManager) {
        this.modelManager = modelManager;
        let model = this.modelManager.getModel();
        if(model.isFieldUpdated("name")) {
            this.workspaceView.setName(model.getName());
        }
    }

    //====================================
    // properties and display
    //====================================

    getViewState() {
        if(this.treeEntry) {
            return {treeState: this.treeEntry.getState()};
        }
    }

    init() {
        this.treeEntry = this.createTreeEntry();
        this.treeEntry.setState(TreeEntry.EXPANDED);

        let viewState = this.modelManager.getCachedViewState();
        if((viewState)&&(viewState.treeState !== undefined)) {
            this.treeEntry.setState(viewState.treeState)
        }
    }

    createTreeEntry() {
        var iconUrl = apogeeui.getResourcePath(ICON_RES_PATH);
        var isRoot = true;
        return new TreeEntry(MODEL_FOLDER_LABEL, iconUrl, null, null, isRoot);
    }

}

let MODEL_FOLDER_LABEL = "Code";

let ICON_RES_PATH = "/componentIcons/folder.png";   