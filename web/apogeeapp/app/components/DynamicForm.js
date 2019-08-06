import Component from "/apogeeapp/app/component/Component.js";
import EditComponent from "/apogeeapp/app/component/EditComponent.js";

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
        
        //create the new view element;
        switch(viewType) {
            
            case DynamicForm.VIEW_FORM:
                callbacks = this.getFormCallbacks();
                return new apogeeapp.app.ConfigurableFormDisplay(displayContainer,callbacks);
                
            case DynamicForm.VIEW_CODE:
                callbacks = apogeeapp.app.dataDisplayCallbackHelper.getMemberFunctionBodyCallbacks(this.member);
                return new apogeeapp.app.AceTextEditor(displayContainer,callbacks,"ace/mode/javascript");
                
            case DynamicForm.VIEW_SUPPLEMENTAL_CODE:
                callbacks = apogeeapp.app.dataDisplayCallbackHelper.getMemberSupplementalCallbacks(this.member);
                return new apogeeapp.app.AceTextEditor(displayContainer,callbacks,"ace/mode/javascript");
                
            case DynamicForm.VIEW_DESCRIPTION:
                callbacks = apogeeapp.app.dataDisplayCallbackHelper.getMemberDescriptionCallbacks(this.member);
                //return new apogeeapp.app.AceTextEditor(displayContainer,callbacks,"ace/mode/text");
                return new apogeeapp.app.TextAreaEditor(displayContainer,callbacks);
                
            default:
    //temporary error handling...
                alert("unrecognized view element!");
                return null;
        }
    }

    getFormCallbacks() {
        var callbacks = {
                getData: () => {              
                    let layoutFunction = this.member.getData();
                    let admin = {
                        getMessenger: () => new apogeeapp.app.UiCommandMessenger(this.member)
                    }
                    return layoutFunction(admin);
                }
            }
        return callbacks;
    }
        
    //======================================
    // Static methods
    //======================================

    static createMemberJson(userInputValues,optionalBaseJson) {
        var json = Component.createMemberJson(DynamicForm,userInputValues,optionalBaseJson);
        return json;
    }

}

DynamicForm.VIEW_FORM = "Form";
DynamicForm.VIEW_CODE = "Code";
DynamicForm.VIEW_SUPPLEMENTAL_CODE = "Private";
DynamicForm.VIEW_DESCRIPTION = "Notes";

DynamicForm.VIEW_MODES = [
    DynamicForm.VIEW_FORM,
    DynamicForm.VIEW_CODE,
    DynamicForm.VIEW_SUPPLEMENTAL_CODE,
    DynamicForm.VIEW_DESCRIPTION
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
DynamicForm.DEFAULT_WIDTH = 400;
DynamicForm.DEFAULT_HEIGHT = 400;
DynamicForm.ICON_RES_PATH = "/componentIcons/formControl.png";
DynamicForm.DEFAULT_MEMBER_JSON = {
    "type": "apogee.FunctionTable",
    "updateData": {
        "argList": ["admin"]
    }
};
