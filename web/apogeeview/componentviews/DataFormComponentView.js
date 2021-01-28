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
export default class DataFormComponentView extends ComponentView {

    constructor(modelView,component) {
        super(modelView,component);
    };

    //==============================
    // Protected and Private Instance Methods
    //==============================

    /**  This method retrieves the table edit settings for this component instance
     * @protected */
    getTableEditSettings() {
        return DataFormComponentView.TABLE_EDIT_SETTINGS;
    }

    /** This method should be implemented to retrieve a data display of the give type. 
     * @protected. */
    getDataDisplay(displayContainer,viewType) {
        
        var dataDisplaySource;
        var app = this.getApp();
        
        //create the new view element;
        switch(viewType) {
            
            case DataFormComponentView.VIEW_FORM:
                var dataDisplaySource = this.getOutputDataDisplaySource();
                return new ConfigurableFormEditor(displayContainer,dataDisplaySource);

            case DataFormComponentView.VIEW_LAYOUT_CODE:
                dataDisplaySource = this.getLayoutDataDisplaySource(app);
                return new AceTextEditor(displayContainer,dataDisplaySource,"ace/mode/javascript",AceTextEditor.OPTION_SET_DISPLAY_MAX);
                
            case DataFormComponentView.VIEW_INPUT_CODE:
                dataDisplaySource = dataDisplayHelper.getMemberFunctionBodyDataSource(app,this,"member.input");
                return new AceTextEditor(displayContainer,dataDisplaySource,"ace/mode/javascript",AceTextEditor.OPTION_SET_DISPLAY_MAX);
                
            case DataFormComponentView.VIEW_INPUT_SUPPLEMENTAL_CODE:
                dataDisplaySource = dataDisplayHelper.getMemberSupplementalDataSource(app,this,"member.input");
                return new AceTextEditor(displayContainer,dataDisplaySource,"ace/mode/javascript",AceTextEditor.OPTION_SET_DISPLAY_MAX);

            case DataFormComponentView.VIEW_VALIDATOR_CODE:
                dataDisplaySource = this.getValidatorDataDisplaySource(app);
                return new AceTextEditor(displayContainer,dataDisplaySource,"ace/mode/javascript",AceTextEditor.OPTION_SET_DISPLAY_MAX);

            case DataFormComponentView.VIEW_FORM_VALUE:
                dataDisplaySource = dataDisplayHelper.getMemberDataTextDataSource(app,this,"member.value");
                return new AceTextEditor(displayContainer,dataDisplaySource,"ace/mode/json",AceTextEditor.OPTION_SET_DISPLAY_SOME);

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
        //load this when the form is updated, to be used when form submitted
        //we will update the form if this value changes
        let isDataValidFunction;

        return {
            //NEED TO FACTOR IN INPUT VALUE!!!

            //This method reloads the component and checks if there is a DATA update. UI update is checked later.
            doUpdate: () => {
                //return value is whether or not the data display needs to be udpated
                let component = this.getComponent();
                let reloadData = component.isMemberDataUpdated("member.value");
                let reloadDataDisplay = component.areAnyFieldsUpdated(["layoutCode","validatorCode"]) || component.isMemberFieldUpdated("member.input","data");
                return {reloadData,reloadDataDisplay};
            },

            getDisplayData: () => {       
                let wrappedData = dataDisplayHelper.getEmptyWrappedData();

                //get the layout function
                let component = this.getComponent();
                let {layoutFunction,validatorFunction,errorMessage} = component.createFormFunctions();
                if(errorMessage) {
                    wrappedData.displayInvalid = true;
                    wrappedData.messageType = DATA_DISPLAY_CONSTANTS.MESSAGE_TYPE_ERROR;
                    wrappedData.message = errorMessage;
                    return wrappedData;
                }

                //load the layout
                let inputMember = component.getField("member.input");
                let {abnormalWrappedData,inputData} = dataDisplayHelper.getProcessedMemberDisplayData(inputMember);
                if(abnormalWrappedData) {
                    return abnormalWrappedData;
                }

                //save this for use on submit
                isDataValidFunction = validatorFunction;

                //use the parent folder as the context base
                let contextMemberId = component.getMember().getParentId();
                let commandMessenger = new UiCommandMessenger(this,contextMemberId);
                try {
                    let layout = layoutFunction(commandMessenger,inputData);
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

            getData: () => {
                let valueMember = this.getComponent().getField("member.value");
                return dataDisplayHelper.getStandardWrappedMemberData(valueMember,true);
            },

            getEditOk: () => true,

            saveData: (formValue) => {
                let component = this.getComponent();
                //below this data is valid only for normal state input. That should be ok since this is save.
                let inputData = component.getField("member.input").getData();

                try {
                    let isValidResult = isDataValidFunction(formValue,inputData);
                    if(isValidResult === true) {
                        //save data
                        let memberId = component.getMemberId();
                        let commandMessenger = new UiCommandMessenger(this,memberId);
                        commandMessenger.dataCommand("value",formValue);
                        return true;
                    }
                    else {
                        //isValidResult should be the error message. Check to make sure if it is string, 
                        //since the user may return false. (If so, give a generic error message)
                        let msg = ((typeof isValidResult) == "string") ? isValidResult : "Invalid form value!";
                        apogeeUserAlert(msg);
                        return false;
                    }
                }
                catch(error) {
                    if(error.stack) console.error(error.stack);
                    apogeeUserAlert("Error validating input: " + error.toString());
                }
            }
        }
    }

    getLayoutDataDisplaySource(app) {
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
                command.type = "dataFormUpdateCommand";
                command.memberId = component.getMemberId();
                command.field = "layout";
                command.initialValue = component.getField("layoutCode");
                command.targetValue = targetLayoutCode;

                app.executeCommand(command);
                return true; 
            }

        }
    }

    getValidatorDataDisplaySource(app) {
        return {

            //This method reloads the component and checks if there is a DATA update. UI update is checked later.
            doUpdate: () => {
                //return value is whether or not the data display needs to be udpated
                let reloadData = this.getComponent().isFieldUpdated("validatorCode");
                let reloadDataDisplay = false;
                return {reloadData,reloadDataDisplay};
            },

            getData: () => {
                return this.getComponent().getField("validatorCode");
            },

            getEditOk: () => {
                return true;
            },

            saveData: (targetLayoutCode) => {
                let component = this.getComponent();

                var command = {};
                command.type = "dataFormUpdateCommand";
                command.memberId = component.getMemberId();
                command.field = "validator";
                command.initialValue = component.getField("validatorCode");
                command.targetValue = targetLayoutCode;

                app.executeCommand(command);
                return true; 
            }

        }
    }
}

DataFormComponentView.VIEW_FORM = "form";
DataFormComponentView.VIEW_LAYOUT_CODE = "layout";
DataFormComponentView.VIEW_INPUT_CODE = "input";
DataFormComponentView.VIEW_INPUT_SUPPLEMENTAL_CODE = "inputPrivate";
DataFormComponentView.VIEW_VALIDATOR_CODE = "validator";
DataFormComponentView.VIEW_FORM_VALUE = "value";

DataFormComponentView.VIEW_MODES = [
    ComponentView.VIEW_INFO_MODE_ENTRY,
    {
        name: DataFormComponentView.VIEW_FORM,
        label: "Form",
        sourceLayer: "model",
        sourceType: "data",
        suffix: ".value", 
        isActive: true
    },
    {
        name: DataFormComponentView.VIEW_LAYOUT_CODE,
        label: "Layout Code",
        sourceLayer: "app",
        sourceType: "function", 
        argList: "commandMessenger,inputData",
        isActive: true,
        //description: "This is a test of the description!"
    },
    {
        name: DataFormComponentView.VIEW_VALIDATOR_CODE,
        label: "Validator Code",
        sourceLayer: "app",
        sourceType: "function", 
        argList: "formValue,inputData",
        isActive: false
    },
    {
        name: DataFormComponentView.VIEW_INPUT_CODE,
        label: "Input Data Code",
        sourceLayer: "model",
        sourceType: "function", 
        suffix: ".input",
        isActive: false
    },
    {
        name: DataFormComponentView.VIEW_INPUT_SUPPLEMENTAL_CODE,
        label: "Input Data Private",
        sourceLayer: "model", 
        sourceType: "private code",
        suffix: ".input",
        isActive: false
    },
    {
        name: DataFormComponentView.VIEW_FORM_VALUE,
        label: "Value",
        sourceLayer: "model",
        sourceType: "data",
        suffix: ".value", 
        isActive: false
    }
];

DataFormComponentView.TABLE_EDIT_SETTINGS = {
    "viewModes": DataFormComponentView.VIEW_MODES
}

//======================================
// This is the control generator, to register the control
//======================================

DataFormComponentView.componentName = "apogeeapp.NewDataFormCell";
DataFormComponentView.hasTabEntry = false;
DataFormComponentView.hasChildEntry = true;
DataFormComponentView.ICON_RES_PATH = "/icons3/formCellIcon.png";






