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

hax.deletemember.fireDeletedEventList = function(deleteInfoList) {
    for(var i = 0; i < deleteInfoList.length; i++) {
        var deleteInfo = deleteInfoList[i];
        var workspace = deleteInfo.workspace;
        workspace.dispatchEvent(hax.deletemember.MEMBER_DELETED_EVENT,deleteInfo);
    }
}


/** This method should be called to delete a child. The return value is an ActionResponse.
 * It will by default create its own action response object, however optionally an
 * existing action response may be passed in. */
hax.deletemember.deleteMember = function(member,optionalActionResponse) {
	var actionResponse = optionalActionResponse ? optionalActionResponse : new hax.ActionResponse();
    
    try {
        
        var recalculateList = [];
        var deleteInfoList = [];
        
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
            
        }
        workspace.updateDependeciesForModelChange(recalculateList);

        hax.calculation.callRecalculateList(recalculateList,actionResponse);

        //dispatch events
        hax.deletemember.fireDeletedEventList(deleteInfoList);
        hax.updatemember.fireUpdatedEventList(recalculateList);
	}
	catch(error) {
        //unknown application error
        var actionError = hax.ActionError.processException(error,"AppException",true);
        actionResponse.addError(actionError);
    }
    
    //return response
    return actionResponse;
        
}


hax.deletemember.fillDeleteInfoList =  function(member,deleteInfoList) {
    var deleteInfo = {};
    deleteInfo.member = member;
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



