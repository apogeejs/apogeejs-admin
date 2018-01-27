
apogeeapp.app.dataDisplayCallbackHelper = {};

/** This function creates editor callbacks or member data where the editor takes JSON format. */
apogeeapp.app.dataDisplayCallbackHelper.getMemberDataJsonCallbacks = function(member) {
    return {
        getData: () => member.getData(),
        getEditOk: () => (!member.hasCode()),
        saveData: (data) => apogeeapp.app.dataDisplayCallbackHelper.saveData(member,data)
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
                textData = JSON.stringify(json,null,apogeeapp.app.AceDataMode.formatString);
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
                    //parsing error
                    alert("There was an error parsing the JSON input: " +  error.message);
                    return false;
                }
            }
            else {
                data = "";
            }

            return apogeeapp.app.dataDisplayCallbackHelper.saveData(member,data);
        }
    }
}

/** This function creates editor callbacks or the member function body. 
 * The argument optionalClearCodeValue can optionally be set. If so, the member data will be 
 * set with this value if the function body and supplemental code are empty. */
apogeeapp.app.dataDisplayCallbackHelper.getMemberFunctionBodyCallbacks = function(member,optionalClearCodeValue) {
    return {
        getData: () => member.getFunctionBody(),
        getEditOk: () => true,
        saveData: (text) => {
            var argList = member.getArgList();
            var functionBody = text;
            var supplementalCode = member.getSupplementalCode();
            return apogeeapp.app.dataDisplayCallbackHelper.setCode(member,argList,functionBody,supplementalCode,optionalClearCodeValue);
        }
    }
}

/** This function creates editor callbacks or the member supplemental code. */
apogeeapp.app.dataDisplayCallbackHelper.getMemberSupplementalCallbacks = function(member,optionalClearCodeValue) {
    return {
        getData: () => member.getSupplementalCode(),
        getEditOk: () => true,
        saveData: (text) => {
            var argList = member.getArgList();
            var functionBody = member.getFunctionBody();
            var supplementalCode = text;
            return apogeeapp.app.dataDisplayCallbackHelper.setCode(member,argList,functionBody,supplementalCode,optionalClearCodeValue);
        }
    }
}

/** This function creates editor callbacks or the member description. */
apogeeapp.app.dataDisplayCallbackHelper.getMemberDescriptionCallbacks = function(member) {
    return {
        getData: () => member.getDescription(),
        getEditOk: () => true,
        saveData: (text) => {	
            if((text === null)||(text === undefined)) {
                text = "";
            }

            var actionData = {};
            actionData.action = "updateDescription";
            actionData.member = member;
            actionData.description = text;
            var actionResponse =  apogee.action.doAction(actionData,true);

            return true;
        }
    
    }
}

//=============================
// Shared methods
//=============================

/** @private */
apogeeapp.app.dataDisplayCallbackHelper.saveData = function(member,data) {
    var actionData = {};
    actionData.action = "updateData";
    actionData.member = member;
    actionData.data = data;
    var actionResponse =  apogee.action.doAction(actionData,true);

    return true;    
}

/** This method is a common method to set the code and supplemental code. It also
 * will clear the code if both code fields are empty and a defined clearCodeValue is set. 
 * @private */
 apogeeapp.app.dataDisplayCallbackHelper.setCode = function(member,argList,functionBody,supplementalCode,clearCodeValue) {
    var actionData = {};

    if((clearCodeValue !== undefined)&&(functionBody == "")&&(supplementalCode == "")) {
        //special case - clear code
        actionData.action = "updateData";
        actionData.member = member;
        actionData.data = clearCodeValue;
    }
    else {
        //standard case - edit code
        actionData.action = "updateCode";
        actionData.member = member;
        actionData.argList = argList;
        actionData.functionBody = functionBody;
        actionData.supplementalCode = supplementalCode;  
    }

    var actionResponse =  apogee.action.doAction(actionData,true);

    return true;  
}


