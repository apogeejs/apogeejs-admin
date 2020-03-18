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
        this.modelManager.addListener("created",eventData => this.targetCreated(eventData));
        this.modelManager.addListener("updated",eventData => this.targetUpdated(eventData));
        this.modelManager.addListener("deleted",eventData => this.targetDeleted(eventData));

        this.modelManager.setViewStateCallback(() => this.getViewState());
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
        if(target.getTargetType() == "modelManager") {
            this.onModelUpdated(target);
        }
        if(target.getTargetType() == "component") {
            let componentView = this.getComponentView(target.getId());
            componentView.componentUpdated(target);
        }
    }

    targetDeleted(eventData) {
        if((eventData.targetId)&&(eventData.targetType == "component")) {
            this.onComponentDeleted(eventData.targetId);
        }
    }

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

    onComponentDeleted(memberId) {
        let componentView = this.componentViewMap[memberId];
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

        delete this.componentViewMap[memberId];
    }

    onModelUpdated(modelManager) {
        let model = modelManager.getModel();
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