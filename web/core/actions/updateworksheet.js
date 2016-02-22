/** This namespace contains functions to process an update the object function
 *for a worksheet. */
visicomp.core.updateworksheet = {};

visicomp.core.updateworksheet.updateArgList = function(worksheet,argList,optionalActionResponse) {
    worksheet.setArgList(argList);
    return visicomp.core.updateworksheet.recalculateFunction(worksheet,optionalActionResponse);
}
    
visicomp.core.updateworksheet.updateReturnValue = function(worksheet,returnValueString,optionalActionResponse) {
    worksheet.setReturnValueString(returnValueString);
    return visicomp.core.updateworksheet.recalculateFunction(worksheet,optionalActionResponse);
}

/** This method update the worksheet function and does the necessary recalculation. */
visicomp.core.updateworksheet.recalculateFunction = function(worksheet,optionalActionResponse) {
	var actionResponse = optionalActionResponse ? optionalActionResponse : new visicomp.core.ActionResponse();
    
    var worksheetFunction = worksheet.getWorksheetFunction();
    
    //set the worksheet function directly as data
    visicomp.core.updatemember.updateData(worksheet,worksheetFunction,actionResponse);
    
    return actionResponse;
}