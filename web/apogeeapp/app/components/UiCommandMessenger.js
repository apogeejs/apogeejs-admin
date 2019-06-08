/** This is a wrapped version of the Apogee Messenger to let users set
 * member values from the UI. It wraps the messenger functions so they will 
 * allow for undo support, and returns a actionResponse rather than throwing an error..
 */

apogeeapp.app.UiCommandMessenger = class {
    
    constructor(fromMember) {
        this.messenger = new apogee.action.Messenger(fromMember);
    }
    
    /** This method gets the command to update the given table using the messenger */
    getDataUpdateCommand(updateMemberName,data,optionalCommandDescription) {
        var member = this.messenger.getMemberObject(updateMemberName);
        if(!member) {
            var msg = "Member not found: " + updateMemberName;
            alert(msg);
            return;
        }
        
        var command = {};
        command.cmd = () => this._messengerCallWrapper(() => this.messenger.dataUpdate(updateMemberName,data));
        command.undoCmd = apogeeapp.app.membersave.getMemberStateUndoCommand(member);
        command.desc = optionalCommandDescription ? optionalCommandDescription : "User Input write to " + updateMemberName;
        
        return command;
    }
    
    /** This method gets the command to do a compound data update with the messenger. */
    getCompoundDataUpdateCommand(updateInfo,optionalCommandDescription) {
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
        command.desc = optionalCommandDescription ? optionalCommandDescription : "User Input compound data action";
        
        return command
    }
    
    /** This method executes a command. */
    executeCommand(command) {
        apogeeapp.app.Apogee.getInstance().executeCommand(command);
    }
    
    
    //###############################################
    // THERE ARE THE OLD MESSENGER-LIKE METHODS
    // I IWLL KEEP THESE TEMPORARILY FOR BACK COMPATIBILITY
    //###############################################
    
    dataUpdate(updateMemberName,data) {
        var command = this.getDataUpdateCommand(updateMemberName,data);
        this.executeCommand(command);
    }
    
    compoundDataUpdate(updateInfo) { 
        var command = this.getCompoundDataUpdateCommand(updateInfo);
        this.executeCommand(command);       
    }
    
    //=============================
    // Private Functions
    //=============================
    
    /** This method wraps the call to the messenger to return an action response
     * rather than throw an error. */
    _messengerCallWrapper(messengerCallFunction) {

        try {
            messengerCallFunction();
            return true;
        }
        catch(error) {
            apogeeapp.app.CommandManager.errorAlert("Error setting remote data: " + error.message);
            return false;
        }
    }

    
}


