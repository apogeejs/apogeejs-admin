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
            return _getDataMember().getData();
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

    let baseSource = dataDisplayHelper.getMemberDataJsonDataSource(app,componentView,memberFieldName,doReadOnly);

    return {
        doUpdate: baseSource.doUpdate,

        getData: function() {
            let json = baseSource.getData();

            var textData;
            if(json == apogeeutil.INVALID_VALUE) {
                //for invalid input, convert to display an empty string
                textData = "";
            }
            else if(json === null) {
                textData = "null";
            }
            else if(json === undefined) {
                textData = "undefined";
            }
            else {
                textData = JSON.stringify(json,null,FORMAT_STRING);
            }

            return textData;
        },

        getEditOk: baseSource.getEditOk,

        saveData: doReadOnly ? undefined :
            function(text) {
                var data;
                if(text.length > 0) {
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
                else {
                    data = "";
                }

                return baseSource.saveData(data);
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
dataDisplayHelper.getStandardErrorDataSource = function(app,componentView,memberFieldName) {

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

        showDisplay() {
            let member = _getDataMember();
            return (member.getState() == apogeeutil.STATE_ERROR);
        },

        getData: function() {
            let member = _getDataMember();
            if(member.getState() == apogeeutil.STATE_ERROR) {
                return member.getExtendedErrorInfo();
            }
            else {
                return "";
            }
        }
    }
}
