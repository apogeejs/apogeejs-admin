
/** These functions assist in using adebugger. */

/** The function generated below is called each time the user code is run.
 * This code is broken out to make debugginr easier.
 * The method below "initFunction" itself is not particularly helpful for debugging.
 * It does lazy context initialization the first time this user code is called. 
 */
apogee.memberDebugHook = function(member) {
    
     return function() {
        //insert breakpoint below
        //return of this function enters the user code for this member.
        //
        //for conditional breakpoints, use the function member.getName()
        //to get the member name.        
        return member.testFunction();
    };
}


