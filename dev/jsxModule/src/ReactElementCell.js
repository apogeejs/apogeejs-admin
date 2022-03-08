import Component from "/apogeejs-app-lib/src/component/Component.js";
import jsxTransformer from "/apogeejs-admin/dev/babelTransformer/releases/v0.0.0-p.0/jsxTransform.es.js";
import Apogee from "/apogeejs-app-lib/src/Apogee.js";

import {getErrorViewModeEntry,getAppCodeViewModeEntry,getFormulaViewModeEntry} from "/apogeejs-view-lib/src/datasource/standardDataDisplay.js";

/** This method creates the resource. */
function onJsxCodeUpdate(component,jsxCode) {
    try {
//KLUDGE!!
        let jsxFunction = `
function __createJsx(props) {
"//>//"
${jsxCode}
"//>//"
}        
        `
        const transformedJsxCode = jsxTransformer(jsxFunction);

let functionBody = `
${transformedJsxCode.code}
return __createJsx(props)
`

        //transformedJsxCode.code
        let actionData = {
            action: "updateCode",
            memberId: component.getMember().getId(),
            argList: ["props"],
            functionBody: functionBody,
            supplemenatlCode: ""
        }

        //Another KLUDGE
        //Lookup the model id from the run context and send a future command
        let app = Apogee.getInstance();
        let appRunContext = app.getRunContext();

        setTimeout(() => {
            let model = appRunContext.getConfirmedModel(); //THis is not necessarily the current model, but it is the current model id
            let modelId = model.getId();
            appRunContext.futureExecuteAction(modelId,actionData)
        },0);

    }
    catch(error) {
        //how do I send an error to a function member?
        //I think set data is no allowed, which is the usual way to set an error

        apogeeUserAlert("Error converter JSX code: " + error.toString());
    }
}

const ReactElementCellConfig = {
    componentClass: Component,
    displayName: "React Element Cell",
    defaultMemberJson: {
        "type": "apogee.FunctionMember",
        "fields": {
            "argList": [],
            "functionBody": "",
            "supplementalCode": ""
        }
    },
    defaultComponentJson: {
        type: "apogeeapp.ReactElementCell",
        fields: {
            jsxCode: ""
        }
    },
    fieldFunctions: {
		jsxCode: {
			fieldChangeHandler: onJsxCodeUpdate 
		}
	},

    viewModes: [
        getErrorViewModeEntry(),
        // {
        //     name: "Display", 
        //     label: "Display", 
        //     isActive: true,
        //     getDataDisplay: (componentView,displayContainer) => componentView.getOutputDataDisplay(displayContainer)
        // },
        getAppCodeViewModeEntry("jsxCode",null,"jsxCode","JSX Code",{sourceType: "code", argList:"props", isActive: true /*,textDisplayMode: "ace/mode/js"*/}),
        getFormulaViewModeEntry("member",{name: "convertedCode", label:"Converted Code"})
    ],
    iconResPath: "/icons3/genericCellIcon.png"
}
export default ReactElementCellConfig;






