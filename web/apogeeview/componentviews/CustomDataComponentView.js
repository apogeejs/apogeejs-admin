 import apogeeutil from "/apogeeutil/apogeeUtilLib.js";
import { Messenger } from "/apogee/apogeeCoreLib.js";

import ComponentView from "/apogeeview/componentdisplay/ComponentView.js";
import AceTextEditor from "/apogeeview/datadisplay/AceTextEditor.js";
import HtmlJsDataDisplay from "/apogeeview/datadisplay/HtmlJsDataDisplay.js";
import dataDisplayHelper from "/apogeeview/datadisplay/dataDisplayCallbackHelper.js";
import DATA_DISPLAY_CONSTANTS from "/apogeeview/datadisplay/dataDisplayConstants.js";
import CommandManager from "/apogeeapp/commands/CommandManager.js";
import apogeeui from "/apogeeui/apogeeui.js";

/** This attempt has a single form edit page which returns an object. */
// To add - I should make it so it does not call set data until after it is initialized. I will cache it rather 
//than making the user do that.

/** This is a custom resource component. 
 * To implement it, the resource script must have the methods "run()" which will
 * be called when the component is updated. It also must have any methods that are
 * confugred with initialization data from the model. */
export default class CustomDataComponentView extends ComponentView {

    constructor(modelView,component) {
        //extend edit component
        super(modelView,component);
    };

    //==============================
    // Protected and Private Instance Methods
    //==============================


    /**  This method retrieves the table edit settings for this component instance
     * @protected */
    getTableEditSettings() {
        return CustomDataComponentView.TABLE_EDIT_SETTINGS;
    }

    /** This method should be implemented to retrieve a data display of the give type. 
     * @protected. */
    getDataDisplay(displayContainer,viewType) {
        
        var dataDisplaySource;
        var app = this.getModelView().getApp();
        let component = this.getComponent();
        
        //create the new view element;
        switch(viewType) {
            
            case CustomDataComponentView.VIEW_FORM:
                displayContainer.setDisplayDestroyFlags(this.getDisplayDestroyFlags());
                this.activeOutputDisplayContainer = displayContainer;
                var dataDisplaySource = this.getOutputDataDisplaySource();
                var html = this.getField("html");
                var resource = this.createResource();
                var dataDisplay = new HtmlJsDataDisplay(displayContainer,dataDisplaySource,this.inputTable,html,resource);
                return dataDisplay;
                
            case CustomDataComponentView.VIEW_VALUE:
                dataDisplaySource = dataDisplayHelper.getMemberDataTextDataSource(app,component,"data");
                return new AceTextEditor(displayContainer,dataDisplaySource,"ace/mode/json",AceTextEditor.OPTION_SET_DISPLAY_SOME);
                
            case CustomDataComponentView.VIEW_CODE:
                dataDisplaySource = dataDisplayHelper.getMemberFunctionBodyDataSource(app,component,"input");
                return new AceTextEditor(displayContainer,dataDisplaySource,"ace/mode/javascript",AceTextEditor.OPTION_SET_DISPLAY_MAX);
                
            case CustomDataComponentView.VIEW_SUPPLEMENTAL_CODE:
                dataDisplaySource = dataDisplayHelper.getMemberSupplementalDataSource(app,component,"input");
                return new AceTextEditor(displayContainer,dataDisplaySource,"ace/mode/javascript",AceTextEditor.OPTION_SET_DISPLAY_MAX);
            
            case CustomDataComponentView.VIEW_HTML:
                dataDisplaySource = this.getUiDataDisplaySource("html");
                return new AceTextEditor(displayContainer,dataDisplaySource,"ace/mode/html",AceTextEditor.OPTION_SET_DISPLAY_MAX);
        
            case CustomDataComponentView.VIEW_CSS:
                dataDisplaySource = this.getUiDataDisplaySource("css");
                return new AceTextEditor(displayContainer,dataDisplaySource,"ace/mode/css",AceTextEditor.OPTION_SET_DISPLAY_MAX);
                
            case CustomDataComponentView.VIEW_UI_CODE:
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
        let component = this;
        let inputTable = component.getField("member.input");
        var messenger = new Messenger(inputTable);

        return {
            doUpdate: function(updatedComponent) {
                //set the component instance for this data source
                component = updatedComponent;
                inputTable = component.getField("member.input");
                //return value is whether or not the data display needs to be udpated
                return component.isMemberDataUpdated("member.input");
            },

            getData: function() {
                inputTable.getData();
            },

            saveData: function(formValue) {
                //send value to the table whose variable name is "data"
                messenger.dataUpdate("data",formValue);
                return true;
            }


        };
    }

    /** This method returns the data dispklay data source for the code field data displays. */
    getUiDataDisplaySource(codeFieldName) {
        //this is the instance of the component that is active for the data source - it will be updated
        //as the component changes.
        let component = this;
        return {
            doUpdate: function(updatedComponent) {
                //set the component instance for this data source
                component = updatedComponent;
                //return value is whether or not the data display needs to be udpated
                return component.isFieldUpdated(codeFieldName);
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
                component.doCodeFieldUpdate(codeField,text);
            }
        }
    }



}



//======================================
// This is the control generator, to register the control
//======================================

CustomDataComponentView.componentName = "apogeeapp.app.CustomDataComponent";
CustomDataComponentView.hasTabEntry = false;
CustomDataComponentView.hasChildEntry = true;
CustomDataComponentView.ICON_RES_PATH = "/componentIcons/formControl.png";

CustomDataComponentView.propertyDialogLines = [
    {
        "type":"checkbox",
        "heading":"Destroy on Hide: ",
        "resultKey":"destroyOnInactive"
    }
];

CustomDataComponentView.VIEW_FORM = "Form";
CustomDataComponentView.VIEW_VALUE = "Data Value";
CustomDataComponentView.VIEW_CODE = "Input Code";
CustomDataComponentView.VIEW_SUPPLEMENTAL_CODE = "Input Private";
CustomDataComponentView.VIEW_HTML = "HTML";
CustomDataComponentView.VIEW_CSS = "CSS";
CustomDataComponentView.VIEW_UI_CODE = "uiGenerator(mode)";

CustomDataComponentView.VIEW_MODES = [
    CustomDataComponentView.VIEW_FORM,
    CustomDataComponentView.VIEW_VALUE,
    CustomDataComponentView.VIEW_CODE,
    CustomDataComponentView.VIEW_SUPPLEMENTAL_CODE,
    CustomDataComponentView.VIEW_HTML,
    CustomDataComponentView.VIEW_CSS,
    CustomDataComponentView.VIEW_UI_CODE
];

CustomDataComponentView.TABLE_EDIT_SETTINGS = {
    "viewModes": CustomDataComponentView.VIEW_MODES,
    "defaultView": CustomDataComponentView.VIEW_FORM
}



