import ComponentView from "/apogeejs-view-lib/src/componentdisplay/ComponentView.js";
import {getErrorViewModeEntry,getMemberDataTextViewModeEntry} from "/apogeejs-view-lib/src/datasource/standardDataDisplay.js";
import apogeeutil from "/apogeejs-util-lib/src/apogeeUtilLib.js"

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

let SESSION_TOKEN_VIEW = {
    name: "sessionToken",
    label: "Session Token",
    sourceLayer: "model",
    sourceType: "data",
    suffix: "",
    isActive: false,
    getDataDisplay: (componentView,displayContainer) => componentView.getDataViewDisplay(displayContainer)
}

let BASE_URL_VIEW = {
    name: "LOGIN_URL",
    label: "Base Login URL",
    sourceLayer: "model",
    sourceType: "data",
    suffix: "",
    isActive: false,
    getDataDisplay: (componentView,displayContainer) => componentView.getDataViewDisplay(displayContainer)
}

let FOO_TRYER_VIEW = getMemberDataTextViewModeEntry("member",{name:"fooTryer",label:"Test Function Arg List"});


MultiLoginComponentView.VIEW_MODES = [
    getErrorViewModeEntry(),
    childViewModeWrapper(["loginForm"],MAIN_FORM_VIEW),
    childViewModeWrapper(["sessionToken"],SESSION_TOKEN_VIEW),
    childViewModeWrapper(["LOGIN_URL"],BASE_URL_VIEW),
    childViewModeWrapper(["fooTryer"],FOO_TRYER_VIEW)
];

MultiLoginComponentView.componentName = "apogeeapp.MultiLoginCell";
MultiLoginComponentView.hasTabEntry = false;
MultiLoginComponentView.hasChildEntry = true;
MultiLoginComponentView.ICON_RES_PATH = "/icons3/mapCellIcon.png";



MultiLoginComponentView.propertyDialogEntries = [
    {
        component: "foo",
        member: ".",
        propertyKey: "argList",
        dialogElement: {
            "type":"radioButtonGroup",
            "label":"Arg List: ",
            "entries":["x,y","y,x"],
            "hint": "Function = 10*x + y",
            "key":"foo.argListString"
        },
        propertyToForm: argListValue => argListValue.toString(),
        formToProperty: argListString => apogeeutil.parseStringArray(argListString)
    },
    {
        component: "sessionToken",
        propertyKey: "dataView",
        dialogElement: {
            "type":"dropdown",
            "label":"Session Token Display Format: ",
            "entries":["Colorized","Text Data"],
            "key":"sessionToken.dataView"
        }
    },
    {
        component: "LOGIN_URL",
        propertyKey: "dataView",
        dialogElement: {
            "type":"dropdown",
            "label":"LOGIN_URL Display Format: ",
            "entries":["Colorized","Text Data"],
            "key":"LOGIN_URL.dataView"
        }
    }
];


