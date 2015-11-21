/** Namespace for the core logic for manipulating tables. */
visicomp.core = {}

/** Namespace for table update code, so the user can run it in the debugger. */
visicomp.core.functionCode = {};

/** This is a simple entry point to debug user code */
visicomp.core.getObjectFunction = function(object) {
    var objectName = object.getFullName();
    var workspaceName = object.getWorkspace().getName();
    
    return visicomp.core.functionCode[workspaceName][objectName];
}


