import { Messenger } from "/apogee/apogeeCoreLib.js";

import EditComponent from "/apogeeapp/app/component/EditComponent.js";
import AceTextEditor from "/apogeeapp/app/datadisplay/AceTextEditor.js";
import ConfigurableFormEditor from "/apogeeapp/app/datadisplay/ConfigurableFormEditor.js";
import dataDisplayHelper from "/apogeeapp/app/datadisplay/dataDisplayCallbackHelper.js";

/** This ccomponent represents a data value, with input being from a configurable form.
 * This is an example of componound component. The data associated with the form
 * can be accessed from the variables (componentName).data. There are also subtables
 * "layout" which contains the form layout and "isInputValid" which is a function
 * to validate form input.
 * If you want a form to take an action on submit rather than create and edit a 
 * data value, you can use the dynmaic form. */
export default class FormDataComponent extends EditComponent {

    constructor(workspaceUI,folder) {
        //extend edit component
        super(workspaceUI,folder,FormDataComponent);
        
        //this should be present in the json that builds the folder, but in case it isn't (for one, because of a previous mistake)
        folder.setChildrenWriteable(false);
        
        //load these!
        this.dataTable = folder.lookupChildFromPathArray(["data"]);
        this.layoutFunctionTable = folder.lookupChildFromPathArray(["layout"]);
        this.isInputValidFunctionTable = folder.lookupChildFromPathArray(["isInputValid"]);
    };

    //==============================
    // Protected and Private Instance Methods
    //==============================

    /**  This method retrieves the table edit settings for this component instance
     * @protected */
    getTableEditSettings() {
        return FormDataComponent.TABLE_EDIT_SETTINGS;
    }

    /** This method should be implemented to retrieve a data display of the give type. 
     * @protected. */
    getDataDisplay(displayContainer,viewType) {
        
        var callbacks;
        var app = this.getWorkspaceUI().getApp();
        
        //create the new view element;
        switch(viewType) {
                
            case FormDataComponent.VIEW_FORM:
                callbacks = this.getFormEditorCallbacks();
                var formEditorDisplay = new ConfigurableFormEditor(displayContainer,callbacks);
                return formEditorDisplay;
                
            case FormDataComponent.VIEW_LAYOUT_CODE:
                callbacks = dataDisplayHelper.getMemberFunctionBodyCallbacks(app,this.layoutFunctionTable,FormDataComponent.TABLE_EDIT_SETTINGS.emptyDataValue);
                return new AceTextEditor(displayContainer,callbacks,"ace/mode/javascript",AceTextEditor.OPTION_SET_DISPLAY_MAX);
                
            case FormDataComponent.VIEW_LAYOUT_SUPPLEMENTAL_CODE:
                callbacks = dataDisplayHelper.getMemberSupplementalCallbacks(app,this.layoutFunctionTable,FormDataComponent.TABLE_EDIT_SETTINGS.emptyDataValue);
                return new AceTextEditor(displayContainer,callbacks,"ace/mode/javascript",AceTextEditor.OPTION_SET_DISPLAY_MAX);
            
            case FormDataComponent.VIEW_FORM_VALUE:
                callbacks = dataDisplayHelper.getMemberDataTextCallbacks(app,this.dataTable);
                return new AceTextEditor(displayContainer,callbacks,"ace/mode/json",AceTextEditor.OPTION_SET_DISPLAY_SOME);
                
            case FormDataComponent.VIEW_INPUT_INVALID_CODE:
                callbacks = dataDisplayHelper.getMemberFunctionBodyCallbacks(app,this.isInputValidFunctionTable,FormDataComponent.TABLE_EDIT_SETTINGS.emptyDataValue);
                return new AceTextEditor(displayContainer,callbacks,"ace/mode/javascript",AceTextEditor.OPTION_SET_DISPLAY_MAX);
                
            case FormDataComponent.VIEW_INPUT_INVALID_SUPPLEMENTAL_CODE:
                callbacks = dataDisplayHelper.getMemberSupplementalCallbacks(app,this.isInputValidFunctionTable,FormDataComponent.TABLE_EDIT_SETTINGS.emptyDataValue);
                return new AceTextEditor(displayContainer,callbacks,"ace/mode/javascript",AceTextEditor.OPTION_SET_DISPLAY_MAX);
                
            default:
    //temporary error handling...
                alert("unrecognized view element!");
                return null;
        }
    }

