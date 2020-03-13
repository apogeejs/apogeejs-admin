import apogeeutil from "/apogeeutil/apogeeUtilLib.js";

import ComponentView from "/apogeeview/componentdisplay/ComponentView.js";
import AceTextEditor from "/apogeeview/datadisplay/AceTextEditor.js";
import HtmlJsDataDisplay from "/apogeeview/datadisplay/HtmlJsDataDisplay.js";
import dataDisplayHelper from "/apogeeview/datadisplay/dataDisplayHelper.js";

/** This is a custom resource component. 
 * To implement it, the resource script must have the methods "run()" which will
 * be called when the component is updated. It also must have any methods that are
 * confugred with initialization data from the model. */
export default class CustomComponentView extends ComponentView {

    constructor(modelView,component) {
        super(modelView,component);
    };

    //==============================
    // Protected and Private Instance Methods
    //==============================

    /**  This method retrieves the table edit settings for this component instance
     * @protected */
    getTableEditSettings() {
        return CustomComponentView.TABLE_EDIT_SETTINGS;
    }

    /** This method should be implemented to retrieve a data display of the give type. 
     * @protected. */
    getDataDisplay(displayContainer,viewType) {
        
        var dataDisplaySource;
        var app = this.getModelView().getApp();
        let component = this.getComponent();
        
        //create the new view element;
        switch(viewType) {
            
            case CustomComponentView.VIEW_OUTPUT:
                displayContainer.setDisplayDestroyFlags(component.getDisplayDestroyFlags());
                var dataDisplaySource = this.getOutputDataDisplaySource();
                var dataDisplay = new HtmlJsDataDisplay(app,displayContainer,dataDisplaySource);
                return dataDisplay;
                
            case CustomComponentView.VIEW_CODE:
                dataDisplaySource = dataDisplayHelper.getMemberFunctionBodyDataSource(app,component,"member");
                return new AceTextEditor(displayContainer,dataDisplaySource,"ace/mode/javascript",AceTextEditor.OPTION_SET_DISPLAY_MAX);
                
            case CustomComponentView.VIEW_SUPPLEMENTAL_CODE:
                dataDisplaySource = dataDisplayHelper.getMemberSupplementalDataSource(app,component,"member");
                return new AceTextEditor(displayContainer,dataDisplaySource,"ace/mode/javascript",AceTextEditor.OPTION_SET_DISPLAY_MAX);
            
            case CustomComponentView.VIEW_HTML:
                dataDisplaySource = this.getUiDataDisplaySource("html");
                return new AceTextEditor(displayContainer,dataDisplaySource,"ace/mode/html",AceTextEditor.OPTION_SET_DISPLAY_MAX);
        
            case CustomComponentView.VIEW_CSS:
                dataDisplaySource = this.getUiDataDisplaySource("css");
                return new AceTextEditor(displayContainer,dataDisplaySource,"ace/mode/css",AceTextEditor.OPTION_SET_DISPLAY_MAX);
                
            case CustomComponentView.VIEW_UI_CODE:
                dataDisplaySource = this.getUiDataDisplaySource("uiCode");
                return new AceTextEditor(displayContainer,dataDisplaySource,"ace/mode/javascript",AceTextEditor.OPTION_SET_DISPLAY_MAX);
                
            default:
    //temporary error handling...
                alert("unrecognized view element!");
                return null;
        }
    }

    getOutputDataDisplaySource() {
        //this is the instance of the component that is active for the data source - it will be updated
        //as the component changes.
        let component = this.getComponent();
        let member = component.getMember();
        return {

            //This method reloads the component and checks if there is a DATA update. UI update is checked later.
            doUpdate: function(updatedComponent) {
                //set the component instance for this data source
                component = updatedComponent;
                member = component.getMember();
                //return value is whether or not the data display needs to be udpated
                let reloadData = component.isMemberDataUpdated("member");
                let reloadDataDisplay = component.areAnyFieldsUpdated(["html","uiCode"]);
                return {reloadData,reloadDataDisplay};
            },

            getData: function() {
                return member.getData();
            },

            //below - custom methods for HtmlJsDataDisplay

            //returns the HTML for the data display
            getHtml: function() {
                return component.getField("html");
            },

            //returns the resource for the data display
            getResource: function() {
                return component.createResource();
            },

            //gets the mebmer used as a refernce for the UI manager passed to the resource functions 
            getContextMember: function() {
                return member;
            }
        }
    }

    /** This method returns the data dispklay data source for the code field data displays. */
    getUiDataDisplaySource(codeFieldName) {
        //this is the instance of the component that is active for the data source - it will be updated
        //as the component changes.
        let component = this.getComponent();
        return {
            doUpdate: function(updatedComponent) {
                //set the component instance for this data source
                component = updatedComponent;
                //return value is whether or not the data display needs to be udpated
                let reloadData = component.isFieldUpdated(codeFieldName);
                let reloadDataDisplay = false;
                return {reloadData,reloadDataDisplay};
            },

            getData: function() {
                let codeField = component.getField(codeFieldName);
                if((codeField === undefined)||(codeField === null)) codeField = "";
                return codeField;
            },

            getEditOk: function() {
                return true;
            },
            
            saveData: function(text) {
                component.doCodeFieldUpdate(codeFieldName,text);
                return true;
            }
        }
    }
}

CustomComponentView.VIEW_OUTPUT = "Display";
CustomComponentView.VIEW_CODE = "Input Code";
CustomComponentView.VIEW_SUPPLEMENTAL_CODE = "Input Private";
CustomComponentView.VIEW_HTML = "HTML";
CustomComponentView.VIEW_CSS = "CSS";
CustomComponentView.VIEW_UI_CODE = "uiGenerator()";

CustomComponentView.VIEW_MODES = [
    CustomComponentView.VIEW_OUTPUT,
    CustomComponentView.VIEW_CODE,
    CustomComponentView.VIEW_SUPPLEMENTAL_CODE,
    CustomComponentView.VIEW_HTML,
    CustomComponentView.VIEW_CSS,
    CustomComponentView.VIEW_UI_CODE
];

CustomComponentView.TABLE_EDIT_SETTINGS = {
    "viewModes": CustomComponentView.VIEW_MODES,
    "defaultView": CustomComponentView.VIEW_OUTPUT
}

/** This is the format string to create the code body for updateing the member
 * Input indices:
 * 0: resouce methods code
 * 1: uiPrivate
 * @private
 */
CustomComponentView.GENERATOR_FUNCTION_FORMAT_TEXT = [
    "//member functions",
    "var resourceFunction = function(component) {",
    "{0}",
    "}",
    "//end member functions",
    "return resourceFunction;",
    ""
       ].join("\n");
    
    


//======================================
// This is the control generator, to register the control
//======================================

CustomComponentView.componentName = "apogeeapp.app.CustomComponent";
CustomComponentView.hasTabEntry = false;
CustomComponentView.hasChildEntry = true;
CustomComponentView.ICON_RES_PATH = "/componentIcons/chartControl.png";
CustomComponentView.propertyDialogLines = [
    {
        "type":"checkbox",
        "heading":"Destroy on Hide: ",
        "resultKey":"destroyOnInactive"
    }
];






