apogee.action = {};

/** This class encapsulates a response to an action. It include a success flag,
 * a list of ActionErrors, and a fatal flag. Success is set to true unless there
 * are errors set. The fatal flag indicates that one of the errors was a fatal error.
 * When processing an action, only model data errors should be set. A code error 
 * will be translated to a data error when recalculate is called. Application 
 * errors can also be set. */
apogee.ActionResponse = function() {
    this.success = true;
    this.errors = [];
    this.fatal = false;
}

/** This method adds an error to the error list for this action. It also sets 
 * success to false. */
apogee.ActionResponse.prototype.addError = function(actionError) {
    this.success = false;
    if(actionError.getIsFatal()) {
        this.fatal = true;
    }
    
    if(this.errors.indexOf(actionError) < 0) {
        this.errors.push(actionError);
    }
}

/** This method returns false if there were any errors during this action. */
apogee.ActionResponse.prototype.getSuccess = function() {
    return this.success;
}

/** This method returns the error message for this action. It is only valid if success = false. */
apogee.ActionResponse.prototype.getErrorMsg = function() {
    var msg = "";
    if(this.fatal) {
        msg += "Unknown Error: The application is in an indeterminant state. It is recommended it be closed.\n";
    }
    for(var i = 0; i < this.errors.length; i++) {
        var actionError = this.errors[i];
        var line = "";
        if(actionError.member) {
            line += actionError.member.getName() + ": ";
        }
        line += actionError.msg;
        msg += line + "\n";
    }
    return msg;
}
        




