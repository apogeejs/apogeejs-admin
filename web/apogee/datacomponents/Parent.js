import ContextManager from "/apogee/lib/ContextManager.js";

/** This component encapsulates an parent object that is a member and contains children members, creating  a 
 * hierarchical structure in the model. Each child has a name and this name
 * forms the index of the child into its parent. (I guess that means it doesn't
 * have to be a string, in the case we made an ArrayFolder, which would index the
 * children by integer.)
 * 
 * This is a mixin and not a class. It is used for the prototype of the objects that inherit from it.
 */
let Parent = {};
export {Parent as default};

/** This initializes the component.
 * - isCopy - this should be set to true (or another value that evaluates to true) if this parent is being initialized
 * as a copy of aother instance.
 */
Parent.parentMixinInit = function(isCopy) {
    //default value. Can be reconfigured
    this.childrenWriteable = true

    if(!isCopy) {
        //initialize the child mape
        this.setField("childIdMap",{});
    }
}

Parent.isParent = true;

/** This method returns the map of the children. */
Parent.getChildIdMap = function() {
    return this.getField("childIdMap");
}

/** This method looks up a child from this parent.  */
Parent.lookupChildId = function(name) {
    //check look for object in this folder
    let childIdMap = this.getField("childIdMap");
    return childIdMap[name];
}

/** This method looks up a child from this parent.  */
Parent.lookupChild = function(model,name) {
    let childId = this.lookupChildId(name);
    if(childId) {
        return model.lookupMemberById(childId);
    }
    else {
        return null;
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

/** This method adds a table to the folder. It also sets the folder for the
 *table object to this folder. It will fail if the name already exists.  */
Parent.addChild = function(model,child) {
    
    //check if it exists first
    let name = child.getName();
    let childIdMap = this.getField("childIdMap");
    if(childIdMap[name]) {
        //already exists! not fatal since it is not added to the model yet,
        throw base.createError("There is already an object with the given name.",false);
    }

    //make a copy of the child map to modify
    let newChildIdMap = {};
    Object.assign(newChildIdMap,childIdMap);

    //add object
    newChildIdMap[name] = child.getId();
    this.setField("childIdMap",newChildIdMap);
    
    //set all children as dependents
    if(this.onAddChild) {
        this.onAddChild(model,child);
    }
}

//This method should optionally be implemented for any additional actions when a Child is added.
//Parent.onAddChild(model,child);

/** This method removes a table from the folder. */
Parent.removeChild = function(model,child) {
    //make sure this is a child of this object
    var parent = child.getParent(model);
    if((!parent)||(parent !== this)) return;
    
    //remove from folder
    var name = child.getName();
    let childIdMap = this.getField("childIdMap");
    //make a copy of the child map to modify
    let newChildIdMap = {};
    Object.assign(newChildIdMap,childIdMap);
    
    delete(newChildIdMap[name]);
    this.setField("childIdMap",newChildIdMap);
    
    //set all children as dependents
    if(this.onRemoveChild) {
        this.onRemoveChild(model,child);
    }
}

//This method should optionally be implemented for any additional actions when a Child is removed.
//Parent.onRemoveChild(model,child);

///** This method is called when the model is closed. 
//* It should do any needed cleanup for the object. */
Parent.onClose = function() {
    let childIdMap = this.getField("childIdMap");
    for(var key in childIdMap) {
        var childId = childIdMap[key];
        let child = model.lookupMemberById(childId);
        if((child)(child.onClose)) child.onClose();
    }

    if(this.onCloseAddition) {
        this.onCloseAddition();
    }
}

//This method should optionally be implemented if there are any additional actions when the parent is closed.
//This method will be called after all children have been closed.
//Parent.onCloseAddition();

//This method should be implemented to give the base name the children inherit for the full name. */
//Parent.getPossesionNameBase = function(model);

/** This method returns the full name in dot notation for this object. */
Parent.getChildFullName = function(model,childName) {
    return this.getPossesionNameBase(model) + childName;
}

/** This method looks up a member by its full name. */
Parent.getMemberByFullName = function(model,fullName) {
    var path = fullName.split(".");
    return this.lookupChildFromPathArray(model,path);
}

/** This method looks up a child using an arry of names corresponding to the
 * path from this folder to the object.  The argument startElement is an optional
 * index into the path array for fodler below the root folder. 
 * The optional parentMemberList argument can be passed in to load the parent members 
 * for the given member looked up. */
Parent.lookupChildFromPathArray = function(model,path,startElement,optionalParentMemberList) {
    if(startElement === undefined) startElement = 0;
    
    var childMember = this.lookupChild(model,path[startElement]);
    if(!childMember) return undefined;
    
    if(startElement < path.length-1) {
        if(childMember.isParent) {
            let grandChildMember = childMember.lookupChildFromPathArray(model,path,startElement+1,optionalParentMemberList);
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