import apogeeutil from "/apogeeutil/apogeeUtilLib.js";
import {FieldObject} from "/apogeeutil/apogeeBaseLib.js";

/** This component encapsulates the member functionality for objects in the model.
 * 
 * This is a mixin and not a class. It is used for the prototype of the objects that inherit from it.
 *  
 * COMPONENT DEPENDENCIES:
 * 
 * FIELD NAMES (from update event):
 * - data
 * - name
 * - parent
 * 
 * This class represents a member object. 
 * The parent should be the parent member that holds this member or the object that holds
 * the hierarchy (maybe the model). */
export default class Member extends FieldObject {

    constructor(name,parentId,instanceToCopy,keepUpdatedFixed) {
        super("member",instanceToCopy,keepUpdatedFixed);
        
        //==============
        //Fields
        //==============
        //Initailize these if this is a new instance
        if(!instanceToCopy) {
            this.setField("name",name);
            this.setField("parentId",parentId);
            //"data"
            //"pendingPromise"
            //"state"
        }
    }

    /** This property tells if this object is a member. */
    get isMember() {
        return true;
    }

    /** this method gets the name. */
    getName() {
        return this.getField("name");
    }

    /** This method returns the full name in dot notation for this object. */
    getFullName(model) {
        let name = this.getField("name");
        let parentId = this.getField("parentId");
        if(parentId) {
            let parent = model.lookupMemberById(parentId);
            if(parent) {
                return parent.getChildFullName(model,name);
            }
        }
        
        //if we get here there is no parent
        return name;
    }

    /** This returns true if the full name changes. */
    isFullNameUpdated(model) {
        if(this.areAnyFieldsUpdated(["name","parentId"])) {
            return true;
        }
        else {
            let parent = this.getParent(model);
            if(parent) {
                return parent.isFullNameUpdated(model); 
            } 
        }
    }

    getParentId() {
        return this.getField("parentId");
    }

    /** This returns the parent for this member. */
    getParent(model) {
        let parentId = this.getField("parentId");
        return model.lookupMemberById(parentId);
    }

    /** This returns the parent for this member. For the root folder
     * this value is null. */
    getParentMember(model) {
        let parentId = this.getField("parentId");
        if(parentId) {
            let parent = model.lookupMemberById(parentId);
            if((parent)&&(parent instanceof Member)) {
                return parent;
            }
        }

        //if we get here, there is no parent
        return null;
    }

    //================================================
    // Serialization Methods
    //================================================

    /** This method writes the child to a json. */
    toJson(model) {
        var json = {};
        json.name = this.getField("name");
        json.type = this.constructor.generator.type;
        if(this.addToJson) {
            this.addToJson(model,json);
        }
        
        if(this.getUpdateData) {
            var updateData = this.getUpdateData();
            json.updateData = updateData;
        }
        return json;
    }

    ///** This method creates a member from a json. IT should be implemented as a static
    // * function in extending objects. */ 
    //fromJson(parent,json,childrenJsonOutputList) {
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
        return (this.getPendingPromise() === promise);
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
            this.setField("pendingPromise",promise);
        }
    }

    /** This sets the result invalid flag. If the result is invalid, any
     * table depending on this will also have an invalid value. 
     * The optional data value should typically be undefined unless there is a specifc data value that should be
     * set with the invalid state. */
    setResultInvalid() {
        this._setState(apogeeutil.STATE_INVALID);
    }

    /** This methos sets the data, where the data can be a generalized value
     *  include data, apogeeutil.INVALID_VALUE, a Promis or an Error. Also, an explitict
     * errorList can be passed in, includgin either Error or String objects. 
     * This method does not however apply the asynchrnous data, it only flags the member as pending.
     * the asynchronous data is set separately (also) using applyAsynchData, whcih requires access
     * to the model object. */
    applyData(data,errorList) {

        //handle four types of data inputs
        if((errorList)&&(errorList.length > 0)) {
            this.setErrors(errorList);
        }
        else if(data instanceof Promise) {
            //data is a promise - flag this a pending
            this.setResultPending(data);
        }
        else if(data instanceof Error) {
            //data is an error
            this.setError(data);
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
    applyAsynchData(model,promise) {

        //kick off the asynch update
        var asynchCallback = memberValue => {
            //set the data for the table, along with triggering updates on dependent tables.
            let actionData = {};
            actionData.action = "updateData";
            actionData.memberId = this.getId();
            actionData.sourcePromise = promise;
            actionData.data = memberValue;
            model.doFutureAction(actionData);
        }
        var asynchErrorCallback = errorMsg => {
            let actionData = {};
            actionData.action = "updateData";
            actionData.memberId = this.getId();
            actionData.sourcePromise = promise;
            actionData.data = new Error(errorMsg);
            model.doFutureAction(actionData);
        }

        //call appropriate action when the promise completes
        promise.then(asynchCallback).catch(asynchErrorCallback);
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
     * the parent of this member. */
    move(newName,newParent) {
        //update the name if needed
        if(newName != this.getField("name")) {
            this.setField("name",newName);
        }
        
        //update the parent if needed
        let currentParentId = this.getField("parentId");
        if(currentParentId != newParent.getId()) {
            this.setField("parentId",newParent.getId());
        }
    }

    //========================================
    // "Protected" Methods
    //========================================

    /** This method is called when the member is deleted. If necessary the implementation
     * can extend this function, but it should call this base version of the function
     * if it does.  
     * @protected */
    onDeleteMember(model) {
    }

    ///** This method is called when the model is closed and also when an object
    // * is deleted. It should do any needed cleanup for the object.  
    // * @protected */
    //onClose();

    //Implement this method if there is data to add to this member. Otherwise it may
    //be omitted
    ///** This method adds any additional data to the json saved for this member. 
    // * @protected */
    //addToJson(model,json) {
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

    /** This updates the state. For state NORMAL, the data should be set. 
     * For any state other than NORMAL, the data will be set to INVALID, regardless of 
     * what argument is given for data.
     * For state ERROR, an error list should be set. */
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
        this.setField("data",data);
        if(state == apogeeutil.STATE_NORMAL) {
            if(data !== undefined) {
                this.setField("data",data);
            }
            else {
                this.clearField("data");
            }
        }
        else { 
            this.setField("data",apogeeutil.INVALID_VALUE);
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
apogeeutil.mixin(Member,FieldObject);

let UNKNOWN_ERROR_MSG_PREFIX = "Unknown error in member ";

