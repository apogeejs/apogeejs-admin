
/** These functions assist in using adebugger. */

/** The function is called when a member function is called. It
 * is intended for debug purposes, to add a breakpoint. */
__memberFunctionDebugHook = function(member) {
}

/** This function is called from the constructor code for a custom control.
 * It is intended to allow adding a breakpoint before entering user code.
 * To use this, the constuctor must be set. */
__customControlDebugHook = function(member) {
}


