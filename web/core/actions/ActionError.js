

/** This method class is an action error object, to be used in an action return value. 
 * If this is an error is associated with a member the member should be passed in. Otherwise
 * null or any false value may be passed in. The error type can be omitted if the type is
 * visicomp.core.ActionError.ACTION_ERROR_MODEL and a member is passed in, which is the
 * standard case for an error. */
visicomp.core.ActionError = function(msg,optionalMember,optionalErrorType) {
    this.msg = (msg != null) ? msg : visicomp.core.ActionError.UNKNOWN_ERROR_MESSAGE;
    if(optionalMember) {
        this.member = optionalMember;
        this.errorType = visicomp.core.ActionError.ACTION_ERROR_MODEL;
    }
    if(optionalErrorType) {
        this.errorType = optionalErrorType;
    }
    
    this.isFatal = false;
    this.parentException = null;
    
}

visicomp.core.ActionError.UNKNOWN_ERROR_MESSAGE = "Unknown Error";

/** This is an error in the user model code. */
visicomp.core.ActionError.ACTION_ERROR_MODEL = "model";
/** This is an error in the application code. */
visicomp.core.ActionError.ACTION_ERROR_APP = "app";
/** This is an error in the user appliation level code, such as custom components. */
visicomp.core.ActionError.ACTION_ERROR_USER_APP = "user app";
/** This is an operator error. */
visicomp.core.ActionError.ACTION_ERROR_USER = "user";

/** This sets the exception that triggered this error. */
visicomp.core.ActionError.prototype.setParentException = function(exception) {
    this.parentException = exception;
}

/** This sets the exception that triggered this error. */
visicomp.core.ActionError.prototype.setIsFatal= function(isFatal) {
    this.isFatal = isFatal;
}

/** This sets the exception that triggered this error. */
visicomp.core.ActionError.prototype.getIsFatal= function() {
    return this.isFatal;
}

/** This method processes an exception from a model error, returning an ActionError object.
 * IT is OK if the member is passed as null. The resulting error message is the message from the
 * exception. An optional prefix may be added using the argument optionalErrorMsgPrefix.
 * This method also prints the stack trace for the exception. */
visicomp.core.ActionError.processMemberModelException = function(error,optionalMember,optionalErrorMsgPrefix) {
    if(error.stack) {
        console.error(error.stack);
    }
    var errorMsg = optionalErrorMsgPrefix ? optionalErrorMsgPrefix : "";
    if(error.message) errorMsg += error.message;
    if(errorMsg.length == 0) errorMsg = "Unknown error";
    var actionError = new visicomp.core.ActionError(errorMsg,optionalMember,visicomp.core.util.ACTION_ERROR_MODEL);
    actionError.setParentException(error);
    return actionError;
}

/** This method processes a fatal application exception, returning an ActionError object
 * marked as fatal. This should be use when the app lication is left in an unknown state. 
 * The resulting error message is the message from the
 * exception. An optional prefix may be added using the argument optionalErrorMsgPrefix.
 * This method also prints the stack trace for the exception. */
visicomp.core.ActionError.processFatalAppException = function(error,optionalErrorMsgPrefix) {  
    if(error.stack) {
        console.error(error.stack);
    }
    var errorMsg = optionalErrorMsgPrefix ? optionalErrorMsgPrefix : "";
    if(error.message) errorMsg += error.message;
    if(errorMsg.length == 0) errorMsg = "Unknown error";
    var actionError = new visicomp.core.ActionError(errorMsg,null,visicomp.core.util.ACTION_ERROR_APP);
    actionError.setParentException(error);
    actionError.setIsFatal(true);
    return actionError;
}


 