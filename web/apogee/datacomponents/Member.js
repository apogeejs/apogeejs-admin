import {doAction} from "/apogee/actions/action.js";

/** This component encapsulates the member functionality for objects in the model.
 * 
 * This is a mixin and not a class. It is used for the prototype of the objects that inherit from it.
 *  
 * COMPONENT DEPENDENCIES:
 * 
 * FIELD NAMES (from update event):
 * - data
 * - name
 * - owner
 * 
 */
let Member = {};
export {Member as default};
    
/** This serves as the constructor for the member object, when extending it. 
 * The owner should be the parent that holds this member or the object that holds
 * the hierarchy (maybe the model). If the owner is not a parent, this is typically
 * a folder and it is called the root folder. */
Member.init = function(name,generator) {
    this.id = Member._createId();
    this.name = name;
    
    this.data = null;
    this.impactsList = [];
    
    this.generator = generator;
    this.errors = []; 
    this.resultInvalid = false;
    this.resultPending = false;
    
    this.updated = {};
    
    //set updated in constructor
    this.fieldUpdated("name");
    this.fieldUpdated("data");
}

Member.initOwner = function(owner) {
    if(this.owner != owner) {
        this.fieldUpdated("owner");
    }
    
    this.owner = owner;
    if(owner.isParent) {
        this.owner.addChild(this);
    }
    else if(owner.isRootHolder) {
        this.owner.setRoot(this);
    }
}

Member.move = function(newName,newOwner) {

    //remove from old owner
    if(this.owner) {
        if(this.owner.isParent) {
            this.owner.removeChild(this);
        }
        else {
            //don't allow moving a root for now!
            //or renaiming either!
        }
    }
    
    //check for change of name
    if(newName != this.name) {
        this.fieldUpdated("name");
        
        this.name = newName;
    }
    
    //place in the new owner or update the name in the old owner
    //owner field updated here
    this.initOwner(newOwner);
}

/** This property tells if this object is a member.
 * This property should not be implemented on non-members. */
Member.isMember = true

/** this method gets the ID. It is not persistent and is valid only for this 
 * instance the model is opened. */
Member.getId = function() {
    return this.id;
}

/** this method gets the name. */
Member.getName = function() {
    return this.name;
}

/** This method returns the full name in dot notation for this object. */
Member.getFullName = function() {
    if(this.owner) {
        return this.owner.getChildFullName(this.name);
    }
    else {
        //this shouldn't happen
        return this.name;
    }
}

/** This returns the owner for this member. */
Member.getOwner = function() {
    return this.owner;
}

/** This returns the parent for this member. For the root folder
 * this value is null. */
Member.getParent = function() {
    if((this.owner)&&(this.owner.isParent)) {
        return this.owner;
    }
    else {
        return null;
    }
}

/** this method gets the model. */
Member.getModel = function() {
   if(this.owner) {
       return this.owner.getModel();
   }
   else {
       return null;
   }
}

/** this method gets the root folder/namespace for this object. */
Member.getRoot = function() {
    var ancestor = this;
	while(ancestor) {
		var owner = ancestor.getOwner();
        if(!owner) {
            return null;
        }
        else if(!owner.isParent) {
            return ancestor;
        }
        ancestor = owner;
	} 
	return null; //this shouldn't happen
}

/** This method sets the pre calc error for this dependent. */
Member.addError = function(error) {
    this.errors.push(error);
}

/** This method sets the pre calc error for this dependent. */
Member.addErrors = function(errorList) {
    this.errors = this.errors.concat(errorList);
}

/** This method clears the error list. */
Member.clearErrors = function(type) {
    var newList = [];
    if(type != null) {    
        for(var i = 0; i < this.errors.length; i++) {
            var entry = this.errors[i];
            if(entry.type != type) {
                newList.push(entry);
            }
        }
    }
    this.errors = newList;
}

/** This returns true if there is a pre calc error. */
Member.hasError = function() {
    return (this.errors.length > 0);
}

/** This returns the pre calc error. */
Member.getErrors = function() {
    return this.errors;
}

/** This returns true if the member is not up to date, typically
 * do to waiting on an asynchronous operation. */
Member.getResultPending = function() {
    return this.resultPending;
}

/** This returns true if the member is not up to date, typically
 * do to waiting on an asynchronous operation. */
Member.getPendingPromise = function() {
    return this.pendingPromise;
}

/** This sets the result pending flag. If is pending is set to true and
 * this is the object whose value is pending (as opposed to a member that 
 * is dependent on the pending member) the promise should be saved. This 
 * is used to ensure only a matching asynchronous action is kept. */
Member.setResultPending = function(isPending,promise) {
    this.resultPending = isPending;
    this.pendingPromise = promise;
}

/** This returns true if the member is invalid, typically
 * meaning the calculation could not properly be performed becase the
 * needed data is not available. */
Member.getResultInvalid = function() {
    return this.resultInvalid;
}

/** This sets the result invalid flag. If the result is invalid, any
 * table depending on this will also have an invalid value. */
Member.setResultInvalid = function(isInvalid) {
    this.resultInvalid = isInvalid;
}

