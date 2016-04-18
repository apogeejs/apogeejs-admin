

/** This method class is an action error object, to be used in an action return value. 
 * The error type is a classification string. If the error is associated with a member
 * the member can be set here. */
visicomp.core.ActionError = function(msg,errorType,optionalMember) {
    this.msg = (msg != null) ? msg : visicomp.core.ActionError.UNKNOWN_ERROR_MESSAGE;
    this.errorType = errorType;
    this.member = optionalMember;
    
    this.isFatal = false;
    this.parentException = null;
}

visicomp.core.ActionError.UNKNOWN_ERROR_MESSAGE = "Unknown Error";

//"User App" - This is an error in the users application code
//"Custom Control - Update" - in "update" of custom control (cleared and set)
//"FolderFunction - Code" - error in setting the folderFunction function
//"User" - This is an operator error
//"Model" - This is an error in the data model, like a missing generator
//"Code" - error in use model code (I used on folderFunction and in code. Maybe I should split these.)
//"Calculate" - error when the object function is set as data (includes execution if necessary)
//
///** This is an error in the user model code. */
//visicomp.core.ActionError.ACTION_ERROR_MODEL = "model";
///** This is an error in the application code. */
//visicomp.core.ActionError.ACTION_ERROR_APP = "app";
///** This is an error in the user appliation level code, such as custom components. */
//visicomp.core.ActionError.ACTION_ERROR_USER_APP = "user app";
///** This is an operator error. */
//visicomp.core.ActionError.ACTION_ERROR_USER = "user";

/** This sets the exception that triggered this error. */
visicomp.core.ActionError.prototype.setParentException = function(exception) {
    this.parentException = exception;
}

/** This sets the exception that triggered this error. */
visicomp.core.ActionError.prototype.setIsFatal= function(isFatal) {
    this.isFatal = isFatal;
}

/** This returns true if this is a fatal error. */
visicomp.core.ActionError.prototype.getIsFatal= function() {
    return this.isFatal;
}

/** This gets the type of error. */
visicomp.core.ActionError.prototype.getType= function() {
    return this.errorType;
}

/** This method processes a fatal application exception, returning an ActionError object
 * marked as fatal. This should be use when the app lication is left in an unknown state. 
 * The resulting error message is the message from the
 * exception. An optional prefix may be added using the argument optionalErrorMsgPrefix.
 * This method also prints the stack trace for the exception. */
visicomp.core.ActionError.processException = function(exception,type,defaultToFatal,optionalErrorMsgPrefix) {  
    if(exception.stack) {
        console.error(exception.stack);
    }
    var errorMsg = optionalErrorMsgPrefix ? optionalErrorMsgPrefix : "";
    if(exception.message) errorMsg += exception.message;
    if(errorMsg.length == 0) errorMsg = "Unknown error";
    var actionError = new visicomp.core.ActionError(errorMsg,type,null);
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


 