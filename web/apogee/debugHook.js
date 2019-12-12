
/** These functions assist in using adebugger. */

/** The function is called when a member function is called. It
 * is intended for debug purposes, to add a breakpoint. */
__globals__.__memberFunctionDebugHook = function(memberFullName) {
}

/** This function is called from the constructor code for a custom control.
 * It is intended to allow adding a breakpoint before entering user code.
 * To use this, the constuctor must be set. */
__globals__.__customControlDebugHook = function(args) {
}

/** This is a wrapper used in function table creation to help make 
 * debugging more readable, rather than placing this code in the section that
 * is obfuscated. */
__globals__.__functionTableWrapper = function(initMember) {

    var memberFunction;
    var memberInitialized = false;

    //create member function for lazy initialization
    var wrapperMemberFunction = function(argList) {
        if(!memberInitialized) {
            memberFunction = initMember();
            memberInitialized = true;
        }

        return memberFunction.apply(null,arguments);
    }
    
    return wrapperMemberFunction;
}


