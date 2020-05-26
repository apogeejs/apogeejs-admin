/** This class is used to provide user-code user interface access to 
 * modifying the model using commands. */
export default class UiCommandMessenger {
    
    constructor(componentView,fromMemberId) {
        this.componentView = componentView;
        this.fromMemberId = fromMemberId;
        this.app = componentView.getModelView().getApp();
    }
    
    /** This method sents a command to update the given member, as specified by the
     * variable name updateMemberName, with the value data. UpdateMemberName should
     * be the name as it would be specified in a formula from the given member. Data may
     * get a JSON or a Promise (for asynch data), Error (to set an error state) 
     * or apogeeutil.INVALID_VALUE.*/
    dataCommand(updateMemberName,data,optionalCommandDescription,optionalSetsWorkspaceDirty) { 
        let command  = {}
        command.type = "saveMemberData";
        command.memberId = this._getLocalMemberId(updateMemberName);
        command.data = data;
        return this.app.executeCommand(command);
    }
    
    /** This is similar to getDataUpdateCommand but it allows setting multiple values.
     * UpdateInfo is an array with each element being a array of two values with the first
     * being the member name and the second being the value to set. */
    compoundDataCommand(updateInfo,optionalCommandDescription,optionalSetsWorkspaceDirty) {

        let command  = {}
        command.type = "saveMemberCompound";
        command.updateList = updateInfo.map( updateInfo => {
            let updateListEntry = {};
            updateListEntry.memberId = this._getLocalMemberId(updateInfo[0]);
            updateListEntry.data = updateInfo[1];
            return updateListEntry;
        });
        return this.app.executeCommand(command);
    }
    
    //=============================
    // Private Functions
    //=============================

    /** This method returns the member instance for a given local member name,
     * as defined from the source object context. */
    _getLocalMemberId(localMemberName) { 
        let model = this.componentView.getModelView().getModelManager().getModel();
        let fromMember = model.lookupMemberById(this.fromMemberId);
        let contextManager = fromMember.getContextManager();

        var pathArray = localMemberName.split(".");
        var member = contextManager.getMember(model,pathArray);
        return member.getId();
    }

    
}


