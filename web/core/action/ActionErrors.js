/** This is for managing a list of errors for an action. */
visicomp.core.ActionErrors = function() {
    this.list = [];
}

/** This method adds a member to the list if it is not there. */
visicomp.core.ActionErrors.prototype.add = function(actionError) {
    if(this.list.indexOf(actionError) < 0) {
        this.list.push(actionError);
    }
}

/** This method adds a member to the list if it is not there. */
visicomp.core.ActionErrors.prototype.getErrorList = function() {
    return this.list;
}

