import DATA_DISPLAY_CONSTANTS from "/apogeeview/datadisplay/dataDisplayConstants.js";

let dataDisplayHelper = {};
export {dataDisplayHelper as default}

const FORMAT_STRING = "\t";


/** This function creates the data display data source  for the data of the given member. The
 * member field should be the field name used to access the data source from the associated component. */
dataDisplayHelper.getMemberDataJsonDataSource = function(app,componentView,memberFieldName,doReadOnly) {

    //this is used internally to lookup the data member used here
    let _getDataMember = function() {
        let component = componentView.getComponent();
        let member = component.getField(memberFieldName);
        return member;
    };
    
    return {

        doUpdate: function() {
            //return value is whether or not the data display needs to be udpated
            let component = componentView.getComponent();
            let reloadData = component.isMemberDataUpdated(memberFieldName);
            let reloadDataDisplay = false;
            return {reloadData,reloadDataDisplay};
        },

        getData: function() {
            let member = _getDataMember();
            return displayDataHelper.getStandardWrappedMemberData(member);
        },

        getEditOk: doReadOnly ? 
            function () { return false; }  : 
            function () {
                return !_getDataMember().hasCode();
            },

        saveData: doReadOnly ? undefined :
            function(data) {
                var commandData = {};
                commandData.type = "saveMemberData";
                commandData.memberId = _getDataMember().getId();
                commandData.data = data;
                
                app.executeCommand(commandData);
                return true;
            }
    }
}

/** This function creates editor callbacks or member data where the editor takes text format. */
dataDisplayHelper.getMemberDataTextDataSource = function(app,componentView,memberFieldName,doReadOnly) {

    //this is used internally to lookup the data member used here
    let _getDataMember = function() {
        let component = componentView.getComponent();
        let member = component.getField(memberFieldName);
        return member;
    };
    
    return {

        doUpdate: function() {
            //return value is whether or not the data display needs to be udpated
            let component = componentView.getComponent();
            let reloadData = component.isMemberDataUpdated(memberFieldName);
            let reloadDataDisplay = false;
            return {reloadData,reloadDataDisplay};
        },

        getData: function() {
            let member = _getDataMember();
            let wrappedData = dataDisplayHelper.getEmptyWrappedData();
            if(member.getState() != apogeeutil.STATE_NORMAL) {
                wrappedData.hideDisplay = true;
                wrappedData.data = apogeeutil.INVALID_VALUE;
                switch(member.getState()) {
                    case apogeeutil.STATE_ERROR: 
                        wrappedData.messageType = DATA_DISPLAY_CONSTANTS.MESSAGE_TYPE_ERROR;
                        wrappedData.message = "Error in value: " + member.getErrorMsg();
                        break;

                    case apogeeutil.STATE_PENDING:
                        wrappedData.messageType = DATA_DISPLAY_CONSTANTS.MESSAGE_TYPE_INFO;
                        wrappedData.message = "Value pending!";
                        break;

                    case apogeeutil.STATE_INVALID:
                        wrappedData.messageType = DATA_DISPLAY_CONSTANTS.MESSAGE_TYPE_INFO;
                        wrappedData.message = "Value invalid!";
                        break;

                    default:
                        throw new Error("Unknown display data value state!")
                }
            }
            else {
                //convert data to a string, as is appropriate
                let textData;
                let data = member.getData();
                if(data == apogeeutil.INVALID_VALUE) {
                    textData = apogeeutil.INVALID_VALUE;
                }
                else if(json === undefined) {
                    textData = "undefined";
                }
                else {
                    textData = JSON.stringify(data);
                }
                wrappedData.data = textData;
            }
        },

        getEditOk: doReadOnly ? 
            function () { return false; }  : 
            function () {
                return !_getDataMember().hasCode();
            },

        saveData: doReadOnly ? undefined :
            function(text) {
                var data;
                if(text === "undefined") {
                    data = undefined;
                }
                else {
                    try {
                        data = JSON.parse(text);
                    }
                    catch(error) {
                        if(error.stack) console.error(error.stack);
                        
                        //parsing error
                        apogeeUserAlert("There was an error parsing the JSON input: " +  error.message);
                        return false;
                    }
                }

                var commandData = {};
                commandData.type = "saveMemberData";
                commandData.memberId = _getDataMember().getId();
                commandData.data = data;
                
                app.executeCommand(commandData);
                return true;
            }
    }
}


