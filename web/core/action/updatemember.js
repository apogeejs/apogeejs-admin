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
visicomp.core.updatemember.updateCode = function(member,argList,functionBody,supplementalCode) {
    var recalculateList = [];
    
    var editStatus = visicomp.core.updatemember.updateObjectFunction(member,
        argList,
        functionBody,
        supplementalCode,
        recalculateList);
        
    if(!editStatus.success) {
        return editStatus;
    }
    
    editStatus = visicomp.core.updatemember.doRecalculate(recalculateList,editStatus);
    
    return editStatus;
}

/** This is the listener for the update member event. */
visicomp.core.updatemember.updateData = function(member,data) {
    var recalculateList = [];
    var editStatus = visicomp.core.updatemember.updateObjectData(member,data,recalculateList);
    
    if(!editStatus.success) {
        return editStatus;
    }
    
    editStatus = visicomp.core.updatemember.doRecalculate(recalculateList,editStatus);
    
    return editStatus;
}

/** This is the listener for the update members event. */
visicomp.core.updatemember.updateObjects = function(updateDataList) {
    var mainEditStatus = {};
    var singleEditStatus;
    var recalculateList = [];

    //flag start of save (almost)
    mainEditStatus.saveStarted = true;

    //update members and add to recalculate list
    for(var i = 0; i < updateDataList.length; i++) {
        var argData = updateDataList[i];
        var member = argData.member;
        var data = argData.data;
        var argList = argData.argList; 
        var functionBody = argData.functionBody;
        var supplementalCode = argData.supplementalCode;
        
        if(functionBody) {
            singleEditStatus = visicomp.core.updatemember.updateObjectFunction(member,
                argList,
                functionBody,
                supplementalCode,
                recalculateList);
        }
        else if(data) {
            singleEditStatus = visicomp.core.updatemember.updateObjectData(member,data,recalculateList);
        }
        
        //stop processing on an error
        if(!singleEditStatus.success) {
            mainEditStatus.success = false;
            mainEditStatus.msg = singleEditStatus.msg;
            mainEditStatus.success = false;
            return mainEditStatus;
        }
    }
    
    //flag end of save
    mainEditStatus.saveCompleted = true;

    //return status
    mainEditStatus = visicomp.core.updatemember.doRecalculate(recalculateList,mainEditStatus);
    
    return mainEditStatus;
}

//=====================================
// Private Functions
//=====================================

visicomp.core.updatemember.processCode = function(member,argList,functionBody,supplementalCode) {
    
    //load some needed variables
    var localFolder = member.getParent();
    var rootFolder = member.getRootFolder();
    var codeLabel = member.getFullName();
    
    var codeInfo = visicomp.core.codeCompiler.processCode(argList,
        functionBody,
        supplementalCode,
        localFolder,
        rootFolder,
        codeLabel);
        
    return codeInfo;
}

/** This is the listener for the update member event. */
visicomp.core.updatemember.updateObjectFunction = function(member,
        argList,
        functionBody,
        supplementalCode,
        recalculateList) {
    
    var editStatus = {};
    
    //process the code
    var codeInfo;
   
    try {
        codeInfo = visicomp.core.updatemember.processCode(member,argList,functionBody,supplementalCode);
    }
    catch(error) {
        editStatus.msg = error.msg;
        editStatus.error = error;
        editStatus.succcess = false;
        return editStatus;
    }
    
    editStatus.saveStarted = true;
         
    //save the code
    try {
        member.setCodeInfo(codeInfo);
    }
    catch(error) {
        editStatus.msg = error.msg;
        editStatus.error = error;
        editStatus.succcess = false;
        return editStatus;
    }
    
    editStatus.saveEnded = true;
    
    try {
        visicomp.core.calculation.addToRecalculateList(recalculateList,member);
    }
    catch(error) {
        editStatus.msg = error.msg;
        editStatus.error = error;
        editStatus.succcess = false;
        return editStatus;
    }
    
    editStatus.success = true;
    return editStatus;
}


/** This is the listener for the update member event. */
visicomp.core.updatemember.updateObjectData = function(member,data,recalculateList) {
    var editStatus = {};
    editStatus.saveStarted = true;

    //set data
    try {
        member.setData(data);
        member.clearCode();
    }
    catch(error) {
        editStatus.msg = error.msg;
        editStatus.error = error;
        editStatus.succcess = false;
        return editStatus;
    }
    
    editStatus.saveEnded = true;
    
    try {
        visicomp.core.calculation.addToRecalculateList(recalculateList,member);
    }
    catch(error) {
        editStatus.msg = error.msg;
        editStatus.error = error;
        editStatus.succcess = false;
        return editStatus;
    }
    
    editStatus.success = true;
    return editStatus;
}

/** This is the listener for the update member event. */
visicomp.core.updatemember.doRecalculate = function(recalculateList,editStatus) {
    //sort list
    try {
        visicomp.core.calculation.sortRecalculateList(recalculateList);
    }
    catch(error) {
        editStatus.msg = error.msg;
        editStatus.error = error;
        editStatus.succcess = false;
        return editStatus;
    }
    
    //recalculate - let an error from here go, to be processed in debugger for now
    visicomp.core.calculation.callRecalculateList(recalculateList);
    
    editStatus.success = true;
    return editStatus;
}


