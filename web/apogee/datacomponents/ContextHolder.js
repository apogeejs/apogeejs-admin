/** This component encapsulates an object that has a context manager.
 * 
 * This is a mixin and not a class. It is used for the prototype of the objects that inherit from it.
 * 
 * COMPONENT DEPENDENCIES:
 */
let ContextHolder = {};
export {ContextHolder as default};

/** This initializes the component */
ContextHolder.contextHolderMixinInit = function(isScopeRoot) {
    this.isScopeRoot = isScopeRoot;

    //&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&
    //What kind of field is this? Dependent?
    //will be set on demand
    this.contextManager = null;
    //&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&
}

ContextHolder.isContextHolder = true;

/** This method retrieves the context manager. */
ContextHolder.getContextManager = function() {
    if(!this.contextManager) {
        //set the context manager
        this.contextManager = this.createContextManager();
    }
    
    return this.contextManager;
}

ContextHolder.getIsScopeRoot = function() {
    return this.isScopeRoot;
}

//this method must be implemneted in extending classes
///** This method retrieve creates the loaded context manager. */
//ContextHolder.createContextManager = function();





