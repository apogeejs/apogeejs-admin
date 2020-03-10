let dataDisplayHelper = {};
export {dataDisplayHelper as default}

const FORMAT_STRING = "\t";

/** This function creates the data display data source  for the data of the given member. The
 * member field should be the field name used to access the data source from the associated component. */
dataDisplayHelper.getMemberDataJsonDataSource = function(app,component,memberFieldName) {
    let dataMember = component.getField(memberFieldName);
    return {
        doUpdate: function(updatedComponent) {
            //set the component instance for this data source
            component = updatedComponent;
            dataMember = component.getField(memberFieldName);
            //return value is whether or not the data display needs to be udpated
            return dataMember.isFieldUpdated("data");
        },

        getData: function() {
            return dataMember.getData();
        },

        getEditOk: function () {
            return !dataMember.hasCode();
        },

        saveData: function(data) {
            var commandData = {};
            commandData.type = "saveMemberData";
            commandData.memberFullName = dataMember.getFullName();
            commandData.data = data;
            
            app.executeCommand(commandData);
            return true;
        }
    }
}

/** This function creates editor callbacks or member data where the editor takes text format. */
dataDisplayHelper.getMemberDataTextDataSource = function(app,component,memberFieldName) {
    let baseSource = dataDisplayHelper.getMemberDataJsonDataSource(app,component,memberFieldName);

    return {
        doUpdate: baseSource.doUpdate,

        getData: function() {
            let json = baseSource.getData();

            var textData;
            if(json === null) {
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

        saveData: function(text) {
            var data;
            if(text.length > 0) {
                try {
                    data = JSON.parse(text);
                }
                catch(error) {
                    if(error.stack) console.error(error.stack);
                    
                    //parsing error
                    alert("There was an error parsing the JSON input: " +  error.message);
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
 * set with this value if the function body and supplemental code are empty. */
dataDisplayHelper.getMemberFunctionBodyDataSource = function(app,component,memberFieldName) {
    let functionMember = component.getField(memberFieldName);
    return {
        doUpdate: function(updatedComponent) {
            //set the component instance for this data source
            component = updatedComponent;
            functionMember = component.getField(memberFieldName);
            //return value is whether or not the data display needs to be udpated
            return functionMember.isFieldUpdated("functionBody");
        },

        getData: function() {
            return functionMember.getFunctionBody();
        },

        getEditOk: function() {
            return true;
        },

        saveData: function(text) {
            var commandData = {};
            commandData.type = "saveMemberCode";
            commandData.memberFullName = functionMember.getFullName();
            commandData.argList = functionMember.getArgList();
            commandData.functionBody = text;
            commandData.supplementalCode = functionMember.getSupplementalCode();
            
            app.executeCommand(commandData);
            return true;
        }
    }
}

/** This function creates editor callbacks or the member supplemental code. */
dataDisplayHelper.getMemberSupplementalDataSource = function(app,component,memberFieldName) {
    let functionMember = component.getField(memberFieldName);
    return {
        doUpdate: function(updatedComponent) {
            //set the component instance for this data source
            component = updatedComponent;
            functionMember = component.getField(memberFieldName);
            //return value is whether or not the data display needs to be udpated
            return functionMember.isFieldUpdated("supplementalCode");
        },

        getData: function() {
            functionMember.getSupplementalCode();
        },

        getEditOk: function() {
            return true;
        },

        saveData: function(text) {
            var commandData = {};
            commandData.type = "saveMemberCode";
            commandData.memberFullName = functionMember.getFullName();
            commandData.argList = functionMember.getArgList();
            commandData.functionBody = functionMember.getFunctionBody();
            commandData.supplementalCode = text;
            
            app.executeCommand(commandData);
            return true;
        }
    }
}
