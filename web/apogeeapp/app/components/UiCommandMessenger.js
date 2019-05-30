/** This is a wrapped version of the Apogee Messenger to let users set
 * member values from the UI. It wraps the messenger functions so they will 
 * allow for undo support, and returns a actionResponse rather than throwing an error..
 */

apogeeapp.app.UiCommandMessenger = class {
    
    constructor(fromMember) {
        this.messenger = new apogee.action.Messenger(fromMember);
    }
    
    dataUpdate(updateMemberName,data) {
        var member = this.messenger.getMemberObject(updateMemberName);
        if(!member) {
            var msg = "Member not found: " + updateMemberName;
            alert(msg);
            return;
        }
        
        var command = {};
        command.cmd = () => this._messengerCallWrapper(() => this.messenger.dataUpdate(updateMemberName,data));
        command.undoCmd = apogeeapp.app.dataDisplayCallbackHelper.getMemberStateUndoCommand(member);
        command.desc = "User Input write to " + updateMemberName;
        
        apogeeapp.app.Apogee.getInstance().executeCommand(command);
    }
    
    compoundDataUpdate(updateInfo) { 
        //get the compound update to undo this one
        var getUndoValue = updateElement => {
            var member = this.messenger.getMemberObject(updateElement[0]);
            if(!member) {
                var msg = "Member not found: " + updateMemberName;
                alert(msg);
                return;
            }
            var undoUpdateElement = [];
            undoUpdateElement[0] = updateElement[0];
            undoUpdateElement[1] = member.getData();
            return undoUpdateElement;
        }
        var undoUpdateInfo = updateInfo.map(getUndoValue);
        
        var command = {};
        command.cmd = () => this._messengerCallWrapper(() => this.messenger.compoundDataUpdate(updateInfo));
        command.undoCmd = () => this._messengerCallWrapper(() => this.messenger.compoundDataUpdate(undoUpdateInfo));
        command.desc = "User Input compound data action";
        
        apogeeapp.app.Apogee.getInstance().executeCommand(command);
        
    }
    errorUpdate(updateMemberName,errorMessage) {
        var member = this.messenger.getMemberObject(updateMemberName);
        if(!member) {
            var msg = "Member not found: " + updateMemberName;
            alert(msg);
            return;
        }
        
        var command = {};
        command.cmd = () => this._messengerCallWrapper(() => this.messenger.errorUpdate(updateMemberName,errorMessage));
        command.undoCmd = apogeeapp.app.dataDisplayCallbackHelper.getMemberStateUndoCommand(member);
        command.desc = "User Input error action";
        
        apogeeapp.app.Apogee.getInstance().executeCommand(command);
    }
    
    asynchDataUpdate(updateMemberName,dataPromise) {
        var member = this.messenger.getMemberObject(updateMemberName);
        if(!member) {
            var msg = "Member not found: " + updateMemberName;
            alert(msg);
            return;
        }
        var initialData = member.getData();
        
        var command = {};
        command.cmd = () => this._messengerCallWrapper(() => this.messenger.asynchDataUpdate(updateMemberName,dataPromise));
        command.undoCmd = apogeeapp.app.dataDisplayCallbackHelper.getMemberStateUndoCommand(member);
        command.desc = "User Input write to " + updateMemberName;
        
        apogeeapp.app.Apogee.getInstance().executeCommand(command);
    }
    
    //=============================
    // Private Functions
    //=============================
    
    /** This method wraps the call to the messenger to return an action response
     * rather than throw an error. */
    _messengerCallWrapper(messengerCallFunction) {
        var actionResponse = new apogee.ActionResponse();
        try {
            messengerCallFunction();
        }
        catch(error) {
            var actionError = apogee.ActionError.processException(error,apogee.ActionError.ERROR_TYPE_APP,false,"Error in executing user input: ");
            actionResponse.addError(actionError);
        }
        return actionResponse;
    }

    
}


