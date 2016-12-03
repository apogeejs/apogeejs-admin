/** This namespace contains functions to process a create of a member */
hax.movemember = {};

/** member MOVE EVENT
 * This listener event is fired when after a member is moveded, meaning either
 * the name or folder is updated. It is to be used to respond
 * to the member update such as to update the UI.
 * 
 * Event member Format:
 * [member]
 */
hax.movemember.MEMBER_MOVED_EVENT = "memberMoved";

hax.movemember.fireMovedEvent = function(moveInfo) {
    var workspace = moveInfo.member.getWorkspace();
    workspace.dispatchEvent(hax.movemember.MEMBER_MOVED_EVENT,moveInfo);
}

hax.movemember.fireMovedEventList = function(moveInfoList) {
    for(var i = 0; i < moveInfoList.length; i++) {
        hax.movemember.fireMovedEvent(moveInfoList[i]);
    }
}

/** This method creates member according the input json, in the given folder.
 * The return value is an ActionResponse object. Optionally, an existing action response
 * may be passed in or otherwise one will be created here. */
hax.movemember.moveMember = function(member,name,folder,completedActions) {
        
    var movedMemberList = [];
    hax.movemember.loadMovedList(member,movedMemberList);
    var movedOldNameList = hax.movemember.getNameList(movedMemberList);
    member.move(name,folder);
    var movedNewNameList = hax.movemember.getNameList(movedMemberList);
    
    //add the individual moves
    for(var i = 0; i < movedMemberList.length; i++) {
        var moveMember = movedMemberList[i];
        var memberInfo = {};
        memberInfo.member = moveMember;
        memberInfo.oldFullName = movedOldNameList[i];
        memberInfo.newFullName = movedNewNameList[i];
        memberInfo.action = "move";
        hax.action.addActionInfo(completedActions,memberInfo);
    }

}

/** this creates the moved info list, including the member and the old name, but not the new name
 * @private */
hax.movemember.loadMovedList = function(member,movedMemberList) {
    movedMemberList.push(member);
    
    if(member.isParent) {
        var childMap = member.getChildMap();
        for(var key in childMap) {
            var child = childMap[key];
            hax.movemember.loadMovedList(child,movedMemberList);
        }
    }
    else if(member.isRootHolder) {
        var root = member.getRoot();
        hax.movemember.loadMovedList(root,movedMemberList);
    }
}

/** this adds the new name to the moved list
 * @private */
hax.movemember.getNameList = function(movedMemberList) {
    var nameList = [];
    for(var i = 0; i < movedMemberList.length; i++) {
        nameList[i] = movedMemberList[i].getFullName();
    }
    return nameList;
}
