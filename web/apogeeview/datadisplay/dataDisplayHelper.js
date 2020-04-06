let dataDisplayHelper = {};
export {dataDisplayHelper as default}

const FORMAT_STRING = "\t";

/** This function creates the data display data source  for the data of the given member. The
 * member field should be the field name used to access the data source from the associated component. */
dataDisplayHelper.getMemberDataJsonDataSource = function(app,componentView,memberFieldName) {

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

        getEditOk: function () {
            return !_getDataMember().hasCode();
        },

        saveData: function(data) {
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
dataDisplayHelper.getMemberDataTextDataSource = function(app,componentView,memberFieldName) {

    let baseSource = dataDisplayHelper.getMemberDataJsonDataSource(app,componentView,memberFieldName);

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
dataDisplayHelper.getMemberFunctionBodyDataSource = function(app,componentView,memberFieldName) {

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
            
            app.executeCommand(commandData);
            return true;
        }
    }
}

/** This function creates editor callbacks or the member supplemental code. */
dataDisplayHelper.getMemberSupplementalDataSource = function(app,componentView,memberFieldName) {

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
            
            app.executeCommand(commandData);
            return true;
        }
    }
}
