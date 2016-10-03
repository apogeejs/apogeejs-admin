/** This component encapsulates an object that has a context manager.
 * 
 * This is a mixin and not a class. It is used for the prototype of the objects that inherit from it.
 * 
 * COMPONENT DEPENDENCIES:
 */
hax.core.ContextHolder = {};

/** This initializes the component */
hax.core.ContextHolder.init = function() {
    //will be set on demand
    this.contextManager = null;
}

hax.core.ContextHolder.isContextHolder = true;

/** This method retrieves the context manager. */
hax.core.ContextHolder.getContextManager = function() {
    if(!this.contextManager) {
        //set the context manager
        this.contextManager = this.createContextManager();
    }
    
    return this.contextManager;
}

//this method must be implemneted in extending classes
///** This method retrieve creates the loaded context manager. */
//hax.core.ContextHolder.createContextManager = function();

/** This is used only if the context manager should be replaced with an existing one.. */
hax.core.ContextHolder.setContextManager = function(contextManager) {
    this.contextManager = contextManager;
}