    getFormEditorCallbacks() {
        var callbacks = {};
        
        //return desired form value
        callbacks.getData = () => this.dataTable.getData();
        
        //return form layout
        callbacks.getLayoutInfo = () => {              
                let layoutFunction = this.layoutFunctionTable.getData();
                return layoutFunction();
            }
        
        //edit ok - always true
        callbacks.getEditOk = () => true;
        
        //save data - just form value here
        var messenger = new Messenger(this.layoutFunctionTable);
        callbacks.saveData = (formValue) => {
            
            //validate input
            var isInputValid = this.isInputValidFunctionTable.getData();
            var validateResult = isInputValid(formValue);
            if(validateResult !== true) {
                if(typeof validateResult == 'string') {
                    alert(validateResult);
                    return false;
                }
                else {
                    alert("Improper format for isInputValid function. It should return true or an error message");
                    return;
                }
            }

            //save the data
            messenger.dataUpdate("data",formValue);
            return true;
        }
        
        return callbacks;
    }

    //======================================
    // Static methods
    //======================================

}


FormDataComponent.VIEW_FORM = "Form";
FormDataComponent.VIEW_LAYOUT_CODE = "Layout Code";
FormDataComponent.VIEW_LAYOUT_SUPPLEMENTAL_CODE = "Layout Private";
FormDataComponent.VIEW_FORM_VALUE = "Form Value";
FormDataComponent.VIEW_INPUT_INVALID_CODE = "isInputValid(formValue)";
FormDataComponent.VIEW_INPUT_INVALID_SUPPLEMENTAL_CODE = "isInputValid Private";

FormDataComponent.VIEW_MODES = [
    FormDataComponent.VIEW_FORM,
    FormDataComponent.VIEW_LAYOUT_CODE,
    FormDataComponent.VIEW_LAYOUT_SUPPLEMENTAL_CODE,
    FormDataComponent.VIEW_INPUT_INVALID_CODE,
    FormDataComponent.VIEW_INPUT_INVALID_SUPPLEMENTAL_CODE,
    FormDataComponent.VIEW_FORM_VALUE
];

FormDataComponent.TABLE_EDIT_SETTINGS = {
    "viewModes": FormDataComponent.VIEW_MODES,
    "defaultView": FormDataComponent.VIEW_FORM,
}

//======================================
// This is the component generator, to register the component
//======================================

FormDataComponent.displayName = "Form Data Table";
FormDataComponent.uniqueName = "apogeeapp.app.FormDataComponent";
FormDataComponent.hasTabEntry = false;
FormDataComponent.hasChildEntry = true;
FormDataComponent.ICON_RES_PATH = "/componentIcons/formControl.png";
FormDataComponent.DEFAULT_MEMBER_JSON = {
        "type": "apogee.Folder",
        "childrenNotWriteable": true,
        "children": {
            "layout": {
                "name": "layout",
                "type": "apogee.FunctionTable",
                "updateData": {
                    "argList":[],
                }
            },
            "data": {
                "name": "data",
                "type": "apogee.JsonTable",
                "updateData": {
                    "data": "",
                }
            },
            "isInputValid": {
                "name": "isInputValid",
                "type": "apogee.FunctionTable",
                "updateData": {
                    "argList":["formValue"],
                    "functionBody": "//If data valid, return true. If data is invalid, return an error message.\nreturn true;"
                }
            }
        }
    };

