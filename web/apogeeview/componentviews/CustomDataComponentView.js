import ComponentView from "/apogeeview/componentdisplay/ComponentView.js";
import AceTextEditor from "/apogeeview/datadisplay/AceTextEditor.js";
import HtmlJsDataDisplay from "/apogeeview/datadisplay/HtmlJsDataDisplay.js";
import StandardErrorDisplay from "/apogeeview/datadisplay/StandardErrorDisplay.js";
import dataDisplayHelper from "/apogeeview/datadisplay/dataDisplayHelper.js";
import UiCommandMessenger from "/apogeeview/commandseq/UiCommandMessenger.js";
import DATA_DISPLAY_CONSTANTS from "/apogeeview/datadisplay/dataDisplayConstants.js";
import {uiutil} from "/apogeeui/apogeeUiLib.js";


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

        //^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
        //add css to page! I think this should go in a separate on create event, but until I 
        //make this, I iwll put this here.
        let css = component.getField("css");
        if((css)&&(css != "")) {
            uiutil.setObjectCssData(component.getId(),css);
        }
        //^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
    };

    /** This component overrides the componentupdated to process the css data, which is managed directly in the view. */
    componentUpdated(component) {
        super.componentUpdated(component);

        //if this is the css field, set it immediately
        if(component.isFieldUpdated("css")) {
            uiutil.setObjectCssData(component.getId(),component.getField("css"));
        }
    }

    //==============================
    // Protected and Private Instance Methods
    //==============================

    /** This component extends the on delete method to get rid of any css data for this component. */
    onDelete() {
        //remove the css data for this component
        uiutil.setObjectCssData(this.component.getId(),"");
        
        super.onDelete();
    }


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
        
        //create the new view element;
        switch(viewType) {
            
            case CustomDataComponentView.VIEW_OUTPUT:
                displayContainer.setDestroyViewOnInactive(this.getComponent().getDestroyOnInactive());
                var dataDisplaySource = this.getOutputDataDisplaySource();
                var dataDisplay = new HtmlJsDataDisplay(displayContainer,dataDisplaySource);
                return dataDisplay;
                
            case CustomDataComponentView.VIEW_VALUE:
                dataDisplaySource = dataDisplayHelper.getMemberDataTextDataSource(app,this,"member.data");
                return new AceTextEditor(displayContainer,dataDisplaySource,"ace/mode/json",AceTextEditor.OPTION_SET_DISPLAY_SOME);
                
            case CustomDataComponentView.VIEW_CODE:
                dataDisplaySource = dataDisplayHelper.getMemberFunctionBodyDataSource(app,this,"member.input");
                return new AceTextEditor(displayContainer,dataDisplaySource,"ace/mode/javascript",AceTextEditor.OPTION_SET_DISPLAY_MAX);
                
            case CustomDataComponentView.VIEW_SUPPLEMENTAL_CODE:
                dataDisplaySource = dataDisplayHelper.getMemberSupplementalDataSource(app,this,"member.input");
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

            case ComponentView.VIEW_INFO: 
                dataDisplaySource = dataDisplayHelper.getStandardErrorDataSource(app,this);
                return new StandardErrorDisplay(displayContainer,dataDisplaySource);
                
            default:
    //temporary error handling...
                console.error("unrecognized view element: " + viewType);
                return null;
        }
    }

    getOutputDataDisplaySource() {
        return {

            //This method reloads the component and checks if there is a DATA update. UI update is checked later.
            doUpdate: () => {
                //return value is whether or not the data display needs to be udpated
                let reloadData = this.getComponent().isMemberDataUpdated("member.data");
                let reloadDataDisplay = this.getComponent().areAnyFieldsUpdated(["html","uiCode","member.input"]);
                return {reloadData,reloadDataDisplay};
            },

            getDisplayData: () => {
                let inputMember = this.getComponent().getField("member.input");
                switch(inputMember.getState()) {
                    case apogeeutil.STATE_NORMAL:
                        return inputMember.getData();

                    case apogeeutil.STATE_ERROR: {
                        let wrappedData = DATA_DISPLAY_CONSTANTS.getEmptyWrappedData();
                        wrappedData.data = apogeeutil.INVALID_VALUE;
                        wrappedData.hideDisplay = true;
                        wrappedData.messageType = DATA_DISPLAY_CONSTANTS.MESSAGE_TYPE_ERROR;
                        wrappedData.message = "Error in display input value!";
                        return wrappedData;
                    }

                    case apogeeutil.STATE_PENDING: {
                        let wrappedData = DATA_DISPLAY_CONSTANTS.getEmptyWrappedData();
                        wrappedData.data = apogeeutil.INVALID_VALUE;
                        wrappedData.hideDisplay = true;
                        wrappedData.messageType = DATA_DISPLAY_CONSTANTS.MESSAGE_TYPE_INFO;
                        wrappedData.message = "Display input value pending!";
                        return wrappedData;
                    }

                    case apogeeutil.STATE_INVALID: {
                        //CAREFUL! We don't want to hide the data view since that is how
                        //the value is set. If we hide it, there will be no way to make the
                        //value not INVALID.
                        let wrappedData = DATA_DISPLAY_CONSTANTS.getEmptyWrappedData();
                        wrappedData.data = apogeeutil.INVALID_VALUE;
                        wrappedData.hideDisplay = false;
                        wrappedData.messageType = DATA_DISPLAY_CONSTANTS.MESSAGE_TYPE_INFO;
                        wrappedData.message = "Display input value invalid!";
                        wrappedData.data = apogeeutil.INVALID_VALUE;
                        return wrappedData;
                    }

                    default:
                        throw new Error("Unknown display data value state!")
                }
            },

            getData: () => {
                let dataMember = this.getComponent().getField("member.data");
                switch(dataMember.getState()) {
                    case apogeeutil.STATE_NORMAL:
                        return dataMember.getData();

                    case apogeeutil.STATE_ERROR: {
                        let wrappedData = DATA_DISPLAY_CONSTANTS.getEmptyWrappedData();
                        wrappedData.hideDisplay = true;
                        wrappedData.messageType = DATA_DISPLAY_CONSTANTS.MESSAGE_TYPE_ERROR;
                        wrappedData.message = "Error in data value: " + dataMember.getErrorMsg();
                        return wrappedData;
                    }

                    case apogeeutil.STATE_PENDING: {
                        let wrappedData = DATA_DISPLAY_CONSTANTS.getEmptyWrappedData();
                        wrappedData.hideDisplay = true;
                        wrappedData.messageType = DATA_DISPLAY_CONSTANTS.MESSAGE_TYPE_INFO;
                        wrappedData.message = "Display data value pending!";
                        return wrappedData;
                    }

                    case apogeeutil.STATE_INVALID: {
                        //CAREFUL! We don't want to hide the data view since that is how
                        //the value is set. If we hide it, there will be no way to make the
                        //value not INVALID.
                        let wrappedData = DATA_DISPLAY_CONSTANTS.getEmptyWrappedData();
                        wrappedData.hideDisplay = false;
                        wrappedData.messageType = DATA_DISPLAY_CONSTANTS.MESSAGE_TYPE_INFO;
                        wrappedData.message = "Display data value invalid!";
                        wrappedData.data = apogeeutil.INVALID_VALUE;
                        return wrappedData;
                    }

                    default:
                        throw new Error("Unknown display data value state!")
                }
            },

            //edit ok - always true
            getEditOk: () => {
                return true;
            },

            saveData: (formValue) => {
                //send value to the table whose variable name is "data"
                //the context reference is the member called "input" 
                let inputMember = this.getComponent().getField("member.input");
                let commandMessenger = new UiCommandMessenger(this,inputMember.getId());
                commandMessenger.dataCommand("data",formValue);
                return true;
            },

            //below - custom methods for HtmlJsDataDisplay

            //returns the HTML for the data display
            getHtml: () => {
                return this.getComponent().getField("html");
            },

            //returns the resource for the data display
            getResource: () => {
                return this.getComponent().createResource();
            },

            //gets the mebmer used as a refernce for the UI manager passed to the resource functions 
            getContextMember: () => {
                let inputMember = this.getComponent().getField("member.input");
                return inputMember;
            }
        }
    }

    /** This method returns the data dispklay data source for the code field data displays. */
    getUiDataDisplaySource(codeFieldName) {
 
        return {
            doUpdate: () => {
                //return value is whether or not the data display needs to be udpated
                let reloadData = this.getComponent().isFieldUpdated(codeFieldName);
                let reloadDataDisplay = false;
                return {reloadData,reloadDataDisplay};
            },

            getData: () => {
                let codeField = this.getComponent().getField(codeFieldName);
                if((codeField === undefined)||(codeField === null)) codeField = "";
                return codeField;
            },

            getEditOk: () => {
                return true;
            },
            
            saveData: (text) => {
                let app = this.getModelView().getApp();
                this.getComponent().doCodeFieldUpdate(app,codeFieldName,text);
                return true;
            }
        }
    }



}



