import ContextManager from "/apogee/lib/ContextManager.js";

/** This component encapsulates an owner object that is a member and contains children members, creating  a 
 * hierarchical structure in the model. Each child has a name and this name
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
let Parent = {};
export {Parent as default};

/** This initializes the component */
Parent.parentMixinInit = function() {
    this.childrenWriteable = true;
}

Parent.isParent = true;

///** this method gets a map of child names to children. This may not be the structure
// * of the data in the parent, but it is the prefered common representation. */
//Parent.getChildMap = function();

// Must be implemented in extending object
///** This method looks up a child from this folder.  */
//Parent.lookupChild = function(name);

/** This method looks up a child using an arry of names corresponding to the
 * path from this folder to the object.  The argument startElement is an optional
 * index into the path array for fodler below the root folder. 
 * The optional parentMemberList argument can be passed in to load the parent members 
 * for the given member looked up. */
Parent.lookupChildFromPathArray = function(path,startElement,optionalParentMemberList) {
    if(startElement === undefined) startElement = 0;
    
    var childMember = this.lookupChild(path[startElement]);
    if(!childMember) return undefined;
    
    if(startElement < path.length-1) {
        if(childMember.isParent) {
            let grandChildMember = childMember.lookupChildFromPathArray(path,startElement+1,optionalParentMemberList);
            //record the parent path, if requested
            if((grandChildMember)&&(optionalParentMemberList)) {
                optionalParentMemberList.push(childMember);
            }
            return grandChildMember;
        }
        else if(childMember.isOwner) {
            let grandChildMember = childMember.lookupChildFromPathArray(path,startElement+1,optionalParentMemberList);
            //record the parent path, if requested
            if((grandChildMember)&&(optionalParentMemberList)) {
                optionalParentMemberList.push(childMember);
            }
            return grandChildMember;
        }
        else {
            return childMember;
        }
    }
    else {
        return childMember;
    }
}

/** This method allows the UI to decide if the user can add children to it. This
 * value defaults to true. */
Parent.getChildrenWriteable = function() {
    return this.childrenWriteable;
}

/** This method sets the writeable property for adding child members. This value of
 * the method is not enforced (since children must be added one way or another). */
Parent.setChildrenWriteable = function(writeable) {
    this.childrenWriteable = writeable; 
}

// Must be implemented in extending object
///** This method adds the child to this parent. 
// * It will fail if the name already exists.  */
//Parent.addChild = function(model,child);

// Must be implemented in extending object
///** This method removes this child from this parent.  */
//Parent.removeChild = function(model,child);

// Must be implemented in extending object
///** This method updates the data object for this child. */
//Parent.updateData = function(child);

///** This method is called when the model is closed. 
//* It should do any needed cleanup for the object. */
//Parent.onClose = function();

//------------------------------
//ContextHolder methods
//------------------------------

/** This method retrieve creates the loaded context manager. */
Parent.createContextManager = function() {
    //set the context manager
    var contextManager = new ContextManager(this);
    //add an entry for this folder. Make it local unless this si a root folder
    var myEntry = {};
    myEntry.contextHolderAsParent = true;
    contextManager.addToContextList(myEntry);
    
    return contextManager;
}

//------------------------------
//Owner methods
//------------------------------

/** This method returns the full name in dot notation for this object. */
//Parent.getFullName = function(model) {
//    return super.getFullName(model);
//}

/** this method gets the hame the children inherit for the full name. */
Parent.getPossesionNameBase = function(model) {
    return this.getFullName(model) + ".";
}

