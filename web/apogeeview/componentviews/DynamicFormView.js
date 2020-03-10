import ComponentView from "/apogeeview/componentdisplay/ComponentView.js";
import AceTextEditor from "/apogeeview/datadisplay/AceTextEditor.js";
import ConfigurableFormDisplay from "/apogeeview/datadisplay/ConfigurableFormDisplay.js";
import dataDisplayHelper from "/apogeeview/datadisplay/dataDisplayCallbackHelper.js";
import UiCommandMessenger from "/apogeeapp/commands/UiCommandMessenger.js";

/** This component represents a table object. */
export default class DynamicFormView extends ComponentView {
        
    constructor(modelView,folderComponent) {
        //extend edit component
        super(modelView,folderComponent);
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
        let component = this.getComponent();
        
        //create the new view element;
        switch(viewType) {
            
            case DynamicFormView.VIEW_FORM:
                dataDisplaySource = this.getFormCallbacks();
                return new ConfigurableFormDisplay(displayContainer,dataDisplaySource);
                
            case DynamicFormView.VIEW_CODE:
                dataDisplaySource = dataDisplayHelper.getMemberFunctionBodyDataSource(app,component,"member");
                return new AceTextEditor(displayContainer,dataDisplaySource,"ace/mode/javascript",AceTextEditor.OPTION_SET_DISPLAY_MAX);
                
            case DynamicFormView.VIEW_SUPPLEMENTAL_CODE:
                dataDisplaySource = dataDisplayHelper.getMemberSupplementalDataSource(app,component,"member");
                return new AceTextEditor(displayContainer,dataDisplaySource,"ace/mode/javascript",AceTextEditor.OPTION_SET_DISPLAY_MAX);
                
            default:
    //temporary error handling...
                alert("unrecognized view element!");
                return null;
        }
    }

    getFormCallbacks() { 
        let component = this.getComponent();
        let functionMember = component.getField("member");
        let app = this.getModelView().getApp();

        var dataDisplaySource = {

            doUpdate: function(updatedComponent) {
                //set the component instance for this data source
                component = updatedComponent;
                functionMember = component.getField("member");
                //update if either code field changed
                return component.isMemberCodeUpdated("member");
            },

            getData: () => {              
                let layoutFunction = functionMember.getData();
                let admin = {
                    getMessenger: () => new UiCommandMessenger(app,member)
                }
                return layoutFunction(admin);
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
    DynamicForm.VIEW_FORM,
    DynamicForm.VIEW_CODE,
    DynamicForm.VIEW_SUPPLEMENTAL_CODE
];

DynamicFormView.TABLE_EDIT_SETTINGS = {
    "viewModes": DynamicForm.VIEW_MODES,
    "defaultView": DynamicForm.VIEW_FORM
}

//======================================
// This is the component generator, to register the component
//======================================

DynamicFormView.componentName = "apogeeapp.app.DynamicForm";
DynamicFormView.hasTabEntry = false;
DynamicFormView.hasChildEntry = true;
DynamicFormView.ICON_RES_PATH = "/componentIcons/formControl.png";

