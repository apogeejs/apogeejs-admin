import ComponentView from "/apogeejs-view-lib/src/componentdisplay/ComponentView.js";
import {getErrorViewModeEntry,getMemberDataTextViewModeEntry} from "/apogeejs-view-lib/src/datasource/standardDataDisplay.js";

/** This component represents a table object. */
export default class MultiLoginComponentView extends ComponentView {


    //needed as a part component view, for now - does nothing
    addChild(childComponentView) {}
}

function childViewModeWrapper(childPathArray,originalViewModeEntry) {
    let viewModeEntry = {};
    Object.assign(viewModeEntry,originalViewModeEntry);
    viewModeEntry.getDataDisplay = (parentComponentView,displayContainer) => {
        let childComponentView = getChildComponentView(childPathArray,parentComponentView);
        return originalViewModeEntry.getDataDisplay(childComponentView,displayContainer);
    }
    return viewModeEntry;
}

function getChildComponentView(childPathArray,parentComponentView) {
    //get the child member
    let parentComponent = parentComponentView.getComponent();
    let folderMember = parentComponent.getMember();
    let modelManager = parentComponentView.getApp().getModelManager();
    let model = modelManager.getModel();
    let childMember = folderMember.lookupChildFromPathArray(model,childPathArray);
    //get the component view
    let childComponentId = modelManager.getComponentIdByMemberId(childMember.getId());
    let childComponentView = parentComponentView.appViewInterface.getComponentViewByComponentId(childComponentId);
    return childComponentView;
}
//======================================
// This is the component generator, to register the component
//======================================

let MAIN_FORM_VIEW = {
    name: "Form",
    label: "Form", 
    isActive: false, //DOH! if this is true, the child component view is not ready in time.
    getDataDisplay: (componentView,displayContainer) => componentView.getFormViewDataDisplay(displayContainer)
}

let SESSION_TOKEN_VIEW = getMemberDataTextViewModeEntry("member",{name:"sessionToken",label:"Session Token"});
let BASE_URL_VIEW = getMemberDataTextViewModeEntry("member",{name:"LOGIN_URL",label:"Base Login URL"});;


MultiLoginComponentView.VIEW_MODES = [
    getErrorViewModeEntry(),
    childViewModeWrapper(["loginForm"],MAIN_FORM_VIEW),
    childViewModeWrapper(["sessionToken"],SESSION_TOKEN_VIEW),
    childViewModeWrapper(["LOGIN_URL"],BASE_URL_VIEW)
];

MultiLoginComponentView.componentName = "apogeeapp.MultiLoginCell";
MultiLoginComponentView.hasTabEntry = false;
MultiLoginComponentView.hasChildEntry = true;
MultiLoginComponentView.ICON_RES_PATH = "/icons3/mapCellIcon.png";


