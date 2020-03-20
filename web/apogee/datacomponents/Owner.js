/** This component encapsulates an object that owns a member. This is different from
 * Parent in that Parent is also a member. Parents are a subset of owners.
 * An object that owns a root folder is an owner but not a parent.
 * Examples of Owners that are not parent are the Model, which holds the model root folder
 * and the FolderFunction, which is a data object which has its own root folder containing its children,
 * which are inaccessible from the rest of the model.
 * 
 * This is a mixin and not a class. It is used for the prototype of the objects that inherit from it.
 * 
 * COMPONENT DEPENDENCIES:
 * An Owner must be a Context Holder
 */
let Owner = {};
export {Owner as default};

Owner.isOwner = true;

//must be implemented in extending object
///** This method retrieves the model for the child of this owner. */
//Owner.getModel = function();

//must be implemented in extending object
///** This method retrieves the full name whichis relevent for a root folder owned
// * by this object. */
//Owner.getPossesionNameBase = function();

/** This method returns the full name in dot notation for this object. */
Owner.getChildFullName = function(model,childName) {
    return this.getPossesionNameBase(model) + childName;
}

//must be implented by extending object
///** This method retrieves the context manager for this owner. */
//Owner.getContextManager = function();

/** This method looks up a member by its full name. */
Owner.getMemberByFullName = function(fullName) {
    var path = fullName.split(".");
    return this.lookupChildFromPathArray(path);
}

///** This method looks up a member by an array path. The start element is
// * the index of the array at which to start. */
//Owner.lookupChildFromPathArray = function(path,startElement,optionalParentMemberList);

///** This method is called when the model is closed.
// It should do any needed cleanup for the object. */
//Owner.onClose = function();