/** This function creates editor callbacks or the member function body. 
 * The argument optionalClearCodeValue can optionally be set. If so, the member data will be 
 * set with this value if the function body and supplemental code are empty. 
 * The optionalDefaultDataValue will be used to clear the function and save the data value if the formula and
 * private code are empty strings. */
dataDisplayHelper.getMemberFunctionBodyDataSource = function(app,componentView,memberFieldName,optionalDefaultDataValue) {

    //this is used internally to lookup the data member used here
    let _getFunctionMember = function() {
        let component = componentView.getComponent();
        let member = component.getField(memberFieldName);
        return member;
    };

    return {

        doUpdate: function() {
            //return value is whether or not the data display needs to be udpated
            let component = componentView.getComponent();
            let reloadData = component.isMemberFieldUpdated(memberFieldName,"functionBody");
            let reloadDataDisplay = false;
            return {reloadData,reloadDataDisplay};
        },

        getData: function() {
            return _getFunctionMember().getFunctionBody();
        },

        getEditOk: function() {
            return true;
        },

        saveData: function(text) {
            let functionMember = _getFunctionMember();

            var commandData = {};
            commandData.type = "saveMemberCode";
            commandData.memberId = functionMember.getId();
            commandData.argList = functionMember.getArgList();
            commandData.functionBody = text;
            commandData.supplementalCode = functionMember.getSupplementalCode();
            if(optionalDefaultDataValue !== undefined) commandData.clearCodeDataValue = optionalDefaultDataValue;
            
            app.executeCommand(commandData);
            return true;
        }
    }
}

/** This function creates editor callbacks or the member supplemental code. 
 * The optionalDefaultDataValue will be used to clear the function and save the data value if the formula and
 * private code are empty strings. 
*/
dataDisplayHelper.getMemberSupplementalDataSource = function(app,componentView,memberFieldName,optionalDefaultDataValue) {

    //this is used internally to lookup the data member used here
    let _getFunctionMember = function() {
        let component = componentView.getComponent();
        let member = component.getField(memberFieldName);
        return member;
    };

    return {

        doUpdate: function() {
            //return value is whether or not the data display needs to be udpated
            let component = componentView.getComponent();
            let reloadData = component.isMemberFieldUpdated(memberFieldName,"supplementalCode");
            let reloadDataDisplay = false;
            return {reloadData,reloadDataDisplay};
        },

        getData: function() {
            return _getFunctionMember().getSupplementalCode();
        },

        getEditOk: function() {
            return true;
        },

        saveData: function(text) {
            let functionMember = _getFunctionMember();

            var commandData = {};
            commandData.type = "saveMemberCode";
            commandData.memberId = functionMember.getId();
            commandData.argList = functionMember.getArgList();
            commandData.functionBody = functionMember.getFunctionBody();
            commandData.supplementalCode = text;
            if(optionalDefaultDataValue !== undefined) commandData.clearCodeDataValue = optionalDefaultDataValue;
            
            app.executeCommand(commandData);
            return true;
        }
    }
}


/** This function creates the data display data source  for the data of the given member. The
 * member field should be the field name used to access the data source from the associated component. */
dataDisplayHelper.getStandardErrorDataSource = function(app,componentView) {
    
    return {
        doUpdate: function() {
            //return value is whether or not the data display needs to be udpated
            //the overall state is taken from the main memberm which will encompass any changes to 
            //the child members.
            let component = componentView.getComponent();
            let reloadData = component.isMemberDataUpdated("member");
            let reloadDataDisplay = false;
            return {reloadData,reloadDataDisplay};
        },

        getData: function() {
            if(componentView.getBannerState() == apogeeutil.STATE_ERROR) {
                let errorInfoList = componentView.getErrorInfoList()
                if((errorInfoList)&&(errorInfoList.length > 0)) {
                    //show data view, this is our data
                    return errorInfoList;
                }
            }

            //no error or error info; remove the data view
            let wrappedData = dataDisplayHelper.getEmptyWrappedData();
            wrappedData.removeView = true;
            return wrappedData;
            
        }
    }
}

