/** This component encapsulates an object that has a context manager.
 * 
 * This is a mixin and not a class. It is used for the prototype of the objects that inherit from it.
 * 
 * COMPONENT DEPENDENCIES:
 */
hax.ContextHolder = {};

/** This initializes the component */
hax.ContextHolder.init = function() {
    //will be set on demand
    this.contextManager = null;
}

hax.ContextHolder.isContextHolder = true;

/** This method retrieves the context manager. */
hax.ContextHolder.getContextManager = function() {
    if(!this.contextManager) {
        //set the context manager
        this.contextManager = this.createContextManager();
    }
    
    return this.contextManager;
}

//this method must be implemneted in extending classes
///** This method retrieve creates the loaded context manager. */
//hax.ContextHolder.createContextManager = function();

hax.ContextManager.prototype.getImpactor = function(path) {
    
    return this.hierarchicalLookup("lookupImpactor",path);
}

///** This method looks up a member by name, where the name is the name of
// * the variable as accessed from the context of this member. */
//hax.ContextHolder.lookupMemberByName = function(variableName) {
//    var path = fullName.split(".");
//    var contextManager =  this.getContextManager();
//    return contextManager.getImpactor(path);
//}




