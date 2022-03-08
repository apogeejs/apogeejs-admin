import Component from "/apogeejs-app-lib/src/component/Component.js";
import jsxTransformer from "/apogeejs-admin/dev/babelTransformer/releases/v0.0.0-p.0/jsxTransform.es.js";
import Apogee from "/apogeejs-app-lib/src/Apogee.js";

import HtmlJsDataDisplay from "/apogeejs-view-lib/src/datadisplay/HtmlJsDataDisplay.js";
import dataDisplayHelper from "/apogeejs-view-lib/src/datadisplay/dataDisplayHelper.js";
import {getErrorViewModeEntry,getAppCodeViewModeEntry,getFormulaViewModeEntry,getPrivateViewModeEntry} from "/apogeejs-view-lib/src/datasource/standardDataDisplay.js";


/** This method creates the resource. */
function onJsxCodeUpdate(component,jsxCode) {
    try {
//KLUDGE!!
        let jsxFunction = `
function __createJsx(props) {
${jsxCode}
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
            memberId: component.getField("member.jsx").getId(),
            argList: ["props"],
            functionBody: functionBody,
            supplementalCode: ""
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


///////////////////////////////////////////////////////
// view code
////////////////////////////////////////////////////////

function getOutputDataDisplay(componentView,displayContainer) {
    displayContainer.setDestroyViewOnInactive(componentView.getComponent().getField("destroyOnInactive"));
    var dataDisplaySource = getOutputDataDisplaySource(componentView);
    return new HtmlJsDataDisplay(displayContainer,dataDisplaySource);
}

function getOutputDataDisplaySource(componentView) {

    return {

        //This method reloads the component and checks if there is a DATA update. UI update is checked later.
        doUpdate: () => {
            //return value is whether or not the data display needs to be udpated
            let reloadData = componentView.getComponent().isMemberDataUpdated("member.props");
            let reloadDataDisplay = componentView.getComponent().isMemberDataUpdated("member.jsx");
            return {reloadData,reloadDataDisplay};
        },

        getData: () => dataDisplayHelper.getWrappedMemberData(componentView,"member.props"),

        //below - custom methods for HtmlJsDataDisplay

        //returns the HTML for the data display
        getHtml: () => {
            return "";
        },

        //returns the resource for the data display
        getResource: () => {
            return {
                setData: function(props,outputElement,admin) {
                    let elementMember = componentView.getComponent().getField("member.jsx");
                    if(elementMember.getState() == apogeeutil.STATE_NORMAL) {
                        let Element = elementMember.getData();
                        ReactDOM.render(React.createElement(Element,props),outputElement);
                    }
                    else {
                        apogeeUserAlert("error in jsx code")
                    }
                }
            }
        },

        //gets the mebmer used as a refernce for the UI manager passed to the resource functions 
        getScopeMember: () => {
            let inputMember = componentView.getComponent().getField("member.props");
            return inputMember;
        }
    }
}


//======================================
// This is the control config, to register the control
//======================================

const ReactDisplayCellConfig = {
    componentClass: Component,
    displayName: "React Display Cell",
    defaultMemberJson: {
        "type": "apogee.Folder",
        "childrenNotWriteable": true,
        "children": {
            "jsx": {
                "name": "jsx",
                "type": "apogee.FunctionMember",
                "fields": {
                    "argList": [],
                    "functionBody": "return ''",
                    "supplementalCode": ""
                }
            },
            "props": {
                "name": "props",
                "type": "apogee.DataMember",
                "fields": {
                    "data": {},
                }
            }
        }
    },
    defaultComponentJson: {
        type: "apogeeapp.ReactDisplayCell",
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
        {
            name: "Display", 
            label: "Display", 
            isActive: true,
            getDataDisplay: (componentView,displayContainer) => getOutputDataDisplay(componentView,displayContainer)
        },
        getAppCodeViewModeEntry("jsxCode",null,"jsxCode","JSX Code",{sourceType: "code", argList:"props", isActive: true /*,textDisplayMode: "ace/mode/js"*/}),
        getFormulaViewModeEntry("member.jsx",{name: "convertedCode", label:"Converted Code"}),
        getFormulaViewModeEntry("member.props","inputProperties","Input Properties"),
        getPrivateViewModeEntry("member.props","inputPrivate","Input Private"),
    ],
    iconResPath: "/icons3/genericCellIcon.png"
}
export default ReactDisplayCellConfig;






