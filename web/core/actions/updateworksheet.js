/** This namespace contains functions to process an update the object function
 *for a worksheet. */
visicomp.core.updateworksheet = {};

visicomp.core.updateworksheet.updateArgList = function(worksheet,argList,optionalActionResponse) {
    var actionResponse = optionalActionResponse ? optionalActionResponse : new visicomp.core.ActionResponse();
    try {
        worksheet.setArgList(argList);

        var recalculateList = [];
        visicomp.core.calculation.addToRecalculateList(recalculateList,worksheet);
        var calcSuccess = visicomp.core.updatemember.doRecalculate(recalculateList,actionResponse);
        
        //fire updated events
        visicomp.core.updatemember.fireUpdatedEventList(recalculateList);
    }
    catch(error) {
        var actionError = visicomp.core.ActionError.processFatalAppException(error);
        actionResponse.addError(actionError);
    }
    
    return actionResponse;
}
    
visicomp.core.updateworksheet.updateReturnValue = function(worksheet,returnValueString,optionalActionResponse) {
     var actionResponse = optionalActionResponse ? optionalActionResponse : new visicomp.core.ActionResponse();
    try {
        worksheet.setReturnValueString(returnValueString);

        var recalculateList = [];
        visicomp.core.calculation.addToRecalculateList(recalculateList,worksheet);
        var calcSuccess = visicomp.core.updatemember.doRecalculate(recalculateList,actionResponse);
        
        //fire updated events
        visicomp.core.updatemember.fireUpdatedEventList(recalculateList);
    }
    catch(error) {
        var actionError = visicomp.core.ActionError.processFatalAppException(error);
        actionResponse.addError(actionError);
    }
    
    return actionResponse;
}