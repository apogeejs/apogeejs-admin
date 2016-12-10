/** This namespace contains functions to process a create of a member */
hax.movemember = {};

/** Move member action */
hax.movemember.ACTION_NAME = "moveMember";

/** member MOVE EVENT
 * Event member Format:
 * [member]
 * [oldFullName]
 */
hax.movemember.MEMBER_MOVED_EVENT = "memberMoved";

hax.movemember.ACTION_INFO= {
    "actionFunction": hax.movemember.moveMember,
    "checkUpdateAll": true,
    "updateDependencies": true,
    "addToRecalc": true,
    "event": hax.movemember.MEMBER_MOVED_EVENT
};

hax.action.addEventInfo(hax.movemember.ACTION_NAME,hax.movemember.ACTION_INFO);

/** This method creates member according the input json, in the given folder.
 * The return value is an ActionResponse object. Optionally, an existing action response
 * may be passed in or otherwise one will be created here. */
hax.movemember.moveMember = function(actionData,processedActions) {
        
    var member = actionData.member;
        
    var movedMemberList = [];
    hax.movemember.loadMovedList(member,movedMemberList);
    var movedOldNameList = hax.movemember.getNameList(movedMemberList);
    member.move(actionData.name,actionData.folder);
    
    //add the individual moves
    for(var i = 0; i < movedMemberList.length; i++) {
        var moveMember = movedMemberList[i];
        
        //we are adding multiple delete events here
        var actionDataEntry;
        if(moveMember === member) {
            actionDataEntry = actionData;
        }
        else {
            actionDataEntry = {};
            actionDataEntry.action = "moveMember";
            actionDataEntry.member = member;
            actionDataEntry.name = member.getName();
            actionDataEntry.folder = member.getParent();
            actionDataEntry.actionInfo = actionData.actionInfo;
        }
        //add additional info
        var eventInfo = {};
        eventInfo.member = member;
        eventInfo.oldFullName = movedOldNameList[i];
        actionDataEntry.eventInfo = eventInfo;
        
        processedActions.push(actionDataEntry);
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
