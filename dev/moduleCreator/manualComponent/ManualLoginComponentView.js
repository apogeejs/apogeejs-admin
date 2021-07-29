import ComponentView from "/apogeejs-view-lib/src/componentdisplay/ComponentView.js";
import ConfigurableFormEditor from "/apogeejs-view-lib/src/datadisplay/ConfigurableFormEditor.js";
import {getErrorViewModeEntry,getMemberDataTextViewModeEntry} from "/apogeejs-view-lib/src/datasource/standardDataDisplay.js";
import dataDisplayHelper from "/apogeejs-view-lib/src/datadisplay/dataDisplayHelper.js";
import UiCommandMessenger from "/apogeejs-view-lib/src/commandseq/UiCommandMessenger.js";

/** This component represents a table object. */
export default class ManaualLoginComponentView extends ComponentView {

    //////////////////////////////////////////////////////////////////////
    // copy from DesignerDataFormComponentView
    // - modify member field names - insert "loginForm"
    // - we need to load the validator field from the component data. Field name change?
    
    getFormViewDataDisplay(displayContainer) {
        let dataDisplaySource = this._getOutputFormDataSource();
        return new ConfigurableFormEditor(displayContainer,dataDisplaySource);
    }

    //==========================
    // Private Methods
    //==========================
 
    _getOutputFormDataSource() {
        //load this when the form is updated, to be used when form submitted
        //we will update the form if this value changes
        let isDataValidFunction;

        return {
            //This method reloads the component and checks if there is a DATA update. UI update is checked later.
            doUpdate: () => {
                //return value is whether or not the data display needs to be udpated
                let component = this.getComponent();
                let reloadData = component.isMemberDataUpdated("member.loginForm.value");
                let reloadDataDisplay = component.isFieldUpdated("validatorCode") || component.isMemberFieldUpdated("member.loginForm.data","data");
                return {reloadData,reloadDataDisplay};
            },

            getDisplayData: () => {       
                let wrappedData = dataDisplayHelper.getEmptyWrappedData();

                //get the layout function
                let component = this.getComponent();
                let {validatorFunction,errorMessage} = component.createValidatorFunction();
                if(errorMessage) {
                    wrappedData.displayInvalid = true;
                    wrappedData.messageType = DATA_DISPLAY_CONSTANTS.MESSAGE_TYPE_ERROR;
                    wrappedData.message = errorMessage;
                    return wrappedData;
                }

                //load the layout
                let formMember = this.getComponent().getField("member.loginForm.data");
                let {abnormalWrappedData,inputData} = dataDisplayHelper.getProcessedMemberDisplayData(formMember);
                if(abnormalWrappedData) {
                    return abnormalWrappedData;
                }

                //save this for use on submit
                isDataValidFunction = validatorFunction;

                return inputData;
            },

            getData: () => {
                let valueMember = this.getComponent().getField("member.loginForm.value");
                return dataDisplayHelper.getStandardWrappedMemberData(valueMember,true);
            },

            getEditOk: () => true,

            saveData: (formValue) => {
                let component = this.getComponent();
                //below this data is valid only for normal state input. That should be ok since this is save.
                let formLayout = component.getField("member.loginForm.data").getData();

                try {
                    let isValidResult = isDataValidFunction(formValue,formLayout);
                    if(isValidResult === true) {
                        //save data
                        let memberId = component.getMemberId();
                        let commandMessenger = new UiCommandMessenger(this,memberId);
                        commandMessenger.dataCommand("loginForm.value",formValue);
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

    // end copy from DesignerDataFormComponentView
    //////////////////////////////////////////////////////////////////////
    


}

//======================================
// This is the component generator, to register the component
//======================================


ManaualLoginComponentView.VIEW_MODES = [
    getErrorViewModeEntry(),
    {
        name: "Form",
        label: "Form", 
        isActive: true,
        getDataDisplay: (componentView,displayContainer) => componentView.getFormViewDataDisplay(displayContainer)
    },
    getMemberDataTextViewModeEntry("member.sessionToken",{name:"sessionToken",label:"Session Token"}),
    getMemberDataTextViewModeEntry("member.LOGIN_URL",{name:"LOGIN_URL",label:"Base Login URL"})
];

ManaualLoginComponentView.componentName = "apogeeapp.ManualLoginCell";
ManaualLoginComponentView.hasTabEntry = false;
ManaualLoginComponentView.hasChildEntry = true;
ManaualLoginComponentView.ICON_RES_PATH = "/icons3/mapCellIcon.png";


