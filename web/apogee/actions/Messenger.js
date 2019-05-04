/** This is a messenger class for sending action messages. */
apogee.action.Messenger = class {
    
    constructor(fromMember) {
        this.workspace = fromMember.getWorkspace();
        this.contextManager = fromMember.getContextManager();
    }

    /** This is a convenience method to set a member to a given value. */
    dataUpdate(updateMemberName,data) {
        var addToUndo = false;
        
        //set the data for the table, along with triggering updates on dependent tables.
        var actionData = {};
        actionData.action = "updateData";
        actionData.memberName = updateMemberName;
        actionData.workspace = this.workspace;
        actionData.data = data;
        return apogee.action.doAction(actionData,addToUndo,this.contextManager);
    }

    /** This is a convenience method to set a member to a given value. */
    compoundDataUpdate(updateInfo) { 
        var addToUndo = false;
        
        //make the action list
        var actionList = [];
        for(var i = 0; i < updateInfo.length; i++) {
            var updateEntry = updateInfo[i];
            var subActionData = {};
            subActionData.action = "updateData";
            subActionData.memberName = updateEntry[0];
            subActionData.workspace = this.workspace;
            subActionData.data = updateEntry[1];
            actionList.push(subActionData);
        }
        
        //create the single compound action
        var actionData = {};
        actionData.action = apogee.compoundaction.ACTION_NAME;
        actionData.actions = actionList;
        actionData.workspace = this.workspace;
        return apogee.action.doAction(actionData,addToUndo,this.contextManager);
    }

    /** This is a convenience method to set a member tohave an error message. */
    errorUpdate(updateMemberName,errorMessage) {
        var addToUndo = false;
        
        var actionData = {};
        actionData.action = "updateError";
        actionData.memberName = updateMemberName;
        actionData.workspace = this.workspace;
        actionData.errorMsg = errorMessage;
        return apogee.action.doAction(actionData,addToUndo,this.contextManager);
    }

    /** This is a convenience method to set a member to a given value when the dataPromise resolves. */
    asynchDataUpdate(updateMemberName,dataPromise) {
        var addToUndo = false;
        
        var token = apogee.action.getAsynchToken();

        var actionData = {};
        actionData.action = "updateDataPending";
        actionData.memberName = updateMemberName;
        actionData.workspace = this.workspace;
        actionData.token = token;
        var actionResponse =  apogee.action.doAction(actionData,addToUndo,this.contextManager);

        var asynchCallback = function(memberValue) {
            //set the data for the table, along with triggering updates on dependent tables.
            var actionData = {};
            actionData.action = "updateData";
            actionData.memberName = updateMemberName;
            actionData.workspace = this.workspace;
            actionData.token = token;
            actionData.data = memberValue;
            var actionResponse =  apogee.action.doAction(actionData,addToUndo,this.contextManager);
        }
        var asynchErrorCallback = function(errorMsg) {
            var actionData = {};
            actionData.action = "updateError";
            actionData.memberName = updateMemberName;
            actionData.workspace = this.workspace;
            actionData.token = token;
            actionData.errorMsg = errorMsg;
            var actionResponse =  apogee.action.doAction(actionData,addToUndo,this.contextManager);
        }

        //call appropriate action when the promise resolves.
        dataPromise.then(asynchCallback).catch(asynchErrorCallback);
    }
    
}


