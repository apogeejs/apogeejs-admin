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
 * This class represents a member object. 
 * The owner should be the parent that holds this member or the object that holds
 * the hierarchy (maybe the model). If the owner is not a parent, this is typically
 * a folder and it is called the root folder. */
export default class Member {

    constructor(name,generator) {
        this.id = _createId();
        
        //&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&
        //FIELDS
        this.name = name;
        this.owner = null;
        this.data = null;

        this.resultPending = false;
        //&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&
        
        //&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&
        //DERIVED FIELDS (presumably based on implementation)
        this.impactsList = [];

        this.generator = generator;
        this.errors = []; 
        this.resultInvalid = false;
        //&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&
        
        this.updated = {};
        
        //set updated in constructor
        this.fieldUpdated("name");
        this.fieldUpdated("data");
    }

    initOwner(owner) {
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

    move(newName,newOwner) {

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

    /** this method gets the ID. It is not persistent and is valid only for this 
     * instance the model is opened. */
    getId() {
        return this.id;
    }

    /** this method gets the name. */
    getName() {
        return this.name;
    }

    /** This method returns the full name in dot notation for this object. */
    getFullName() {
        if(this.owner) {
            return this.owner.getChildFullName(this.name);
        }
        else {
            //this shouldn't happen
            return this.name;
        }
    }

    /** This returns the owner for this member. */
    getOwner() {
        return this.owner;
    }

    /** This returns the parent for this member. For the root folder
     * this value is null. */
    getParent() {
        if((this.owner)&&(this.owner.isParent)) {
            return this.owner;
        }
        else {
            return null;
        }
    }

    /** this method gets the model. */
    getModel() {
        if(this.owner) {
            return this.owner.getModel();
        }
        else {
            return null;
        }
    }

    /** this method gets the root folder/namespace for this object. */
    getRoot() {
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
    addError(error) {
        this.errors.push(error);
    }

    /** This method sets the pre calc error for this dependent. */
    addErrors(errorList) {
        this.errors = this.errors.concat(errorList);
    }

    /** This method clears the error list. */
    clearErrors(type) {
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
    hasError() {
        return (this.errors.length > 0);
    }

    /** This returns the pre calc error. */
    getErrors() {
        return this.errors;
    }

    /** This returns true if the member is not up to date, typically
     * do to waiting on an asynchronous operation. */
    getResultPending() {
        return this.resultPending;
    }

    /** This returns true if the member is not up to date, typically
     * do to waiting on an asynchronous operation. */
    getPendingPromise() {
        return this.pendingPromise;
    }

    /** This sets the result pending flag. If is pending is set to true and
     * this is the object whose value is pending (as opposed to a member that 
     * is dependent on the pending member) the promise should be saved. This 
     * is used to ensure only a matching asynchronous action is kept. */
    setResultPending(isPending,promise) {
        this.resultPending = isPending;
        this.pendingPromise = promise;
    }

    /** This returns true if the member is invalid, typically
     * meaning the calculation could not properly be performed becase the
     * needed data is not available. */
    getResultInvalid() {
        return this.resultInvalid;
    }

    /** This sets the result invalid flag. If the result is invalid, any
     * table depending on this will also have an invalid value. */
    setResultInvalid(isInvalid) {
        this.resultInvalid = isInvalid;
    }

    /** This returns true if the pending token matches. */
    pendingPromiseMatches(promise) {
        return (this.pendingPromise === promise);
    }

    getSetDataOk() {
        return this.generator.setDataOk;
    }

    /** This method writes the child to a json. */
    toJson() {
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
    //fromJson(owner,json,childrenJsonOutputList) {
    //}

    //-----------------------------------
    // Data methods
    //-----------------------------------

    /** this method gets the data map. */
    getData() {
        return this.data;
    }

    /** This returns an array of members this member impacts. */
    getImpactsList() {
        return this.impactsList;
    }

    /** This method sets the data for this object. This is the object used by the 
     * code which is identified by this name, for example the JSON object associated
     * with a JSON table. Besides hold the data object, this updates the parent data map. */
    setData(data) {
        this.data = data;
        this.fieldUpdated("data");
    
        var parent = this.getParent();
        if(parent) {
            parent.updateData(this);
        }
    }


    /** This method implements setting asynchronous data on the member using a promise. */
    applyPromiseData(promise,optionalPromiseRefresh) {
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
                doAction(model,actionData);
            }
            var asynchErrorCallback = errorMsg => {
                let actionData = {};
                actionData.action = "updateData";
                actionData.memberName = this.getFullName();
                actionData.sourcePromise = promise;
                actionData.data = new Error(errorMsg);
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
    onDeleteMember() {
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
    //onClose();

    //Implement this method if there is data to add to this member. Otherwise it may
    //be omitted
    ///** This method adds any additional data to the json saved for this member. 
    // * @protected */
    //addToJson(json) {
    //}

    //Implement this method if there is update data for this json. otherwise it may
    //be omitted
    ///** This gets an update structure to upsate a newly instantiated member
    //* to match the current object. It may return "undefined" if there is no update
    //* data needed. 
    //* @protected */
    //getUpdateData() {
    //}

    //-------------------------
    // Update Event Methods
    //-------------------------

    getUpdated() {
        return this.updated;
    }

    clearUpdated() {
        this.updated = {};
    }

    fieldUpdated(field) {
        this.updated[field] = true;
    }

    isFieldUpdated(field) {
        return this.updated[field] ? true : false;
    }

    //getId() Implmented above

    getTargetType() {
        return "member";
    }



    //===================================
    // Private Functions
    //===================================

    /** This method adds a data member to the imapacts list for this node.
     * The return value is true if the member was added and false if it was already there. 
     * @private */
    addToImpactsList(member) {
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
    removeFromImpactsList(member) {
        //it should appear only once
        for(var i = 0; i < this.impactsList.length; i++) {
            if(this.impactsList[i] == member) {
                this.impactsList.splice(i,1);
                return;
            }
        }
    }
}

/** This is used for Id generation.
 * @private */
let nextId = 1;

/** This method generates a member ID for the member. It is only valid
 * for the duration the model is opened. It is not persisted.
 * @private
 */
function _createId() {
    return nextId++;
}

