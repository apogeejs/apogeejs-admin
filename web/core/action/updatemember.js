/** This namespace contains functions to process an update to an member
 * which inherits from the FunctionBase component. */
visicomp.core.updatemember = {};

/** UPDATE MEMBER HANDLER
 * This handler should be called to request an update to a member, including the
 * value, the formula or the initilializer.
 * 
 * Event member format:
 * { 
 *	member: [member], 
 *	value: [data], //if data is set directly, otherwise use code 
 *	functionBody: [formula text],
 *	supplementalCode: [supplementalCode],
 * }
 */
visicomp.core.updatemember.UPDATE_MEMBER_HANDLER = "updateMember";

/** UPDATE MEMBERS HANDLER
 * This handler should be called to request an update to a member, including the
 * value, the formula or the initilializer.
 * 
 * Event member format:
 * An array of member update members
 */
visicomp.core.updatemember.UPDATE_MEMEBERS_HANDLER = "updateMemebers";

/** member UPDATED EVENT
 * This listener event is fired when after a member is updated, to be used to respond
 * to the member update such as to update the UI.
 * 
 * Event member Format:
 * [member]
 */
visicomp.core.updatemember.OBJECT_UPDATED_EVENT = "memberUpdated";

visicomp.core.updatemember.fireUpdatedEvent = function(member) {
    var workspace = member.getWorkspace();
    workspace.dispatchEvent(visicomp.core.updatemember.MEMBER_UPDATED_EVENT,member);
}

/** This is the listener for the update member event. */
visicomp.core.updatemember.onUpdateObject = function(updateData) {
    var returnValue;
    
    try {
		//update member content
		visicomp.core.updatemember.setContent(updateData);

		//recalculate
		var recalculateList = [];
		visicomp.core.calculation.addToRecalculateList(recalculateList,updateData.member);
		visicomp.core.calculation.recalculateObjects(recalculateList);

		//return success
		returnValue = {"success":true};
	}
	finally {
        //for now we will not catch errors but let the broswer take care of them
        //in the future we want the debugger handling for user code errors.
        if(!returnValue) {
            alert("There was an error. See the browser debugger.");
        }
    }
    
    return returnValue;
}


/** This is the listener for the update members event. */
visicomp.core.updatemember.onUpdateObjects = function(updateDataList) {
    var recalculateList = [];

    //update members and add to recalculate list
    for(var i = 0; i < updateDataList.length; i++) {
        var data = updateDataList[i];
        visicomp.core.updatemember.setContent(data);
        visicomp.core.calculation.addToRecalculateList(recalculateList,data.member);
    }

    //recalculate members
    visicomp.core.calculation.recalculateObjects(recalculateList);

    //return success
    return {
        "success":true
    };
}
    
/** This method subscribes to the update member handler event */
visicomp.core.updatemember.initHandler = function(eventManager) {
    eventManager.addHandler(visicomp.core.updatemember.UPDATE_MEMBER_HANDLER, 
            visicomp.core.updatemember.onUpdateObject);
    eventManager.addHandler(visicomp.core.updatemember.UPDATE_MEMBERS_HANDLER, 
            visicomp.core.updatemember.onUpdateObjects);
}


/** This method updates the data for the member. It should be implemented by
 * the member.
 * @protected */
visicomp.core.updatemember.setContent = function(contentData) {
    var member = contentData.member;
	if(!member) {
		alert("Error: missing member");
		return;
	}

    //read handler data
    var functionBody = contentData.functionBody;
    var supplementalCode = contentData.supplementalCode;
    var data = contentData.data;
	
    //set forumula or value, not both
    if(functionBody) {
		
        //set code
        member.setCode(functionBody,supplementalCode);
    }
    else {
        //clear the formula
        member.clearCodeInfo();

        //set data
        member.setData(data);
		
		//fire this for the change in value
		visicomp.core.updatemember.fireUpdatedEvent(member);
    }
}	




