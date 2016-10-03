/** This namespace contains functions to process an update the object function
 *for a folderFunction. */
hax.core.updatefolderFunction = {};

hax.core.updatefolderFunction.updatePropertyValues = function(folderFunction,argList,returnValueString,optionalActionResponse) {
    var actionResponse = optionalActionResponse ? optionalActionResponse : new hax.core.ActionResponse();
    try {
        folderFunction.setArgList(argList);
        folderFunction.setReturnValueString(returnValueString);

        var recalculateList = [];
        hax.core.calculation.addToRecalculateList(recalculateList,folderFunction);
        hax.core.calculation.callRecalculateList(recalculateList,actionResponse);
        
        //fire updated events
        hax.core.updatemember.fireUpdatedEventList(recalculateList);
    }
    catch(error) {
        var actionError = hax.core.ActionError.processException(error,"AppException",true);
        actionResponse.addError(actionError);
    }
    
    return actionResponse;
}