/** This returns true if the pending token matches. */
Member.pendingPromiseMatches = function(promise) {
    return (this.pendingPromise === promise);
}

Member.getSetDataOk = function() {
    return this.generator.setDataOk;
}

/** This method writes the child to a json. */
Member.toJson = function() {
	var json = {};
    json.name = this.name;
    json.type = this.generator.type;
    if(this.addToJson) {
        this.addToJson(json);
    }
    
    if(this.getUpdateData) {
        var updateData = this.getUpdateData();
        json.updateData = updateData;
    }
    return json;
}

///** This method creates a member from a json. IT should be implemented as a static
// * function in extending objects. */ 
//Member.fromJson = function(owner,json,childrenJsonOutputList) {
//}

//-----------------------------------
// Data methods
//-----------------------------------

/** this method gets the data map. */
Member.getData = function() {
    return this.data;
}

/** This returns an array of members this member impacts. */
Member.getImpactsList = function() {
    return this.impactsList;
}

/** This method sets the data for this object. This is the object used by the 
 * code which is identified by this name, for example the JSON object associated
 * with a JSON table. Besides hold the data object, this updates the parent data map. */
Member.setData = function(data) {
    this.data = data;
    this.fieldUpdated("data");
  
    var parent = this.getParent();
    if(parent) {
        parent.updateData(this);
    }
}


/** This method implements setting asynchronous data on the member using a promise. */
Member.applyPromiseData = function(promise,onAsynchComplete,optionalPromiseRefresh) {
    //set the result as pending
    this.setResultPending(true,promise);

    //kick off the asynch update, if this is not only a refresh of the promise
    if(!optionalPromiseRefresh) {
        var model = this.getModel();
        var asynchCallback = memberValue => {
            //set the data for the table, along with triggering updates on dependent tables.
            let actionData = {};
            actionData.action = "updateData";
            actionData.memberName = this.getFullName();
            actionData.sourcePromise = promise;
            actionData.data = memberValue;
            if(onAsynchComplete) {
                actionData.onComplete = onAsynchComplete;
            }
            doAction(model,actionData);
        }
        var asynchErrorCallback = errorMsg => {
            let actionData = {};
            actionData.action = "updateData";
            actionData.memberName = this.getFullName();
            actionData.sourcePromise = promise;
            actionData.data = new Error(errorMsg);
            if(onAsynchComplete) {
                actionData.onComplete = onAsynchComplete;
            }
            doAction(model,actionData);
        }

        //call appropriate action when the promise completes
        promise.then(asynchCallback).catch(asynchErrorCallback);
    }
}

//========================================
// "Protected" Methods
//========================================

/** This method is called when the member is deleted. If necessary the implementation
 * can extend this function, but it should call this base version of the function
 * if it does.  
 * @protected */
Member.onDeleteMember = function() {
    if(!(this.owner)) return;
    
	if(this.owner.isParent) {
		this.owner.removeChild(this);
	}
    else if(this.owner.isRootHolder) {
        this.owner.setRoot(null);
    }
    this.owner = null;
}

///** This method is called when the model is closed and also when an object
// * is deleted. It should do any needed cleanup for the object.  
// * @protected */
//Member.onClose = function();

//Implement this method if there is data to add to this member. Otherwise it may
//be omitted
///** This method adds any additional data to the json saved for this member. 
// * @protected */
//Member.addToJson = function(json) {
//}

//Implement this method if there is update data for this json. otherwise it may
//be omitted
///** This gets an update structure to upsate a newly instantiated member
//* to match the current object. It may return "undefined" if there is no update
//* data needed. 
//* @protected */
//Member.getUpdateData = function() {
//}

//-------------------------
// Update Event Methods
//-------------------------

Member.getUpdated = function() {
    return this.updated;
}

Member.clearUpdated = function() {
    this.updated = {};
}

Member.fieldUpdated = function(field) {
    this.updated[field] = true;
}

Member.isFieldUpdated = function(field) {
    return this.updated[field] ? true : false;
}

Member.getEventId = function() {
    //use the main member for the event ID
    return "member:" + this.member.getId();
}

Member.getTargetType = function() {
    return "member";
}



//===================================
// Private Functions
//===================================

/** This method adds a data member to the imapacts list for this node.
 * The return value is true if the member was added and false if it was already there. 
 * @private */
Member.addToImpactsList = function(member) {
    //exclude this member
    if(member === this) return;
    
    //add to the list iff it is not already there
    if(this.impactsList.indexOf(member) === -1) {
        this.impactsList.push(member);
        return true;
    }
    else {
        return false;
    }
}

/** This method removes a data member from the imapacts list for this node. 
 * @private */
Member.removeFromImpactsList = function(member) {
    //it should appear only once
    for(var i = 0; i < this.impactsList.length; i++) {
        if(this.impactsList[i] == member) {
            this.impactsList.splice(i,1);
            return;
        }
    }
}

/** This is used for Id generation.
 * @private */
Member.nextId = 1;

/** This method generates a member ID for the member. It is only valid
 * for the duration the model is opened. It is not persisted.
 * @private
 */
Member._createId = function() {
    return Member.nextId++;
}