//======================================
// This is the control generator, to register the control
//======================================

CustomDataComponentView.componentName = "apogeeapp.CustomDataCell";
CustomDataComponentView.hasTabEntry = false;
CustomDataComponentView.hasChildEntry = true;
CustomDataComponentView.ICON_RES_PATH = "/icons3/genericCellIcon.png";

CustomDataComponentView.propertyDialogLines = [
    {
        "type":"checkbox",
        "label":"Destroy on Hide: ",
        "key":"destroyOnInactive"
    }
];

CustomDataComponentView.VIEW_OUTPUT = "Form"; //oops! this was a mistake, from copying from form data component
CustomDataComponentView.VIEW_VALUE = "Data Value";
CustomDataComponentView.VIEW_CODE = "Input Code";
CustomDataComponentView.VIEW_SUPPLEMENTAL_CODE = "Input Private";
CustomDataComponentView.VIEW_HTML = "HTML";
CustomDataComponentView.VIEW_CSS = "CSS";
CustomDataComponentView.VIEW_UI_CODE = "uiGenerator(mode)";

CustomDataComponentView.VIEW_MODES = [
    ComponentView.VIEW_INFO_MODE_ENTRY,
    {name: CustomDataComponentView.VIEW_OUTPUT, label: "Display", isActive: true},
    {name: CustomDataComponentView.VIEW_VALUE, label: "Data Value", isActive: false},
    {name: CustomDataComponentView.VIEW_CODE, label: "Input Code", isActive: false},
    {name: CustomDataComponentView.VIEW_SUPPLEMENTAL_CODE, label: "Input Private", isActive: false},
    {name: CustomDataComponentView.VIEW_HTML, label: "HTML", isActive: false},
    {name: CustomDataComponentView.VIEW_CSS, label: "CSS", isActive: false},
    {name: CustomDataComponentView.VIEW_UI_CODE, label: "uiGenerator()", isActive: false}
];

CustomDataComponentView.TABLE_EDIT_SETTINGS = {
    "viewModes": CustomDataComponentView.VIEW_MODES
}



