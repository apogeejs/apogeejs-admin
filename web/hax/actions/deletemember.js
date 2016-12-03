/** This namespace contains the action to delete a member. */
hax.deletemember = {};

/** MEMBER DELETED EVENT
 * This listener event is fired when after a member is deleted, to be used to respond
 * such as to update the UI.
 * 
 * Event object Format:
 * [child]
 */
hax.deletemember.MEMBER_DELETED_EVENT = "memberDeleted";

hax.createmember.fireDeletedEvent = function(deleteInfo) {
    var workspace = deleteInfo.workspace;
    workspace.dispatchEvent(hax.deletemember.MEMBER_DELETED_EVENT,deleteInfo);
}

hax.deletemember.fireDeletedEventList = function(deleteInfoList) {
    for(var i = 0; i < deleteInfoList.length; i++) {
        hax.createmember.fireDeletedEvent(deleteInfoList[i]);
    }
}


/** This method should be called to delete a child. The return value is an ActionResponse.
 * It will by default create its own action response object, however optionally an
 * existing action response may be passed in. */
hax.deletemember.deleteMember = function(member,optionalActionResponse) {
	var actionResponse = optionalActionResponse ? optionalActionResponse : new hax.ActionResponse();
    
    try {
        var deleteInfoList = [];
        var completedActions = hax.action.createCompletedActionsObject();
        
        var workspace = member.getWorkspace();
        
        hax.deletemember.fillDeleteInfoList(member,deleteInfoList);
        for(var i = 0; i < deleteInfoList.length; i++) {
            //call delete handlers
            var deleteInfo = deleteInfoList[i];
            var member = deleteInfo.member;
            member.onDeleteChild();
            if(member.isDependent) {
                member.onDeleteDependent();
            }   
            hax.action.addActionInfo(completedActions,deleteInfo);
        }
        
        hax.action.finalizeAction(workspace,completedActions,actionResponse);
	}
	catch(error) {
        //unknown application error
        var actionError = hax.ActionError.processException(error,"AppException",true);
        actionResponse.addError(actionError);
    }
    
    //return response
    return actionResponse;
        
}

/** @private */
hax.deletemember.fillDeleteInfoList =  function(member,deleteInfoList) {
    var deleteInfo = {};
    deleteInfo.member = member;
    deleteInfo.action = "delete"
    deleteInfo.workspace = member.getWorkspace();
    deleteInfo.fullName = member.getFullName();
    deleteInfoList.push(deleteInfo);
    if(member.isParent) {
        var childMap = member.getChildMap();
        for(var key in childMap) {
            var child = childMap[key];
            hax.deletemember.fillDeleteInfoList(child,deleteInfoList);
        }
    }
    else if(member.isRootHolder) {
        var root = member.getRoot();
        hax.deletemember.fillDeleteInfoList(root,deleteInfoList);
    }
}



