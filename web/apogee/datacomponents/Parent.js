/** This component encapsulates an owner object that is a member and contains children members, creating  a 
 * hierarchical structure in the workspace. Each child has a name and this name
 * forms the index of the child into its parent. (I guess that means it doesn't
 * have to be a string, in the case we made an ArrayFolder, which would index the
 * children by integer.)
 * 
 * This is a mixin and not a class. It is used for the prototype of the objects that inherit from it.
 * 
 * COMPONENT DEPENDENCIES:
 * - A Parent must be a Member.
 * - A Parent must be an Owner.
 */
apogee.Parent = {};

/** This is the name for the root. */
apogee.Parent.ROOT_NAME = "root";

/** This initializes the component */
apogee.Parent.init = function() {
    this.childrenWriteable = true;
}

apogee.Parent.isParent = true;


/** this is used to identify if this is the root folder. */
apogee.Parent.isRoot = function() {
    //undefined may be OK too. If there is populated object this is not root.
    return (this.getParent() == null); 
}

///** this method gets a map of child names to children. This may not be the structure
// * of the data in the parent, but it is the prefered common representation. */
//apogee.Parent.getChildMap = function();

// Must be implemented in extending object
///** This method looks up a child from this folder.  */
//apogee.Folder.lookupChild = function(name);

/** This method looks up a child using an arry of names corresponding to the
 * path from this folder to the object.  The argument startElement is an optional
 * index into the path array for fodler below the root folder. */
apogee.Parent.lookupChildFromPathArray = function(path,startElement) {
    if(startElement === undefined) startElement = 0;
    
    var member = this.lookupChild(path[startElement]);
    if(!member) return undefined;
    
    if(startElement < path.length-1) {
        if(member.isParent) {
            return member.lookupChildFromPathArray(path,startElement+1);
        }
        else if(member.isOwner) {
            return member.getMemberByPathArray(path,startElement+1);
        }
        else {
            return member;
        }
    }
    else {
        return member;
    }
}

/** This method allows the UI to decide if the user can add children to it. This
 * value defaults to true. */
apogee.Parent.getChildrenWriteable = function() {
    return this.childrenWriteable;
}

/** This method sets the writeable property for adding child members. This value of
 * the method is not enforced (since children must be added one way or another). */
apogee.Parent.setChildrenWriteable = function(writeable) {
    this.childrenWriteable = writeable; 
}

// Must be implemented in extending object
///** This method adds the child to this parent. 
// * It will fail if the name already exists.  */
//apogee.Parent.addChild = function(child);

// Must be implemented in extending object
///** This method removes this child from this parent.  */
//apogee.Parent.removeChild = function(child);

// Must be implemented in extending object
///** This method updates the data object for this child. */
//apogee.Parent.updateData = function(child);

///** This method is called when the workspace is closed. 
//* It should do any needed cleanup for the object. */
//apogee.Parent.onClose = function();

//------------------------------
//ContextHolder methods
//------------------------------

/** This method retrieve creates the loaded context manager. */
apogee.Parent.createContextManager = function() {
    //set the context manager
    var contextManager = new apogee.ContextManager(this);
    //add an entry for this folder. Make it local unless this si a root folder
    var myEntry = {};
    myEntry.parent = this;
    contextManager.addToContextList(myEntry);
    
    return contextManager;
}

//------------------------------
//Owner methods
//------------------------------

/** This method returns the full name in dot notation for this object. */
//apogee.Parent.getFullName = function() {
//    return apogee.Member.getFullName.call(this);
//}

/** this method gets the hame the children inherit for the full name. */
apogee.Parent.getPossesionNameBase = function() {
    return this.getFullName() + ".";
}

