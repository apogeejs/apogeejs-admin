import base from "/apogeeutil/base.js";
import {doAction} from "/apogee/actions/action.js";
import FieldObject from "/apogeeutil/FieldObject.js";

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
export default class Member extends FieldObject {

    constructor(model,name,owner) {
        super();

        this.id = _createId();
        
        //&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&
        //FIELDS
        this.setField("name",name);
        this.setField("model",model);
        this.setField("owner",owner);
        //"data"
        //"pendingPromise"
        //"state"
        //&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&

        //register member with model
        model.registerMember(this);

        //init the owner for this child
        if(owner.isParent) {
            owner.addChild(this);
        }
        else if(owner.isRootHolder) {
            owner.setRoot(this);
        }
    }

    /** this method gets the ID. It is not persistent and is valid only for this 
     * instance the model is opened. */
    getId() {
        return this.id;
    }

    getTargetType() {
        return "member";
    }

    /** this method gets the name. */
    getName() {
        return this.getField("name");
    }

    /** This method returns the full name in dot notation for this object. */
    getFullName() {
        let name = this.getField("name");
        let owner = this.getField("owner");
        if(owner) {
            return owner.getChildFullName(name);
        }
        else {
            //this shouldn't happen
            return name;
        }
    }

    /** This returns the owner for this member. */
    getOwner() {
        return this.getField("owner");
    }

    /** This returns the parent for this member. For the root folder
     * this value is null. */
    getParent() {
        let owner = this.getField("owner");
        if((owner)&&(owner.isParent)) {
            return owner;
        }
        else {
            return null;
        }
    }

