import Component from "/apogeeapp/app/component/Component.js";
import EditComponent from "/apogeeapp/app/component/EditComponent.js";
import AceTextEditor from "/apogeeapp/app/datadisplay/AceTextEditor.js";
import ConfigurableFormDisplay from "/apogeeapp/app/datadisplay/ConfigurableFormDisplay.js";
import dataDisplayHelper from "/apogeeapp/app/datadisplay/dataDisplayCallbackHelper.js";
import UiCommandMessenger from "/apogeeapp/app/commands/UiCommandMessenger.js";

/** This component represents a table object. */
export default class DynamicForm extends EditComponent {
        
    constructor(workspaceUI, functionObject) {
        //extend edit component
        super(workspaceUI,functionObject,DynamicForm);
    };

    //==============================
    // Protected and Private Instance Methods
    //==============================



    /**  This method retrieves the table edit settings for this component instance
     * @protected */
    getTableEditSettings() {
        return DynamicForm.TABLE_EDIT_SETTINGS;
    }

    /** This method should be implemented to retrieve a data display of the give type. 
     * @protected. */
    getDataDisplay(displayContainer,viewType) {
        
        var callbacks;
        var app = this.getWorkspaceUI().getApp();
        
        //create the new view element;
        switch(viewType) {
            
            case DynamicForm.VIEW_FORM:
                callbacks = this.getFormCallbacks();
                return new ConfigurableFormDisplay(displayContainer,callbacks);
                
            case DynamicForm.VIEW_CODE:
                callbacks = dataDisplayHelper.getMemberFunctionBodyCallbacks(app,this.member);
                return new AceTextEditor(displayContainer,callbacks,"ace/mode/javascript");
                
            case DynamicForm.VIEW_SUPPLEMENTAL_CODE:
                callbacks = dataDisplayHelper.getMemberSupplementalCallbacks(app,this.member);
                return new AceTextEditor(displayContainer,callbacks,"ace/mode/javascript");
                
            default:
    //temporary error handling...
                alert("unrecognized view element!");
                return null;
        }
    }

    getFormCallbacks() {
        var app = this.getWorkspaceUI().getApp();
        var callbacks = {
                getData: () => {              
                    let layoutFunction = this.member.getData();
                    let admin = {
                        getMessenger: () => new UiCommandMessenger(app,this.member)
                    }
                    return layoutFunction(admin);
                }
            }
        return callbacks;
    }
        
    //======================================
    // Static methods
    //======================================


}

DynamicForm.VIEW_FORM = "Form";
DynamicForm.VIEW_CODE = "Code";
DynamicForm.VIEW_SUPPLEMENTAL_CODE = "Private";

DynamicForm.VIEW_MODES = [
    DynamicForm.VIEW_FORM,
    DynamicForm.VIEW_CODE,
    DynamicForm.VIEW_SUPPLEMENTAL_CODE
];

DynamicForm.TABLE_EDIT_SETTINGS = {
    "viewModes": DynamicForm.VIEW_MODES,
    "defaultView": DynamicForm.VIEW_FORM
}

//======================================
// This is the component generator, to register the component
//======================================



DynamicForm.displayName = "Dynamic Form";
DynamicForm.uniqueName = "apogeeapp.app.DynamicForm";
DynamicForm.hasTabEntry = false;
DynamicForm.hasChildEntry = true;
DynamicForm.ICON_RES_PATH = "/componentIcons/formControl.png";
DynamicForm.DEFAULT_MEMBER_JSON = {
    "type": "apogee.FunctionTable",
    "updateData": {
        "argList": ["admin"]
    }
};
