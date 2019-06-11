/** This class is used to provide user-code user interface access to 
 * modifying the model. */
apogeeapp.app.UiCommandMessenger = class {
    
    constructor(fromMember) {
        this.workspace = fromMember.getWorkspace();
        this.contextManager = fromMember.getContextManager();
        this.fromMember = fromMember;
    }
    
    /** This method gets the command to do a data update. */
    getDataUpdateCommand(updateMemberName,data,optionalCommandDescription,optionalSetsWorkspaceDirty) {

        var member = this._getMemberObject(updateMemberName);
        if(!member) {
            throw new Error("Error calling messenger - member not fond: " + updateMemberName);
        }
        
        return apogeeapp.app.membersave.createSaveDataCommand(member,data,optionalCommandDescription,optionalSetsWorkspaceDirty);
    }
    
    /** This method gets the command to do a compound data update. */
    getCompoundDataUpdateCommand(updateInfo,optionalCommandDescription,optionalSetsWorkspaceDirty) {
        
        //populte the update into with the proper member objects
        var modUpdateInfo = updateInfo.map( entry => {
            let member = this._getMemberObject(entry[0]);
            if(!member) {
                throw new Error("Error calling messenger - member not fond: " + updateMemberName);
            }
            return [member,entry[1]];
        });
        
        return apogeeapp.app.membersave.createCompoundSaveDataCommand(this.workspace,modUpdateInfo,optionalCommandDescription,optionalSetsWorkspaceDirty);
    }
    
    /** This method executes a command. */
    executeCommand(command) {
        apogeeapp.app.Apogee.getInstance().executeCommand(command);
    }
    
    //=============================
    // Private Functions
    //=============================
    
    /** This method returns the member instance for a given local member name,
     * as defined from the source object context. */
    _getMemberObject = function(localMemberName) { 
        var path = localMemberName.split(".");
        var member = this.contextManager.getMember(path);
        return member;
    }

    
}


