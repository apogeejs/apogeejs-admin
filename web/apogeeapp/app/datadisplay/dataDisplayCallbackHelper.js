
apogeeapp.app.dataDisplayCallbackHelper = {};

apogeeapp.app.dataDisplayCallbackHelper.formatString = "\t";

/** This function creates editor callbacks or member data where the editor takes JSON format. */
apogeeapp.app.dataDisplayCallbackHelper.getMemberDataJsonCallbacks = function(member) {
    return {
        getData: () => member.getData(),
        getEditOk: () => (!member.hasCode()),
        saveData: (data) => {
            var commandData = {};
            commandData.type = "saveMemberData";
            commandData.memberFullName = member.getFullName();
            commandData.data = data;
            
            apogeeapp.app.Apogee.getInstance().executeCommand(commandData);
            return true;
        }
    }
}

/** This function creates editor callbacks or member data where the editor takes text format. */
apogeeapp.app.dataDisplayCallbackHelper.getMemberDataTextCallbacks = function(member) {
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
                textData = JSON.stringify(json,null,apogeeapp.app.dataDisplayCallbackHelper.formatString);
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
            
            apogeeapp.app.Apogee.getInstance().executeCommand(commandData);
            return true;
        }
    }
}

/** This function creates editor callbacks or the member function body. 
 * The argument optionalClearCodeValue can optionally be set. If so, the member data will be 
 * set with this value if the function body and supplemental code are empty. */
apogeeapp.app.dataDisplayCallbackHelper.getMemberFunctionBodyCallbacks = function(member,optionalClearCodeDataValue) {
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
            
            apogeeapp.app.Apogee.getInstance().executeCommand(commandData);
            return true;
        }
    }
}

/** This function creates editor callbacks or the member supplemental code. */
apogeeapp.app.dataDisplayCallbackHelper.getMemberSupplementalCallbacks = function(member,optionalClearCodeDataValue) {
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
            
            apogeeapp.app.Apogee.getInstance().executeCommand(commandData);
            return true;
        }
    }
}

/** This function creates editor callbacks or the member description. */
apogeeapp.app.dataDisplayCallbackHelper.getMemberDescriptionCallbacks = function(member) {
    return {
        getData: () => member.getDescription(),
        getEditOk: () => true,
        saveData: (text) => {  
            var commandData = {};
            commandData.type = "saveMemberDescription";
            commandData.memberFullName = member.getFullName();
            commandData.description = text;
            
            apogeeapp.app.Apogee.getInstance().executeCommand(commandData);
            return true;
        }
    }
}
