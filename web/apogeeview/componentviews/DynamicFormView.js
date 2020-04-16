import ComponentView from "/apogeeview/componentdisplay/ComponentView.js";
import AceTextEditor from "/apogeeview/datadisplay/AceTextEditor.js";
import ConfigurableFormEditor from "/apogeeview/datadisplay/ConfigurableFormEditor.js";
import dataDisplayHelper from "/apogeeview/datadisplay/dataDisplayHelper.js";
import UiCommandMessenger from "/apogeeapp/commands/UiCommandMessenger.js";

/** This component represents a table object. */
export default class DynamicFormView extends ComponentView {
        
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
        return DynamicFormView.TABLE_EDIT_SETTINGS;
    }

    /** This method should be implemented to retrieve a data display of the give type. 
     * @protected. */
    getDataDisplay(displayContainer,viewType) {
        
        var dataDisplaySource;
        var app = this.getModelView().getApp();
        
        //create the new view element;
        switch(viewType) {
            
            case DynamicFormView.VIEW_FORM:
                dataDisplaySource = this.getFormCallbacks();
                return new ConfigurableFormEditor(displayContainer,dataDisplaySource);
                
            case DynamicFormView.VIEW_CODE:
                dataDisplaySource = dataDisplayHelper.getMemberFunctionBodyDataSource(app,this,"member");
                return new AceTextEditor(displayContainer,dataDisplaySource,"ace/mode/javascript",AceTextEditor.OPTION_SET_DISPLAY_MAX);
                
            case DynamicFormView.VIEW_SUPPLEMENTAL_CODE:
                dataDisplaySource = dataDisplayHelper.getMemberSupplementalDataSource(app,this,"member");
                return new AceTextEditor(displayContainer,dataDisplaySource,"ace/mode/javascript",AceTextEditor.OPTION_SET_DISPLAY_MAX);
                
            default:
    //temporary error handling...
                alert("unrecognized view element!");
                return null;
        }
    }

    getFormCallbacks() { 
        var dataDisplaySource = {
            doUpdate: () => {
                //we have no data here, just the form layout
                let reloadData = false;
                let reloadDataDisplay = this.getComponent().isMemberDataUpdated("member");
                return {reloadData,reloadDataDisplay};
            },

            getDisplayData: () => {             
                let functionMember = this.getComponent().getField("member"); 
                let layoutFunction = functionMember.getData();
                let app = this.getModelView().getApp();
                let admin = {
                    getMessenger: () => new UiCommandMessenger(app,member)
                }
                return layoutFunction(admin);
            },

            getData: () => {              
                return null;
            }
        }

        return dataDisplaySource;
    }
        
    //======================================
    // Static methods
    //======================================


}

DynamicFormView.VIEW_FORM = "Form";
DynamicFormView.VIEW_CODE = "Code";
DynamicFormView.VIEW_SUPPLEMENTAL_CODE = "Private";

DynamicFormView.VIEW_MODES = [
    DynamicFormView.VIEW_FORM,
    DynamicFormView.VIEW_CODE,
    DynamicFormView.VIEW_SUPPLEMENTAL_CODE
];

DynamicFormView.TABLE_EDIT_SETTINGS = {
    "viewModes": DynamicFormView.VIEW_MODES,
    "defaultView": DynamicFormView.VIEW_FORM
}

//======================================
// This is the component generator, to register the component
//======================================

DynamicFormView.componentName = "apogeeapp.app.DynamicForm";
DynamicFormView.hasTabEntry = false;
DynamicFormView.hasChildEntry = true;
DynamicFormView.ICON_RES_PATH = "/componentIcons/formControl.png";

