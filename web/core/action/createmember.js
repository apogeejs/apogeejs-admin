/** This namespace contains functions to process a create of a member */
visicomp.core.createmember = {};

/** member CREATED EVENT
 * This listener event is fired when after a member is created, to be used to respond
 * to the member update such as to update the UI.
 * 
 * Event member Format:
 * [member]
 */
visicomp.core.createmember.MEMBER_CREATED_EVENT = "memberCreated";

visicomp.core.createmember.fireCreatedEvent = function(member) {
    var workspace = member.getWorkspace();
    workspace.dispatchEvent(visicomp.core.createmember.MEMBER_CREATED_EVENT,member);
}

/** This is the listener for the create table event. */
visicomp.core.createmember.createMember = function(folder,json) {
	var returnValue;
    
    try {
		//create member
        var generator = visicomp.core.Workspace.getMemberGenerator(json.type);
        var workspace = folder.getWorkspace();
        var updateDataList = [];
        
        var member = generator.createMember(folder,json,updateDataList);
       
        //do data updates if needed
        if(updateDataList.length > 0) {
//we need ot capture and correctly handle the edit status
            visicomp.core.updatemember.updateObjects(updateDataList);
        }
        
        //do any updates to other objects because of the added obejct
        workspace.updateForAddedVariable(member);

		//dispatch event
		workspace.dispatchEvent(visicomp.core.createmember.MEMBER_CREATED_EVENT,member);

		//return success
		returnValue = {"success":true, "member":member};
	}
	finally {
        //for now we will not catch errors but let the broswer take care of them
        //in the future we want the debugger handling for user code errors.
        if(!returnValue) {
            alert("There was an error. See the browser debugger.");
            returnValue = {"success":false};
        }
    }
    
    return returnValue;
}




