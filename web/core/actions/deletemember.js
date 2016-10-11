/** This namespace contains the action to delete a member. */
hax.core.deletemember = {};

/** MEMBER DELETED EVENT
 * This listener event is fired when after a member is deleted, to be used to respond
 * such as to update the UI.
 * 
 * Event object Format:
 * [child]
 */
hax.core.deletemember.MEMBER_DELETED_EVENT = "memberDeleted";

hax.core.deletemember.fireDeletedEventList = function(deleteInfoList) {
    for(var i = 0; i < deleteInfoList.length; i++) {
        var deleteInfo = deleteInfoList[i];
        var workspace = deleteInfo.workspace;
        workspace.dispatchEvent(hax.core.deletemember.MEMBER_DELETED_EVENT,deleteInfo);
    }
}


/** This method should be called to delete a child. The return value is an ActionResponse.
 * It will by default create its own action response object, however optionally an
 * existing action response may be passed in. */
hax.core.deletemember.deleteMember = function(member,optionalActionResponse) {
	var actionResponse = optionalActionResponse ? optionalActionResponse : new hax.core.ActionResponse();
    
    try {
        
        var recalculateList = [];
        var deleteInfoList = [];
        
        var workspace = member.getWorkspace();
        
        hax.core.deletemember.fillDeleteInfoList(member,deleteInfoList);
        for(var i = 0; i < deleteInfoList.length; i++) {
            //call delete handlers
            var deleteInfo = deleteInfoList[i];
            var member = deleteInfo.member;
            member.onDeleteChild();
            if(member.isDependent) {
                member.onDeleteDependent();
            }
            
        }
        workspace.updateDependeciesForModelChange(recalculateList);

        hax.core.calculation.callRecalculateList(recalculateList,actionResponse);

        //dispatch events
        hax.core.deletemember.fireDeletedEventList(deleteInfoList);
        hax.core.updatemember.fireUpdatedEventList(recalculateList);
	}
	catch(error) {
        //unknown application error
        var actionError = hax.core.ActionError.processException(error,"AppException",true);
        actionResponse.addError(actionError);
    }
    
    //return response
    return actionResponse;
        
}


hax.core.deletemember.fillDeleteInfoList =  function(member,deleteInfoList) {
    var deleteInfo = {};
    deleteInfo.member = member;
    deleteInfo.workspace = member.getWorkspace();
    deleteInfo.fullName = member.getFullName();
    deleteInfoList.push(deleteInfo);
    if(member.isParent) {
        var childMap = member.getChildMap();
        for(var key in childMap) {
            var child = childMap[key];
            hax.core.deletemember.fillDeleteInfoList(child,deleteInfoList);
        }
    }
    else if(member.isRootHolder) {
        var root = member.getRoot();
        hax.core.deletemember.fillDeleteInfoList(root,deleteInfoList);
    }
}



