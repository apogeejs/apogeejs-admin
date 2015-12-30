/** This namespace contains functions to process an update to an member
 * which inherits from the FunctionBase component. */
visicomp.core.updatemember = {};

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
visicomp.core.updatemember.updateCode = function(member,functionBody,supplementalCode) {
    var editStatus;

    //set code
    editStatus = visicomp.core.updatemember.setCode(member,functionBody,supplementalCode);

    if(editStatus.success) {
        //recalculate
        var recalculateList = [];
        visicomp.core.calculation.addToRecalculateList(recalculateList,member);
        visicomp.core.calculation.recalculateObjects(recalculateList,editStatus);
    }
    
    return editStatus;
}

/** This is the listener for the update member event. */
visicomp.core.updatemember.updateData = function(member,data) {
    var editStatus;

    //set data
    editStatus = visicomp.core.updatemember.setData(member,data);

    if(editStatus.success) {
        //recalculate
        var recalculateList = [];
        visicomp.core.calculation.addToRecalculateList(recalculateList,member);
        visicomp.core.calculation.recalculateObjects(recalculateList,editStatus);
    }
    
    return editStatus;
}

/** This is the listener for the update member event. */
visicomp.core.updatemember.updateArgList = function(member,argList) {
    var editStatus;

    //set data
    editStatus = visicomp.core.updatemember.setArgList(member,argList);

    if(editStatus.success) {
        //recalculate
        var recalculateList = [];
        visicomp.core.calculation.addToRecalculateList(recalculateList,member);
        visicomp.core.calculation.recalculateObjects(recalculateList,editStatus);
    }

    return editStatus;
}


/** This is the listener for the update members event. */
visicomp.core.updatemember.updateObjects = function(updateDataList) {
    var mainEditStatus = visicomp.core.util.createEditStatus();
    var singleEditStatus
    var recalculateList = [];

    //flag start of save (almost)
    mainEditStatus.saveStarted = true;

    //update members and add to recalculate list
    for(var i = 0; i < updateDataList.length; i++) {
        var argData = updateDataList[i];
        var member = argData.member;
        var data = argData.data;
        var functionBody = argData.functionBody;
        var supplementalCode = argData.supplementalCode;
        
        if(functionBody) {
            singleEditStatus = visicomp.core.updatemember.setCode(member,functionBody,supplementalCode);
        }
        else if(data) {
            singleEditStatus = visicomp.core.updatemember.setData(member,data);
        }
        
        //stop processing on an error
        if(!singleEditStatus.success) {
            mainEditStatus.success = false;
            mainEditStatus.msg = singleEditStatus.msg;
            return mainEditStatus;
        }
        
        visicomp.core.calculation.addToRecalculateList(recalculateList,member);
    }
    
    //flag end of save
    mainEditStatus.saveCompleted = true;

    //recalculate members
    visicomp.core.calculation.recalculateObjects(recalculateList,mainEditStatus);

    //return status
    return mainEditStatus;
}

/** This method responds to a "new" menu event. */
visicomp.core.updatemember.getUpdateDataWrapper = function(member,data,functionBody,supplementalCode) {
	
	var updateDataWraapper = {};
    updateDataWraapper.member = member;
    if((data !== undefined)||(data !== null)) {
        updateDataWraapper.data = data;
    }
	updateDataWraapper.functionBody = functionBody;
	updateDataWraapper.supplementalCode = supplementalCode;
	
	return updateDataWraapper;
}

visicomp.core.updatemember.setCode = function(member,functionBody,supplementalCode) {
     //set code
     var editStatus = member.setCode(functionBody,supplementalCode);
     
     return editStatus;
}

visicomp.core.updatemember.setData = function(member,data) {
    //set data
    var editStatus = member.setData(data);

    //clear the formula
    member.clearCode();
    
    return editStatus;
}

visicomp.core.updatemember.setArgList = function(member,argList) {
    var editStatus = member.setArgList(argList);
    
    return editStatus;
}




