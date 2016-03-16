/** This component encapsulates an object that has a context manager.
 * 
 * This is a mixin and not a class. It is used for the prototype of the objects that inherit from it.
 * 
 * COMPONENT DEPENDENCIES:
 */
visicomp.core.ContextHolder = {};

/** This initializes the component */
visicomp.core.ContextHolder.init = function() {
    //will be set on demand
    this.contextManager = null;
}

visicomp.core.ContextHolder.isContextHolder = true;

/** This method retrieves the context manager. */
visicomp.core.ContextHolder.getContextManager = function() {
    if(!this.contextManager) {
        //set the context manager
        this.contextManager = this.createContextManager();
    }
    
    return this.contextManager;
}

//this method must be implemneted in extending classes
///** This method retrieve creates the loaded context manager. */
//visicomp.core.ContextHolder.createContextManager = function();

/** This is used only if the context manager should be replaced with an existing one.. */
visicomp.core.ContextHolder.setContextManager = function(contextManager) {
    this.contextManager = contextManager;
}




