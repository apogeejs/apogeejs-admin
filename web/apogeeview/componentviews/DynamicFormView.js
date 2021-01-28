import ComponentView from "/apogeeview/componentdisplay/ComponentView.js";
import AceTextEditor from "/apogeeview/datadisplay/AceTextEditor.js";
import StandardErrorDisplay from "/apogeeview/datadisplay/StandardErrorDisplay.js";
import ConfigurableFormEditor from "/apogeeview/datadisplay/ConfigurableFormEditor.js";
import dataDisplayHelper from "/apogeeview/datadisplay/dataDisplayHelper.js";
import UiCommandMessenger from "/apogeeview/commandseq/UiCommandMessenger.js";

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
        var app = this.getApp();
        
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

            case ComponentView.VIEW_INFO: 
                dataDisplaySource = dataDisplayHelper.getStandardErrorDataSource(app,this);
                return new StandardErrorDisplay(displayContainer,dataDisplaySource);
                
            default:
    //temporary error handling...
                console.error("unrecognized view element: " + viewType);
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

                //make sure this is a function (could be invalid value, or a user code error)
                if(layoutFunction instanceof Function) {
                    let admin = {
                        getCommandMessenger: () => new UiCommandMessenger(this,functionMember.getId())
                    }
                    try {
                        let layout = layoutFunction(admin);
                        if(layout) return layout;
                        else return ConfigurableFormEditor.getEmptyLayout();
                    }
                    catch(error) {
                        console.error("Error reading form layout " + this.getName() + ": " + error.toString());
                        if(error.stack) console.error(error.stack);
                        return ConfigurableFormEditor.getErrorLayout("Error in layout: " + error.toString())
                    }
                }
                //if we get here there was a problem with the layout
                return apogeeutil.INVALID_VALUE;
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
    ComponentView.VIEW_INFO_MODE_ENTRY,
    {name: DynamicFormView.VIEW_FORM, label: "Form", isActive: true},
    {name: DynamicFormView.VIEW_CODE, label: "Code", isActive: false},
    {name: DynamicFormView.VIEW_SUPPLEMENTAL_CODE, label: "Private", isActive: false},
];

DynamicFormView.TABLE_EDIT_SETTINGS = {
    "viewModes": DynamicFormView.VIEW_MODES
}

//======================================
// This is the component generator, to register the component
//======================================

DynamicFormView.componentName = "apogeeapp.ActionFormCell";
DynamicFormView.hasTabEntry = false;
DynamicFormView.hasChildEntry = true;
DynamicFormView.ICON_RES_PATH = "/icons3/formCellIcon.png";

