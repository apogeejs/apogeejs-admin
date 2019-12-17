let dataDisplayHelper = {};
export {dataDisplayHelper as default}

const FORMAT_STRING = "\t";

/** This function creates editor callbacks or member data where the editor takes JSON format. */
dataDisplayHelper.getMemberDataJsonCallbacks = function(app,member) {
    return {
        getData: () => member.getData(),
        getEditOk: () => (!member.hasCode()),
        saveData: (data) => {
            var commandData = {};
            commandData.type = "saveMemberData";
            commandData.memberFullName = member.getFullName();
            commandData.data = data;
            
            app.executeCommand(commandData);
            return true;
        }
    }
}

/** This function creates editor callbacks or member data where the editor takes text format. */
dataDisplayHelper.getMemberDataTextCallbacks = function(app,member) {
    return {
        getData: () => {
            var json = member.getData();	

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
        getEditOk: () => (!member.hasCode()),
        saveData: (text) => {
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
            
            var commandData = {};
            commandData.type = "saveMemberData";
            commandData.memberFullName = member.getFullName();
            commandData.data = data;
            
            app.executeCommand(commandData);
            return true;
        }
    }
}

/** This function creates editor callbacks or the member function body. 
 * The argument optionalClearCodeValue can optionally be set. If so, the member data will be 
 * set with this value if the function body and supplemental code are empty. */
dataDisplayHelper.getMemberFunctionBodyCallbacks = function(app,member,optionalClearCodeDataValue) {
    return {
        getData: () => member.getFunctionBody(),
        getEditOk: () => true,
        saveData: (text) => {
            var commandData = {};
            commandData.type = "saveMemberCode";
            commandData.memberFullName = member.getFullName();
            commandData.argList = member.getArgList();
            commandData.functionBody = text;
            commandData.supplementalCode = member.getSupplementalCode();
            
            app.executeCommand(commandData);
            return true;
        }
    }
}

/** This function creates editor callbacks or the member supplemental code. */
dataDisplayHelper.getMemberSupplementalCallbacks = function(app,member,optionalClearCodeDataValue) {
    return {
        getData: () => member.getSupplementalCode(),
        getEditOk: () => true,
        saveData: (text) => {
            var commandData = {};
            commandData.type = "saveMemberCode";
            commandData.memberFullName = member.getFullName();
            commandData.argList = member.getArgList();
            commandData.functionBody = member.getFunctionBody();
            commandData.supplementalCode = text;
            
            app.executeCommand(commandData);
            return true;
        }
    }
}

/** This function creates editor callbacks or the member description. */
dataDisplayHelper.getMemberDescriptionCallbacks = function(app,member) {
    return {
        getData: () => member.getDescription(),
        getEditOk: () => true,
        saveData: (text) => {  
            var commandData = {};
            commandData.type = "saveMemberDescription";
            commandData.memberFullName = member.getFullName();
            commandData.description = text;
            
            app.executeCommand(commandData);
            return true;
        }
    }
}
