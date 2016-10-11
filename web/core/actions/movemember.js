/** This namespace contains functions to process a create of a member */
hax.core.movemember = {};

/** member MOVE EVENT
 * This listener event is fired when after a member is moveded, meaning either
 * the name or folder is updated. It is to be used to respond
 * to the member update such as to update the UI.
 * 
 * Event member Format:
 * [member]
 */
hax.core.movemember.MEMBER_MOVED_EVENT = "memberMoved";


hax.core.movemember.fireMovedEventList = function(movedMemberList,movedOldNameList,movedNewNameList) {
    for(var i = 0; i < movedMemberList.length; i++) {
        var member = movedMemberList[i];
        var workspace = member.getWorkspace();
        var memberInfo = {};
        memberInfo.member = member;
        memberInfo.oldFullName = movedOldNameList[i];
        memberInfo.newFullName = movedNewNameList[i];
        workspace.dispatchEvent(hax.core.movemember.MEMBER_MOVED_EVENT,memberInfo);
    }
}

/** This method creates member according the input json, in the given folder.
 * The return value is an ActionResponse object. Optionally, an existing action response
 * may be passed in or otherwise one will be created here. */
hax.core.movemember.moveMember = function(member,name,folder,recalculateList) {
        
    var movedMemberList = [];
    hax.core.movemember.loadMovedList(member,movedMemberList);
    var movedOldNameList = hax.core.movemember.getNameList(movedMemberList);
    member.move(name,folder);
    var movedNewNameList = hax.core.movemember.getNameList(movedMemberList);

    var workspace = member.getWorkspace();

    workspace.updateDependeciesForModelChange(recalculateList);
    
    var updatedButNotMoved = hax.core.util.getListInFirstButNotSecond(recalculateList,movedMemberList);

    //dispatch events
    hax.core.movemember.fireMovedEventList(movedMemberList,movedOldNameList,movedNewNameList);
    hax.core.updatemember.fireUpdatedEventList(updatedButNotMoved);
}

//this creates the moved info list, including the member and the old name, but not the new name
hax.core.movemember.loadMovedList = function(member,movedMemberList) {
    movedMemberList.push(member);
    
    if(member.isParent) {
        var childMap = member.getChildMap();
        for(var key in childMap) {
            var child = childMap[key];
            hax.core.movemember.loadMovedList(child,movedMemberList);
        }
    }
    else if(member.isRootHolder) {
        var root = member.getRoot();
        hax.core.movemember.loadMovedList(root,movedMemberList);
    }
}

//this adds the new name to the moved list
hax.core.movemember.getNameList = function(movedMemberList) {
    var nameList = [];
    for(var i = 0; i < movedMemberList.length; i++) {
        nameList[i] = movedMemberList[i].getFullName();
    }
    return nameList;
}
