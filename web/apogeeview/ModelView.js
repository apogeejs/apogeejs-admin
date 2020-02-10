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
        this.modelManager.addListener("created",target => this.targetCreated(target));
        this.modelManager.addListener("updated",target => this.targetUpdated(target));
        this.modelManager.addListener("deleted",target => this.targetDeleted(target));

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
        if(target.getTargetType() == "model") {
            this.onModelUpdated(eventData.fieldsUpdated);
        }
    }

    targetDeleted(eventData) {
        let target = eventData.target;
        if(target.getTargetType() == "component") {
            this.onComponentDeleted(target);
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

    onComponentDeleted(component) {
        let componentView = this.componentViewMap[component.getId()];
        delete this.componentViewMap[component.getId()];

        //add to the proper parent
        let parentComponentView = componentView.getParentComponentView();
        if(parentComponentView) {
            parentComponentView.removeChild(componentView);
        }
        else {
            //this is a root component
            this.treeEntry.removeChild(componentView.getTreeEntry());
        }
    }

    onModelUpdated(fieldsUpdated) {
        if(apogeeutil.isFieldUpdated(fieldsUpdated,"name")) {
            let model = this.modelManager.getModel();
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