/** This method reads the data from the given member and wraps it, including
 * handling error/pending/invalid data. This is appropriate for the 
 * getData function in a data source (not getDataDisplay though) 
 * There is one option - if optionalShowDispalyForInvalidData = true
 * the display will not be hidden if the data value is INVALID_VALUE. */
displayDataHelper.getStandardWrappedMemberData = function(member,optionalShowDispalyForInvalidData) {
    let wrappedData = dataDisplayHelper.getEmptyWrappedData();
    if(member.getState() != apogeeutil.STATE_NORMAL) {
        wrappedData.data = apogeeutil.INVALID_VALUE;
        switch(member.getState()) {
            case apogeeutil.STATE_ERROR: 
                wrappedData.hideDisplay = true;
                wrappedData.messageType = DATA_DISPLAY_CONSTANTS.MESSAGE_TYPE_ERROR;
                wrappedData.message = "Error in value: " + member.getErrorMsg();
                break;

            case apogeeutil.STATE_PENDING:
                wrappedData.hideDisplay = true;
                wrappedData.messageType = DATA_DISPLAY_CONSTANTS.MESSAGE_TYPE_INFO;
                wrappedData.message = "Value pending!";
                break;

            case apogeeutil.STATE_INVALID:
                wrappedData.hideDisplay = optionalShowDispalyForInvalidData ? false : true;
                wrappedData.messageType = DATA_DISPLAY_CONSTANTS.MESSAGE_TYPE_INFO;
                wrappedData.message = "Value invalid!";
                break;

            default:
                throw new Error("Unknown display data value state!")
        }
    }
    else {
        wrappedData.data = member.getData();
    }

    return wrappedData;
}

/** This method wraps "abnormal" member data when read as part of
 * getDisplayData. The return value is {abnormalWrappedData,data} 
 * If the member state is normal, the data will be returned and abnomrlaWrappedData 
 * will be undefined. If the state is not normal, abnormalWrappedData will be
 * defined and data will be undefined. */
displayDataHelper.getProcessedMemberDisplayData = function(member) {
    let abnormalWrappedData,inputData;

    if(member.getState() != apogeeutil.STATE_NORMAL) {
        abnormalWrappedData = dataDisplayHelper.getEmptyWrappedData();
        abnormalWrappedData.displayInvalid = true;

        switch(member.getState()) {
            case apogeeutil.STATE_ERROR: 
                abnormalWrappedData.messageType = DATA_DISPLAY_CONSTANTS.MESSAGE_TYPE_ERROR;
                abnormalWrappedData.message = "Error in layout input value: " + member.getErrorMsg();
                break;

            case apogeeutil.STATE_PENDING:
                abnormalWrappedData.messageType = DATA_DISPLAY_CONSTANTS.MESSAGE_TYPE_INFO;
                abnormalWrappedData.message = "Display layout input value pending!";
                break;

            case apogeeutil.STATE_INVALID:
                abnormalWrappedData.messageType = DATA_DISPLAY_CONSTANTS.MESSAGE_TYPE_INFO;
                abnormalWrappedData.message = "Display layout input value invalid!";
                break;

            default:
                throw new Error("Unknown display data value state!")
        }
    }
    else {
        inputData = member.getData();
    }

    return {abnormalWrappedData,inputData};
}


/** This function returns true if the passed in data is wrapped data. */
dataDisplayHelper.isWrappedData = function(data) {
    if(!data) return false;
    return (data[DATA_DISPLAY_CONSTANTS.WRAPPED_DATA_KEY] == DATA_DISPLAY_CONSTANTS.WRAPPED_DATA_VALUE);
}

/** This function returns empty wrapped data, since it can be cumbersome to construct. The return
 * value can be modified by adding additional fields. */
dataDisplayHelper.getEmptyWrappedData = function() {
    let wrappedData = {};
    wrappedData[DATA_DISPLAY_CONSTANTS.WRAPPED_DATA_KEY] = DATA_DISPLAY_CONSTANTS.WRAPPED_DATA_VALUE;
    return wrappedData;
}

