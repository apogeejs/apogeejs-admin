import ComponentView from "/apogeeview/componentdisplay/ComponentView.js";
import AceTextEditor from "/apogeeview/datadisplay/AceTextEditor.js";
import StandardErrorDisplay from "/apogeeview/datadisplay/StandardErrorDisplay.js";
import ConfigurableFormEditor from "/apogeeview/datadisplay/ConfigurableFormEditor.js";
import dataDisplayHelper from "/apogeeview/datadisplay/dataDisplayHelper.js";
import DATA_DISPLAY_CONSTANTS from "/apogeeview/datadisplay/dataDisplayConstants.js";
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
            
            case ActionFormComponentView.VIEW_FORM:
                var dataDisplaySource = this.getOutputDataDisplaySource();
                return new ConfigurableFormEditor(displayContainer,dataDisplaySource);

            case ActionFormComponentView.VIEW_LAYOUT_CODE:
                dataDisplaySource = this.getFormCodeDataDisplaySource(app);
                return new AceTextEditor(displayContainer,dataDisplaySource,"ace/mode/javascript",AceTextEditor.OPTION_SET_DISPLAY_MAX);
                
            case ActionFormComponentView.VIEW_INPUT_CODE:
                dataDisplaySource = dataDisplayHelper.getMemberFunctionBodyDataSource(app,this,"member");
                return new AceTextEditor(displayContainer,dataDisplaySource,"ace/mode/javascript",AceTextEditor.OPTION_SET_DISPLAY_MAX);
                
            case ActionFormComponentView.VIEW_INPUT_SUPPLEMENTAL_CODE:
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

    getOutputDataDisplaySource() {
        return {

            //This method reloads the component and checks if there is a DATA update. UI update is checked later.
            doUpdate: () => {
                let reloadData = false;
                let reloadDataDisplay = this.getComponent().isFieldUpdated("layoutCode") || this.getComponent().isMemberDataUpdated("member");
                return {reloadData,reloadDataDisplay};
            },

            getDisplayData: () => {       
                let wrappedData = dataDisplayHelper.getEmptyWrappedData();

                //get the layout function
                let component = this.getComponent();
                let {formLayoutFunction,errorMessage} = component.createFormLayoutFunction();
                if(errorMessage) {
                    wrappedData.displayInvalid = true;
                    wrappedData.messageType = DATA_DISPLAY_CONSTANTS.MESSAGE_TYPE_ERROR;
                    wrappedData.message = errorMessage;
                    return wrappedData;
                }

                //load the layout
                //read the input data (checking for non-normal state)
                let member = this.getComponent().getMember();
                let {abnormalWrappedData,inputData} = dataDisplayHelper.getProcessedMemberDisplayData(member);
                if(abnormalWrappedData) {
                    return abnormalWrappedData;
                }

                //use the parent folder as the context base
                let contextMemberId = component.getMember().getParentId();
                let commandMessenger = new UiCommandMessenger(this,contextMemberId);
                try {
                    let layout = formLayoutFunction(commandMessenger,inputData);
                    wrappedData.data = layout;
                    return wrappedData;
                }
                catch(error) {
                    wrappedData.displayInvalid = true;
                    wrappedData.messageType = DATA_DISPLAY_CONSTANTS.MESSAGE_TYPE_ERROR;
                    wrappedData.message = "Error executing layout function: " + error.toString();
                    return wrappedData;
                }
            },

            //no data
            getData: () => null
        }
    }

    getFormCodeDataDisplaySource(app) {
        return {

            //This method reloads the component and checks if there is a DATA update. UI update is checked later.
            doUpdate: () => {
                //return value is whether or not the data display needs to be udpated
                let reloadData = this.getComponent().isFieldUpdated("layoutCode");
                let reloadDataDisplay = false;
                return {reloadData,reloadDataDisplay};
            },

            getData: () => {
                return this.getComponent().getField("layoutCode");
            },

            getEditOk: () => {
                return true;
            },

            saveData: (targetLayoutCode) => {
                let component = this.getComponent();

                var command = {};
                command.type = "actionFormUpdateCommand";
                command.memberId = component.getMemberId();
                command.initialValue = component.getField("layoutCode");
                command.targetValue = targetLayoutCode;

                app.executeCommand(command);
                return true; 
            }

        }
    }
}

ActionFormComponentView.VIEW_FORM = "form";
ActionFormComponentView.VIEW_LAYOUT_CODE = "layout";
ActionFormComponentView.VIEW_INPUT_CODE = "input";
ActionFormComponentView.VIEW_INPUT_SUPPLEMENTAL_CODE = "inputPrivate";


ActionFormComponentView.VIEW_MODES = [
    ComponentView.VIEW_INFO_MODE_ENTRY,
    {name: ActionFormComponentView.VIEW_FORM, label: "Form", isActive: true},
    {name: ActionFormComponentView.VIEW_LAYOUT_CODE, label: "Layout Code", isActive: false},
    {name: ActionFormComponentView.VIEW_INPUT_CODE, label: "Input Data Code", isActive: false},
    {name: ActionFormComponentView.VIEW_INPUT_SUPPLEMENTAL_CODE, label: "Input Data Private", isActive: false}
];

ActionFormComponentView.TABLE_EDIT_SETTINGS = {
    "viewModes": ActionFormComponentView.VIEW_MODES
}


//======================================
// This is the control generator, to register the control
//======================================

ActionFormComponentView.componentName = "apogeeapp.NewActionFormCell";
ActionFormComponentView.hasTabEntry = false;
ActionFormComponentView.hasChildEntry = true;
ActionFormComponentView.ICON_RES_PATH = "/icons3/formCellIcon.png";






