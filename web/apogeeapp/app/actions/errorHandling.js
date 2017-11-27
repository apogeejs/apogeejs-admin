
//==========================
// Error Handling
//==========================

apogeeapp.app.errorHandling = {};
    
apogeeapp.app.errorHandling.handleActionError = function(errorActionResponse) {
    var errors = errorActionResponse.getErrors();
    
    //show alert for messages of type apogee.ActionError.ERROR_TYPE_APP and 
    //apogee.ActionError.ERROR_TYPE_USER. (Do not show model error in alert)
    var isFatal = errors.some( error => error.isFatal);
    var filteredErrors = errors.filter(apogeeapp.app.errorHandling.typeFilter);
    
    if((isFatal)||(filteredErrors.length > 0)) {
        var msg = "";
        if(isFatal) {
            msg += "Fatal Error: The application is in an indeterminant state. It is recommended it be closed.\n";
        }
        msg += apogee.ActionResponse.getListErrorMsg(filteredErrors);
        alert(msg);
    }
    
    //show all errors on the console
    //console.log(errorActionResponse.getErrorMsg());
}

/** This is used to filter out messages we want to alert the user in the ui. */
apogeeapp.app.errorHandling.typeFilter = function(actionError) {
    if(actionError.getType) {
        var actualErrorType = actionError.getType();
        return ( (actualErrorType == apogee.ActionError.ERROR_TYPE_APP) ||
                 (actualErrorType == apogee.ActionError.ERROR_TYPE_USER) );
    }
    else {
        //this is not an action error
        return false;
    } 
}