    /** this method gets the model. */
    getModel() {
        return this.getField("model");
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

    //================================================
    // Serialization Methods
    //================================================

    /** This method writes the child to a json. */
    toJson() {
        var json = {};
        json.name = this.getField("name");
        json.type = this.constructor.generator.type;
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

    //=======================================
    // Data/State getting functions
    //=======================================

    /** This returns the state struct for the member. */
    getState() {
        let stateStruct = this.getField("state");
        if(stateStruct) { 
            return stateStruct.state;
        }
        else {
            //If this happens, we will just make it state normal 
            return apogeeutil.STATE_NORMAL;
        }
    }

    /** this method gets the data map. */
    getData() {
        return this.getField("data");
    }

    /** This returns true if this member accepts setting the data. */
    getSetDataOk() {
        return this.constructor.generator.setDataOk;
    }

    /** This returns the pre calc error. */
    getErrors() {
        let stateStruct = this.getField("state");
        let errorList;
        if(stateStruct) {
            //If this happens, we will just make it state normal
            errorList = stateStruct.errorList;
        }
        if(!errorList) {
            //just return an emptylist
            errorList = [];
        }
        return errorList;
    }

    getErrorMsg() {
        let stateStruct = this.getField("state");
        let errorMsg;
        if(stateStruct) {
            //If this happens, we will just make it state normal
            errorMsg = stateStruct.errorMsg;
        }
        if(!errorMsg) {
            //just return an emptylist
            errorMsg = UNKNOWN_ERROR_MSG_PREFIX + this.getName();
        }
        return errorMsg;
    }

    /** This returns true if the member is not up to date, typically
     * do to waiting on an asynchronous operation. */
    getPendingPromise() {
        return this.getField("pendingPromise");
    }

    /** This returns true if the pending token matches. */
    pendingPromiseMatches(promise) {
        return (this.pendingPromise === promise);
    }

    //=======================================
    // Update Data/State functions
    //=======================================

    /** This method clears the state field. */
    clearState() {
        this.clearField("state");
    }

    /** This method sets the data for this object. This is the object used by the 
     * code which is identified by this name, for example the JSON object associated
     * with a JSON table. Besides hold the data object, this updates the parent data map. */
    setData(data) {
        this.setField("data",data);
        this._setState(apogeeutil.STATE_NORMAL,data);
    }

    /** This method adds an error for this member. It will be valid for the current round of calculation of
     * this member. The error may be a javascript Error object of string (or any other object really). 
     * The optional data value should typically be undefined unless there is a specifc data value that should be
     * set with the error state. */
    setError(error) {
        this._setState(apogeeutil.STATE_ERROR,undefined,[error]);
    }

    /** This method sets the pre calc error for this dependent. 
     * The optional data value should typically be undefined unless there is a specifc data value that should be
     * set with the error state. */
    setErrors(errorList) {
        this._setState(apogeeutil.STATE_ERROR,undefined,errorList);
    }

    /** This sets the result pending flag. If there is a promise setting this member to pending, it should
     * be passed as an arg. In this case the field will be updated only if the reolving promise matches this
     * set promise. Otherwise it is assumed the promise had been superceded. In the case this member is pending
     * because it depends on a remote pending member, then no promise should be passed in to this function. 
     * The optional data value should typically be undefined unless there is a specifc data value that should be
     * set with the pending state. */
    setResultPending(promise) {
        this._setState(apogeeutil.STATE_PENDING);
        if(promise) {
            this._setField("pendingPromise",promise);
        }
    }

    /** This sets the result invalid flag. If the result is invalid, any
     * table depending on this will also have an invalid value. 
     * The optional data value should typically be undefined unless there is a specifc data value that should be
     * set with the invalid state. */
    setResultInvalid() {
        this._setDataState(apogeeutil.STATE_INVALID);
    }

    /** This methos sets the data, where the data can be a generalized value
     *  include data, apogeeutil.INVALID_VALUE, a Promis or an Error. Also, an explitict
     * errorList can be passed in, includgin either Error or String objects. */
    applyData(data,errorList) {

        //handle four types of data inputs
        if((errorList)&&(errorList.length > 0)) {
            this.setErrors(errorList);
        }
        else if(data instanceof Promise) {
            //data is a promise - will be updated asynchromously
            this.applyPromiseData(data);
        }
        else if(data instanceof Error) {
            //data is an error
            this.setError(error);
        }
        else if(data === apogeeutil.INVALID_VALUE) {
            //data is an invalid value
            this.setResultInvalid();
        }
        else {
            //normal data update (poosibly from an asynchronouse update)
            this.setData(data);
        }
    }

    /** This method implements setting asynchronous data on the member using a promise. */
    applyPromiseData(promise,optionalPromiseRefresh) {
        //set the result as pending
        this.setResultPending(promise);

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

    /** This method can be called to set data without setting the state. It is intended to be
     * used by the folder to set the data value when an error, pending or invalid state is present. This
     * data value is used for pass-through dependenceis. */
    forceUpdateDataWithoutStateChange(data) {
        this.setField("data",data)
    }

    //========================================
    // Move Functions
    //=========================================

    /** This method should be used to rename and/or change 
     * the owner of this member. */
    move(newName,newOwner) {
        let currentOwner = this.getField("owner");

        //remove from old named object from the new or old owner
        if(currentOwner.isParent) {
            currentOwner.removeChild(this);
        }
        else {
            //don't allow moving a root for now!
            //or renaiming either!
        }
        
        //check for change of name
        if(newName != this.getField("name")) {
            this.setField("name",newName);
        }
        
        //set the new owner, if it changed
        if(currentOwner != newOwner) {
            this.setField("owner",newOwner);
        }

        //set the newly named object in the new or old owner
        if(newOwner.isParent) {
            newOwner.addChild(this);
        }
        else {
            //don't allow moving a root for now!
            //or renaiming either!
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
        let owner = this.getField("owner");
        if(!(owner)) return;
        
        if(owner.isParent) {
            owner.removeChild(this);
        }
        else if(owner.isRootHolder) {
            owner.setRoot(null);
        }
        owner = null;
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

    //----------------------------------
    // State setting methods
    //----------------------------------

    /** This updates the state. */
    _setState(state,data,errorList) {
        let newStateStruct = {};
        let oldStateStruct = this.getField("state");

        //don't update state if it is the same value (unless it is error, then we will update it
        //becuase I don't feel like comparing the error messages)
        if((oldStateStruct)&&(oldStateStruct.state == state)&&(state != apogeeutil.STATE_ERROR)) {
            return;
        }

        //do some safety checks on the error list
        if(state == apogeeutil.STATE_ERROR) {
            //make sure there is an error list
            if(!errorList) errorList = [];

            newStateStruct.state = apogeeutil.STATE_ERROR;
            newStateStruct.errorList = errorList;
            if(errorList.length > 0) {
                newStateStruct.errorMsg = errorList.join("\n");
            }
            else {
                newStateStruct.errorMsg = UNKNOWN_ERROR_MSG_PREFIX + this.getName();
            }
        }
        else {
            //here we ignore the error list if there was one (there shouldn't be)
            newStateStruct.state = state;
        }

        //set the data if we passed it in, regardless of state
        this.setField("state",newStateStruct);
        if(data !== undefined) {
            this.setField("data",data)
        }
        else {
            this.clearField("data");
        }

        //clear the pending promise, if we are not in pending state
        //note that the pending promise must be set elsewhere
        if(state != apogeeutil.STATE_PENDING) {
            if(this.getField("pendingPromise")) {
                this.clearField("pendingPromise");
            }
        }
    }


}

//add mixins to this class
base.mixin(Member,FieldObject);

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

let UNKNOWN_ERROR_MSG_PREFIX = "Unknown error in member ";

