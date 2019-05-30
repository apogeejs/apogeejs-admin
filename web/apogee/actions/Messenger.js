/** This is a messenger class for sending action messages. 
 * If the send fails, and exception will be thrown. */
apogee.action.Messenger = class {
    
    constructor(fromMember) {
        this.workspace = fromMember.getWorkspace();
        this.contextManager = fromMember.getContextManager();
        this.fromMember = fromMember;
    }

    /** This is a convenience method to set a member to a given value. */
    dataUpdate(updateMemberName,data) {
        var addToUndo = false;
        
        var member = this.getMemberObject(updateMemberName);
        if(!member) {
            throw new Error("Error calling messenger - member not fond: " + updateMemberName);
        }
        
        //set the data for the table, along with triggering updates on dependent tables.
        var actionData = {};
        actionData.action = apogee.updatemember.UPDATE_DATA_ACTION_NAME;
        actionData.member = member;
        actionData.data = data;
        
        var actionResponse = apogee.action.doAction(actionData,addToUndo);
        if(!actionResponse.getSuccess()) {
            throw new Error(actionResponse.getErrorMsg());
        }
    }

    /** This is a convenience method to set a member to a given value. */
    compoundDataUpdate(updateInfo) { 
        var addToUndo = false;
        
        //make the action list
        var actionList = [];
        for(var i = 0; i < updateInfo.length; i++) {
            let updateEntry = updateInfo[i];
            let subActionData = {};
            
            let member = this.getMemberObject(updateEntry[0]);
            if(!member) {
                throw new Error("Error calling messenger - member not fond: " + updateMemberName);
            }
            
            subActionData.action = apogee.updatemember.UPDATE_DATA_ACTION_NAME;
            subActionData.member = member;
            subActionData.data = updateEntry[1];
            actionList.push(subActionData);
        }
        
        //create the single compound action
        var actionData = {};
        actionData.action = apogee.compoundaction.ACTION_NAME;
        actionData.actions = actionList;
        actionData.workspace = this.workspace;
        
        var actionResponse = apogee.action.doAction(actionData,addToUndo);
        if(!actionResponse.getSuccess()) {
            throw new Error(actionResponse.getErrorMsg());
        }
    }

    /** This is a convenience method to set a member tohave an error message. */
    errorUpdate(updateMemberName,errorMessage) {
        var addToUndo = false;
        
        var member = this.getMemberObject(updateMemberName);
        if(!member) {
            throw new Error("Error calling messenger - member not fond: " + updateMemberName);
        }
        
        var actionData = {};
        actionData.action = apogee.updatemember.UPDATE_ASYNCH_ERROR_ACTION_NAME;
        actionData.member = member;
        actionData.errorMsg = errorMessage;
        
        var actionResponse = apogee.action.doAction(actionData,addToUndo);
        if(!actionResponse.getSuccess()) {
            throw new Error(actionResponse.getErrorMsg());
        }
    }

    /** This is a convenience method to set a member to a given value when the dataPromise resolves. */
    asynchDataUpdate(updateMemberName,dataPromise) {
        var addToUndo = false;
        
        var member = this.getMemberObject(updateMemberName);
        if(!member) {
            throw new Error("Error calling messenger - member not fond: " + updateMemberName);
        }

        var actionData = {};
        actionData.action = apogee.updatemember.UPDATE_DATA_PENDING_ACTION_NAME;
        actionData.member = member;
        actionData.promise = dataPromise;
        
        var actionResponse =  apogee.action.doAction(actionData,addToUndo);

        var asynchCallback = function(memberValue) {
            //set the data for the table, along with triggering updates on dependent tables.
            var actionData = {};
            actionData.action = apogee.updatemember.UPDATE_DATA_ACTION_NAME;
            actionData.member = member;
            actionData.promise = dataPromise;
            actionData.data = memberValue;
            var actionResponse =  apogee.action.doAction(actionData,addToUndo);
        }
        var asynchErrorCallback = function(errorMsg) {
            var actionData = {};
            actionData.action = apogee.updatemember.UPDATE_ASYNCH_ERROR_ACTION_NAME;
            actionData.member = member;
            actionData.promise = dataPromise;
            actionData.errorMsg = errorMsg;
            var actionResponse =  apogee.action.doAction(actionData,addToUndo);
        }

        //call appropriate action when the promise resolves.
        dataPromise.then(asynchCallback).catch(asynchErrorCallback);
        
        //throw an error if the original action call fails
        if(!actionResponse.getSuccess()) {
            throw new Error(actionResponse.getErrorMsg());
        }
    }
    
    
    /** This method returns the member instance for a given local member name,
     * as defined from the source object context. */
    getMemberObject = function(localMemberName) { 
        var path = localMemberName.split(".");
        var member = this.contextManager.getMember(path);
        return member;
    }
}
    


