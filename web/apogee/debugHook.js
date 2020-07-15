
/** These functions assist in using adebugger. */

/** The function is called when a member function is called. It
 * is intended for debug purposes, to add a breakpoint. */
__globals__.__memberFunctionDebugHook = function(memberName) {
}

/** This function is called from the constructor code for a custom control.
 * It is intended to allow adding a breakpoint before entering user code.
 * To use this, the constuctor must be set. */
__globals__.__customControlDebugHook = function(args) {
}

/** This is a wrapper used in function table creation to help make 
 * debugging more readable, rather than placing this code in the section that
 * is obfuscated. */
__globals__.__functionTableWrapper = function(initMember,functionName) {

    var memberFunction;
    var memberInitialized = false;

    var initializeIfNeeded = () => {
        if(!memberInitialized) {
            memberFunction = initMember();
            memberInitialized = true;
        }
    }

    //create member function for lazy initialization
    var wrapperMemberFunction = function(argList) {
        initializeIfNeeded();
        try {
            return memberFunction.apply(null,arguments);
        }
        catch(error) {
            console.error("Error in function call to " + functionName);
            throw error;
        }
    }

    //add an function on this function to allow external initialization
    wrapperMemberFunction.initializeIfNeeded = initializeIfNeeded;
    
    return wrapperMemberFunction;
}


