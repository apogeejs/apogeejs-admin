import ComponentView from "/apogeejs-view-lib/src/componentdisplay/ComponentView.js";
import {getErrorViewModeEntry,getMemberDataTextViewModeEntry} from "/apogeejs-view-lib/src/datasource/standardDataDisplay.js";
import apogeeutil from "/apogeejs-util-lib/src/apogeeUtilLib.js"

/** This component represents a table object. */
class MultiLoginComponentView extends ComponentView {

    //needed as a part component view, for now - does nothing
    addChild(childComponentView) {
        //TESTING!!!////////
        let componentDisplay = this.getComponentDisplay();
        componentDisplay.addChildComponentView(childComponentView);
        childComponentView.setComponentDisplay(componentDisplay);
        ///////////////////
    }

    removeChild(childComponentView) {
        //TESTING!!!////////
        //do something here?
        //////////////////////
    }
 }

//======================================
// This is the component generator, to register the component
//======================================

let MAIN_FORM_VIEW = {
    childPath: "loginForm",
    name: "Form",
    label: "Form", 
    isActive: false, //DOH! if this is true, the child component view is not ready in time.
    getDataDisplay: (componentView,displayContainer) => componentView.getFormViewDataDisplay(displayContainer)
}

let SESSION_TOKEN_VIEW = {
    childPath: "sessionToken",
    name: "Data",
    label: "Session Token",
    sourceLayer: "model",
    sourceType: "data",
    suffix: "",
    isActive: false,
    getDataDisplay: (componentView,displayContainer) => componentView.getDataViewDisplay(displayContainer)
}

let BASE_URL_VIEW = {
    childPath: "LOGIN_URL",
    name: "Data",
    label: "Base Login URL",
    sourceLayer: "model",
    sourceType: "data",
    suffix: "",
    isActive: false,
    getDataDisplay: (componentView,displayContainer) => componentView.getDataViewDisplay(displayContainer)
}

let FOO_TRYER_VIEW = getMemberDataTextViewModeEntry("member",{name: "Data",label:"Test Function Arg List",childPath:"fooTryer"});


const MultiLoginComponentViewConfig = {
    componentType: "apogeeapp.MultiLoginCell",
    viewClass: MultiLoginComponentView,
    viewModes: [
        getErrorViewModeEntry(),
        MAIN_FORM_VIEW,
        SESSION_TOKEN_VIEW,
        BASE_URL_VIEW,
        FOO_TRYER_VIEW
    ],
    hasTabEntry: false,
    hasChildEntry: true,
    iconResPath: "/icons3/mapCellIcon.png",
    propertyDialogEntries: [
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
    ]
}
export default MultiLoginComponentViewConfig;


