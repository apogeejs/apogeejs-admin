

/** This method class is an action error object, to be used in an action return value. 
 * If this is an error is associated with a member the member should be passed in. Otherwise
 * null or any false value may be passed in. The error type can be omitted if the type is
 * visicomp.core.action.ACTION_ERROR_MODEL and a member is passed in, which is the
 * standard case for an error. */
visicomp.core.ActionError = function(msg,optionalMember,optionalErrorType) {
    this.msg = (msg != null) ? msg : visicomp.core.action.UNKNOWN_ERROR_MESSAGE;
    if(optionalMember) {
        this.member = optionalMember;
        this.errorType = visicomp.core.action.ACTION_ERROR_MODEL;
    }
    if(optionalErrorType) {
        this.errorType = optionalErrorType;
    }
    
    this.isDependencyError = false;
    this.parentException = null;
    
}

visicomp.core.action.UNKNOWN_ERROR_MESSAGE = "Unknown Error";

visicomp.core.action.ACTION_ERROR_MODEL = "model";
visicomp.core.action.ACTION_ERROR_APP = "app";
visicomp.core.action.ACTION_ERROR_USER_APP = "user app";

/** This flag indicates the error was triggered by a previoues error. */
visicomp.core.ActionError.prototype.setDependencyError = function(isDependencyError) {
    this.isDependencyError = isDependencyError;
}

/** This sets the exception that triggered this error. */
visicomp.core.ActionError.prototype.setParentException = function(exception) {
    this.parentException = exception;
}

 