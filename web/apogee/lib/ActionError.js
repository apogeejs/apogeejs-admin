

/** This method class is an action error object, to be used in an action return value. 
 * The error type is a classification string. If the error is associated with a member
 * the member can be set here. */
export default function ActionError(msg,errorType,optionalMember) {
    this.msg = (msg != null) ? msg : ActionError.UNKNOWN_ERROR_MESSAGE;
    this.errorType = errorType;
    this.member = optionalMember;
    
    this.isFatal = false;
    this.parentException = null;
}

/* Error type Application - This is an error caused by the application. This is
 * may be shown to the user in a dialog. */
ActionError.ERROR_TYPE_APP = "AppException";
/** Error Type Model - This is an error that arises from the user code. Note that
 * rather than using this error type, a alternate descriptive string may be used. */
ActionError.ERROR_TYPE_MODEL = "ModelException";
/** Error Type User - this is operator error. */
ActionError.ERROR_TYPE_USER = "UserException";

/** This is used as the error message when no other error message is given. */
ActionError.UNKNOWN_ERROR_MESSAGE = "Unknown Error";


/** This sets the exception that triggered this error. */
ActionError.prototype.setParentException = function(exception) {
    this.parentException = exception;
}

/** This sets the exception that triggered this error. */
ActionError.prototype.setIsFatal= function(isFatal) {
    this.isFatal = isFatal;
}

/** This returns true if this is a fatal error. */
ActionError.prototype.getIsFatal= function() {
    return this.isFatal;
}

/** This gets the type of error. */
ActionError.prototype.getType= function() {
    return this.errorType;
}

/** This method processes a fatal application exception, returning an ActionError object
 * marked as fatal. This should be use when the app lication is left in an unknown state. 
 * The resulting error message is the message from the
 * exception. An optional prefix may be added using the argument optionalErrorMsgPrefix.
 * This method also prints the stack trace for the exception. */
ActionError.processException = function(exception,type,defaultToFatal,optionalErrorMsgPrefix) {  
    if(exception.stack) {
        console.error(exception.stack);
    }
    var errorMsg = optionalErrorMsgPrefix ? optionalErrorMsgPrefix : "";
    if(exception.message) errorMsg += exception.message;
    if(errorMsg.length == 0) errorMsg = "Unknown error";
    var actionError = new ActionError(errorMsg,type,null);
    actionError.setParentException(exception);
	
    var isFatal;
	if(exception.isFatal !== undefined) {
		isFatal = exception.isFatal;
	}
	else {
		isFatal = defaultToFatal;
	}
	
    actionError.setIsFatal(isFatal);
    return actionError;
}

ActionError.getListErrorMsg = function(errorList) {
    var msgList = errorList.map( actionError => {
        var msg = "";
        if(actionError.member) {
            msg += actionError.member.getName() + ": ";
        }
        msg += actionError.msg;
        return msg;
    });
    return msgList.join(";\n");
}


 