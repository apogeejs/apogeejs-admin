import ComponentView from "/apogeeview/componentdisplay/ComponentView.js";
import AceTextEditor from "/apogeeview/datadisplay/AceTextEditor.js";
import StandardErrorDisplay from "/apogeeview/datadisplay/StandardErrorDisplay.js";
import ConfigurableFormEditor from "/apogeeview/datadisplay/ConfigurableFormEditor.js";
import dataDisplayHelper from "/apogeeview/datadisplay/dataDisplayHelper.js";
import UiCommandMessenger from "/apogeeview/commandseq/UiCommandMessenger.js";

/** This is a custom resource component. 
 * To implement it, the resource script must have the methods "run()" which will
 * be called when the component is updated. It also must have any methods that are
 * confugred with initialization data from the model. */
export default class ActionFormComponentView extends ComponentView {

    constructor(modelView,component) {
        super(modelView,component);
    };

    //==============================
    // Protected and Private Instance Methods
    //==============================

    /**  This method retrieves the table edit settings for this component instance
     * @protected */
    getTableEditSettings() {
        return ActionFormComponentView.TABLE_EDIT_SETTINGS;
    }

    /** This method should be implemented to retrieve a data display of the give type. 
     * @protected. */
    getDataDisplay(displayContainer,viewType) {
        
        var dataDisplaySource;
        var app = this.getModelView().getApp();
        
        //create the new view element;
        switch(viewType) {
            
            case ActionFormComponentView.VIEW_OUTPUT:
                var dataDisplaySource = this.getOutputDataDisplaySource();
                return new ConfigurableFormEditor(displayContainer,dataDisplaySource);
                
            case ActionFormComponentView.VIEW_CODE:
                dataDisplaySource = dataDisplayHelper.getMemberFunctionBodyDataSource(app,this,"member");
                return new AceTextEditor(displayContainer,dataDisplaySource,"ace/mode/javascript",AceTextEditor.OPTION_SET_DISPLAY_MAX);
                
            case ActionFormComponentView.VIEW_SUPPLEMENTAL_CODE:
                dataDisplaySource = dataDisplayHelper.getMemberSupplementalDataSource(app,this,"member");
                return new AceTextEditor(displayContainer,dataDisplaySource,"ace/mode/javascript",AceTextEditor.OPTION_SET_DISPLAY_MAX);
            
            case ActionFormComponentView.VIEW_FORM_CODE:
                dataDisplaySource = this.getFormCodeDataDisplaySource(app);
                return new AceTextEditor(displayContainer,dataDisplaySource,"ace/mode/javascript",AceTextEditor.OPTION_SET_DISPLAY_MAX);

            case ComponentView.VIEW_INFO: 
                dataDisplaySource = dataDisplayHelper.getStandardErrorDataSource(app,this,"member");
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
                let reloadData = this.getComponent().isMemberDataUpdated("member");
                let reloadDataDisplay = this.getComponent().isFieldUpdated("formCode");
                return {reloadData,reloadDataDisplay};
            },

            getDisplayData: () => {       
                let component = this.getComponent();
                let layoutFunction = component.createFormLayoutFunction(); 
                let contextMemberId = component.getMember().getParentId();

                //make sure this is a function (could be invalid value, or a user code error)
                if(layoutFunction instanceof Function) {
                    let admin = {
                        getCommandMessenger: () => new UiCommandMessenger(this,contextMemberId)
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
                let member = this.getComponent().getMember();
                return member.getData();
            }
        }
    }

    getFormCodeDataDisplaySource(app) {
        return {

            //This method reloads the component and checks if there is a DATA update. UI update is checked later.
            doUpdate: () => {
                //return value is whether or not the data display needs to be udpated
                let reloadData = this.getComponent().isFieldUpdated("formCode");
                let reloadDataDisplay = false;
                return {reloadData,reloadDataDisplay};
            },

            getData: () => {
                return this.getComponent().getField("formCode");
            },

            getEditOk: () => {
                return true;
            },

            saveData: (targetFormCode) => {
                let component = this.getComponent();

                var command = {};
                command.type = "actionFormComponentUpdateCommand";
                command.memberId = component.getMemberId();
                command.initialValue = component.getField("formCode");
                command.targetValue = targetFormCode;

                app.executeCommand(command);
                return true; 
            }

        }
    }
}

ActionFormComponentView.VIEW_OUTPUT = "Display";
ActionFormComponentView.VIEW_CODE = "Input Code";
ActionFormComponentView.VIEW_SUPPLEMENTAL_CODE = "Input Private";
ActionFormComponentView.VIEW_FORM_CODE = "Form Layout Code";

ActionFormComponentView.VIEW_MODES = [
    ComponentView.VIEW_INFO_MODE_ENTRY,
    {name: ActionFormComponentView.VIEW_OUTPUT, label: "Display", isActive: true},
    {name: ActionFormComponentView.VIEW_CODE, label: "Input Code", isActive: false},
    {name: ActionFormComponentView.VIEW_SUPPLEMENTAL_CODE, label: "Input Private", isActive: false},
    {name: ActionFormComponentView.VIEW_FORM_CODE, label: "Form Layout Code", isActive: false},
];

ActionFormComponentView.TABLE_EDIT_SETTINGS = {
    "viewModes": ActionFormComponentView.VIEW_MODES,
    "defaultView": ActionFormComponentView.VIEW_OUTPUT
}


//======================================
// This is the control generator, to register the control
//======================================

ActionFormComponentView.componentName = "apogeeapp.NewActionFormCell";
ActionFormComponentView.hasTabEntry = false;
ActionFormComponentView.hasChildEntry = true;
ActionFormComponentView.ICON_RES_PATH = "/icons3/formCellIcon.png";






