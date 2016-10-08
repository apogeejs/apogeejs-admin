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

hax.core.movemember.fireCreatedEvent = function(member) {
    var workspace = member.getWorkspace();
    workspace.dispatchEvent(hax.core.movemember.MEMBER_MOVED_EVENT,member);
}

/** This method creates member according the input json, in the given folder.
 * The return value is an ActionResponse object. Optionally, an existing action response
 * may be passed in or otherwise one will be created here. */
hax.core.movemember.moveMember = function(member,name,folder,recalculateList) {
        
    var moveInfo = {};

    moveInfo.oldFullName = member.getFullName();
    member.move(name,folder);
    moveInfo.newFullName = member.getFullName();

    var workspace = member.getWorkspace();

    workspace.updateForDeletedVariable(member,recalculateList);
    workspace.updateForAddedVariable(member,recalculateList);

    //dispatch events
    workspace.dispatchEvent(hax.core.movemember.MEMBER_MOVED_EVENT,moveInfo);
	
}