/** This function reads data, handling wrapped or unwrapped data.
 * Wrapped Data Options:
 * - data - This is the data to pass return
 * - messageType - This is the type of message to show. The option are none, error, warning and info. The message can be shown
 *      even if the display is not hidden (which is not true for display data).
 * - message - This is the message to show.
 * - hideDisplay - If this is true, the main display element will not be shown.
 * - removeView - If this is true, the entire data view will be removed, as if it were not there.
 * 
 * Unwrapped Data:
 * If the data is not wrapped, the return value is the data. If this value is apogeeutil.INVALID_VALUE, hideDisplay
 * will be set to true and a default message will be shown.
 * 
 * The return values is:
 *  {data,messageType,message,hideDisplay,removeView}
 */
dataDisplayHelper.readWrappedData = function(getDataFunction,errorPrefix) {
    
    let data;
    let messageType;
    let message;
    let hideDisplay;
    let removeView;

    try {
        //load data from data source
        let dataReturn
        if(getDataFunction) {
            dataReturn = getDataFunction();
        }
        else {
            dataReturn = apogeeutil.INVALID_VALUE;
        }

        //load data display values
        if((dataReturn)&&(dataDisplayHelper.isWrappedData(dataReturn))) {
            //handle a wrapped return value
            data = dataReturn.data;
            messageType = dataReturn.messageType;
            message = dataReturn.message;
            removeView = dataReturn.removeView;
            hideDisplay = dataReturn.hideDisplay;
        }
        else {
            //straight data was returned
            data = dataReturn;
            hideDisplay = (data === apogeeutil.INVALID_VALUE);
        }
    }
    catch(error) {
        //hide dispay and show error message
        messageType = DATA_DISPLAY_CONSTANTS.MESSAGE_TYPE_ERROR;
        message = errorPrefix + error.toString();
        removeView = false;
        hideDisplay = true;
        data = apogeeutil.INVALID_VALUE;

        if(error.stack) console.error(error.stack);
    }

    //set values that have not be set
    if(messageType === undefined) {
        messageType = DATA_DISPLAY_CONSTANTS.MESSAGE_TYPE_NONE
        message = "";
    }
    hideDisplay = hideDisplay ? true : false;
    removeView = removeView ? true : false;

    return {data,messageType,message,hideDisplay,removeView};
}

/** This function reads display data, handling wrapped or unwrapped data.
 * Wrapped Data Options:
 * - data - this is the data to pass to the dispaly
 * - displayInvalid - if this is true the display is hidden and a message is shown. 
 * - messageType - This is the type of message to show. This is valid only if the display is invalid and ignored otherwise.
 *      If a message will be shown and this is not set, the message type wil be error.
 * - message - This is the message to show.
 * 
 * Unwrapped Data:
 * If the data is not wrapped, the return value is the data. If this value is apogeeutil.INVALID_VALUE, displayInvalid
 * will be set to true and a default message will be shown.
 * 
 * The return values is:
 *  {data,displayInvalid,messageType,message}
 */
dataDisplayHelper.readWrappedDisplayData = function(getDataFunction,errorPrefix) {
    
    let data;
    let messageType;
    let message;
    let displayInvalid;

    try {
        //load data from data source
        let dataReturn
        if(getDataFunction) {
            dataReturn = getDataFunction();
        }
        else {
            dataReturn = apogeeutil.INVALID_VALUE;
        }

        //load data display values
        if((dataReturn)&&(dataDisplayHelper.isWrappedData(dataReturn))) {
            //handle a wrapped return value
            data = dataReturn.data;
            displayInvalid = dataReturn.displayInvalid;
            messageType = dataReturn.messageType;
            message = dataReturn.message;
        }
        else {
            //straight data was returned
            data = dataReturn;
            displayInvalid = (data === apogeeutil.INVALID_VALUE);
        }
    }
    catch(error) {
        //hide dispay and show error message
        messageType = DATA_DISPLAY_CONSTANTS.MESSAGE_TYPE_ERROR;
        message = errorPrefix + error.toString();
        displayInvalid = true;
        data = apogeeutil.INVALID_VALUE;

        if(error.stack) console.error(error.stack);
    }

    //fill in the message type and message if they are not set
    //by default, set message type to error
    if(displayInvalid) {
        if(messageType === undefined) messageType = DATA_DISPLAY_CONSTANTS.MESSAGE_TYPE_ERROR;
        if(message === undefined) message = "Data unavailable";
    }

    return {data,displayInvalid,messageType,message};
}
