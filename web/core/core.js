/** Namespace for the core logic for manipulating tables. */
visicomp.core = {}

/** Namespace for table update code, so the user can run it in the debugger. */
visicomp.core.functionCode = {};

/** This is a simple entry point to debug user code */
visicomp.core.runObjectFunction = function(object) {
    var objectName = object.getFullName();
    var workspaceName = object.getWorkspace().getName();
    
    var objectFunction = visicomp.core.functionCode[workspaceName][objectName];
    if(objectFunction) {
        //step in here to debug user code for a given table
        return objectFunction();
    }
    else {
        throw "Table update command not found";
    }
}


