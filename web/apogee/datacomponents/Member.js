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

    constructor(name,instanceToCopy,keepUpdatedFixed,specialCaseIdValue) {
        super("member",instanceToCopy,keepUpdatedFixed,specialCaseIdValue);
        
        //==============
        //Fields
        //==============
        //Initailize these if this is a new instance
        if(!instanceToCopy) {
            this.setField("name",name);
            //"data"
            //"pendingPromise"
            this.setField("state",apogeeutil.STATE_NONE);
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
            if((parent)&&(parent.isMember)) {
                return parent.isFullNameUpdated(model); 
            } 
            else {
                //if the parent is the model, we don't need to check the full name 
                return false;
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
            throw new Error("INVALID STATE: member " + this.getName());
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

    /** This returns the list of errors. The entries can be javscript Error objects, members (signifying a
     * dependency error), strings or other objects (which should be converted to strings). */
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
        let errorList = this.getErrors();
        let errorMsgs = [];
        let dependentMemberNames = [];
        errorList.forEach( errorEntry => {
            if(errorEntry instanceof Member) {
                dependentMemberNames.push(errorEntry.getName());
            }
            else errorMsgs.push(errorEntry.toString());
        })
        if(dependentMemberNames.length > 0) {
            errorMsgs.push( "Error in dependency: " + dependentMemberNames.join(", "));
        }
        
        let errorMsg = errorMsgs.join("; ");
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

    /** This method sets the state to none, signifying an invalid state. */
    clearState() {
        this.setField("state",{"state":apogeeutil.STATE_NONE});
    }

    /** This method sets the data for this object. This is the object used by the 
     * code which is identified by this name, for example the JSON object associated
     * with a JSON table. */
    setData(model,data) {
        this.setStateAndData(model,apogeeutil.STATE_NORMAL,data);
    }

    /** This method sets an error for this member. It will be valid for the current round of calculation of
     * this member. The error should be a javascript Error object, an apogee Member (signifying a dependnecy
     * error), a string, or another type, which will be interpretted as a string. */
    setError(model,error) {
        this.setStateAndData(model,apogeeutil.STATE_ERROR,apogeeutil.INVALID_VALUE,[error]);
    }

    /** This method sets the error for this dependent. See setError for more details. */
    setErrors(model,errorList) {
        this.setStateAndData(model,apogeeutil.STATE_ERROR,apogeeutil.INVALID_VALUE,errorList);
    }

    /** This sets the result pending flag. The promise triggering the pending state should also be passed if there
     * is one for this member. If the state is pending because it depends on a pending member, the promise should be
     * left as undefined.*/
    setResultPending(model,promise) {
        this.setStateAndData(model,apogeeutil.STATE_PENDING,apogeeutil.INVALID_VALUE);
        if(promise) {
            this.setField("pendingPromise",promise);
        }
    }

    /** This sets the result invalid flag. If the result is invalid, any
     * table depending on this will also have an invalid value. */
    setResultInvalid(model) {
        this.setStateAndData(model,apogeeutil.STATE_INVALID,apogeeutil.INVALID_VALUE);
    }

    /** This methos sets the data, where the data can be a generalized value
     *  include data, apogeeutil.INVALID_VALUE, a Promis or an Error. Also, an explitict
     * errorList can be passed in, includgin either Error or String objects. 
     * This method does not however apply the asynchrnous data, it only flags the member as pending.
     * the asynchronous data is set separately (also) using applyAsynchFutureValue, whcih requires access
     * to the model object. */
    applyData(model,data,errorList) {

        //handle four types of data inputs
        if((errorList)&&(errorList.length > 0)) {
            this.setErrors(model,errorList);
        }
        else if(data instanceof Promise) {
            //data is a promise - flag this a pending
            this.setResultPending(model,data);
        }
        else if(data instanceof Error) {
            //data is an error
            this.setError(model,data);
        }
        else if(data === apogeeutil.INVALID_VALUE) {
            //data is an invalid value
            this.setResultInvalid(model);
        }
        else {
            //normal data update (poosibly from an asynchronouse update)
            this.setData(model,data);
        }
    }

    /** This method implements setting asynchronous data on the member using a promise.
     * This does not however set the current pending state. */
    applyAsynchFutureValue(model,promise) {

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

    
    /** This method updates the state and data. This should not typically be called directly instead the individual
     * data and state setters should be called.
     * The data value will be applied regardless of the state. The error list is applied only if the state is ERROR. */
    setStateAndData(model,state,data,errorList) {
        //set data as specified
        if(data == undefined) {
            this.clearField("data");
        }
        else {
            this.setField("data",data);
        }

        //set the state if it is error or if it changes
        let oldStateStruct = this.getState();
        if((state == apogeeutil.STATE_ERROR)||(!oldStateStruct)||(state != oldStateStruct.state)) {
            //update the state
            let newStateStruct = {};

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
                newStateStruct.state = state;
            }
            this.setField("state",newStateStruct);
        }

        //clear the pending promise
        //note that the pending promise must be set elsewhere if we are in pending
        if(this.getField("pendingPromise")) {
            this.clearField("pendingPromise");
        }

        //notify parent of update
        let parentId = this.getField("parentId");
        if(parentId) {
            let parent = model.getMutableMember(parentId);
            parent.childDataUpdate(model,this);
        }
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

    /** This should only be used for intially setting the parent id. */
    setParentId(parentId) {
        this.setField("parentId",parentId);
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


    /** This method adds any errors from the new addedErrorList to the oldErrorList if
     * they are not already present. */
    _getMergedErrorList(oldErrorList,addedErrorList) {
        let errorsToAdd = []
        addedErrorList.forEach( element => {
            if(oldErrorList.indexOf(element) < 0) errorsToAdd.push(element);
        })
        return oldErrorList.concat(errorsToAdd);
    }

}

//add mixins to this class
apogeeutil.mixin(Member,FieldObject);

let UNKNOWN_ERROR_MSG_PREFIX = "Unknown error in member ";

