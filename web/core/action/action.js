visicomp.core.action = {};

/** This method creates an action response object, to be used in an action return value. */
visicomp.core.action.createActionResponse = function() {
    var obj = {};
    obj.success = false;
    obj.errors = new visicomp.core.ActionErrors()
    obj.fatal = false;
    obj.actionDone = false;
    return obj;
}




