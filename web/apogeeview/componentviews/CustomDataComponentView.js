import ComponentView from "/apogeeview/componentdisplay/ComponentView.js";
import DATA_DISPLAY_CONSTANTS from "/apogeeview/datadisplay/dataDisplayConstants.js";
import AceTextEditor from "/apogeeview/datadisplay/AceTextEditor.js";
import HtmlJsDataDisplay from "/apogeeview/datadisplay/HtmlJsDataDisplay.js";
import dataDisplayHelper from "/apogeeview/datadisplay/dataDisplayHelper.js";
import UiCommandMessenger from "/apogeeapp/commands/UiCommandMessenger.js";
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

        //^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
        //add css to page! I think this should go in a separate on create event, but until I 
        //make this, I iwll put this here.
        let css = component.getField("css");
        if((css)&&(css != "")) {
            apogeeui.setObjectCssData(component.getId(),css);
        }
        //^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
    };

    /** This component overrides the componentupdated to process the css data, which is managed directly in the view. */
    componentUpdated(component) {
        super.componentUpdated(component);

        //if this is the css field, set it immediately
        if(component.isFieldUpdated("css")) {
            apogeeui.setObjectCssData(component.getId(),component.getField("css"));
        }
    }

    //==============================
    // Protected and Private Instance Methods
    //==============================

    /** This component extends the on delete method to get rid of any css data for this component. */
    onDelete() {
        //remove the css data for this component
        apogeeui.setObjectCssData(this.component.getId(),"");
        
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
            
            case CustomDataComponentView.VIEW_FORM:
                displayContainer.setDestroyViewOnInactive(this.getComponent().getDestroyOnInactive());
                var dataDisplaySource = this.getOutputDataDisplaySource();
                var dataDisplay = new HtmlJsDataDisplay(app,displayContainer,dataDisplaySource);
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
                
            default:
    //temporary error handling...
                alert("unrecognized view element!");
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
                return inputMember.getData();
            },

            getData: () => {
                let dataMember = this.getComponent().getField("member.data");
                return dataMember.getData();
            },

            //edit ok - always true
            getEditOk: () => {
                return true;
            },

            saveData: (formValue) => {
                //send value to the table whose variable name is "data"
                //the context reference is the member called "input" 
                let inputMember = this.getComponent().getField("member.input");
                let app = this.modelView.getApp();  
                let commandMessenger = new UiCommandMessenger(app,inputMember);
                commandMessenger.dataUpdate("data",formValue);
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
            doUpdate: function() {
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



