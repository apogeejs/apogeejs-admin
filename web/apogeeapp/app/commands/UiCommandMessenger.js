/** This class is used to provide user-code user interface access to 
 * modifying the model. 
 * Updates are done with commands. There is a method here which executes a command
 * and methods to create commands for setting a value to a table or for setting
 * values on multiple tables. Custom commands can also be created. See the 
 * documentation. */
apogeeapp.app.UiCommandMessenger = class {
    
    constructor(fromMember) {
        this.workspace = fromMember.getWorkspace();
        this.contextManager = fromMember.getContextManager();
        this.fromMember = fromMember;
    }
    
    /** This method sents a command to update the given member, as specified by the
     * variable name updateMemberName, with the value data. UpdateMemberName should
     * be the name as it would be specified in a formula from the given member. Data may
     * get a JSON or a Promise (for asynch data), Error (to set an error state) 
     * or apogee.util.INVALID_VALUE.*/
    getDataUpdateCommand(updateMemberName,data,optionalCommandDescription,optionalSetsWorkspaceDirty) {

        var member = this._getMemberObject(updateMemberName);
        if(!member) {
            throw new Error("Error calling messenger - member not fond: " + updateMemberName);
        }
        
        return apogeeapp.app.membersave.createSaveDataCommand(member,data,optionalCommandDescription,optionalSetsWorkspaceDirty);
    }
    
    /** This is similar to getDataUpdateCommand but it allows setting multiple values.
     * UpdateInfo is an array with each element being a array of two values with the first
     * being the member name and the second being the value to set. */
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


