// File: apogeeCoreBundle.es.js
// Version: 1.0.0-p5
// Copyright (c) 2016-2020 Dave Sutter
// License: MIT

/** 
 * This namespace includes some utility functions available to the user.
 * @namespace
 */
let apogeeutil = {};

/** None State - used by members. This indicates no state information is present. */
apogeeutil.STATE_NORMAL = "none";

/** Normal State - used by members */
apogeeutil.STATE_NORMAL = "normal";

/** Pending State - used by members */
apogeeutil.STATE_PENDING = "pending";

/** Error State - used by members */
apogeeutil.STATE_ERROR = "error";

/** Invalid State - used by members */
apogeeutil.STATE_INVALID = "invalid";

/** Standard dependency 
 * @private */
apogeeutil.NORMAL_DEPENDENCY = 1;

/** Pass through dependency 
 * @private */
apogeeutil.PASS_THROUGH_DEPENDENCY = 2;

/** 
 * This value can be assigned to a data table to signify that data is not valid.
 * Any other member depending on this value will withhold the calcalation and also
 * return this invalid value.
 */
apogeeutil.INVALID_VALUE = {"apogeeValue":"INVALID VALUE"};

/**
 * This is a special throwable that is used to exit a function when the function definition depends
 * on another invalid value. I don't like to use exceptions for non-exceptional cases, which 
 * I consider this to be, but I couldn't figure out how else to exit the function.  */
apogeeutil.MEMBER_FUNCTION_INVALID_THROWABLE = {"apogeeException":"invalid"};

/**
 * This is a special throwable that is used to exit a function when the function definition depends
 * on another pending value. I don't like to use exceptions for non-exceptional cases, which 
 * I consider this to be, but I couldn't figure out how else to exit the function.  */
apogeeutil.MEMBER_FUNCTION_PENDING_THROWABLE = {"apogeeException":"pending"};

/** 
 * This function should be called from the body of a function table
 * to indicate the function will not return a valid value. (The actual invalid value
 * can not be returned since this typically will not have the desired effect.)
 */
apogeeutil.invalidFunctionReturn = function() {
    throw apogeeutil.MEMBER_FUNCTION_INVALID_THROWABLE;
};

/** This function reads any proeprty of the mixinObject and adds it
 * fo the prototypr of the destObject. This is intended to apend functions and
 * other properties to a cless directly without going through inheritance. 
 * Note this will overwrite and similarly named object in the dest class.
 * @private */
apogeeutil.mixin = function(destObject,mixinObject) {
    for(var key in mixinObject) {
        destObject.prototype[key] = mixinObject[key];
    }
};

/** 
 * This method creates an integer hash value for a string. 
 * 
 * @param {String} string - This is the string for which a hash number is desired.
 * @return {integer} This is the hash value for the string.
 */
apogeeutil.stringHash = function(string) {
    var HASH_SIZE = 0xffffffff;
    var hash = 0;
    var ch;
    for (var i = 0; i < string.length; i++) {
        ch = string.charCodeAt(i);
        hash = (31 * hash + ch) & HASH_SIZE;
    }
    return hash;
};

/** 
 * This method creates an integer hash value for a JSON object. 
 * 
 * @param {JSON} object - This is the json valued object for which a hash number is desired.
 * @return {integer} This is the hash value for the JSON.
 */
apogeeutil.objectHash = function(object) {
    //this is not real efficient. It should be implemented differently
    var string = JSON.stringify(object);
    return stringHash(string);
};

/**
 * @private
 */
apogeeutil.constructors = {
    "String": ("").constructor,
    "Number": (3).constructor,
    "Boolean": (true).constructor,
    "Date": (new Date()).constructor,
    "Object": ({}).constructor,
    "Array": ([]).constructor,
    "Function": (function(){}).constructor
};

/** This method returns the object type. The Allowed types are:
 * String, Number, Boolean, Date, Object, Array, Function, null, undefined.
 * @param {Object} object - This is the object for which the type is desired.
 * @returns {String} This is the type for the object. 
 */
apogeeutil.getObjectType = function(object) {
    if(object === null) return "null";
    if(object === undefined) return "undefined";
    
    var constructor = object.constructor;
    for(var key in apogeeutil.constructors) {
        if(constructor == apogeeutil.constructors[key]) {
            return key;
        }	
    }
    //not found
    return "Unknown";
};

/** This method creates a deep copy of an object, array or value. Note that
 * undefined is not a valid value in JSON. 
 * 
 * @param {JSON} data - This is a JSON valued object
 * @returns {JSON} A JSON object which is a deep copy of the input.
 */
apogeeutil.jsonCopy = function(data) {
    if(data === null) return null;
    if(data === undefined) return undefined;
    return JSON.parse(JSON.stringify(data));
};

/** This method takes a field which can be an object, 
 *array or other value. If it is an object or array it 
 *freezes that object and all of its children, recursively.
 * Warning - this does not check for cycles (which are not in JSON 
 * objects but can be in javascript objects)
 * Implementation from Mozilla */
apogeeutil.deepFreeze = function(obj) {
    if((obj === null)||(obj === undefined)) return;
    
    //retrieve the property names defined on obj
    var propNames = Object.getOwnPropertyNames(obj);

    //freeze properties before freezing self
    propNames.forEach(function(name) {
        var prop = obj[name];

        //freeze prop if it is an object
        if(typeof prop == 'object' && prop !== null) apogeeutil.deepFreeze(prop);
    });

    //freeze self (no-op if already frozen)
    return Object.freeze(obj);
};

/** This method does format string functionality. Text should include
 * {i} to insert the ith string argument passed. 
 *  @param {String} format - This is a format string to format the output.
 *  @param {Array} stringArgs - These are the values which should be placed into the format string.
 *  @returns {String} The format string with the proper inserted values is returned.  
 */
apogeeutil.formatString = function(format,stringArgs) {
    var formatParams = arguments;
    return format.replace(/{(\d+)}/g, function(match,p1) {
        var index = Number(p1) + 1;
        return formatParams[index]; 
    });
};

/** This method reads the query string from a url
 * 
 *  @param {String} field - This is the field that should be read from the url query string
 *  @param {String} url - This is the url from which we read the query string
 *  @returns {String} The value associated with the query string key passed in. 
 */
apogeeutil.readQueryField = function(field,url) {
    var href = url ? url : window.location.href;
    var reg = new RegExp( '[?&]' + field + '=([^&#]*)', 'i' );
    var string = reg.exec(href);
    return string ? string[1] : null;
};

/** 
 * This is a not-so-efficient equals for json objects. For JSON objects it
 * does not require order matching of the keys. For JSON arrays it does require
 * order matching of the array values.
 * 
 *  @param {JSON} json1 - This is a JSON valued object 
 *  @param {JSON} json1 - This is a JSON valued object 
 *  @returns {Boolean}  - Returns whether or not the objects are equal
 */
apogeeutil.jsonEquals = function(json1,json2) {
    var string1 = JSON.stringify(apogeeutil.getNormalizedCopy(json1));
    var string2 = JSON.stringify(apogeeutil.getNormalizedCopy(json2));
    return (string1 == string2);
};

/** 
 * This method returns a copied json that has the order in all JSON objects/"maps" normalized to alphabetical. 
 * The order of JSON arrays is NOT modified.
 * This is intended for the purpose of comparing json objects. 
 * 
 *  @param {JSON} json1 - This is a JSON valued object 
 *  @returns {JSON} - Returns a order-modified version of the object
 */  
apogeeutil.getNormalizedCopy = function(json) {
    var copiedJson;

    var objectType = apogeeutil.getObjectType(json);
    
    switch(objectType) {
        case "Object":
            copiedJson = apogeeutil.getNormalizedObjectCopy(json);
            break;
            
        case "Array": 
            copiedJson = apogeeutil.getNormalizedArrayCopy(json);
            break;
            
        default:
            copiedJson = json;
    }
    
    return copiedJson;
};

/** this orders the keys apphabetically, since order is not important in a json object 
 * @private
 */
apogeeutil.getNormalizedObjectCopy = function(json) {
    var copiedJson = {};
    
    var keys = [];
    var key;
    for(key in json) {
        keys.push(key);
    }
    
    keys.sort();
    
    for(var i = 0; i < keys.length; i++) {
        key = keys[i];
        copiedJson[key] = apogeeutil.getNormalizedCopy(json[key]);
    }
    return copiedJson;
};

/** This method counts the properties in a object. */
apogeeutil.jsonObjectLength = function(jsonObject) {
    var count = 0;

    for(var key in jsonObject) {
        count++;
    }

    return count;
};

/** This makes a copy of with any contained objects normalized. 
 * @private 
 */
apogeeutil.getNormalizedArrayCopy = function(json) {
    var copiedJson = [];
    for(var i = 0; i < json.length; i++) {
        var element = json[i];
        copiedJson.push(apogeeutil.getNormalizedCopy(element));
    }
    return copiedJson;
};

//=================
// Some other generic utils
//=================

/** This methdo parses an arg list string to make an arg list array. It is
 * also used outisde this class. */
apogeeutil.parseStringArray = function(argListString) {
    var argList = argListString.split(",");
    for(var i = 0; i < argList.length; i++) {
        argList[i] = argList[i].trim();
    }
    return argList;
};

//=================
// Network request utils
//=================


/** 
 * This method does a standard callback request. It includes the following options:
 * - "method" - HTTP method, default value is "GET"
 * - "body" - HTTP body for the request
 * - "header" - HTTP headers, example: {"Content-Type":"text/plain","other-header":"xxx"}
 * @param {String} url - This is the url to be requested
 * @param {function} onSuccess - This is a callback that will be called if the request succeeds. It should take a String request body argument.
 * @param {function} onError - This is the callback that will be called it the request fails. It should take a String error message argument. 
 * @param {Object} options - These are options for the request.
 */
apogeeutil.callbackRequest = function(url,onSuccess,onError,options) {
    
    var xmlhttp=new XMLHttpRequest();

    xmlhttp.onreadystatechange=function() {
        var msg;
        if(xmlhttp.readyState==4) {
            if(xmlhttp.status==200) {
                try {
                    onSuccess(xmlhttp.responseText);
                }
                catch(error) {
                    onError(error.message);
                }

            }
            else if(xmlhttp.status >= 400)  {
                msg = "Error in http request. Status: " + xmlhttp.status;
                onError(msg);
            }
            else if(xmlhttp.status == 0) {
                msg = "Preflight error in request. See console";
                onError(msg);
            }
        }
    };

    if(!options) options = {};
    
    var method = options.method ? options.method : "GET";
    xmlhttp.open(method,url,true);
    
    if(options.header) {
        for(var key in options.header) {
            xmlhttp.setRequestHeader(key,options.header[key]);
        }
    }
    
    xmlhttp.send(options.body);
};

/** 
 * This method returns a promise object for an HTTP request. The promist object
 * returns the text body of the URL if it resolves successfully.
 *  
 * @param {String} url - This is the url to be requested
 * @param {Object} options - These are options for the request. See {@link apogeeutil.callbackRequest} for the options definition.
 * @return {Promise} This method returns a promise object with the URL body as text.
 */
apogeeutil.textRequest = function(url,options) {
    return new Promise(function(onSuccess,onError) {
        apogeeutil.callbackRequest(url,onSuccess,onError,options);
    });
};

/** 
 * This method returns a promise object for an HTTP request. The promist object
 * returns the JSON body of the URL if it resolves successfully.
 *  
 * @param {String} url - This is the url to be requested
 * @param {Object} options - These are options for the request. See {@link apogeeutil.callbackRequest} for the options definition.
 * @return {Promise} This method returns a promise object with the URL body as text.
 */
apogeeutil.jsonRequest = function(url,options) {
    return apogeeutil.textRequest(url,options).then(JSON.parse);
};

/* 
 * This is a mixin to give event functionality.
 */
var EventManager = {};
    
/** This serves as the constructor. */
EventManager.eventManagerMixinInit = function() {
     /** This field holds the event listeners
    * @private */
    this.listenerTable = {};
    
    /** This field holds the event handlers
    * @private */
    this.handlerTable = {};
};

/** This method adds a listener for the given event. */
EventManager.addListener = function(eventName, callback) {
    var callbackList = this.listenerTable[eventName];
    if(!callbackList) {
        callbackList = [];
        this.listenerTable[eventName] = callbackList;
    }
    //make sure the object is not already in the list
    for(var i = 0; i < callbackList.length; i++) {
        var c = callbackList[i];
        if(c == callback) {
            return;
        }
    }
    //add to the list
    callbackList.push(callback);
};

/** This method removes a listener for the event. */
EventManager.removeListener = function(eventName, callback) {
    var callbackList = this.listenerTable[eventName];
    if(callbackList) {
        var index = callbackList.indexOf(callback);
        if(index >= 0) {
            callbackList.splice(index,1);
        }
    }
};

/** THis method dispatches an event. */
EventManager.hasListeners = function(eventName) {
    return this.listenerTable[eventName] ? true : false;
};

/** THis method dispatches an event. */
EventManager.dispatchEvent = function(eventName, eventData) {
    var callbackList = this.listenerTable[eventName];
    if(callbackList) {
        for(var i = 0; i < callbackList.length; i++) {
            var callback = callbackList[i];
            callback.call(null,eventData);
        }
    }
};


/** This method adds a handler. */
EventManager.addHandler = function(handlerName, callback) {
    this.handlerTable[handlerName] = callback;
};

/** This method clears a handler. */
EventManager.removeHandler = function(handlerName) {
    delete this.handlerTable[handlerName];
};

/** This method calls a handler by name and returns the result. If no 
 * handler is found undefined is returned. */
EventManager.callHandler = function(handlerName, handlerData) {
    var callback = this.handlerTable[handlerName];
    if(callback) {
        return callback(handlerData)
    }
    else {
        return undefined;
    }
};

/** This resets all the listeners and handlers */
EventManager.clearListenersAndHandlers = function() {
    this.listenerTable = {};
    this.handlerTable = {};
};

/** This is a class for the field object formalism. It is used to store fields
 * and track modifications. It allows you to lock the object so that no more changes
 * can be made. */
class FieldObject {

    /** constructor.
     * - objectType - a text only string giving the name of the object type. This
     * is used in the id string.
     * - instanceToCopy - if this argument is defined, the created instance will be a shallow copy
     * of the this passed instance. By default it will have the updated fields flag cleared, but this
     * can be changed with the "keepUpdatedFixed" flag The new instance will be unlocked.
     * - keepUpdatedFixed - This should only be used when an instance is copied. If this is true
     * the copied instance will keep the same fields updated flags. Otherwise they will be cleared.
     * - specialCaseIdValue - This can be set if you wnt to create a new instance with a specific ID value. 
     * This should be done only in special circumstances. One example is "redo" creation of an object (after an undo)
     * subsequent commands for this object will reference its original ID. This is a way to set the ID of the recreaeted
     * object to match the original.
     */
    constructor(objectType,instanceToCopy,keepUpdatedFixed,specialCaseIdValue) {
        if(!instanceToCopy) {
            if(specialCaseIdValue) {
                this.id = specialCaseIdValue;
            }
            else {
                this.id = _createId(objectType);
            }
            this.objectType = objectType;
        }
        else {
            this.id = instanceToCopy.id;
            this.objectType = instanceToCopy.objectType;

        }

        this.fieldMap = {};
        if(instanceToCopy) {
            Object.assign(this.fieldMap,instanceToCopy.fieldMap);
        }

        this.updated = {};
        if(keepUpdatedFixed) {
            Object.assign(this.updated,instanceToCopy.updated);
        }

        this.isLocked = false;
    }

    /** This sets a field value. It will throw an exception if the object is locked. */
    setField(name,value) {
        if(this.isLocked) {
            throw new Error("Attempting to set a value on a locked object.");
        }

        this.fieldMap[name] = value;
        this.updated[name] = true;
    }

    /** This will clear the value of a field. */
    clearField(name) {
        if(this.fieldMap[name] !== undefined) {
            delete this.fieldMap[name];
            this.updated[name] = true;
        }
    }

    /** This ges a field value, by name. */
    getField(name) {
        return this.fieldMap[name];
    }

    /** This method locks the object. On instantiation the object is unlocked and
     * fields can be set. Once it it locked the fields can not be changed. */
    lock() {
        this.isLocked = true;
    }

    getIsLocked() {
        return this.isLocked;
    }

    /** This returns a map of the updated fields for this object.  */
    getUpdated() {
        return this.updated;
    }

    /** This returns true if the given field is updated. */
    isFieldUpdated(field) {
        return this.updated[field] ? true : false;
    }

    /** This returns true if any fields in the give list have been updated. */
    areAnyFieldsUpdated(fieldList) {
        return fieldList.some( field => this.updated[field]);
    }

    /** This method should be implemented for any object using this mixin. 
     * This should give a unique identifier for all objects of the given object type, below.
     * A unique id may optionally be generated using the statid FieldObject method createId. */
    getId() {
        return this.id;
    }

    /** Thie method should be implemented for any object using this method. 
     * It identifies the type of object. */
    getType() {
        return this.objectType;
    }

    /** This static functions returns the type of an object given the ID. */
    static getTypeFromId(id) {
        let typeEnd = id.indexOf("|");
        if(typeEnd < 0) {
            throw new Error("Invalid ID");
        }
        else {
            return id.substr(0,typeEnd);
        }
    }

    /** This static function indicates if the given ID is an object of the given type. */
    static idIsTypeOf(id,type) {
        return id.startsWith(type + "|");
    }

    /** This loads the current field object to have a copy of the data from the given field object.
     * The update field is however cleared. This method will throw an exception is you try to copy 
     * into a loacked object. */
    copyFromFieldsObject(otherFieldObject) {
        if(this.isLocked) {
            throw new Error("Attempting to copy fields into a locked object.");
        }

        for(name in otherFieldObject.fieldMap) {
            this.fieldMap[name] = otherFieldObject.fieldMap[name];
        }
        this.updated = {};
    }

    //================================
    // Static Methods
    //================================

    

}

/** This function generates a ID that is unique over the span of this application execution (until the 
 * integers wrap). This is suitable for creating the field object ID for an instance.
 * At some point we shouldhandle wrapping, and the three cases it can cause - negative ids, 0 id, and most seriously,
 * a reused id.
 * 
 * Currently planned future solution to wrapping: make this an operation issue. And event can be issued when we 
 * have reached given id values. Then it is the responsibility of the operator to restart the sytems. This is probably safer
 * than trying to com eup with some clever remapping solution. */
function _createId(objectType) {
    return objectType + "|" + nextId++;
}

/** This is used for Id generation.
 * @private */
let nextId = 1;

/** This class manages variable scope for the user code. It is used to look up 
 * variables both to find dependencies in member code or to find the value for
 * member code execution.
 * 
 * It has two lookup functions. "getMember" looks up members and is used to 
 * find dependencies. "getValue" looks up member values, for evaluating member values.
 * 
 * When a lookup is done, the named member/value is looked up in the local member scope. If it is not found,
 * the search is then done in the parent of the member. This chain continues until we reach a "root" object,
 * an example of which is the model object itself.
 * 
 * The root object has a lookup like the other context manager objects, however, if a lookup fails
 * to fins something, it does a lookup on global javascript variables. (Any filtering on this is TBD)
 * 
 * In the local scope for each context holder there is a context list, that allows for a number of entries. 
 * Currently the only one type of entry - parent entry. It looks up children of the current object.
 * 
 * In the future we can add imports for the local scope, and potentially other lookup types. 
 * */
function ContextManager(contextHolder) {
    this.contextHolder = contextHolder;

    this.contextList = [];
}

ContextManager.prototype.addToContextList = function(entry) {
    this.contextList.push(entry);
};

ContextManager.prototype.removeFromContextList = function(entry) {
    var index = this.contextList.indexOf(entry);
    if(index >= 0) {
        this.contextList.splice(index,1);
    }
};

ContextManager.prototype.clearContextList = function() {
    this.contextList = [];
};

ContextManager.prototype.getValue = function(model,varName) {
    var data = this.lookupValue(model,varName);
    
    //if the name is not in this context, check with the parent context
    if(data === undefined) {
        if((this.contextHolder)&&(!this.contextHolder.getIsScopeRoot())) {
            var parent = this.contextHolder.getParent(model);
            if(parent) {
                var parentContextManager = parent.getContextManager();
                data = parentContextManager.getValue(model,varName);
            }
        }
    }
    
    return data;
};

ContextManager.prototype.getMember = function(model,pathArray,optionalParentMembers) {
    let index = 0;
    var impactor = this.lookupMember(model,pathArray,index,optionalParentMembers);
    
    //if the object is not in this context, check with the parent context
    if(!impactor) {
        if((this.contextHolder)&&(!this.contextHolder.getIsScopeRoot())) {
            var parent = this.contextHolder.getParent(model);
            if(parent) {
                var parentContextManager = parent.getContextManager();
                impactor = parentContextManager.getMember(model,pathArray,optionalParentMembers);
            }
        }
    }
    
    return impactor;
};

//==================================
// Private Methods
//==================================

/** Check each entry of the context list to see if the data is present. */
ContextManager.prototype.lookupValue = function(model,varName) {
    var data;
    let childFound = false;
    for(var i = 0; i < this.contextList.length; i++) {
        var entry = this.contextList[i];        
        if(entry.contextHolderAsParent) {
            //for parent entries, look up the child and read the data
            var child = this.contextHolder.lookupChild(model,varName);
            if(child) {
                data = child.getData();
                childFound = true;
            }
        }
        
        if(childFound) return data;
    }

    if(this.contextHolder.getIsScopeRoot()) {
        data = this.getValueFromGlobals(varName);

        if(data != undefined) {
            return data;
        }
    }
    
    return undefined;
};

ContextManager.prototype.lookupMember = function(model,pathArray,index,optionalParentMembers) {
    var impactor;
    for(var i = 0; i < this.contextList.length; i++) {
        var entry = this.contextList[i];        
        if(entry.contextHolderAsParent) {
            //for parent entries, look up the child and read the data
            impactor = this.contextHolder.lookupChild(model,pathArray[index]);

            if((impactor)&&(impactor.isContextHolder)) {
                let childImpactor = impactor.getContextManager().lookupMember(model,pathArray,index+1);
                if(childImpactor) {
                    if(optionalParentMembers) {
                        optionalParentMembers.push(impactor);
                    }
                    impactor = childImpactor;
                }
            }

        }
        //no lookup in data entries
        
        if(impactor) return impactor;
    }
    
    return undefined;
};

ContextManager.prototype.getValueFromGlobals = function(varName) {
    //for now don't do any filtering
    //in the future we may want to do something so people don't deine their own globals - TBD
    return __globals__[varName];
};

/** This component encapsulates an object that has a context manager.
 * 
 * This is a mixin and not a class. It is used for the prototype of the objects that inherit from it.
 * 
 * COMPONENT DEPENDENCIES:
 */
let ContextHolder = {};

/** This initializes the component */
ContextHolder.contextHolderMixinInit = function(isScopeRoot) {
    this.isScopeRoot = isScopeRoot;

    //&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&
    //What kind of field is this? Dependent?
    //will be set on demand
    this.contextManager = null;
    //&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&
};

ContextHolder.isContextHolder = true;

/** This method retrieves the context manager. */
ContextHolder.getContextManager = function() {
    if(!this.contextManager) {
        //set the context manager
        this.contextManager = this.createContextManager();
    }
    
    return this.contextManager;
};

ContextHolder.getIsScopeRoot = function() {
    return this.isScopeRoot;
};

//this method must be implemneted in extending classes
///** This method retrieve creates the loaded context manager. */
//ContextHolder.createContextManager = function();

/** This component encapsulates an parent object that is a member and contains children members, creating  a 
 * hierarchical structure in the model. Each child has a name and this name
 * forms the index of the child into its parent. (I guess that means it doesn't
 * have to be a string, in the case we made an ArrayFolder, which would index the
 * children by integer.)
 * 
 * This is a mixin and not a class. It is used for the prototype of the objects that inherit from it.
 */
let Parent = {};

/** This initializes the component.
 * - isCopy - this should be set to true (or another value that evaluates to true) if this parent is being initialized
 * as a copy of aother instance.
 */
Parent.parentMixinInit = function(isCopy) {
    //default value. Can be reconfigured
    this.childrenWriteable = true;

    if(!isCopy) {
        //initialize the child mape
        this.setField("childIdMap",{});
    }
};

Parent.isParent = true;

/** This method returns the map of the children. */
Parent.getChildIdMap = function() {
    return this.getField("childIdMap");
};

/** This method looks up a child from this parent.  */
Parent.lookupChildId = function(name) {
    //check look for object in this folder
    let childIdMap = this.getField("childIdMap");
    return childIdMap[name];
};

/** This method looks up a child from this parent.  */
Parent.lookupChild = function(model,name) {
    let childId = this.lookupChildId(name);
    if(childId) {
        return model.lookupMemberById(childId);
    }
    else {
        return null;
    }
};

/** This method allows the UI to decide if the user can add children to it. This
 * value defaults to true. */
Parent.getChildrenWriteable = function() {
    return this.childrenWriteable;
};

/** This method sets the writeable property for adding child members. This value of
 * the method is not enforced (since children must be added one way or another). */
Parent.setChildrenWriteable = function(writeable) {
    this.childrenWriteable = writeable; 
};

/** This method adds a table to the folder. It also sets the folder for the
 *table object to this folder. It will fail if the name already exists.  */
Parent.addChild = function(model,child) {
    
    //check if it exists first
    let name = child.getName();
    let childIdMap = this.getField("childIdMap");
    if(childIdMap[name]) {
        //already exists! not fatal since it is not added to the model yet,
        throw new Error("There is already an object with the given name.");
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
};

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
};

//This method should optionally be implemented for any additional actions when a Child is removed.
//Parent.onRemoveChild(model,child);

///** This method is called when the model is closed. 
//* It should do any needed cleanup for the object. */
Parent.onClose = function(model) {
    let childIdMap = this.getField("childIdMap");
    for(var key in childIdMap) {
        var childId = childIdMap[key];
        let child = model.lookupMemberById(childId);
        if((child)&&(child.onClose)) child.onClose(model);
    }

    if(this.onCloseAddition) {
        this.onCloseAddition();
    }
};

//This method should optionally be implemented if there are any additional actions when the parent is closed.
//This method will be called after all children have been closed.
//Parent.onCloseAddition();

//This method should be implemented to give the base name the children inherit for the full name. */
//Parent.getPossesionNameBase = function(model);

/** This method returns the full name in dot notation for this object. */
Parent.getChildFullName = function(model,childName) {
    return this.getPossesionNameBase(model) + childName;
};

/** This method looks up a member by its full name. */
Parent.getMemberByFullName = function(model,fullName) {
    var path = fullName.split(".");
    return this.lookupChildFromPathArray(model,path);
};

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
};

/** This is the model. 
 * -instanceToCopy - if the new instance should be a copy of an existing instance, this
 * argument should be populated. The copy will have the same field values but it will be unlocked 
 * and by default the update fields will be cleared. The event listeners are also cleared.
 * - keepUpdatedFixed - If this argument is set to true, the updated field values will be maintained.
 * */
class Model extends FieldObject {

    constructor(runContext,instanceToCopy,keepUpdatedFixed) {
        //base init
        super("model",instanceToCopy,keepUpdatedFixed);

        //mixin initialization
        this.eventManagerMixinInit();
        //this is a root for the context
        this.contextHolderMixinInit(true);
        this.parentMixinInit(instanceToCopy);

        this.runContext = runContext;

        //==============
        //Fields
        //==============
        //Initailize these if this is a new instance
        if(!instanceToCopy) {
            this.setField("name",Model.DEFAULT_MODEL_NAME);
            this.setField("impactsMap",{});
            //create the member map, with the model included
            let memberMap = {};
            memberMap[this.getId()] = this;
            this.setField("memberMap",memberMap);
        }

        //==============
        //Working variables
        //==============
        this.workingImpactsMap = null;
        this.workingMemberMap = null;
        this.workingChangeMap = {};

        //add a change map entry for this object
        this.workingChangeMap[this.getId()] = {action: instanceToCopy ? "updated" : "created", instance: this};

        // This is a queue to hold actions while one is in process.
        this.actionInProgress = false;
        this.messengerActionList = [];
        this.consecutiveActionCount = 0;
        this.activeConsecutiveActionLimit = Model.CONSECUTIVE_ACTION_INITIAL_LIMIT;
    }

    /** This method returns a mutable copy of this instance. If the instance is already mutable
     * it will be returned rather than making a new one.  */
    getMutableModel() {
        if(this.getIsLocked()) {
            //create a new instance that is a copy of this one
            let newModel = new Model(this.runContext,this);

            //update the member map for the new model
            let newMemberMap = {};
            let oldMemberMap = newModel.getField("memberMap");
            Object.assign(newMemberMap,oldMemberMap);
            newMemberMap[newModel.getId()] = newModel;
            newModel.setField("memberMap",newMemberMap);

            return newModel;
        }
        else {
            //return this instance since it si already unlocked
            return this;
        }
    }

    /** This gets a copy of the model where any unlocked members are replaced with new instance copies.
     * This ensures if we look up a mutable member from here we get a different instance from what was 
     * in our original model instance. */
    getCleanCopy(newRunContext) {
        let newModel = new Model(newRunContext,this);

        //update the member map for the new model
        let oldMemberMap = this.getField("memberMap");

        newModel._populateWorkingMemberMap();
        newModel.workingMemberMap[newModel.getId()] = newModel;

        for(let memberId in oldMemberMap) {
            let member = oldMemberMap[memberId];
            if((member != this)&&(!member.getIsLocked())) {
                //create a new copy of the member and register it.
                let newMember = new member.constructor(member.getName(),member.getParentId(),member);
                newModel.workingMemberMap[newMember.getId()] = newMember;
            }
        }

        return newModel;
    }

    /** This method locks all member instances and the model instance. */
    lockAll() {
        //clear up working fields
        this.workingChangeMap = null;

        //make sure the other working fields have been saved
        if(this.workingImpactsMap) this.finalizeImpactsMap();
        if(this.workingMemberMap) this.finalizeMemberMap();

        //member map includes all members and the model
        let memberMap = this.getField("memberMap");
        for(let id in memberMap) {
            //this will lock the model too
            //we maybe shouldn't be modifying the members in place, but we will do it anyway
            memberMap[id].lock();
        }
    }

    /** This shoudl be called after all dependencies have been updated to store the
     * impacts map (We kept a mutable working copy during construction for efficiency)  */
    finalizeImpactsMap() {
        if(this.workingImpactsMap) {
            this.setField("impactsMap",this.workingImpactsMap);
            this.workingImpactsMap = null;
        } 
    }

    finalizeMemberMap() {
        if(this.workingMemberMap) {
            this.setField("memberMap",this.workingMemberMap);
            this.workingMemberMap = null;
        }
    }

    /** This returns a map of the changes to the model. It is only valid while the 
     * model instance is unlocked. */
    getChangeMap() {
        return this.workingChangeMap;
    }

    /** This function should be used to execute any action that is run asynchronously with the current
     * action. The action is run on a model and it is uncertain whether the existing model will still be 
     * current when this new action is run. An example of when this is used is to populate a data table in
     * response to a json request completing.  */
    doFutureAction(actionData) {
        //run this action asynchronously
        this.runContext.doAsynchActionCommand(this.getId(),actionData);
    }

    /** This method returns the root object - implemented from RootHolder.  */
    setName(name) {
        this.setField("name",name);
    }

    /** This method returns the root object - implemented from RootHolder.  */
    getName() {
        return this.getField("name");
    }

    /** This method updates the dependencies of any children
     * based on an object being added. */
    updateDependeciesForModelChange(additionalUpdatedMembers) {
        //call update in children
        let childIdMap = this.getChildIdMap();
        for(var name in childIdMap) {
            var childId = childIdMap[name];
            let child = this.lookupMemberById(childId);
            if((child)&&(child.isDependent)) {
                child.updateDependeciesForModelChange(this,additionalUpdatedMembers);
            }
        }
    }

    //------------------------------
    // Queded Action Methods
    //------------------------------

    /** This function triggers the action for the queued action to be run when the current thread exits. */
    isActionInProgress() {
        return this.actionInProgress;
    }

    setActionInProgress(inProgress) {
        this.actionInProgress = inProgress;
    }

    saveMessengerAction(actionInfo) {
        this.messengerActionList.push(actionInfo);
    }

    getSavedMessengerAction() {
        if(this.messengerActionList.length > 0) {
            var actionData = {};
            actionData.action = "compoundAction";
            actionData.actions = this.messengerActionList;
            this.messengerActionList = [];
            return actionData;
        }
        else {
            return null;
        }
    }

    /** This method should be called for each consecutive queued action. It checks it if there are 
     * too many. If so, it returns true. In so doing, it also backs of the consecutive queued 
     * action count so next time it will take longer. Any call to clearConsecutiveQueuedActionCount
     * will return it to the default initial value.
     */
    checkConsecutiveQueuedActionLimitExceeded() {
        this.consecutiveActionCount++;
        
        //check the limit
        var exceedsLimit = (this.consecutiveActionCount > this.activeConsecutiveActionLimit);
        if(exceedsLimit) {
            //back off limit for next time
            this.activeConsecutiveActionLimit *= 2;
        }
        
        return exceedsLimit;
    }

    /** This should be called wo abort any queued actions. */
    setCalculationCanceled() {
        //reset queued action variables
        this.clearCommandQueue();
        
        alert("The tables are left in improper state because the calculation was aborted. :( ");
    }

    /** This should be called when there is not a queued action. */
    clearConsecutiveQueuedTracking() {
        this.consecutiveActionCount = 0;
        this.activeConsecutiveActionLimit = Model.CONSECUTIVE_ACTION_INITIAL_LIMIT;
    }

    /** This method resets the command queue */
    clearCommandQueue() {
        //reset queued action variables
        this.messengerActionList = [];
        this.clearConsecutiveQueuedTracking();
    }


    //------------------------------
    // Parent Methods
    //------------------------------

    /** this method gets the hame the children inherit for the full name. */
    getPossesionNameBase(model) {
        //the name starts over at a new model
        return "";
    }

    //------------------------------
    //ContextHolder methods
    //------------------------------

    /** This method retrieve creates the loaded context manager. */
    createContextManager() {
        //set the context manager
        var contextManager = new ContextManager(this);

        //add an entry for this folder. This is for multiple folders in the model base
        //which as of the time of this comment we don't have but plan on adding
        //(at which time this comment will probably be left in by accident...)
        var myEntry = {};
        myEntry.contextHolderAsParent = true;
        contextManager.addToContextList(myEntry);
        
        return contextManager;
    }

    //============================
    // MemberMap Functions
    //============================

    lookupMemberById(memberId) {
        let memberMap = this._getMemberMap();
        return memberMap[memberId];
    }

    /** This method returns a mutable member for the given ID. If the member is already unlocked, that member will be
     * returned. Otherwise a copy of the member will be made and stored as the active instance for the member ID.  */
    getMutableMember(memberId) {
        if(this.getIsLocked()) throw new Error("The model must be unlocked to get a mutable member.");

        let member = this.lookupMemberById(memberId);
        if(member) {
            if(member.getIsLocked()) {
                //create a unlocked copy of the member
                let newMember = new member.constructor(member.getName(),member.getParentId(),member);

                //update the saved copy of this member in the member map
                this.registerMember(newMember);
                return newMember;
            }
            else {
                return member;
            }
        }
        else {
            return null;
        }
    }

    registerMember(member) {
        if(!this.workingMemberMap) {
            this._populateWorkingMemberMap();
        }

        let memberId = member.getId();

        //update the change map for this member change
        let changeMapEntry = this.workingChangeMap[memberId];
        if(!changeMapEntry) {
            //if it already existed we don't need to change it (that means it was a create and we want to keep that)
            //otherwise add a new entry
            if(this.workingMemberMap[memberId]) {
                //this is an update
                this.workingChangeMap[memberId] = {action: "updated", instance: member};
            }
            else {
                //this is a create
                this.workingChangeMap[memberId] = {action: "created", instance: member};
            }
        }

        //add or update the member in the working member map
        this.workingMemberMap[memberId] = member;
    }

    unregisterMember(member) {
        if(!this.workingMemberMap) {
            this._populateWorkingMemberMap();
        }

        let memberId = member.getId();

        //update the change map for this member change
        let changeMapEntry = this.workingChangeMap[memberId];
        if(changeMapEntry) {
            if(changeMapEntry.action == "updated") {
                changeMapEntry.action = "deleted";
            }
            else if(changeMapEntry.action == "created") {
                //these cancel! however, we will keep the entry around and label
                //it as "transient", in case we get another entry for this member
                //I don't think we should get on after delete, but just in case
                changeMapEntry.action = "transient";
            }
            else if(changeMapEntry.action == "transient") ;
            else {
                //this shouldn't happen. We will just mark it as delete
                changeMapEntry.action = "deleted";
            }
        }
        else {
            changeMapEntry = {action: "deleted", instance: member};
            this.workingChangeMap[memberId] = changeMapEntry;
        }

        //remove the member entry
        delete this.workingMemberMap[memberId];
    }

    _getMemberMap() {
        return this.workingMemberMap ? this.workingMemberMap : this.getField("memberMap");
    }

    /** This method makes a mutable copy of the member map, and places it in the working member map. */
    _populateWorkingMemberMap() {
        let memberMap = this.getField("memberMap");
        let newMemberMap = {};
        Object.assign(newMemberMap,memberMap);
        this.workingMemberMap = newMemberMap;
    }

    //============================
    // Impact List Functions
    //============================

    /** This returns an array of members this member impacts. */
    getImpactsList(member) {
        let impactsMap = this.getField("impactsMap");
        let impactsList = impactsMap[member.getId()];
        if(!impactsList) impactsList = [];
        return impactsList;
    }
    
    /** This method adds a data member to the imapacts list for this node.
     * The return value is true if the member was added and false if it was already there. 
     * NOTE: the member ID can be a string or integer. This dependentMemberId should be an int. */
    addToImpactsList(depedentMemberId,memberId) {
        //don't let a member impact itself
        if(memberId === depedentMemberId) return;

        let workingMemberImpactsList = this.getWorkingMemberImpactsList(memberId);

        //add to the list iff it is not already there
        if(workingMemberImpactsList.indexOf(depedentMemberId) === -1) {
            workingMemberImpactsList.push(depedentMemberId);
            return true;
        }
        else {
            return false;
        }
    }

    /** This method removes a data member from the imapacts list for this node. */
    removeFromImpactsList(depedentMemberId,memberId) {

        let workingMemberImpactsList = this.getWorkingMemberImpactsList(memberId);

        //it should appear only once
        for(var i = 0; i < workingMemberImpactsList.length; i++) {
            if(workingMemberImpactsList[i] == depedentMemberId) {
                workingMemberImpactsList.splice(i,1);
                return;
            }
        }
    }
    
    /** This gets a edittable copy of a member impacts list.  */
    getWorkingMemberImpactsList(memberId) {
        //make sure our working impacts map is populated
        //we will use this wile buildign the impacts map and then set the impacts map field
        if(!this.workingImpactsMap) {
            this._populateWorkingImpactsMap();
        }

        let memberImpactsList = this.workingImpactsMap[memberId];
        if(!memberImpactsList) {
            memberImpactsList = [];
            this.workingImpactsMap[memberId] = memberImpactsList;
        }

        return memberImpactsList;
    }

    /** This method will load a mutable copy of the impacts map field to be used
     * when we update the impacts map. We use a working variable since the reconstruction
     * spans many calls to the add/remove function. In the copy, it makes a shallow copy of 
     * each impacts list in the map. */
    _populateWorkingImpactsMap() {
        let impactsMap = this.getField("impactsMap");
        let newImpactsMap = {};
        for(let idString in impactsMap) {
            let impactsList = impactsMap[idString];
            //shallow copy each array
            newImpactsMap[idString] = [...impactsList];
        }
        this.workingImpactsMap = newImpactsMap;
    }

    //============================
    // Save and Load Functions
    //============================

    /** This saves the model */
    toJson() {
        let json = {};
        json.fileType = Model.SAVE_FILE_TYPE;
        json.version = Model.SAVE_FILE_VERSION;

        json.name = this.getField("name");
        json.children = {};
        let childIdMap = this.getField("childIdMap");
        for(var name in childIdMap) {
            var childId = childIdMap[name];
            let child = this.lookupMemberById(childId);
            if(child) {
                json.children[name] = child.toJson(this);
            }
        }

        return json;
    }

    /** This method creates a headless model json from a folder json. It
     * is used in the folder function. */
    static createModelJsonFromFolderJson(name,folderJson) {
        let json = {};
        json.fileType = Model.SAVE_FILE_TYPE;
        json.version = Model.SAVE_FILE_VERSION;

        //let the workspace inherit the folder name
        json.name = name;
        json.children = {};

        //attach a single child named main
        json.children[folderJson.name] = folderJson;

        return json
    }

    //================================
    // Member generator functions
    //================================

    /** This methods retrieves the member generator for the given type. */
    static getMemberGenerator(type) {
        return memberGenerators[type];
    }

    /** This method registers the member generator for a given named type. */
    static addMemberGenerator(generator) {
        memberGenerators[generator.type] = generator;
    }

}

//add mixins to this class
apogeeutil.mixin(Model,EventManager);
apogeeutil.mixin(Model,ContextHolder);
apogeeutil.mixin(Model,Parent);

let memberGenerators = {};

Model.DEFAULT_MODEL_NAME = "Workspace";
Model.ROOT_FOLDER_NAME = "main";

/** This is the supported file type. */
Model.SAVE_FILE_TYPE = "apogee model";

/** This is the supported file version. */
Model.SAVE_FILE_VERSION = 0.3;

Model.CONSECUTIVE_ACTION_INITIAL_LIMIT = 500;

Model.EMPTY_MODEL_JSON = {
    "fileType": Model.SAVE_FILE_TYPE,
    "version": Model.SAVE_FILE_VERSION,
    "name": Model.DEFAULT_MODEL_NAME,
    "children": {
        "main": {
            "name": Model.ROOT_FOLDER_NAME,
            "type": "apogee.Folder"
        }
    }
};

/** This module contains functions to process an update to an member
 * which inherits from the FunctionBase component. */


/** This moethod should be called on an member (impactor or dependent) that changes.
 * This will allow for any Dependents to be recaculated. */
function addToRecalculateList(model,recalculateList,member) {
    //if it is in the list, return
    if(recalculateList.indexOf(member) >= 0) return;
     
    //add this member to recalculate list if it needs to be executed
    if((member.isDependent)&&(member.memberUsesRecalculation())) {
        recalculateList.push(member);
        member.prepareForCalculate();
    }
        
    addDependsOnToRecalculateList(model,recalculateList,member);
}

function addDependsOnToRecalculateList(model,recalculateList,member) {
    //add any member that depends on this one  
    var impactsList = model.getImpactsList(member);
    for(var i = 0; i < impactsList.length; i++) {
        let dependent = model.getMutableMember(impactsList[i]);
        addToRecalculateList(model,recalculateList,dependent);
    }
}



/** This calls execute for each member in the recalculate list. The return value
 * is false if there are any errors. */
function callRecalculateList(model,recalculateList) {
    var dependent;
    var i;
    var success = true;
    for(i = 0; i < recalculateList.length; i++) {
        dependent = recalculateList[i];
        if(dependent.getCalcPending()) {
            dependent.calculate(model);   
        }
    }
    
    return success;
}

/**
 * Action Module
 * An action is an operation on the data model. A mutable (unlocked) model must be passed in. 
 * After the action is completed, the model will be locked, and represent immutable data state.
 * 
 * The code in this module handles
 * the generic parts of the action process, and the action specific code is placed
 * elsewhere.
 * 
 * Generic Action:
 * - The action is represented by a data object "actionData". 
 * - The method doAction is called to exectue the action.
 * - Available actions are registered through the method addActionInfo.
 *   this allows the doAction method to dispatch the actionData to the proper
 *   action specific code.
 * - Included in doing that action is any updates to dependent tables and the 
 * firing of any events for the changes.
 *   
 * Registering a specific action:
 * To register a specific action, addActionInfo must be called with 
 * the name of the action and the function taht executes the action. The function
 * should be of the form: 
 * actionResult = function actionFunction(model,actionData)
 * 
 * Action Data Format:
 * The action data is used to pass data into the action specific code, Format:
 * actionData format: {
 *   "action": (The name of the action to execute),
 *   "member": (The data object that is acted upon , if applicable),
 *   (other, multiple): (Specific data for the action)
 * }
 * 
 * ChangeResult:
 * The return value of the doAction function is a change result. This is a listing of all data objects whcih changed, in the success case.
 * The format is as follows:
 * Format: {
 *  actionDone: (true/false)
 *  actionPending: (Rather than actionDone, actionPending will be returned if doAction is called while another action is in
 *      process. This should only happen for actions being called by the messenger.)
 *  errorMsg: (An error message in the case actionDone is false.)
 *  model: (The model object which was acted on.)
 *  changeList: (An array of changed objects:)
 *      - event: (the change to the object: created/updated/deleted)
 *      - model: (the model, if the object was the model)
 *      - member: (the member, if the object was a member)
 * }
 *  *   "actionPending": (This flag is returned if the action is a queued action and will be run after the
 *                  current action completes.)
 * 
 * ActionResult:
 * The return value of the an action function (not the doAction function) is an ActionResult struct, with the data below. The function should return
 * an action result for each member/model that changes. There should be a single top level action result and then there can be 
 * child action results, in the childActionResults field. An important function of the action result is to tell the doAction function
 * how to calculate updates to the model based on changes to specific members. The flags recalculateMember, recalculateDependsOnMember,
 * updateMemberDependencies and updateModelDependencies serve this purpose and are described below.
 * Format: {
 *   "actionDone": (If this is returned true the action was done. This does not mean it was error free, rather
 *                  if means the action completed and can be undone. For example, it may be setting code in a member
 *                  and the code may be invalid. That is OK. It is displayed in the UI as an error and "actionDone" = true.
 *                  ActionDone should be false there was an error such that the state of the program is compromised and the 
 *                  action can not be undone. In this case, the program will keep the original state rather than adopting 
 *                  the new state the results from the action.
 *   "actionPending": (This flag is returned if the action is a queued action and will be run after the
 *                  current action completes.)
 *   "model": (The model on which the action is acting)
 *   "member": (The object modified in the action, if it is a member. Another option is a model update, in which 
 *                  case this field is left undefined, but a model event will be included. It is also possible that
 *                  there is no member listed because the action result does not corrspond to an action on a member of 
 *                  the model. This is true on the top level result of a compound action.)
 *   "event": (This is the event that should be fired as a result of this action/actionResult. The options are:
 *                  "created", "updated" and "deleted".)
 *   "errorMsg": (This is the error message for is the actionDone is false)
 *   "childActionResults" - (This is a list of action results if there are additional child actions done with this
 *                  action. Examples where this is used are on creating, moving or deleting a folder that has chilren.)
 *   "recalculateMember" - (This is an optional action flag. The is set of the member is a dependent and it must be recalculated.)
 *   "recalculateDependsOnMember" - (This is an optional action flag. This is set if the member has its value changed, but the 
 *                  member does not need to be recalculated. The members that depend on this do however need to be recalculated.)
 *   "updateMemberDependencies" - (This is an optional action flag. The is set of the member is a dependent and it must have its dependencies
 *                  recalculated, such as if the code changes.)
 *   "updateModelDepedencies" - (This is an optional action flag. The is set of the member is a dependent and it is created, deleted or moved.
 *                  In this case, all members in the model should be checked to see if they have any dependency changes.)
 * }
 * 
 */ 

/** This structure holds the processing information for all the actions. It is set by each action. 
 * @private */
let actionInfoMap = {
};

/** This method is used to execute an action for the data model. The model object passed in should be _unlocked_.
 * At the completion of the action, before returning, the model will be locked, meaning it can not longer be changed. */
function doAction(model,actionData) {
    
    //only allow one action at a time
    if(model.isActionInProgress()) {
        //this is a messenger action - we will save it and execute it after this computation cycle is complete
        model.saveMessengerAction(actionData);
        
        //mark command as pending
        let changeResult = {};
        changeResult.actionPending = true;
        return changeResult;
    }
    
    //execute the main action
    let {success, errorMsg} = internalDoAction(model,actionData);
    if(!success) {
        model.clearCommandQueue();
        model.lockAll();

        let changeResult = {};
        changeResult.actionDone = false;
        changeResult.model = model;
        changeResult.errorMsg = errorMsg;
        return changeResult;
    }
    
    //trigger any pending actions
    //these will be done asynchronously
    var savedMessengerAction;
    while(savedMessengerAction = model.getSavedMessengerAction()) {
        var runQueuedAction = true;

        if(model.checkConsecutiveQueuedActionLimitExceeded()) {
            //ask user if about continueing
            var doContinue = confirm("The calculation is taking a long time. Continue?");
            if(!doContinue) {
                model.setCalculationCanceled();
                model.lockAll();

                let changeResult = {};
                changeResult.actionDone = false;
                changeResult.model = model;
                changeResult.errorMsg = "The calculation was canceled";
                return changeResult;         
            }
        }

        if(runQueuedAction) {
            //this action is run synchronously
            let {success, errorMsg} = internalDoAction(model,savedMessengerAction);
            if(!success) {
                model.clearCommandQueue();
                model.lockAll();

                let changeResult = {};
                changeResult.actionDone = false;
                changeResult.model = model;
                changeResult.errorMsg = errorMsg;
                return changeResult;
            }
        }
    }
    
    model.clearConsecutiveQueuedTracking(); 
    
    //fire the events
    let changeList = changeMapToChangeList(model.getChangeMap());
    fireEvents(model,changeList);

    //lock the model
    model.lockAll();

    //return result
    let changeResult = {};
    changeResult.actionDone = true;
    changeResult.model = model;
    changeResult.changeList = changeList;
    return changeResult;
}

/** This function is used to register an action. */
function addActionInfo(actionName,actionFunction) {
    actionInfoMap[actionName] = actionFunction;
}

//=======================================
// Internal Methods
//=======================================

/** This method executes a single action function, */
function internalDoAction(model,actionData) {

    let success, errorMsg;

    //flag action in progress
    model.setActionInProgress(true);  

    try {

        //do the action
        let actionResult = callActionFunction(model,actionData); 
        
        //flatten action result tree into a list of objects modified in the action
        var {actionModifiedMembers, actionDone, errorMsgList} = flattenActionResult(actionResult);

        //return in the failure case
        if(actionDone) {
            //this list will be additional modified members - from dependency changes
            //due to adding and deleting members (This happens when a new remote member is referenced
            //a member formula because of creating or deleting. This is not a common event, but it does happen)
            var additionalUpdatedMembers = [];
            
            //figure out other objects that need to be updated
            //also update dependencies (and the inverse - impacts)
            var updateAllDep = checkUpdateAllDep(actionModifiedMembers);
            if(updateAllDep) {
                //update entire model - see conditions bewlo
                model.updateDependeciesForModelChange(additionalUpdatedMembers);
            }
            else {
                updateDependenciesFromAction(model,actionModifiedMembers);
            }

            //commit the updated impacts map (inverse of dependency map) 
            model.finalizeImpactsMap();
            model.finalizeMemberMap();

            //populate recalc list
            let recalculateList = createRecalculateList(model,actionModifiedMembers,additionalUpdatedMembers);
            
            //recalculate all needed objects
            callRecalculateList(model,recalculateList);

            success = true;
        }
        else {
            success = false;
            errorMsg = errorMsgList.join("; ");
        }

    }
	catch(error) {
        if(error.stack) console.error(error.stack);
        success = false;
        errorMsg = "Unknown error updating model: " + error.message;
    }

    //flag action in progress
    model.setActionInProgress(false);

    return {success, errorMsg};
}

/** This function looks up the proper function for an action and executes it. */
function callActionFunction(model,actionData) {

    let actionResult;

    //do the action
    var actionFunction = actionInfoMap[actionData.action];
    if(actionFunction) {
        actionResult = actionFunction(model,actionData);
    }
    else {
        actionResult = {};
        actionResult.actionDone = false;
        actionResult.errorMsg = "Unknown action: " + actionData.action;
    }  

    return actionResult;
}

/** This method makes sure the member dependencies in the model are properly updated. 
 * @private */
function updateDependenciesFromAction(model,actionModifiedMembers) {
    //upate dependencies on table with updated code
    actionModifiedMembers.forEach(actionResult => {
        if((actionResult.member)&&(actionResult.member.isCodeable)&&(actionResult.updateMemberDependencies)) {
            actionResult.member.initializeDependencies(model);
        }
    });
}

/** This method takes the members that are updated (either by code or value) and
 * adds them to the list of members that need to be recalculated. To do this, we must
 * first have all dependencies updated, sicne it relies on the impacts list. */
function createRecalculateList(model,actionModifiedMembers,additionalUpdatedMembers) {
    let recalculateList = [];

    //add members from each action and/or fields they impact, if applicable
    actionModifiedMembers.forEach( actionResult => {
        //update the recalc list
        if(actionResult.recalculateMember) {
            addToRecalculateList(model,recalculateList,actionResult.member);            
        }
        else if(actionResult.recalculateDependsOnMembers) {
            addDependsOnToRecalculateList(model,recalculateList,actionResult.member);                         
        }
    });

    //add any other modified members to the racalculate list
    additionalUpdatedMembers.forEach(member => addToRecalculateList(model,recalculateList,member));

    return recalculateList;
}

/** This function fires the proper events for the  It combines events to 
 * fire a single event for each member.
 * @private */
function fireEvents(model,changeList) {
    changeList.forEach(changeListEntry => {
        model.dispatchEvent(changeListEntry.event,changeListEntry.instance);
    });
}

function changeMapToChangeList(changeMap) {
    let changeList = [];
    for(let id in changeMap) {
        let changeMapEntry = changeMap[id];

        //ignore the transient objects
        if(changeMapEntry.action == "transient") continue;

        let changeListEntry = {};
        changeListEntry.event = changeMapEntry.instance.getType() + "_" + changeMapEntry.action;
        changeListEntry.instance = changeMapEntry.instance;
        changeList.push(changeListEntry);
    }
    return changeList;
}

/** This method determines if updating all dependencies is necessary. Our dependency 
 * tracking may be in error if a new member is created, a member is deleted or
 * a member is moved. In these actions we flag that the entire model should be
 * updated.*/
function checkUpdateAllDep(completedResults) {
    //return true if any results have the updateModelDependencies flag set
    return completedResults.some(result => result.updateModelDependencies)
}

/** This method unpacks the actionResult and its child reponse into an array of actionResult. */
function flattenActionResult(actionResult) {
    let actionResultInfo = {};
    actionResultInfo.actionModifiedMembers = [];
    actionResultInfo.actionDone = true;
    actionResultInfo.errorMsgList = [];

    addToCompletedResultList(actionResultInfo,actionResult);

    return actionResultInfo;
}

function addToCompletedResultList(actionResultInfo,actionResult) {
    actionResultInfo.actionModifiedMembers.push(actionResult);
    if(!actionResult.actionDone) actionResultInfo.actionDone = false;
    if(actionResult.errorMsgList) actionResultInfo.errorMsgList.push(actionResult.errorMsg);

    if(actionResult.childActionResults) {
        actionResult.childActionResults.forEach( childActionResult => {
            addToCompletedResultList(actionResultInfo,childActionResult);
        });
    }
}

//============================================
// Compound Action
//============================================

/** The compound action is automatically imported when the action module is imported.
 *
 * Action Data format:
 * {
 *  "action": "compoundAction",
 *  "actions": (list of actions in this compound action),
 * }
 */


/** This method is the action function for a compound action. */
function compoundActionFunction(model,actionData) {

    let actionResult = {};

    var actionList = actionData.actions;
    actionResult.childActionResults = [];
    for(var i = 0; i < actionList.length; i++) {
        let childActionData = actionList[i];
        let childActionResult = callActionFunction(model,childActionData);
        actionResult.childActionResults.push(childActionResult);   
    }
    actionResult.actionDone = true;
    return actionResult;
}

//This line of code registers the action 
addActionInfo("compoundAction",compoundActionFunction);

var commonjsGlobal = typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

function createCommonjsModule(fn, module) {
	return module = { exports: {} }, fn(module, module.exports), module.exports;
}

var esprima = createCommonjsModule(function (module, exports) {
/*
  Copyright (c) jQuery Foundation, Inc. and Contributors, All Rights Reserved.

  Redistribution and use in source and binary forms, with or without
  modification, are permitted provided that the following conditions are met:

    * Redistributions of source code must retain the above copyright
      notice, this list of conditions and the following disclaimer.
    * Redistributions in binary form must reproduce the above copyright
      notice, this list of conditions and the following disclaimer in the
      documentation and/or other materials provided with the distribution.

  THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
  AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
  IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
  ARE DISCLAIMED. IN NO EVENT SHALL <COPYRIGHT HOLDER> BE LIABLE FOR ANY
  DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
  (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
  LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
  ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
  (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF
  THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
*/

(function (root, factory) {

    // Universal Module Definition (UMD) to support AMD, CommonJS/Node.js,
    // Rhino, and plain browser loading.

    /* istanbul ignore next */
    {
        factory(exports);
    }
}(commonjsGlobal, function (exports) {

    var Token,
        TokenName,
        FnExprTokens,
        Syntax,
        PlaceHolders,
        Messages,
        Regex,
        source,
        strict,
        index,
        lineNumber,
        lineStart,
        hasLineTerminator,
        lastIndex,
        lastLineNumber,
        lastLineStart,
        startIndex,
        startLineNumber,
        startLineStart,
        scanning,
        length,
        lookahead,
        state,
        extra,
        isBindingElement,
        isAssignmentTarget,
        firstCoverInitializedNameError;

    Token = {
        BooleanLiteral: 1,
        EOF: 2,
        Identifier: 3,
        Keyword: 4,
        NullLiteral: 5,
        NumericLiteral: 6,
        Punctuator: 7,
        StringLiteral: 8,
        RegularExpression: 9,
        Template: 10
    };

    TokenName = {};
    TokenName[Token.BooleanLiteral] = 'Boolean';
    TokenName[Token.EOF] = '<end>';
    TokenName[Token.Identifier] = 'Identifier';
    TokenName[Token.Keyword] = 'Keyword';
    TokenName[Token.NullLiteral] = 'Null';
    TokenName[Token.NumericLiteral] = 'Numeric';
    TokenName[Token.Punctuator] = 'Punctuator';
    TokenName[Token.StringLiteral] = 'String';
    TokenName[Token.RegularExpression] = 'RegularExpression';
    TokenName[Token.Template] = 'Template';

    // A function following one of those tokens is an expression.
    FnExprTokens = ['(', '{', '[', 'in', 'typeof', 'instanceof', 'new',
                    'return', 'case', 'delete', 'throw', 'void',
                    // assignment operators
                    '=', '+=', '-=', '*=', '/=', '%=', '<<=', '>>=', '>>>=',
                    '&=', '|=', '^=', ',',
                    // binary/unary operators
                    '+', '-', '*', '/', '%', '++', '--', '<<', '>>', '>>>', '&',
                    '|', '^', '!', '~', '&&', '||', '?', ':', '===', '==', '>=',
                    '<=', '<', '>', '!=', '!=='];

    Syntax = {
        AssignmentExpression: 'AssignmentExpression',
        AssignmentPattern: 'AssignmentPattern',
        ArrayExpression: 'ArrayExpression',
        ArrayPattern: 'ArrayPattern',
        ArrowFunctionExpression: 'ArrowFunctionExpression',
        BlockStatement: 'BlockStatement',
        BinaryExpression: 'BinaryExpression',
        BreakStatement: 'BreakStatement',
        CallExpression: 'CallExpression',
        CatchClause: 'CatchClause',
        ClassBody: 'ClassBody',
        ClassDeclaration: 'ClassDeclaration',
        ClassExpression: 'ClassExpression',
        ConditionalExpression: 'ConditionalExpression',
        ContinueStatement: 'ContinueStatement',
        DoWhileStatement: 'DoWhileStatement',
        DebuggerStatement: 'DebuggerStatement',
        EmptyStatement: 'EmptyStatement',
        ExportAllDeclaration: 'ExportAllDeclaration',
        ExportDefaultDeclaration: 'ExportDefaultDeclaration',
        ExportNamedDeclaration: 'ExportNamedDeclaration',
        ExportSpecifier: 'ExportSpecifier',
        ExpressionStatement: 'ExpressionStatement',
        ForStatement: 'ForStatement',
        ForOfStatement: 'ForOfStatement',
        ForInStatement: 'ForInStatement',
        FunctionDeclaration: 'FunctionDeclaration',
        FunctionExpression: 'FunctionExpression',
        Identifier: 'Identifier',
        IfStatement: 'IfStatement',
        ImportDeclaration: 'ImportDeclaration',
        ImportDefaultSpecifier: 'ImportDefaultSpecifier',
        ImportNamespaceSpecifier: 'ImportNamespaceSpecifier',
        ImportSpecifier: 'ImportSpecifier',
        Literal: 'Literal',
        LabeledStatement: 'LabeledStatement',
        LogicalExpression: 'LogicalExpression',
        MemberExpression: 'MemberExpression',
        MetaProperty: 'MetaProperty',
        MethodDefinition: 'MethodDefinition',
        NewExpression: 'NewExpression',
        ObjectExpression: 'ObjectExpression',
        ObjectPattern: 'ObjectPattern',
        Program: 'Program',
        Property: 'Property',
        RestElement: 'RestElement',
        ReturnStatement: 'ReturnStatement',
        SequenceExpression: 'SequenceExpression',
        SpreadElement: 'SpreadElement',
        Super: 'Super',
        SwitchCase: 'SwitchCase',
        SwitchStatement: 'SwitchStatement',
        TaggedTemplateExpression: 'TaggedTemplateExpression',
        TemplateElement: 'TemplateElement',
        TemplateLiteral: 'TemplateLiteral',
        ThisExpression: 'ThisExpression',
        ThrowStatement: 'ThrowStatement',
        TryStatement: 'TryStatement',
        UnaryExpression: 'UnaryExpression',
        UpdateExpression: 'UpdateExpression',
        VariableDeclaration: 'VariableDeclaration',
        VariableDeclarator: 'VariableDeclarator',
        WhileStatement: 'WhileStatement',
        WithStatement: 'WithStatement',
        YieldExpression: 'YieldExpression'
    };

    PlaceHolders = {
        ArrowParameterPlaceHolder: 'ArrowParameterPlaceHolder'
    };

    // Error messages should be identical to V8.
    Messages = {
        UnexpectedToken: 'Unexpected token %0',
        UnexpectedNumber: 'Unexpected number',
        UnexpectedString: 'Unexpected string',
        UnexpectedIdentifier: 'Unexpected identifier',
        UnexpectedReserved: 'Unexpected reserved word',
        UnexpectedTemplate: 'Unexpected quasi %0',
        UnexpectedEOS: 'Unexpected end of input',
        NewlineAfterThrow: 'Illegal newline after throw',
        InvalidRegExp: 'Invalid regular expression',
        UnterminatedRegExp: 'Invalid regular expression: missing /',
        InvalidLHSInAssignment: 'Invalid left-hand side in assignment',
        InvalidLHSInForIn: 'Invalid left-hand side in for-in',
        InvalidLHSInForLoop: 'Invalid left-hand side in for-loop',
        MultipleDefaultsInSwitch: 'More than one default clause in switch statement',
        NoCatchOrFinally: 'Missing catch or finally after try',
        UnknownLabel: 'Undefined label \'%0\'',
        Redeclaration: '%0 \'%1\' has already been declared',
        IllegalContinue: 'Illegal continue statement',
        IllegalBreak: 'Illegal break statement',
        IllegalReturn: 'Illegal return statement',
        StrictModeWith: 'Strict mode code may not include a with statement',
        StrictCatchVariable: 'Catch variable may not be eval or arguments in strict mode',
        StrictVarName: 'Variable name may not be eval or arguments in strict mode',
        StrictParamName: 'Parameter name eval or arguments is not allowed in strict mode',
        StrictParamDupe: 'Strict mode function may not have duplicate parameter names',
        StrictFunctionName: 'Function name may not be eval or arguments in strict mode',
        StrictOctalLiteral: 'Octal literals are not allowed in strict mode.',
        StrictDelete: 'Delete of an unqualified identifier in strict mode.',
        StrictLHSAssignment: 'Assignment to eval or arguments is not allowed in strict mode',
        StrictLHSPostfix: 'Postfix increment/decrement may not have eval or arguments operand in strict mode',
        StrictLHSPrefix: 'Prefix increment/decrement may not have eval or arguments operand in strict mode',
        StrictReservedWord: 'Use of future reserved word in strict mode',
        TemplateOctalLiteral: 'Octal literals are not allowed in template strings.',
        ParameterAfterRestParameter: 'Rest parameter must be last formal parameter',
        DefaultRestParameter: 'Unexpected token =',
        ObjectPatternAsRestParameter: 'Unexpected token {',
        DuplicateProtoProperty: 'Duplicate __proto__ fields are not allowed in object literals',
        ConstructorSpecialMethod: 'Class constructor may not be an accessor',
        DuplicateConstructor: 'A class may only have one constructor',
        StaticPrototype: 'Classes may not have static property named prototype',
        MissingFromClause: 'Unexpected token',
        NoAsAfterImportNamespace: 'Unexpected token',
        InvalidModuleSpecifier: 'Unexpected token',
        IllegalImportDeclaration: 'Unexpected token',
        IllegalExportDeclaration: 'Unexpected token',
        DuplicateBinding: 'Duplicate binding %0'
    };

    // See also tools/generate-unicode-regex.js.
    Regex = {
        // ECMAScript 6/Unicode v7.0.0 NonAsciiIdentifierStart:
        NonAsciiIdentifierStart: /[\xAA\xB5\xBA\xC0-\xD6\xD8-\xF6\xF8-\u02C1\u02C6-\u02D1\u02E0-\u02E4\u02EC\u02EE\u0370-\u0374\u0376\u0377\u037A-\u037D\u037F\u0386\u0388-\u038A\u038C\u038E-\u03A1\u03A3-\u03F5\u03F7-\u0481\u048A-\u052F\u0531-\u0556\u0559\u0561-\u0587\u05D0-\u05EA\u05F0-\u05F2\u0620-\u064A\u066E\u066F\u0671-\u06D3\u06D5\u06E5\u06E6\u06EE\u06EF\u06FA-\u06FC\u06FF\u0710\u0712-\u072F\u074D-\u07A5\u07B1\u07CA-\u07EA\u07F4\u07F5\u07FA\u0800-\u0815\u081A\u0824\u0828\u0840-\u0858\u08A0-\u08B2\u0904-\u0939\u093D\u0950\u0958-\u0961\u0971-\u0980\u0985-\u098C\u098F\u0990\u0993-\u09A8\u09AA-\u09B0\u09B2\u09B6-\u09B9\u09BD\u09CE\u09DC\u09DD\u09DF-\u09E1\u09F0\u09F1\u0A05-\u0A0A\u0A0F\u0A10\u0A13-\u0A28\u0A2A-\u0A30\u0A32\u0A33\u0A35\u0A36\u0A38\u0A39\u0A59-\u0A5C\u0A5E\u0A72-\u0A74\u0A85-\u0A8D\u0A8F-\u0A91\u0A93-\u0AA8\u0AAA-\u0AB0\u0AB2\u0AB3\u0AB5-\u0AB9\u0ABD\u0AD0\u0AE0\u0AE1\u0B05-\u0B0C\u0B0F\u0B10\u0B13-\u0B28\u0B2A-\u0B30\u0B32\u0B33\u0B35-\u0B39\u0B3D\u0B5C\u0B5D\u0B5F-\u0B61\u0B71\u0B83\u0B85-\u0B8A\u0B8E-\u0B90\u0B92-\u0B95\u0B99\u0B9A\u0B9C\u0B9E\u0B9F\u0BA3\u0BA4\u0BA8-\u0BAA\u0BAE-\u0BB9\u0BD0\u0C05-\u0C0C\u0C0E-\u0C10\u0C12-\u0C28\u0C2A-\u0C39\u0C3D\u0C58\u0C59\u0C60\u0C61\u0C85-\u0C8C\u0C8E-\u0C90\u0C92-\u0CA8\u0CAA-\u0CB3\u0CB5-\u0CB9\u0CBD\u0CDE\u0CE0\u0CE1\u0CF1\u0CF2\u0D05-\u0D0C\u0D0E-\u0D10\u0D12-\u0D3A\u0D3D\u0D4E\u0D60\u0D61\u0D7A-\u0D7F\u0D85-\u0D96\u0D9A-\u0DB1\u0DB3-\u0DBB\u0DBD\u0DC0-\u0DC6\u0E01-\u0E30\u0E32\u0E33\u0E40-\u0E46\u0E81\u0E82\u0E84\u0E87\u0E88\u0E8A\u0E8D\u0E94-\u0E97\u0E99-\u0E9F\u0EA1-\u0EA3\u0EA5\u0EA7\u0EAA\u0EAB\u0EAD-\u0EB0\u0EB2\u0EB3\u0EBD\u0EC0-\u0EC4\u0EC6\u0EDC-\u0EDF\u0F00\u0F40-\u0F47\u0F49-\u0F6C\u0F88-\u0F8C\u1000-\u102A\u103F\u1050-\u1055\u105A-\u105D\u1061\u1065\u1066\u106E-\u1070\u1075-\u1081\u108E\u10A0-\u10C5\u10C7\u10CD\u10D0-\u10FA\u10FC-\u1248\u124A-\u124D\u1250-\u1256\u1258\u125A-\u125D\u1260-\u1288\u128A-\u128D\u1290-\u12B0\u12B2-\u12B5\u12B8-\u12BE\u12C0\u12C2-\u12C5\u12C8-\u12D6\u12D8-\u1310\u1312-\u1315\u1318-\u135A\u1380-\u138F\u13A0-\u13F4\u1401-\u166C\u166F-\u167F\u1681-\u169A\u16A0-\u16EA\u16EE-\u16F8\u1700-\u170C\u170E-\u1711\u1720-\u1731\u1740-\u1751\u1760-\u176C\u176E-\u1770\u1780-\u17B3\u17D7\u17DC\u1820-\u1877\u1880-\u18A8\u18AA\u18B0-\u18F5\u1900-\u191E\u1950-\u196D\u1970-\u1974\u1980-\u19AB\u19C1-\u19C7\u1A00-\u1A16\u1A20-\u1A54\u1AA7\u1B05-\u1B33\u1B45-\u1B4B\u1B83-\u1BA0\u1BAE\u1BAF\u1BBA-\u1BE5\u1C00-\u1C23\u1C4D-\u1C4F\u1C5A-\u1C7D\u1CE9-\u1CEC\u1CEE-\u1CF1\u1CF5\u1CF6\u1D00-\u1DBF\u1E00-\u1F15\u1F18-\u1F1D\u1F20-\u1F45\u1F48-\u1F4D\u1F50-\u1F57\u1F59\u1F5B\u1F5D\u1F5F-\u1F7D\u1F80-\u1FB4\u1FB6-\u1FBC\u1FBE\u1FC2-\u1FC4\u1FC6-\u1FCC\u1FD0-\u1FD3\u1FD6-\u1FDB\u1FE0-\u1FEC\u1FF2-\u1FF4\u1FF6-\u1FFC\u2071\u207F\u2090-\u209C\u2102\u2107\u210A-\u2113\u2115\u2118-\u211D\u2124\u2126\u2128\u212A-\u2139\u213C-\u213F\u2145-\u2149\u214E\u2160-\u2188\u2C00-\u2C2E\u2C30-\u2C5E\u2C60-\u2CE4\u2CEB-\u2CEE\u2CF2\u2CF3\u2D00-\u2D25\u2D27\u2D2D\u2D30-\u2D67\u2D6F\u2D80-\u2D96\u2DA0-\u2DA6\u2DA8-\u2DAE\u2DB0-\u2DB6\u2DB8-\u2DBE\u2DC0-\u2DC6\u2DC8-\u2DCE\u2DD0-\u2DD6\u2DD8-\u2DDE\u3005-\u3007\u3021-\u3029\u3031-\u3035\u3038-\u303C\u3041-\u3096\u309B-\u309F\u30A1-\u30FA\u30FC-\u30FF\u3105-\u312D\u3131-\u318E\u31A0-\u31BA\u31F0-\u31FF\u3400-\u4DB5\u4E00-\u9FCC\uA000-\uA48C\uA4D0-\uA4FD\uA500-\uA60C\uA610-\uA61F\uA62A\uA62B\uA640-\uA66E\uA67F-\uA69D\uA6A0-\uA6EF\uA717-\uA71F\uA722-\uA788\uA78B-\uA78E\uA790-\uA7AD\uA7B0\uA7B1\uA7F7-\uA801\uA803-\uA805\uA807-\uA80A\uA80C-\uA822\uA840-\uA873\uA882-\uA8B3\uA8F2-\uA8F7\uA8FB\uA90A-\uA925\uA930-\uA946\uA960-\uA97C\uA984-\uA9B2\uA9CF\uA9E0-\uA9E4\uA9E6-\uA9EF\uA9FA-\uA9FE\uAA00-\uAA28\uAA40-\uAA42\uAA44-\uAA4B\uAA60-\uAA76\uAA7A\uAA7E-\uAAAF\uAAB1\uAAB5\uAAB6\uAAB9-\uAABD\uAAC0\uAAC2\uAADB-\uAADD\uAAE0-\uAAEA\uAAF2-\uAAF4\uAB01-\uAB06\uAB09-\uAB0E\uAB11-\uAB16\uAB20-\uAB26\uAB28-\uAB2E\uAB30-\uAB5A\uAB5C-\uAB5F\uAB64\uAB65\uABC0-\uABE2\uAC00-\uD7A3\uD7B0-\uD7C6\uD7CB-\uD7FB\uF900-\uFA6D\uFA70-\uFAD9\uFB00-\uFB06\uFB13-\uFB17\uFB1D\uFB1F-\uFB28\uFB2A-\uFB36\uFB38-\uFB3C\uFB3E\uFB40\uFB41\uFB43\uFB44\uFB46-\uFBB1\uFBD3-\uFD3D\uFD50-\uFD8F\uFD92-\uFDC7\uFDF0-\uFDFB\uFE70-\uFE74\uFE76-\uFEFC\uFF21-\uFF3A\uFF41-\uFF5A\uFF66-\uFFBE\uFFC2-\uFFC7\uFFCA-\uFFCF\uFFD2-\uFFD7\uFFDA-\uFFDC]|\uD800[\uDC00-\uDC0B\uDC0D-\uDC26\uDC28-\uDC3A\uDC3C\uDC3D\uDC3F-\uDC4D\uDC50-\uDC5D\uDC80-\uDCFA\uDD40-\uDD74\uDE80-\uDE9C\uDEA0-\uDED0\uDF00-\uDF1F\uDF30-\uDF4A\uDF50-\uDF75\uDF80-\uDF9D\uDFA0-\uDFC3\uDFC8-\uDFCF\uDFD1-\uDFD5]|\uD801[\uDC00-\uDC9D\uDD00-\uDD27\uDD30-\uDD63\uDE00-\uDF36\uDF40-\uDF55\uDF60-\uDF67]|\uD802[\uDC00-\uDC05\uDC08\uDC0A-\uDC35\uDC37\uDC38\uDC3C\uDC3F-\uDC55\uDC60-\uDC76\uDC80-\uDC9E\uDD00-\uDD15\uDD20-\uDD39\uDD80-\uDDB7\uDDBE\uDDBF\uDE00\uDE10-\uDE13\uDE15-\uDE17\uDE19-\uDE33\uDE60-\uDE7C\uDE80-\uDE9C\uDEC0-\uDEC7\uDEC9-\uDEE4\uDF00-\uDF35\uDF40-\uDF55\uDF60-\uDF72\uDF80-\uDF91]|\uD803[\uDC00-\uDC48]|\uD804[\uDC03-\uDC37\uDC83-\uDCAF\uDCD0-\uDCE8\uDD03-\uDD26\uDD50-\uDD72\uDD76\uDD83-\uDDB2\uDDC1-\uDDC4\uDDDA\uDE00-\uDE11\uDE13-\uDE2B\uDEB0-\uDEDE\uDF05-\uDF0C\uDF0F\uDF10\uDF13-\uDF28\uDF2A-\uDF30\uDF32\uDF33\uDF35-\uDF39\uDF3D\uDF5D-\uDF61]|\uD805[\uDC80-\uDCAF\uDCC4\uDCC5\uDCC7\uDD80-\uDDAE\uDE00-\uDE2F\uDE44\uDE80-\uDEAA]|\uD806[\uDCA0-\uDCDF\uDCFF\uDEC0-\uDEF8]|\uD808[\uDC00-\uDF98]|\uD809[\uDC00-\uDC6E]|[\uD80C\uD840-\uD868\uD86A-\uD86C][\uDC00-\uDFFF]|\uD80D[\uDC00-\uDC2E]|\uD81A[\uDC00-\uDE38\uDE40-\uDE5E\uDED0-\uDEED\uDF00-\uDF2F\uDF40-\uDF43\uDF63-\uDF77\uDF7D-\uDF8F]|\uD81B[\uDF00-\uDF44\uDF50\uDF93-\uDF9F]|\uD82C[\uDC00\uDC01]|\uD82F[\uDC00-\uDC6A\uDC70-\uDC7C\uDC80-\uDC88\uDC90-\uDC99]|\uD835[\uDC00-\uDC54\uDC56-\uDC9C\uDC9E\uDC9F\uDCA2\uDCA5\uDCA6\uDCA9-\uDCAC\uDCAE-\uDCB9\uDCBB\uDCBD-\uDCC3\uDCC5-\uDD05\uDD07-\uDD0A\uDD0D-\uDD14\uDD16-\uDD1C\uDD1E-\uDD39\uDD3B-\uDD3E\uDD40-\uDD44\uDD46\uDD4A-\uDD50\uDD52-\uDEA5\uDEA8-\uDEC0\uDEC2-\uDEDA\uDEDC-\uDEFA\uDEFC-\uDF14\uDF16-\uDF34\uDF36-\uDF4E\uDF50-\uDF6E\uDF70-\uDF88\uDF8A-\uDFA8\uDFAA-\uDFC2\uDFC4-\uDFCB]|\uD83A[\uDC00-\uDCC4]|\uD83B[\uDE00-\uDE03\uDE05-\uDE1F\uDE21\uDE22\uDE24\uDE27\uDE29-\uDE32\uDE34-\uDE37\uDE39\uDE3B\uDE42\uDE47\uDE49\uDE4B\uDE4D-\uDE4F\uDE51\uDE52\uDE54\uDE57\uDE59\uDE5B\uDE5D\uDE5F\uDE61\uDE62\uDE64\uDE67-\uDE6A\uDE6C-\uDE72\uDE74-\uDE77\uDE79-\uDE7C\uDE7E\uDE80-\uDE89\uDE8B-\uDE9B\uDEA1-\uDEA3\uDEA5-\uDEA9\uDEAB-\uDEBB]|\uD869[\uDC00-\uDED6\uDF00-\uDFFF]|\uD86D[\uDC00-\uDF34\uDF40-\uDFFF]|\uD86E[\uDC00-\uDC1D]|\uD87E[\uDC00-\uDE1D]/,

        // ECMAScript 6/Unicode v7.0.0 NonAsciiIdentifierPart:
        NonAsciiIdentifierPart: /[\xAA\xB5\xB7\xBA\xC0-\xD6\xD8-\xF6\xF8-\u02C1\u02C6-\u02D1\u02E0-\u02E4\u02EC\u02EE\u0300-\u0374\u0376\u0377\u037A-\u037D\u037F\u0386-\u038A\u038C\u038E-\u03A1\u03A3-\u03F5\u03F7-\u0481\u0483-\u0487\u048A-\u052F\u0531-\u0556\u0559\u0561-\u0587\u0591-\u05BD\u05BF\u05C1\u05C2\u05C4\u05C5\u05C7\u05D0-\u05EA\u05F0-\u05F2\u0610-\u061A\u0620-\u0669\u066E-\u06D3\u06D5-\u06DC\u06DF-\u06E8\u06EA-\u06FC\u06FF\u0710-\u074A\u074D-\u07B1\u07C0-\u07F5\u07FA\u0800-\u082D\u0840-\u085B\u08A0-\u08B2\u08E4-\u0963\u0966-\u096F\u0971-\u0983\u0985-\u098C\u098F\u0990\u0993-\u09A8\u09AA-\u09B0\u09B2\u09B6-\u09B9\u09BC-\u09C4\u09C7\u09C8\u09CB-\u09CE\u09D7\u09DC\u09DD\u09DF-\u09E3\u09E6-\u09F1\u0A01-\u0A03\u0A05-\u0A0A\u0A0F\u0A10\u0A13-\u0A28\u0A2A-\u0A30\u0A32\u0A33\u0A35\u0A36\u0A38\u0A39\u0A3C\u0A3E-\u0A42\u0A47\u0A48\u0A4B-\u0A4D\u0A51\u0A59-\u0A5C\u0A5E\u0A66-\u0A75\u0A81-\u0A83\u0A85-\u0A8D\u0A8F-\u0A91\u0A93-\u0AA8\u0AAA-\u0AB0\u0AB2\u0AB3\u0AB5-\u0AB9\u0ABC-\u0AC5\u0AC7-\u0AC9\u0ACB-\u0ACD\u0AD0\u0AE0-\u0AE3\u0AE6-\u0AEF\u0B01-\u0B03\u0B05-\u0B0C\u0B0F\u0B10\u0B13-\u0B28\u0B2A-\u0B30\u0B32\u0B33\u0B35-\u0B39\u0B3C-\u0B44\u0B47\u0B48\u0B4B-\u0B4D\u0B56\u0B57\u0B5C\u0B5D\u0B5F-\u0B63\u0B66-\u0B6F\u0B71\u0B82\u0B83\u0B85-\u0B8A\u0B8E-\u0B90\u0B92-\u0B95\u0B99\u0B9A\u0B9C\u0B9E\u0B9F\u0BA3\u0BA4\u0BA8-\u0BAA\u0BAE-\u0BB9\u0BBE-\u0BC2\u0BC6-\u0BC8\u0BCA-\u0BCD\u0BD0\u0BD7\u0BE6-\u0BEF\u0C00-\u0C03\u0C05-\u0C0C\u0C0E-\u0C10\u0C12-\u0C28\u0C2A-\u0C39\u0C3D-\u0C44\u0C46-\u0C48\u0C4A-\u0C4D\u0C55\u0C56\u0C58\u0C59\u0C60-\u0C63\u0C66-\u0C6F\u0C81-\u0C83\u0C85-\u0C8C\u0C8E-\u0C90\u0C92-\u0CA8\u0CAA-\u0CB3\u0CB5-\u0CB9\u0CBC-\u0CC4\u0CC6-\u0CC8\u0CCA-\u0CCD\u0CD5\u0CD6\u0CDE\u0CE0-\u0CE3\u0CE6-\u0CEF\u0CF1\u0CF2\u0D01-\u0D03\u0D05-\u0D0C\u0D0E-\u0D10\u0D12-\u0D3A\u0D3D-\u0D44\u0D46-\u0D48\u0D4A-\u0D4E\u0D57\u0D60-\u0D63\u0D66-\u0D6F\u0D7A-\u0D7F\u0D82\u0D83\u0D85-\u0D96\u0D9A-\u0DB1\u0DB3-\u0DBB\u0DBD\u0DC0-\u0DC6\u0DCA\u0DCF-\u0DD4\u0DD6\u0DD8-\u0DDF\u0DE6-\u0DEF\u0DF2\u0DF3\u0E01-\u0E3A\u0E40-\u0E4E\u0E50-\u0E59\u0E81\u0E82\u0E84\u0E87\u0E88\u0E8A\u0E8D\u0E94-\u0E97\u0E99-\u0E9F\u0EA1-\u0EA3\u0EA5\u0EA7\u0EAA\u0EAB\u0EAD-\u0EB9\u0EBB-\u0EBD\u0EC0-\u0EC4\u0EC6\u0EC8-\u0ECD\u0ED0-\u0ED9\u0EDC-\u0EDF\u0F00\u0F18\u0F19\u0F20-\u0F29\u0F35\u0F37\u0F39\u0F3E-\u0F47\u0F49-\u0F6C\u0F71-\u0F84\u0F86-\u0F97\u0F99-\u0FBC\u0FC6\u1000-\u1049\u1050-\u109D\u10A0-\u10C5\u10C7\u10CD\u10D0-\u10FA\u10FC-\u1248\u124A-\u124D\u1250-\u1256\u1258\u125A-\u125D\u1260-\u1288\u128A-\u128D\u1290-\u12B0\u12B2-\u12B5\u12B8-\u12BE\u12C0\u12C2-\u12C5\u12C8-\u12D6\u12D8-\u1310\u1312-\u1315\u1318-\u135A\u135D-\u135F\u1369-\u1371\u1380-\u138F\u13A0-\u13F4\u1401-\u166C\u166F-\u167F\u1681-\u169A\u16A0-\u16EA\u16EE-\u16F8\u1700-\u170C\u170E-\u1714\u1720-\u1734\u1740-\u1753\u1760-\u176C\u176E-\u1770\u1772\u1773\u1780-\u17D3\u17D7\u17DC\u17DD\u17E0-\u17E9\u180B-\u180D\u1810-\u1819\u1820-\u1877\u1880-\u18AA\u18B0-\u18F5\u1900-\u191E\u1920-\u192B\u1930-\u193B\u1946-\u196D\u1970-\u1974\u1980-\u19AB\u19B0-\u19C9\u19D0-\u19DA\u1A00-\u1A1B\u1A20-\u1A5E\u1A60-\u1A7C\u1A7F-\u1A89\u1A90-\u1A99\u1AA7\u1AB0-\u1ABD\u1B00-\u1B4B\u1B50-\u1B59\u1B6B-\u1B73\u1B80-\u1BF3\u1C00-\u1C37\u1C40-\u1C49\u1C4D-\u1C7D\u1CD0-\u1CD2\u1CD4-\u1CF6\u1CF8\u1CF9\u1D00-\u1DF5\u1DFC-\u1F15\u1F18-\u1F1D\u1F20-\u1F45\u1F48-\u1F4D\u1F50-\u1F57\u1F59\u1F5B\u1F5D\u1F5F-\u1F7D\u1F80-\u1FB4\u1FB6-\u1FBC\u1FBE\u1FC2-\u1FC4\u1FC6-\u1FCC\u1FD0-\u1FD3\u1FD6-\u1FDB\u1FE0-\u1FEC\u1FF2-\u1FF4\u1FF6-\u1FFC\u200C\u200D\u203F\u2040\u2054\u2071\u207F\u2090-\u209C\u20D0-\u20DC\u20E1\u20E5-\u20F0\u2102\u2107\u210A-\u2113\u2115\u2118-\u211D\u2124\u2126\u2128\u212A-\u2139\u213C-\u213F\u2145-\u2149\u214E\u2160-\u2188\u2C00-\u2C2E\u2C30-\u2C5E\u2C60-\u2CE4\u2CEB-\u2CF3\u2D00-\u2D25\u2D27\u2D2D\u2D30-\u2D67\u2D6F\u2D7F-\u2D96\u2DA0-\u2DA6\u2DA8-\u2DAE\u2DB0-\u2DB6\u2DB8-\u2DBE\u2DC0-\u2DC6\u2DC8-\u2DCE\u2DD0-\u2DD6\u2DD8-\u2DDE\u2DE0-\u2DFF\u3005-\u3007\u3021-\u302F\u3031-\u3035\u3038-\u303C\u3041-\u3096\u3099-\u309F\u30A1-\u30FA\u30FC-\u30FF\u3105-\u312D\u3131-\u318E\u31A0-\u31BA\u31F0-\u31FF\u3400-\u4DB5\u4E00-\u9FCC\uA000-\uA48C\uA4D0-\uA4FD\uA500-\uA60C\uA610-\uA62B\uA640-\uA66F\uA674-\uA67D\uA67F-\uA69D\uA69F-\uA6F1\uA717-\uA71F\uA722-\uA788\uA78B-\uA78E\uA790-\uA7AD\uA7B0\uA7B1\uA7F7-\uA827\uA840-\uA873\uA880-\uA8C4\uA8D0-\uA8D9\uA8E0-\uA8F7\uA8FB\uA900-\uA92D\uA930-\uA953\uA960-\uA97C\uA980-\uA9C0\uA9CF-\uA9D9\uA9E0-\uA9FE\uAA00-\uAA36\uAA40-\uAA4D\uAA50-\uAA59\uAA60-\uAA76\uAA7A-\uAAC2\uAADB-\uAADD\uAAE0-\uAAEF\uAAF2-\uAAF6\uAB01-\uAB06\uAB09-\uAB0E\uAB11-\uAB16\uAB20-\uAB26\uAB28-\uAB2E\uAB30-\uAB5A\uAB5C-\uAB5F\uAB64\uAB65\uABC0-\uABEA\uABEC\uABED\uABF0-\uABF9\uAC00-\uD7A3\uD7B0-\uD7C6\uD7CB-\uD7FB\uF900-\uFA6D\uFA70-\uFAD9\uFB00-\uFB06\uFB13-\uFB17\uFB1D-\uFB28\uFB2A-\uFB36\uFB38-\uFB3C\uFB3E\uFB40\uFB41\uFB43\uFB44\uFB46-\uFBB1\uFBD3-\uFD3D\uFD50-\uFD8F\uFD92-\uFDC7\uFDF0-\uFDFB\uFE00-\uFE0F\uFE20-\uFE2D\uFE33\uFE34\uFE4D-\uFE4F\uFE70-\uFE74\uFE76-\uFEFC\uFF10-\uFF19\uFF21-\uFF3A\uFF3F\uFF41-\uFF5A\uFF66-\uFFBE\uFFC2-\uFFC7\uFFCA-\uFFCF\uFFD2-\uFFD7\uFFDA-\uFFDC]|\uD800[\uDC00-\uDC0B\uDC0D-\uDC26\uDC28-\uDC3A\uDC3C\uDC3D\uDC3F-\uDC4D\uDC50-\uDC5D\uDC80-\uDCFA\uDD40-\uDD74\uDDFD\uDE80-\uDE9C\uDEA0-\uDED0\uDEE0\uDF00-\uDF1F\uDF30-\uDF4A\uDF50-\uDF7A\uDF80-\uDF9D\uDFA0-\uDFC3\uDFC8-\uDFCF\uDFD1-\uDFD5]|\uD801[\uDC00-\uDC9D\uDCA0-\uDCA9\uDD00-\uDD27\uDD30-\uDD63\uDE00-\uDF36\uDF40-\uDF55\uDF60-\uDF67]|\uD802[\uDC00-\uDC05\uDC08\uDC0A-\uDC35\uDC37\uDC38\uDC3C\uDC3F-\uDC55\uDC60-\uDC76\uDC80-\uDC9E\uDD00-\uDD15\uDD20-\uDD39\uDD80-\uDDB7\uDDBE\uDDBF\uDE00-\uDE03\uDE05\uDE06\uDE0C-\uDE13\uDE15-\uDE17\uDE19-\uDE33\uDE38-\uDE3A\uDE3F\uDE60-\uDE7C\uDE80-\uDE9C\uDEC0-\uDEC7\uDEC9-\uDEE6\uDF00-\uDF35\uDF40-\uDF55\uDF60-\uDF72\uDF80-\uDF91]|\uD803[\uDC00-\uDC48]|\uD804[\uDC00-\uDC46\uDC66-\uDC6F\uDC7F-\uDCBA\uDCD0-\uDCE8\uDCF0-\uDCF9\uDD00-\uDD34\uDD36-\uDD3F\uDD50-\uDD73\uDD76\uDD80-\uDDC4\uDDD0-\uDDDA\uDE00-\uDE11\uDE13-\uDE37\uDEB0-\uDEEA\uDEF0-\uDEF9\uDF01-\uDF03\uDF05-\uDF0C\uDF0F\uDF10\uDF13-\uDF28\uDF2A-\uDF30\uDF32\uDF33\uDF35-\uDF39\uDF3C-\uDF44\uDF47\uDF48\uDF4B-\uDF4D\uDF57\uDF5D-\uDF63\uDF66-\uDF6C\uDF70-\uDF74]|\uD805[\uDC80-\uDCC5\uDCC7\uDCD0-\uDCD9\uDD80-\uDDB5\uDDB8-\uDDC0\uDE00-\uDE40\uDE44\uDE50-\uDE59\uDE80-\uDEB7\uDEC0-\uDEC9]|\uD806[\uDCA0-\uDCE9\uDCFF\uDEC0-\uDEF8]|\uD808[\uDC00-\uDF98]|\uD809[\uDC00-\uDC6E]|[\uD80C\uD840-\uD868\uD86A-\uD86C][\uDC00-\uDFFF]|\uD80D[\uDC00-\uDC2E]|\uD81A[\uDC00-\uDE38\uDE40-\uDE5E\uDE60-\uDE69\uDED0-\uDEED\uDEF0-\uDEF4\uDF00-\uDF36\uDF40-\uDF43\uDF50-\uDF59\uDF63-\uDF77\uDF7D-\uDF8F]|\uD81B[\uDF00-\uDF44\uDF50-\uDF7E\uDF8F-\uDF9F]|\uD82C[\uDC00\uDC01]|\uD82F[\uDC00-\uDC6A\uDC70-\uDC7C\uDC80-\uDC88\uDC90-\uDC99\uDC9D\uDC9E]|\uD834[\uDD65-\uDD69\uDD6D-\uDD72\uDD7B-\uDD82\uDD85-\uDD8B\uDDAA-\uDDAD\uDE42-\uDE44]|\uD835[\uDC00-\uDC54\uDC56-\uDC9C\uDC9E\uDC9F\uDCA2\uDCA5\uDCA6\uDCA9-\uDCAC\uDCAE-\uDCB9\uDCBB\uDCBD-\uDCC3\uDCC5-\uDD05\uDD07-\uDD0A\uDD0D-\uDD14\uDD16-\uDD1C\uDD1E-\uDD39\uDD3B-\uDD3E\uDD40-\uDD44\uDD46\uDD4A-\uDD50\uDD52-\uDEA5\uDEA8-\uDEC0\uDEC2-\uDEDA\uDEDC-\uDEFA\uDEFC-\uDF14\uDF16-\uDF34\uDF36-\uDF4E\uDF50-\uDF6E\uDF70-\uDF88\uDF8A-\uDFA8\uDFAA-\uDFC2\uDFC4-\uDFCB\uDFCE-\uDFFF]|\uD83A[\uDC00-\uDCC4\uDCD0-\uDCD6]|\uD83B[\uDE00-\uDE03\uDE05-\uDE1F\uDE21\uDE22\uDE24\uDE27\uDE29-\uDE32\uDE34-\uDE37\uDE39\uDE3B\uDE42\uDE47\uDE49\uDE4B\uDE4D-\uDE4F\uDE51\uDE52\uDE54\uDE57\uDE59\uDE5B\uDE5D\uDE5F\uDE61\uDE62\uDE64\uDE67-\uDE6A\uDE6C-\uDE72\uDE74-\uDE77\uDE79-\uDE7C\uDE7E\uDE80-\uDE89\uDE8B-\uDE9B\uDEA1-\uDEA3\uDEA5-\uDEA9\uDEAB-\uDEBB]|\uD869[\uDC00-\uDED6\uDF00-\uDFFF]|\uD86D[\uDC00-\uDF34\uDF40-\uDFFF]|\uD86E[\uDC00-\uDC1D]|\uD87E[\uDC00-\uDE1D]|\uDB40[\uDD00-\uDDEF]/
    };

    // Ensure the condition is true, otherwise throw an error.
    // This is only to have a better contract semantic, i.e. another safety net
    // to catch a logic error. The condition shall be fulfilled in normal case.
    // Do NOT use this to enforce a certain condition on any user input.

    function assert(condition, message) {
        /* istanbul ignore if */
        if (!condition) {
            throw new Error('ASSERT: ' + message);
        }
    }

    function isDecimalDigit(ch) {
        return (ch >= 0x30 && ch <= 0x39);   // 0..9
    }

    function isHexDigit(ch) {
        return '0123456789abcdefABCDEF'.indexOf(ch) >= 0;
    }

    function isOctalDigit(ch) {
        return '01234567'.indexOf(ch) >= 0;
    }

    function octalToDecimal(ch) {
        // \0 is not octal escape sequence
        var octal = (ch !== '0'), code = '01234567'.indexOf(ch);

        if (index < length && isOctalDigit(source[index])) {
            octal = true;
            code = code * 8 + '01234567'.indexOf(source[index++]);

            // 3 digits are only allowed when string starts
            // with 0, 1, 2, 3
            if ('0123'.indexOf(ch) >= 0 &&
                    index < length &&
                    isOctalDigit(source[index])) {
                code = code * 8 + '01234567'.indexOf(source[index++]);
            }
        }

        return {
            code: code,
            octal: octal
        };
    }

    // ECMA-262 11.2 White Space

    function isWhiteSpace(ch) {
        return (ch === 0x20) || (ch === 0x09) || (ch === 0x0B) || (ch === 0x0C) || (ch === 0xA0) ||
            (ch >= 0x1680 && [0x1680, 0x180E, 0x2000, 0x2001, 0x2002, 0x2003, 0x2004, 0x2005, 0x2006, 0x2007, 0x2008, 0x2009, 0x200A, 0x202F, 0x205F, 0x3000, 0xFEFF].indexOf(ch) >= 0);
    }

    // ECMA-262 11.3 Line Terminators

    function isLineTerminator(ch) {
        return (ch === 0x0A) || (ch === 0x0D) || (ch === 0x2028) || (ch === 0x2029);
    }

    // ECMA-262 11.6 Identifier Names and Identifiers

    function fromCodePoint(cp) {
        return (cp < 0x10000) ? String.fromCharCode(cp) :
            String.fromCharCode(0xD800 + ((cp - 0x10000) >> 10)) +
            String.fromCharCode(0xDC00 + ((cp - 0x10000) & 1023));
    }

    function isIdentifierStart(ch) {
        return (ch === 0x24) || (ch === 0x5F) ||  // $ (dollar) and _ (underscore)
            (ch >= 0x41 && ch <= 0x5A) ||         // A..Z
            (ch >= 0x61 && ch <= 0x7A) ||         // a..z
            (ch === 0x5C) ||                      // \ (backslash)
            ((ch >= 0x80) && Regex.NonAsciiIdentifierStart.test(fromCodePoint(ch)));
    }

    function isIdentifierPart(ch) {
        return (ch === 0x24) || (ch === 0x5F) ||  // $ (dollar) and _ (underscore)
            (ch >= 0x41 && ch <= 0x5A) ||         // A..Z
            (ch >= 0x61 && ch <= 0x7A) ||         // a..z
            (ch >= 0x30 && ch <= 0x39) ||         // 0..9
            (ch === 0x5C) ||                      // \ (backslash)
            ((ch >= 0x80) && Regex.NonAsciiIdentifierPart.test(fromCodePoint(ch)));
    }

    // ECMA-262 11.6.2.2 Future Reserved Words

    function isFutureReservedWord(id) {
        switch (id) {
        case 'enum':
        case 'export':
        case 'import':
        case 'super':
            return true;
        default:
            return false;
        }
    }

    function isStrictModeReservedWord(id) {
        switch (id) {
        case 'implements':
        case 'interface':
        case 'package':
        case 'private':
        case 'protected':
        case 'public':
        case 'static':
        case 'yield':
        case 'let':
            return true;
        default:
            return false;
        }
    }

    function isRestrictedWord(id) {
        return id === 'eval' || id === 'arguments';
    }

    // ECMA-262 11.6.2.1 Keywords

    function isKeyword(id) {
        switch (id.length) {
        case 2:
            return (id === 'if') || (id === 'in') || (id === 'do');
        case 3:
            return (id === 'var') || (id === 'for') || (id === 'new') ||
                (id === 'try') || (id === 'let');
        case 4:
            return (id === 'this') || (id === 'else') || (id === 'case') ||
                (id === 'void') || (id === 'with') || (id === 'enum');
        case 5:
            return (id === 'while') || (id === 'break') || (id === 'catch') ||
                (id === 'throw') || (id === 'const') || (id === 'yield') ||
                (id === 'class') || (id === 'super');
        case 6:
            return (id === 'return') || (id === 'typeof') || (id === 'delete') ||
                (id === 'switch') || (id === 'export') || (id === 'import');
        case 7:
            return (id === 'default') || (id === 'finally') || (id === 'extends');
        case 8:
            return (id === 'function') || (id === 'continue') || (id === 'debugger');
        case 10:
            return (id === 'instanceof');
        default:
            return false;
        }
    }

    // ECMA-262 11.4 Comments

    function addComment(type, value, start, end, loc) {
        var comment;

        assert(typeof start === 'number', 'Comment must have valid position');

        state.lastCommentStart = start;

        comment = {
            type: type,
            value: value
        };
        if (extra.range) {
            comment.range = [start, end];
        }
        if (extra.loc) {
            comment.loc = loc;
        }
        extra.comments.push(comment);
        if (extra.attachComment) {
            extra.leadingComments.push(comment);
            extra.trailingComments.push(comment);
        }
        if (extra.tokenize) {
            comment.type = comment.type + 'Comment';
            if (extra.delegate) {
                comment = extra.delegate(comment);
            }
            extra.tokens.push(comment);
        }
    }

    function skipSingleLineComment(offset) {
        var start, loc, ch, comment;

        start = index - offset;
        loc = {
            start: {
                line: lineNumber,
                column: index - lineStart - offset
            }
        };

        while (index < length) {
            ch = source.charCodeAt(index);
            ++index;
            if (isLineTerminator(ch)) {
                hasLineTerminator = true;
                if (extra.comments) {
                    comment = source.slice(start + offset, index - 1);
                    loc.end = {
                        line: lineNumber,
                        column: index - lineStart - 1
                    };
                    addComment('Line', comment, start, index - 1, loc);
                }
                if (ch === 13 && source.charCodeAt(index) === 10) {
                    ++index;
                }
                ++lineNumber;
                lineStart = index;
                return;
            }
        }

        if (extra.comments) {
            comment = source.slice(start + offset, index);
            loc.end = {
                line: lineNumber,
                column: index - lineStart
            };
            addComment('Line', comment, start, index, loc);
        }
    }

    function skipMultiLineComment() {
        var start, loc, ch, comment;

        if (extra.comments) {
            start = index - 2;
            loc = {
                start: {
                    line: lineNumber,
                    column: index - lineStart - 2
                }
            };
        }

        while (index < length) {
            ch = source.charCodeAt(index);
            if (isLineTerminator(ch)) {
                if (ch === 0x0D && source.charCodeAt(index + 1) === 0x0A) {
                    ++index;
                }
                hasLineTerminator = true;
                ++lineNumber;
                ++index;
                lineStart = index;
            } else if (ch === 0x2A) {
                // Block comment ends with '*/'.
                if (source.charCodeAt(index + 1) === 0x2F) {
                    ++index;
                    ++index;
                    if (extra.comments) {
                        comment = source.slice(start + 2, index - 2);
                        loc.end = {
                            line: lineNumber,
                            column: index - lineStart
                        };
                        addComment('Block', comment, start, index, loc);
                    }
                    return;
                }
                ++index;
            } else {
                ++index;
            }
        }

        // Ran off the end of the file - the whole thing is a comment
        if (extra.comments) {
            loc.end = {
                line: lineNumber,
                column: index - lineStart
            };
            comment = source.slice(start + 2, index);
            addComment('Block', comment, start, index, loc);
        }
        tolerateUnexpectedToken();
    }

    function skipComment() {
        var ch, start;
        hasLineTerminator = false;

        start = (index === 0);
        while (index < length) {
            ch = source.charCodeAt(index);

            if (isWhiteSpace(ch)) {
                ++index;
            } else if (isLineTerminator(ch)) {
                hasLineTerminator = true;
                ++index;
                if (ch === 0x0D && source.charCodeAt(index) === 0x0A) {
                    ++index;
                }
                ++lineNumber;
                lineStart = index;
                start = true;
            } else if (ch === 0x2F) { // U+002F is '/'
                ch = source.charCodeAt(index + 1);
                if (ch === 0x2F) {
                    ++index;
                    ++index;
                    skipSingleLineComment(2);
                    start = true;
                } else if (ch === 0x2A) {  // U+002A is '*'
                    ++index;
                    ++index;
                    skipMultiLineComment();
                } else {
                    break;
                }
            } else if (start && ch === 0x2D) { // U+002D is '-'
                // U+003E is '>'
                if ((source.charCodeAt(index + 1) === 0x2D) && (source.charCodeAt(index + 2) === 0x3E)) {
                    // '-->' is a single-line comment
                    index += 3;
                    skipSingleLineComment(3);
                } else {
                    break;
                }
            } else if (ch === 0x3C) { // U+003C is '<'
                if (source.slice(index + 1, index + 4) === '!--') {
                    ++index; // `<`
                    ++index; // `!`
                    ++index; // `-`
                    ++index; // `-`
                    skipSingleLineComment(4);
                } else {
                    break;
                }
            } else {
                break;
            }
        }
    }

    function scanHexEscape(prefix) {
        var i, len, ch, code = 0;

        len = (prefix === 'u') ? 4 : 2;
        for (i = 0; i < len; ++i) {
            if (index < length && isHexDigit(source[index])) {
                ch = source[index++];
                code = code * 16 + '0123456789abcdef'.indexOf(ch.toLowerCase());
            } else {
                return '';
            }
        }
        return String.fromCharCode(code);
    }

    function scanUnicodeCodePointEscape() {
        var ch, code;

        ch = source[index];
        code = 0;

        // At least, one hex digit is required.
        if (ch === '}') {
            throwUnexpectedToken();
        }

        while (index < length) {
            ch = source[index++];
            if (!isHexDigit(ch)) {
                break;
            }
            code = code * 16 + '0123456789abcdef'.indexOf(ch.toLowerCase());
        }

        if (code > 0x10FFFF || ch !== '}') {
            throwUnexpectedToken();
        }

        return fromCodePoint(code);
    }

    function codePointAt(i) {
        var cp, first, second;

        cp = source.charCodeAt(i);
        if (cp >= 0xD800 && cp <= 0xDBFF) {
            second = source.charCodeAt(i + 1);
            if (second >= 0xDC00 && second <= 0xDFFF) {
                first = cp;
                cp = (first - 0xD800) * 0x400 + second - 0xDC00 + 0x10000;
            }
        }

        return cp;
    }

    function getComplexIdentifier() {
        var cp, ch, id;

        cp = codePointAt(index);
        id = fromCodePoint(cp);
        index += id.length;

        // '\u' (U+005C, U+0075) denotes an escaped character.
        if (cp === 0x5C) {
            if (source.charCodeAt(index) !== 0x75) {
                throwUnexpectedToken();
            }
            ++index;
            if (source[index] === '{') {
                ++index;
                ch = scanUnicodeCodePointEscape();
            } else {
                ch = scanHexEscape('u');
                cp = ch.charCodeAt(0);
                if (!ch || ch === '\\' || !isIdentifierStart(cp)) {
                    throwUnexpectedToken();
                }
            }
            id = ch;
        }

        while (index < length) {
            cp = codePointAt(index);
            if (!isIdentifierPart(cp)) {
                break;
            }
            ch = fromCodePoint(cp);
            id += ch;
            index += ch.length;

            // '\u' (U+005C, U+0075) denotes an escaped character.
            if (cp === 0x5C) {
                id = id.substr(0, id.length - 1);
                if (source.charCodeAt(index) !== 0x75) {
                    throwUnexpectedToken();
                }
                ++index;
                if (source[index] === '{') {
                    ++index;
                    ch = scanUnicodeCodePointEscape();
                } else {
                    ch = scanHexEscape('u');
                    cp = ch.charCodeAt(0);
                    if (!ch || ch === '\\' || !isIdentifierPart(cp)) {
                        throwUnexpectedToken();
                    }
                }
                id += ch;
            }
        }

        return id;
    }

    function getIdentifier() {
        var start, ch;

        start = index++;
        while (index < length) {
            ch = source.charCodeAt(index);
            if (ch === 0x5C) {
                // Blackslash (U+005C) marks Unicode escape sequence.
                index = start;
                return getComplexIdentifier();
            } else if (ch >= 0xD800 && ch < 0xDFFF) {
                // Need to handle surrogate pairs.
                index = start;
                return getComplexIdentifier();
            }
            if (isIdentifierPart(ch)) {
                ++index;
            } else {
                break;
            }
        }

        return source.slice(start, index);
    }

    function scanIdentifier() {
        var start, id, type;

        start = index;

        // Backslash (U+005C) starts an escaped character.
        id = (source.charCodeAt(index) === 0x5C) ? getComplexIdentifier() : getIdentifier();

        // There is no keyword or literal with only one character.
        // Thus, it must be an identifier.
        if (id.length === 1) {
            type = Token.Identifier;
        } else if (isKeyword(id)) {
            type = Token.Keyword;
        } else if (id === 'null') {
            type = Token.NullLiteral;
        } else if (id === 'true' || id === 'false') {
            type = Token.BooleanLiteral;
        } else {
            type = Token.Identifier;
        }

        return {
            type: type,
            value: id,
            lineNumber: lineNumber,
            lineStart: lineStart,
            start: start,
            end: index
        };
    }


    // ECMA-262 11.7 Punctuators

    function scanPunctuator() {
        var token, str;

        token = {
            type: Token.Punctuator,
            value: '',
            lineNumber: lineNumber,
            lineStart: lineStart,
            start: index,
            end: index
        };

        // Check for most common single-character punctuators.
        str = source[index];
        switch (str) {

        case '(':
            if (extra.tokenize) {
                extra.openParenToken = extra.tokenValues.length;
            }
            ++index;
            break;

        case '{':
            if (extra.tokenize) {
                extra.openCurlyToken = extra.tokenValues.length;
            }
            state.curlyStack.push('{');
            ++index;
            break;

        case '.':
            ++index;
            if (source[index] === '.' && source[index + 1] === '.') {
                // Spread operator: ...
                index += 2;
                str = '...';
            }
            break;

        case '}':
            ++index;
            state.curlyStack.pop();
            break;
        case ')':
        case ';':
        case ',':
        case '[':
        case ']':
        case ':':
        case '?':
        case '~':
            ++index;
            break;

        default:
            // 4-character punctuator.
            str = source.substr(index, 4);
            if (str === '>>>=') {
                index += 4;
            } else {

                // 3-character punctuators.
                str = str.substr(0, 3);
                if (str === '===' || str === '!==' || str === '>>>' ||
                    str === '<<=' || str === '>>=') {
                    index += 3;
                } else {

                    // 2-character punctuators.
                    str = str.substr(0, 2);
                    if (str === '&&' || str === '||' || str === '==' || str === '!=' ||
                        str === '+=' || str === '-=' || str === '*=' || str === '/=' ||
                        str === '++' || str === '--' || str === '<<' || str === '>>' ||
                        str === '&=' || str === '|=' || str === '^=' || str === '%=' ||
                        str === '<=' || str === '>=' || str === '=>') {
                        index += 2;
                    } else {

                        // 1-character punctuators.
                        str = source[index];
                        if ('<>=!+-*%&|^/'.indexOf(str) >= 0) {
                            ++index;
                        }
                    }
                }
            }
        }

        if (index === token.start) {
            throwUnexpectedToken();
        }

        token.end = index;
        token.value = str;
        return token;
    }

    // ECMA-262 11.8.3 Numeric Literals

    function scanHexLiteral(start) {
        var number = '';

        while (index < length) {
            if (!isHexDigit(source[index])) {
                break;
            }
            number += source[index++];
        }

        if (number.length === 0) {
            throwUnexpectedToken();
        }

        if (isIdentifierStart(source.charCodeAt(index))) {
            throwUnexpectedToken();
        }

        return {
            type: Token.NumericLiteral,
            value: parseInt('0x' + number, 16),
            lineNumber: lineNumber,
            lineStart: lineStart,
            start: start,
            end: index
        };
    }

    function scanBinaryLiteral(start) {
        var ch, number;

        number = '';

        while (index < length) {
            ch = source[index];
            if (ch !== '0' && ch !== '1') {
                break;
            }
            number += source[index++];
        }

        if (number.length === 0) {
            // only 0b or 0B
            throwUnexpectedToken();
        }

        if (index < length) {
            ch = source.charCodeAt(index);
            /* istanbul ignore else */
            if (isIdentifierStart(ch) || isDecimalDigit(ch)) {
                throwUnexpectedToken();
            }
        }

        return {
            type: Token.NumericLiteral,
            value: parseInt(number, 2),
            lineNumber: lineNumber,
            lineStart: lineStart,
            start: start,
            end: index
        };
    }

    function scanOctalLiteral(prefix, start) {
        var number, octal;

        if (isOctalDigit(prefix)) {
            octal = true;
            number = '0' + source[index++];
        } else {
            octal = false;
            ++index;
            number = '';
        }

        while (index < length) {
            if (!isOctalDigit(source[index])) {
                break;
            }
            number += source[index++];
        }

        if (!octal && number.length === 0) {
            // only 0o or 0O
            throwUnexpectedToken();
        }

        if (isIdentifierStart(source.charCodeAt(index)) || isDecimalDigit(source.charCodeAt(index))) {
            throwUnexpectedToken();
        }

        return {
            type: Token.NumericLiteral,
            value: parseInt(number, 8),
            octal: octal,
            lineNumber: lineNumber,
            lineStart: lineStart,
            start: start,
            end: index
        };
    }

    function isImplicitOctalLiteral() {
        var i, ch;

        // Implicit octal, unless there is a non-octal digit.
        // (Annex B.1.1 on Numeric Literals)
        for (i = index + 1; i < length; ++i) {
            ch = source[i];
            if (ch === '8' || ch === '9') {
                return false;
            }
            if (!isOctalDigit(ch)) {
                return true;
            }
        }

        return true;
    }

    function scanNumericLiteral() {
        var number, start, ch;

        ch = source[index];
        assert(isDecimalDigit(ch.charCodeAt(0)) || (ch === '.'),
            'Numeric literal must start with a decimal digit or a decimal point');

        start = index;
        number = '';
        if (ch !== '.') {
            number = source[index++];
            ch = source[index];

            // Hex number starts with '0x'.
            // Octal number starts with '0'.
            // Octal number in ES6 starts with '0o'.
            // Binary number in ES6 starts with '0b'.
            if (number === '0') {
                if (ch === 'x' || ch === 'X') {
                    ++index;
                    return scanHexLiteral(start);
                }
                if (ch === 'b' || ch === 'B') {
                    ++index;
                    return scanBinaryLiteral(start);
                }
                if (ch === 'o' || ch === 'O') {
                    return scanOctalLiteral(ch, start);
                }

                if (isOctalDigit(ch)) {
                    if (isImplicitOctalLiteral()) {
                        return scanOctalLiteral(ch, start);
                    }
                }
            }

            while (isDecimalDigit(source.charCodeAt(index))) {
                number += source[index++];
            }
            ch = source[index];
        }

        if (ch === '.') {
            number += source[index++];
            while (isDecimalDigit(source.charCodeAt(index))) {
                number += source[index++];
            }
            ch = source[index];
        }

        if (ch === 'e' || ch === 'E') {
            number += source[index++];

            ch = source[index];
            if (ch === '+' || ch === '-') {
                number += source[index++];
            }
            if (isDecimalDigit(source.charCodeAt(index))) {
                while (isDecimalDigit(source.charCodeAt(index))) {
                    number += source[index++];
                }
            } else {
                throwUnexpectedToken();
            }
        }

        if (isIdentifierStart(source.charCodeAt(index))) {
            throwUnexpectedToken();
        }

        return {
            type: Token.NumericLiteral,
            value: parseFloat(number),
            lineNumber: lineNumber,
            lineStart: lineStart,
            start: start,
            end: index
        };
    }

    // ECMA-262 11.8.4 String Literals

    function scanStringLiteral() {
        var str = '', quote, start, ch, unescaped, octToDec, octal = false;

        quote = source[index];
        assert((quote === '\'' || quote === '"'),
            'String literal must starts with a quote');

        start = index;
        ++index;

        while (index < length) {
            ch = source[index++];

            if (ch === quote) {
                quote = '';
                break;
            } else if (ch === '\\') {
                ch = source[index++];
                if (!ch || !isLineTerminator(ch.charCodeAt(0))) {
                    switch (ch) {
                    case 'u':
                    case 'x':
                        if (source[index] === '{') {
                            ++index;
                            str += scanUnicodeCodePointEscape();
                        } else {
                            unescaped = scanHexEscape(ch);
                            if (!unescaped) {
                                throw throwUnexpectedToken();
                            }
                            str += unescaped;
                        }
                        break;
                    case 'n':
                        str += '\n';
                        break;
                    case 'r':
                        str += '\r';
                        break;
                    case 't':
                        str += '\t';
                        break;
                    case 'b':
                        str += '\b';
                        break;
                    case 'f':
                        str += '\f';
                        break;
                    case 'v':
                        str += '\x0B';
                        break;
                    case '8':
                    case '9':
                        str += ch;
                        tolerateUnexpectedToken();
                        break;

                    default:
                        if (isOctalDigit(ch)) {
                            octToDec = octalToDecimal(ch);

                            octal = octToDec.octal || octal;
                            str += String.fromCharCode(octToDec.code);
                        } else {
                            str += ch;
                        }
                        break;
                    }
                } else {
                    ++lineNumber;
                    if (ch === '\r' && source[index] === '\n') {
                        ++index;
                    }
                    lineStart = index;
                }
            } else if (isLineTerminator(ch.charCodeAt(0))) {
                break;
            } else {
                str += ch;
            }
        }

        if (quote !== '') {
            index = start;
            throwUnexpectedToken();
        }

        return {
            type: Token.StringLiteral,
            value: str,
            octal: octal,
            lineNumber: startLineNumber,
            lineStart: startLineStart,
            start: start,
            end: index
        };
    }

    // ECMA-262 11.8.6 Template Literal Lexical Components

    function scanTemplate() {
        var cooked = '', ch, start, rawOffset, terminated, head, tail, restore, unescaped;

        terminated = false;
        tail = false;
        start = index;
        head = (source[index] === '`');
        rawOffset = 2;

        ++index;

        while (index < length) {
            ch = source[index++];
            if (ch === '`') {
                rawOffset = 1;
                tail = true;
                terminated = true;
                break;
            } else if (ch === '$') {
                if (source[index] === '{') {
                    state.curlyStack.push('${');
                    ++index;
                    terminated = true;
                    break;
                }
                cooked += ch;
            } else if (ch === '\\') {
                ch = source[index++];
                if (!isLineTerminator(ch.charCodeAt(0))) {
                    switch (ch) {
                    case 'n':
                        cooked += '\n';
                        break;
                    case 'r':
                        cooked += '\r';
                        break;
                    case 't':
                        cooked += '\t';
                        break;
                    case 'u':
                    case 'x':
                        if (source[index] === '{') {
                            ++index;
                            cooked += scanUnicodeCodePointEscape();
                        } else {
                            restore = index;
                            unescaped = scanHexEscape(ch);
                            if (unescaped) {
                                cooked += unescaped;
                            } else {
                                index = restore;
                                cooked += ch;
                            }
                        }
                        break;
                    case 'b':
                        cooked += '\b';
                        break;
                    case 'f':
                        cooked += '\f';
                        break;
                    case 'v':
                        cooked += '\v';
                        break;

                    default:
                        if (ch === '0') {
                            if (isDecimalDigit(source.charCodeAt(index))) {
                                // Illegal: \01 \02 and so on
                                throwError(Messages.TemplateOctalLiteral);
                            }
                            cooked += '\0';
                        } else if (isOctalDigit(ch)) {
                            // Illegal: \1 \2
                            throwError(Messages.TemplateOctalLiteral);
                        } else {
                            cooked += ch;
                        }
                        break;
                    }
                } else {
                    ++lineNumber;
                    if (ch === '\r' && source[index] === '\n') {
                        ++index;
                    }
                    lineStart = index;
                }
            } else if (isLineTerminator(ch.charCodeAt(0))) {
                ++lineNumber;
                if (ch === '\r' && source[index] === '\n') {
                    ++index;
                }
                lineStart = index;
                cooked += '\n';
            } else {
                cooked += ch;
            }
        }

        if (!terminated) {
            throwUnexpectedToken();
        }

        if (!head) {
            state.curlyStack.pop();
        }

        return {
            type: Token.Template,
            value: {
                cooked: cooked,
                raw: source.slice(start + 1, index - rawOffset)
            },
            head: head,
            tail: tail,
            lineNumber: lineNumber,
            lineStart: lineStart,
            start: start,
            end: index
        };
    }

    // ECMA-262 11.8.5 Regular Expression Literals

    function testRegExp(pattern, flags) {
        // The BMP character to use as a replacement for astral symbols when
        // translating an ES6 "u"-flagged pattern to an ES5-compatible
        // approximation.
        // Note: replacing with '\uFFFF' enables false positives in unlikely
        // scenarios. For example, `[\u{1044f}-\u{10440}]` is an invalid
        // pattern that would not be detected by this substitution.
        var astralSubstitute = '\uFFFF',
            tmp = pattern;

        if (flags.indexOf('u') >= 0) {
            tmp = tmp
                // Replace every Unicode escape sequence with the equivalent
                // BMP character or a constant ASCII code point in the case of
                // astral symbols. (See the above note on `astralSubstitute`
                // for more information.)
                .replace(/\\u\{([0-9a-fA-F]+)\}|\\u([a-fA-F0-9]{4})/g, function ($0, $1, $2) {
                    var codePoint = parseInt($1 || $2, 16);
                    if (codePoint > 0x10FFFF) {
                        throwUnexpectedToken(null, Messages.InvalidRegExp);
                    }
                    if (codePoint <= 0xFFFF) {
                        return String.fromCharCode(codePoint);
                    }
                    return astralSubstitute;
                })
                // Replace each paired surrogate with a single ASCII symbol to
                // avoid throwing on regular expressions that are only valid in
                // combination with the "u" flag.
                .replace(
                    /[\uD800-\uDBFF][\uDC00-\uDFFF]/g,
                    astralSubstitute
                );
        }

        // First, detect invalid regular expressions.
        try {
            RegExp(tmp);
        } catch (e) {
            throwUnexpectedToken(null, Messages.InvalidRegExp);
        }

        // Return a regular expression object for this pattern-flag pair, or
        // `null` in case the current environment doesn't support the flags it
        // uses.
        try {
            return new RegExp(pattern, flags);
        } catch (exception) {
            /* istanbul ignore next */
            return null;
        }
    }

    function scanRegExpBody() {
        var ch, str, classMarker, terminated, body;

        ch = source[index];
        assert(ch === '/', 'Regular expression literal must start with a slash');
        str = source[index++];

        classMarker = false;
        terminated = false;
        while (index < length) {
            ch = source[index++];
            str += ch;
            if (ch === '\\') {
                ch = source[index++];
                // ECMA-262 7.8.5
                if (isLineTerminator(ch.charCodeAt(0))) {
                    throwUnexpectedToken(null, Messages.UnterminatedRegExp);
                }
                str += ch;
            } else if (isLineTerminator(ch.charCodeAt(0))) {
                throwUnexpectedToken(null, Messages.UnterminatedRegExp);
            } else if (classMarker) {
                if (ch === ']') {
                    classMarker = false;
                }
            } else {
                if (ch === '/') {
                    terminated = true;
                    break;
                } else if (ch === '[') {
                    classMarker = true;
                }
            }
        }

        if (!terminated) {
            throwUnexpectedToken(null, Messages.UnterminatedRegExp);
        }

        // Exclude leading and trailing slash.
        body = str.substr(1, str.length - 2);
        return {
            value: body,
            literal: str
        };
    }

    function scanRegExpFlags() {
        var ch, str, flags, restore;

        str = '';
        flags = '';
        while (index < length) {
            ch = source[index];
            if (!isIdentifierPart(ch.charCodeAt(0))) {
                break;
            }

            ++index;
            if (ch === '\\' && index < length) {
                ch = source[index];
                if (ch === 'u') {
                    ++index;
                    restore = index;
                    ch = scanHexEscape('u');
                    if (ch) {
                        flags += ch;
                        for (str += '\\u'; restore < index; ++restore) {
                            str += source[restore];
                        }
                    } else {
                        index = restore;
                        flags += 'u';
                        str += '\\u';
                    }
                    tolerateUnexpectedToken();
                } else {
                    str += '\\';
                    tolerateUnexpectedToken();
                }
            } else {
                flags += ch;
                str += ch;
            }
        }

        return {
            value: flags,
            literal: str
        };
    }

    function scanRegExp() {
        var start, body, flags, value;
        scanning = true;

        lookahead = null;
        skipComment();
        start = index;

        body = scanRegExpBody();
        flags = scanRegExpFlags();
        value = testRegExp(body.value, flags.value);
        scanning = false;
        if (extra.tokenize) {
            return {
                type: Token.RegularExpression,
                value: value,
                regex: {
                    pattern: body.value,
                    flags: flags.value
                },
                lineNumber: lineNumber,
                lineStart: lineStart,
                start: start,
                end: index
            };
        }

        return {
            literal: body.literal + flags.literal,
            value: value,
            regex: {
                pattern: body.value,
                flags: flags.value
            },
            start: start,
            end: index
        };
    }

    function collectRegex() {
        var pos, loc, regex, token;

        skipComment();

        pos = index;
        loc = {
            start: {
                line: lineNumber,
                column: index - lineStart
            }
        };

        regex = scanRegExp();

        loc.end = {
            line: lineNumber,
            column: index - lineStart
        };

        /* istanbul ignore next */
        if (!extra.tokenize) {
            // Pop the previous token, which is likely '/' or '/='
            if (extra.tokens.length > 0) {
                token = extra.tokens[extra.tokens.length - 1];
                if (token.range[0] === pos && token.type === 'Punctuator') {
                    if (token.value === '/' || token.value === '/=') {
                        extra.tokens.pop();
                    }
                }
            }

            extra.tokens.push({
                type: 'RegularExpression',
                value: regex.literal,
                regex: regex.regex,
                range: [pos, index],
                loc: loc
            });
        }

        return regex;
    }

    function isIdentifierName(token) {
        return token.type === Token.Identifier ||
            token.type === Token.Keyword ||
            token.type === Token.BooleanLiteral ||
            token.type === Token.NullLiteral;
    }

    // Using the following algorithm:
    // https://github.com/mozilla/sweet.js/wiki/design

    function advanceSlash() {
        var regex, previous, check;

        function testKeyword(value) {
            return value && (value.length > 1) && (value[0] >= 'a') && (value[0] <= 'z');
        }

        previous = extra.tokenValues[extra.tokenValues.length - 1];
        regex = (previous !== null);

        switch (previous) {
        case 'this':
        case ']':
            regex = false;
            break;

        case ')':
            check = extra.tokenValues[extra.openParenToken - 1];
            regex = (check === 'if' || check === 'while' || check === 'for' || check === 'with');
            break;

        case '}':
            // Dividing a function by anything makes little sense,
            // but we have to check for that.
            regex = false;
            if (testKeyword(extra.tokenValues[extra.openCurlyToken - 3])) {
                // Anonymous function, e.g. function(){} /42
                check = extra.tokenValues[extra.openCurlyToken - 4];
                regex = check ? (FnExprTokens.indexOf(check) < 0) : false;
            } else if (testKeyword(extra.tokenValues[extra.openCurlyToken - 4])) {
                // Named function, e.g. function f(){} /42/
                check = extra.tokenValues[extra.openCurlyToken - 5];
                regex = check ? (FnExprTokens.indexOf(check) < 0) : true;
            }
        }

        return regex ? collectRegex() : scanPunctuator();
    }

    function advance() {
        var cp, token;

        if (index >= length) {
            return {
                type: Token.EOF,
                lineNumber: lineNumber,
                lineStart: lineStart,
                start: index,
                end: index
            };
        }

        cp = source.charCodeAt(index);

        if (isIdentifierStart(cp)) {
            token = scanIdentifier();
            if (strict && isStrictModeReservedWord(token.value)) {
                token.type = Token.Keyword;
            }
            return token;
        }

        // Very common: ( and ) and ;
        if (cp === 0x28 || cp === 0x29 || cp === 0x3B) {
            return scanPunctuator();
        }

        // String literal starts with single quote (U+0027) or double quote (U+0022).
        if (cp === 0x27 || cp === 0x22) {
            return scanStringLiteral();
        }

        // Dot (.) U+002E can also start a floating-point number, hence the need
        // to check the next character.
        if (cp === 0x2E) {
            if (isDecimalDigit(source.charCodeAt(index + 1))) {
                return scanNumericLiteral();
            }
            return scanPunctuator();
        }

        if (isDecimalDigit(cp)) {
            return scanNumericLiteral();
        }

        // Slash (/) U+002F can also start a regex.
        if (extra.tokenize && cp === 0x2F) {
            return advanceSlash();
        }

        // Template literals start with ` (U+0060) for template head
        // or } (U+007D) for template middle or template tail.
        if (cp === 0x60 || (cp === 0x7D && state.curlyStack[state.curlyStack.length - 1] === '${')) {
            return scanTemplate();
        }

        // Possible identifier start in a surrogate pair.
        if (cp >= 0xD800 && cp < 0xDFFF) {
            cp = codePointAt(index);
            if (isIdentifierStart(cp)) {
                return scanIdentifier();
            }
        }

        return scanPunctuator();
    }

    function collectToken() {
        var loc, token, value, entry;

        loc = {
            start: {
                line: lineNumber,
                column: index - lineStart
            }
        };

        token = advance();
        loc.end = {
            line: lineNumber,
            column: index - lineStart
        };

        if (token.type !== Token.EOF) {
            value = source.slice(token.start, token.end);
            entry = {
                type: TokenName[token.type],
                value: value,
                range: [token.start, token.end],
                loc: loc
            };
            if (token.regex) {
                entry.regex = {
                    pattern: token.regex.pattern,
                    flags: token.regex.flags
                };
            }
            if (extra.tokenValues) {
                extra.tokenValues.push((entry.type === 'Punctuator' || entry.type === 'Keyword') ? entry.value : null);
            }
            if (extra.tokenize) {
                if (!extra.range) {
                    delete entry.range;
                }
                if (!extra.loc) {
                    delete entry.loc;
                }
                if (extra.delegate) {
                    entry = extra.delegate(entry);
                }
            }
            extra.tokens.push(entry);
        }

        return token;
    }

    function lex() {
        var token;
        scanning = true;

        lastIndex = index;
        lastLineNumber = lineNumber;
        lastLineStart = lineStart;

        skipComment();

        token = lookahead;

        startIndex = index;
        startLineNumber = lineNumber;
        startLineStart = lineStart;

        lookahead = (typeof extra.tokens !== 'undefined') ? collectToken() : advance();
        scanning = false;
        return token;
    }

    function peek() {
        scanning = true;

        skipComment();

        lastIndex = index;
        lastLineNumber = lineNumber;
        lastLineStart = lineStart;

        startIndex = index;
        startLineNumber = lineNumber;
        startLineStart = lineStart;

        lookahead = (typeof extra.tokens !== 'undefined') ? collectToken() : advance();
        scanning = false;
    }

    function Position() {
        this.line = startLineNumber;
        this.column = startIndex - startLineStart;
    }

    function SourceLocation() {
        this.start = new Position();
        this.end = null;
    }

    function WrappingSourceLocation(startToken) {
        this.start = {
            line: startToken.lineNumber,
            column: startToken.start - startToken.lineStart
        };
        this.end = null;
    }

    function Node() {
        if (extra.range) {
            this.range = [startIndex, 0];
        }
        if (extra.loc) {
            this.loc = new SourceLocation();
        }
    }

    function WrappingNode(startToken) {
        if (extra.range) {
            this.range = [startToken.start, 0];
        }
        if (extra.loc) {
            this.loc = new WrappingSourceLocation(startToken);
        }
    }

    WrappingNode.prototype = Node.prototype = {

        processComment: function () {
            var lastChild,
                innerComments,
                leadingComments,
                trailingComments,
                bottomRight = extra.bottomRightStack,
                i,
                comment,
                last = bottomRight[bottomRight.length - 1];

            if (this.type === Syntax.Program) {
                if (this.body.length > 0) {
                    return;
                }
            }
            /**
             * patch innnerComments for properties empty block
             * `function a() {/** comments **\/}`
             */

            if (this.type === Syntax.BlockStatement && this.body.length === 0) {
                innerComments = [];
                for (i = extra.leadingComments.length - 1; i >= 0; --i) {
                    comment = extra.leadingComments[i];
                    if (this.range[1] >= comment.range[1]) {
                        innerComments.unshift(comment);
                        extra.leadingComments.splice(i, 1);
                        extra.trailingComments.splice(i, 1);
                    }
                }
                if (innerComments.length) {
                    this.innerComments = innerComments;
                    //bottomRight.push(this);
                    return;
                }
            }

            if (extra.trailingComments.length > 0) {
                trailingComments = [];
                for (i = extra.trailingComments.length - 1; i >= 0; --i) {
                    comment = extra.trailingComments[i];
                    if (comment.range[0] >= this.range[1]) {
                        trailingComments.unshift(comment);
                        extra.trailingComments.splice(i, 1);
                    }
                }
                extra.trailingComments = [];
            } else {
                if (last && last.trailingComments && last.trailingComments[0].range[0] >= this.range[1]) {
                    trailingComments = last.trailingComments;
                    delete last.trailingComments;
                }
            }

            // Eating the stack.
            while (last && last.range[0] >= this.range[0]) {
                lastChild = bottomRight.pop();
                last = bottomRight[bottomRight.length - 1];
            }

            if (lastChild) {
                if (lastChild.leadingComments) {
                    leadingComments = [];
                    for (i = lastChild.leadingComments.length - 1; i >= 0; --i) {
                        comment = lastChild.leadingComments[i];
                        if (comment.range[1] <= this.range[0]) {
                            leadingComments.unshift(comment);
                            lastChild.leadingComments.splice(i, 1);
                        }
                    }

                    if (!lastChild.leadingComments.length) {
                        lastChild.leadingComments = undefined;
                    }
                }
            } else if (extra.leadingComments.length > 0) {
                leadingComments = [];
                for (i = extra.leadingComments.length - 1; i >= 0; --i) {
                    comment = extra.leadingComments[i];
                    if (comment.range[1] <= this.range[0]) {
                        leadingComments.unshift(comment);
                        extra.leadingComments.splice(i, 1);
                    }
                }
            }


            if (leadingComments && leadingComments.length > 0) {
                this.leadingComments = leadingComments;
            }
            if (trailingComments && trailingComments.length > 0) {
                this.trailingComments = trailingComments;
            }

            bottomRight.push(this);
        },

        finish: function () {
            if (extra.range) {
                this.range[1] = lastIndex;
            }
            if (extra.loc) {
                this.loc.end = {
                    line: lastLineNumber,
                    column: lastIndex - lastLineStart
                };
                if (extra.source) {
                    this.loc.source = extra.source;
                }
            }

            if (extra.attachComment) {
                this.processComment();
            }
        },

        finishArrayExpression: function (elements) {
            this.type = Syntax.ArrayExpression;
            this.elements = elements;
            this.finish();
            return this;
        },

        finishArrayPattern: function (elements) {
            this.type = Syntax.ArrayPattern;
            this.elements = elements;
            this.finish();
            return this;
        },

        finishArrowFunctionExpression: function (params, defaults, body, expression) {
            this.type = Syntax.ArrowFunctionExpression;
            this.id = null;
            this.params = params;
            this.defaults = defaults;
            this.body = body;
            this.generator = false;
            this.expression = expression;
            this.finish();
            return this;
        },

        finishAssignmentExpression: function (operator, left, right) {
            this.type = Syntax.AssignmentExpression;
            this.operator = operator;
            this.left = left;
            this.right = right;
            this.finish();
            return this;
        },

        finishAssignmentPattern: function (left, right) {
            this.type = Syntax.AssignmentPattern;
            this.left = left;
            this.right = right;
            this.finish();
            return this;
        },

        finishBinaryExpression: function (operator, left, right) {
            this.type = (operator === '||' || operator === '&&') ? Syntax.LogicalExpression : Syntax.BinaryExpression;
            this.operator = operator;
            this.left = left;
            this.right = right;
            this.finish();
            return this;
        },

        finishBlockStatement: function (body) {
            this.type = Syntax.BlockStatement;
            this.body = body;
            this.finish();
            return this;
        },

        finishBreakStatement: function (label) {
            this.type = Syntax.BreakStatement;
            this.label = label;
            this.finish();
            return this;
        },

        finishCallExpression: function (callee, args) {
            this.type = Syntax.CallExpression;
            this.callee = callee;
            this.arguments = args;
            this.finish();
            return this;
        },

        finishCatchClause: function (param, body) {
            this.type = Syntax.CatchClause;
            this.param = param;
            this.body = body;
            this.finish();
            return this;
        },

        finishClassBody: function (body) {
            this.type = Syntax.ClassBody;
            this.body = body;
            this.finish();
            return this;
        },

        finishClassDeclaration: function (id, superClass, body) {
            this.type = Syntax.ClassDeclaration;
            this.id = id;
            this.superClass = superClass;
            this.body = body;
            this.finish();
            return this;
        },

        finishClassExpression: function (id, superClass, body) {
            this.type = Syntax.ClassExpression;
            this.id = id;
            this.superClass = superClass;
            this.body = body;
            this.finish();
            return this;
        },

        finishConditionalExpression: function (test, consequent, alternate) {
            this.type = Syntax.ConditionalExpression;
            this.test = test;
            this.consequent = consequent;
            this.alternate = alternate;
            this.finish();
            return this;
        },

        finishContinueStatement: function (label) {
            this.type = Syntax.ContinueStatement;
            this.label = label;
            this.finish();
            return this;
        },

        finishDebuggerStatement: function () {
            this.type = Syntax.DebuggerStatement;
            this.finish();
            return this;
        },

        finishDoWhileStatement: function (body, test) {
            this.type = Syntax.DoWhileStatement;
            this.body = body;
            this.test = test;
            this.finish();
            return this;
        },

        finishEmptyStatement: function () {
            this.type = Syntax.EmptyStatement;
            this.finish();
            return this;
        },

        finishExpressionStatement: function (expression) {
            this.type = Syntax.ExpressionStatement;
            this.expression = expression;
            this.finish();
            return this;
        },

        finishForStatement: function (init, test, update, body) {
            this.type = Syntax.ForStatement;
            this.init = init;
            this.test = test;
            this.update = update;
            this.body = body;
            this.finish();
            return this;
        },

        finishForOfStatement: function (left, right, body) {
            this.type = Syntax.ForOfStatement;
            this.left = left;
            this.right = right;
            this.body = body;
            this.finish();
            return this;
        },

        finishForInStatement: function (left, right, body) {
            this.type = Syntax.ForInStatement;
            this.left = left;
            this.right = right;
            this.body = body;
            this.each = false;
            this.finish();
            return this;
        },

        finishFunctionDeclaration: function (id, params, defaults, body, generator) {
            this.type = Syntax.FunctionDeclaration;
            this.id = id;
            this.params = params;
            this.defaults = defaults;
            this.body = body;
            this.generator = generator;
            this.expression = false;
            this.finish();
            return this;
        },

        finishFunctionExpression: function (id, params, defaults, body, generator) {
            this.type = Syntax.FunctionExpression;
            this.id = id;
            this.params = params;
            this.defaults = defaults;
            this.body = body;
            this.generator = generator;
            this.expression = false;
            this.finish();
            return this;
        },

        finishIdentifier: function (name) {
            this.type = Syntax.Identifier;
            this.name = name;
            this.finish();
            return this;
        },

        finishIfStatement: function (test, consequent, alternate) {
            this.type = Syntax.IfStatement;
            this.test = test;
            this.consequent = consequent;
            this.alternate = alternate;
            this.finish();
            return this;
        },

        finishLabeledStatement: function (label, body) {
            this.type = Syntax.LabeledStatement;
            this.label = label;
            this.body = body;
            this.finish();
            return this;
        },

        finishLiteral: function (token) {
            this.type = Syntax.Literal;
            this.value = token.value;
            this.raw = source.slice(token.start, token.end);
            if (token.regex) {
                this.regex = token.regex;
            }
            this.finish();
            return this;
        },

        finishMemberExpression: function (accessor, object, property) {
            this.type = Syntax.MemberExpression;
            this.computed = accessor === '[';
            this.object = object;
            this.property = property;
            this.finish();
            return this;
        },

        finishMetaProperty: function (meta, property) {
            this.type = Syntax.MetaProperty;
            this.meta = meta;
            this.property = property;
            this.finish();
            return this;
        },

        finishNewExpression: function (callee, args) {
            this.type = Syntax.NewExpression;
            this.callee = callee;
            this.arguments = args;
            this.finish();
            return this;
        },

        finishObjectExpression: function (properties) {
            this.type = Syntax.ObjectExpression;
            this.properties = properties;
            this.finish();
            return this;
        },

        finishObjectPattern: function (properties) {
            this.type = Syntax.ObjectPattern;
            this.properties = properties;
            this.finish();
            return this;
        },

        finishPostfixExpression: function (operator, argument) {
            this.type = Syntax.UpdateExpression;
            this.operator = operator;
            this.argument = argument;
            this.prefix = false;
            this.finish();
            return this;
        },

        finishProgram: function (body, sourceType) {
            this.type = Syntax.Program;
            this.body = body;
            this.sourceType = sourceType;
            this.finish();
            return this;
        },

        finishProperty: function (kind, key, computed, value, method, shorthand) {
            this.type = Syntax.Property;
            this.key = key;
            this.computed = computed;
            this.value = value;
            this.kind = kind;
            this.method = method;
            this.shorthand = shorthand;
            this.finish();
            return this;
        },

        finishRestElement: function (argument) {
            this.type = Syntax.RestElement;
            this.argument = argument;
            this.finish();
            return this;
        },

        finishReturnStatement: function (argument) {
            this.type = Syntax.ReturnStatement;
            this.argument = argument;
            this.finish();
            return this;
        },

        finishSequenceExpression: function (expressions) {
            this.type = Syntax.SequenceExpression;
            this.expressions = expressions;
            this.finish();
            return this;
        },

        finishSpreadElement: function (argument) {
            this.type = Syntax.SpreadElement;
            this.argument = argument;
            this.finish();
            return this;
        },

        finishSwitchCase: function (test, consequent) {
            this.type = Syntax.SwitchCase;
            this.test = test;
            this.consequent = consequent;
            this.finish();
            return this;
        },

        finishSuper: function () {
            this.type = Syntax.Super;
            this.finish();
            return this;
        },

        finishSwitchStatement: function (discriminant, cases) {
            this.type = Syntax.SwitchStatement;
            this.discriminant = discriminant;
            this.cases = cases;
            this.finish();
            return this;
        },

        finishTaggedTemplateExpression: function (tag, quasi) {
            this.type = Syntax.TaggedTemplateExpression;
            this.tag = tag;
            this.quasi = quasi;
            this.finish();
            return this;
        },

        finishTemplateElement: function (value, tail) {
            this.type = Syntax.TemplateElement;
            this.value = value;
            this.tail = tail;
            this.finish();
            return this;
        },

        finishTemplateLiteral: function (quasis, expressions) {
            this.type = Syntax.TemplateLiteral;
            this.quasis = quasis;
            this.expressions = expressions;
            this.finish();
            return this;
        },

        finishThisExpression: function () {
            this.type = Syntax.ThisExpression;
            this.finish();
            return this;
        },

        finishThrowStatement: function (argument) {
            this.type = Syntax.ThrowStatement;
            this.argument = argument;
            this.finish();
            return this;
        },

        finishTryStatement: function (block, handler, finalizer) {
            this.type = Syntax.TryStatement;
            this.block = block;
            this.guardedHandlers = [];
            this.handlers = handler ? [handler] : [];
            this.handler = handler;
            this.finalizer = finalizer;
            this.finish();
            return this;
        },

        finishUnaryExpression: function (operator, argument) {
            this.type = (operator === '++' || operator === '--') ? Syntax.UpdateExpression : Syntax.UnaryExpression;
            this.operator = operator;
            this.argument = argument;
            this.prefix = true;
            this.finish();
            return this;
        },

        finishVariableDeclaration: function (declarations) {
            this.type = Syntax.VariableDeclaration;
            this.declarations = declarations;
            this.kind = 'var';
            this.finish();
            return this;
        },

        finishLexicalDeclaration: function (declarations, kind) {
            this.type = Syntax.VariableDeclaration;
            this.declarations = declarations;
            this.kind = kind;
            this.finish();
            return this;
        },

        finishVariableDeclarator: function (id, init) {
            this.type = Syntax.VariableDeclarator;
            this.id = id;
            this.init = init;
            this.finish();
            return this;
        },

        finishWhileStatement: function (test, body) {
            this.type = Syntax.WhileStatement;
            this.test = test;
            this.body = body;
            this.finish();
            return this;
        },

        finishWithStatement: function (object, body) {
            this.type = Syntax.WithStatement;
            this.object = object;
            this.body = body;
            this.finish();
            return this;
        },

        finishExportSpecifier: function (local, exported) {
            this.type = Syntax.ExportSpecifier;
            this.exported = exported || local;
            this.local = local;
            this.finish();
            return this;
        },

        finishImportDefaultSpecifier: function (local) {
            this.type = Syntax.ImportDefaultSpecifier;
            this.local = local;
            this.finish();
            return this;
        },

        finishImportNamespaceSpecifier: function (local) {
            this.type = Syntax.ImportNamespaceSpecifier;
            this.local = local;
            this.finish();
            return this;
        },

        finishExportNamedDeclaration: function (declaration, specifiers, src) {
            this.type = Syntax.ExportNamedDeclaration;
            this.declaration = declaration;
            this.specifiers = specifiers;
            this.source = src;
            this.finish();
            return this;
        },

        finishExportDefaultDeclaration: function (declaration) {
            this.type = Syntax.ExportDefaultDeclaration;
            this.declaration = declaration;
            this.finish();
            return this;
        },

        finishExportAllDeclaration: function (src) {
            this.type = Syntax.ExportAllDeclaration;
            this.source = src;
            this.finish();
            return this;
        },

        finishImportSpecifier: function (local, imported) {
            this.type = Syntax.ImportSpecifier;
            this.local = local || imported;
            this.imported = imported;
            this.finish();
            return this;
        },

        finishImportDeclaration: function (specifiers, src) {
            this.type = Syntax.ImportDeclaration;
            this.specifiers = specifiers;
            this.source = src;
            this.finish();
            return this;
        },

        finishYieldExpression: function (argument, delegate) {
            this.type = Syntax.YieldExpression;
            this.argument = argument;
            this.delegate = delegate;
            this.finish();
            return this;
        }
    };


    function recordError(error) {
        var e, existing;

        for (e = 0; e < extra.errors.length; e++) {
            existing = extra.errors[e];
            // Prevent duplicated error.
            /* istanbul ignore next */
            if (existing.index === error.index && existing.message === error.message) {
                return;
            }
        }

        extra.errors.push(error);
    }

    function constructError(msg, column) {
        var error = new Error(msg);
        try {
            throw error;
        } catch (base) {
            /* istanbul ignore else */
            if (Object.create && Object.defineProperty) {
                error = Object.create(base);
                Object.defineProperty(error, 'column', { value: column });
            }
        } finally {
            return error;
        }
    }

    function createError(line, pos, description) {
        var msg, column, error;

        msg = 'Line ' + line + ': ' + description;
        column = pos - (scanning ? lineStart : lastLineStart) + 1;
        error = constructError(msg, column);
        error.lineNumber = line;
        error.description = description;
        error.index = pos;
        return error;
    }

    // Throw an exception

    function throwError(messageFormat) {
        var args, msg;

        args = Array.prototype.slice.call(arguments, 1);
        msg = messageFormat.replace(/%(\d)/g,
            function (whole, idx) {
                assert(idx < args.length, 'Message reference must be in range');
                return args[idx];
            }
        );

        throw createError(lastLineNumber, lastIndex, msg);
    }

    function tolerateError(messageFormat) {
        var args, msg, error;

        args = Array.prototype.slice.call(arguments, 1);
        /* istanbul ignore next */
        msg = messageFormat.replace(/%(\d)/g,
            function (whole, idx) {
                assert(idx < args.length, 'Message reference must be in range');
                return args[idx];
            }
        );

        error = createError(lineNumber, lastIndex, msg);
        if (extra.errors) {
            recordError(error);
        } else {
            throw error;
        }
    }

    // Throw an exception because of the token.

    function unexpectedTokenError(token, message) {
        var value, msg = message || Messages.UnexpectedToken;

        if (token) {
            if (!message) {
                msg = (token.type === Token.EOF) ? Messages.UnexpectedEOS :
                    (token.type === Token.Identifier) ? Messages.UnexpectedIdentifier :
                    (token.type === Token.NumericLiteral) ? Messages.UnexpectedNumber :
                    (token.type === Token.StringLiteral) ? Messages.UnexpectedString :
                    (token.type === Token.Template) ? Messages.UnexpectedTemplate :
                    Messages.UnexpectedToken;

                if (token.type === Token.Keyword) {
                    if (isFutureReservedWord(token.value)) {
                        msg = Messages.UnexpectedReserved;
                    } else if (strict && isStrictModeReservedWord(token.value)) {
                        msg = Messages.StrictReservedWord;
                    }
                }
            }

            value = (token.type === Token.Template) ? token.value.raw : token.value;
        } else {
            value = 'ILLEGAL';
        }

        msg = msg.replace('%0', value);

        return (token && typeof token.lineNumber === 'number') ?
            createError(token.lineNumber, token.start, msg) :
            createError(scanning ? lineNumber : lastLineNumber, scanning ? index : lastIndex, msg);
    }

    function throwUnexpectedToken(token, message) {
        throw unexpectedTokenError(token, message);
    }

    function tolerateUnexpectedToken(token, message) {
        var error = unexpectedTokenError(token, message);
        if (extra.errors) {
            recordError(error);
        } else {
            throw error;
        }
    }

    // Expect the next token to match the specified punctuator.
    // If not, an exception will be thrown.

    function expect(value) {
        var token = lex();
        if (token.type !== Token.Punctuator || token.value !== value) {
            throwUnexpectedToken(token);
        }
    }

    /**
     * @name expectCommaSeparator
     * @description Quietly expect a comma when in tolerant mode, otherwise delegates
     * to <code>expect(value)</code>
     * @since 2.0
     */
    function expectCommaSeparator() {
        var token;

        if (extra.errors) {
            token = lookahead;
            if (token.type === Token.Punctuator && token.value === ',') {
                lex();
            } else if (token.type === Token.Punctuator && token.value === ';') {
                lex();
                tolerateUnexpectedToken(token);
            } else {
                tolerateUnexpectedToken(token, Messages.UnexpectedToken);
            }
        } else {
            expect(',');
        }
    }

    // Expect the next token to match the specified keyword.
    // If not, an exception will be thrown.

    function expectKeyword(keyword) {
        var token = lex();
        if (token.type !== Token.Keyword || token.value !== keyword) {
            throwUnexpectedToken(token);
        }
    }

    // Return true if the next token matches the specified punctuator.

    function match(value) {
        return lookahead.type === Token.Punctuator && lookahead.value === value;
    }

    // Return true if the next token matches the specified keyword

    function matchKeyword(keyword) {
        return lookahead.type === Token.Keyword && lookahead.value === keyword;
    }

    // Return true if the next token matches the specified contextual keyword
    // (where an identifier is sometimes a keyword depending on the context)

    function matchContextualKeyword(keyword) {
        return lookahead.type === Token.Identifier && lookahead.value === keyword;
    }

    // Return true if the next token is an assignment operator

    function matchAssign() {
        var op;

        if (lookahead.type !== Token.Punctuator) {
            return false;
        }
        op = lookahead.value;
        return op === '=' ||
            op === '*=' ||
            op === '/=' ||
            op === '%=' ||
            op === '+=' ||
            op === '-=' ||
            op === '<<=' ||
            op === '>>=' ||
            op === '>>>=' ||
            op === '&=' ||
            op === '^=' ||
            op === '|=';
    }

    function consumeSemicolon() {
        // Catch the very common case first: immediately a semicolon (U+003B).
        if (source.charCodeAt(startIndex) === 0x3B || match(';')) {
            lex();
            return;
        }

        if (hasLineTerminator) {
            return;
        }

        // FIXME(ikarienator): this is seemingly an issue in the previous location info convention.
        lastIndex = startIndex;
        lastLineNumber = startLineNumber;
        lastLineStart = startLineStart;

        if (lookahead.type !== Token.EOF && !match('}')) {
            throwUnexpectedToken(lookahead);
        }
    }

    // Cover grammar support.
    //
    // When an assignment expression position starts with an left parenthesis, the determination of the type
    // of the syntax is to be deferred arbitrarily long until the end of the parentheses pair (plus a lookahead)
    // or the first comma. This situation also defers the determination of all the expressions nested in the pair.
    //
    // There are three productions that can be parsed in a parentheses pair that needs to be determined
    // after the outermost pair is closed. They are:
    //
    //   1. AssignmentExpression
    //   2. BindingElements
    //   3. AssignmentTargets
    //
    // In order to avoid exponential backtracking, we use two flags to denote if the production can be
    // binding element or assignment target.
    //
    // The three productions have the relationship:
    //
    //   BindingElements ⊆ AssignmentTargets ⊆ AssignmentExpression
    //
    // with a single exception that CoverInitializedName when used directly in an Expression, generates
    // an early error. Therefore, we need the third state, firstCoverInitializedNameError, to track the
    // first usage of CoverInitializedName and report it when we reached the end of the parentheses pair.
    //
    // isolateCoverGrammar function runs the given parser function with a new cover grammar context, and it does not
    // effect the current flags. This means the production the parser parses is only used as an expression. Therefore
    // the CoverInitializedName check is conducted.
    //
    // inheritCoverGrammar function runs the given parse function with a new cover grammar context, and it propagates
    // the flags outside of the parser. This means the production the parser parses is used as a part of a potential
    // pattern. The CoverInitializedName check is deferred.
    function isolateCoverGrammar(parser) {
        var oldIsBindingElement = isBindingElement,
            oldIsAssignmentTarget = isAssignmentTarget,
            oldFirstCoverInitializedNameError = firstCoverInitializedNameError,
            result;
        isBindingElement = true;
        isAssignmentTarget = true;
        firstCoverInitializedNameError = null;
        result = parser();
        if (firstCoverInitializedNameError !== null) {
            throwUnexpectedToken(firstCoverInitializedNameError);
        }
        isBindingElement = oldIsBindingElement;
        isAssignmentTarget = oldIsAssignmentTarget;
        firstCoverInitializedNameError = oldFirstCoverInitializedNameError;
        return result;
    }

    function inheritCoverGrammar(parser) {
        var oldIsBindingElement = isBindingElement,
            oldIsAssignmentTarget = isAssignmentTarget,
            oldFirstCoverInitializedNameError = firstCoverInitializedNameError,
            result;
        isBindingElement = true;
        isAssignmentTarget = true;
        firstCoverInitializedNameError = null;
        result = parser();
        isBindingElement = isBindingElement && oldIsBindingElement;
        isAssignmentTarget = isAssignmentTarget && oldIsAssignmentTarget;
        firstCoverInitializedNameError = oldFirstCoverInitializedNameError || firstCoverInitializedNameError;
        return result;
    }

    // ECMA-262 13.3.3 Destructuring Binding Patterns

    function parseArrayPattern(params, kind) {
        var node = new Node(), elements = [], rest, restNode;
        expect('[');

        while (!match(']')) {
            if (match(',')) {
                lex();
                elements.push(null);
            } else {
                if (match('...')) {
                    restNode = new Node();
                    lex();
                    params.push(lookahead);
                    rest = parseVariableIdentifier(kind);
                    elements.push(restNode.finishRestElement(rest));
                    break;
                } else {
                    elements.push(parsePatternWithDefault(params, kind));
                }
                if (!match(']')) {
                    expect(',');
                }
            }

        }

        expect(']');

        return node.finishArrayPattern(elements);
    }

    function parsePropertyPattern(params, kind) {
        var node = new Node(), key, keyToken, computed = match('['), init;
        if (lookahead.type === Token.Identifier) {
            keyToken = lookahead;
            key = parseVariableIdentifier();
            if (match('=')) {
                params.push(keyToken);
                lex();
                init = parseAssignmentExpression();

                return node.finishProperty(
                    'init', key, false,
                    new WrappingNode(keyToken).finishAssignmentPattern(key, init), false, true);
            } else if (!match(':')) {
                params.push(keyToken);
                return node.finishProperty('init', key, false, key, false, true);
            }
        } else {
            key = parseObjectPropertyKey();
        }
        expect(':');
        init = parsePatternWithDefault(params, kind);
        return node.finishProperty('init', key, computed, init, false, false);
    }

    function parseObjectPattern(params, kind) {
        var node = new Node(), properties = [];

        expect('{');

        while (!match('}')) {
            properties.push(parsePropertyPattern(params, kind));
            if (!match('}')) {
                expect(',');
            }
        }

        lex();

        return node.finishObjectPattern(properties);
    }

    function parsePattern(params, kind) {
        if (match('[')) {
            return parseArrayPattern(params, kind);
        } else if (match('{')) {
            return parseObjectPattern(params, kind);
        } else if (matchKeyword('let')) {
            if (kind === 'const' || kind === 'let') {
                tolerateUnexpectedToken(lookahead, Messages.UnexpectedToken);
            }
        }

        params.push(lookahead);
        return parseVariableIdentifier(kind);
    }

    function parsePatternWithDefault(params, kind) {
        var startToken = lookahead, pattern, previousAllowYield, right;
        pattern = parsePattern(params, kind);
        if (match('=')) {
            lex();
            previousAllowYield = state.allowYield;
            state.allowYield = true;
            right = isolateCoverGrammar(parseAssignmentExpression);
            state.allowYield = previousAllowYield;
            pattern = new WrappingNode(startToken).finishAssignmentPattern(pattern, right);
        }
        return pattern;
    }

    // ECMA-262 12.2.5 Array Initializer

    function parseArrayInitializer() {
        var elements = [], node = new Node(), restSpread;

        expect('[');

        while (!match(']')) {
            if (match(',')) {
                lex();
                elements.push(null);
            } else if (match('...')) {
                restSpread = new Node();
                lex();
                restSpread.finishSpreadElement(inheritCoverGrammar(parseAssignmentExpression));

                if (!match(']')) {
                    isAssignmentTarget = isBindingElement = false;
                    expect(',');
                }
                elements.push(restSpread);
            } else {
                elements.push(inheritCoverGrammar(parseAssignmentExpression));

                if (!match(']')) {
                    expect(',');
                }
            }
        }

        lex();

        return node.finishArrayExpression(elements);
    }

    // ECMA-262 12.2.6 Object Initializer

    function parsePropertyFunction(node, paramInfo, isGenerator) {
        var previousStrict, body;

        isAssignmentTarget = isBindingElement = false;

        previousStrict = strict;
        body = isolateCoverGrammar(parseFunctionSourceElements);

        if (strict && paramInfo.firstRestricted) {
            tolerateUnexpectedToken(paramInfo.firstRestricted, paramInfo.message);
        }
        if (strict && paramInfo.stricted) {
            tolerateUnexpectedToken(paramInfo.stricted, paramInfo.message);
        }

        strict = previousStrict;
        return node.finishFunctionExpression(null, paramInfo.params, paramInfo.defaults, body, isGenerator);
    }

    function parsePropertyMethodFunction() {
        var params, method, node = new Node(),
            previousAllowYield = state.allowYield;

        state.allowYield = false;
        params = parseParams();
        state.allowYield = previousAllowYield;

        state.allowYield = false;
        method = parsePropertyFunction(node, params, false);
        state.allowYield = previousAllowYield;

        return method;
    }

    function parseObjectPropertyKey() {
        var token, node = new Node(), expr;

        token = lex();

        // Note: This function is called only from parseObjectProperty(), where
        // EOF and Punctuator tokens are already filtered out.

        switch (token.type) {
        case Token.StringLiteral:
        case Token.NumericLiteral:
            if (strict && token.octal) {
                tolerateUnexpectedToken(token, Messages.StrictOctalLiteral);
            }
            return node.finishLiteral(token);
        case Token.Identifier:
        case Token.BooleanLiteral:
        case Token.NullLiteral:
        case Token.Keyword:
            return node.finishIdentifier(token.value);
        case Token.Punctuator:
            if (token.value === '[') {
                expr = isolateCoverGrammar(parseAssignmentExpression);
                expect(']');
                return expr;
            }
            break;
        }
        throwUnexpectedToken(token);
    }

    function lookaheadPropertyName() {
        switch (lookahead.type) {
        case Token.Identifier:
        case Token.StringLiteral:
        case Token.BooleanLiteral:
        case Token.NullLiteral:
        case Token.NumericLiteral:
        case Token.Keyword:
            return true;
        case Token.Punctuator:
            return lookahead.value === '[';
        }
        return false;
    }

    // This function is to try to parse a MethodDefinition as defined in 14.3. But in the case of object literals,
    // it might be called at a position where there is in fact a short hand identifier pattern or a data property.
    // This can only be determined after we consumed up to the left parentheses.
    //
    // In order to avoid back tracking, it returns `null` if the position is not a MethodDefinition and the caller
    // is responsible to visit other options.
    function tryParseMethodDefinition(token, key, computed, node) {
        var value, options, methodNode, params,
            previousAllowYield = state.allowYield;

        if (token.type === Token.Identifier) {
            // check for `get` and `set`;

            if (token.value === 'get' && lookaheadPropertyName()) {
                computed = match('[');
                key = parseObjectPropertyKey();
                methodNode = new Node();
                expect('(');
                expect(')');

                state.allowYield = false;
                value = parsePropertyFunction(methodNode, {
                    params: [],
                    defaults: [],
                    stricted: null,
                    firstRestricted: null,
                    message: null
                }, false);
                state.allowYield = previousAllowYield;

                return node.finishProperty('get', key, computed, value, false, false);
            } else if (token.value === 'set' && lookaheadPropertyName()) {
                computed = match('[');
                key = parseObjectPropertyKey();
                methodNode = new Node();
                expect('(');

                options = {
                    params: [],
                    defaultCount: 0,
                    defaults: [],
                    firstRestricted: null,
                    paramSet: {}
                };
                if (match(')')) {
                    tolerateUnexpectedToken(lookahead);
                } else {
                    state.allowYield = false;
                    parseParam(options);
                    state.allowYield = previousAllowYield;
                    if (options.defaultCount === 0) {
                        options.defaults = [];
                    }
                }
                expect(')');

                state.allowYield = false;
                value = parsePropertyFunction(methodNode, options, false);
                state.allowYield = previousAllowYield;

                return node.finishProperty('set', key, computed, value, false, false);
            }
        } else if (token.type === Token.Punctuator && token.value === '*' && lookaheadPropertyName()) {
            computed = match('[');
            key = parseObjectPropertyKey();
            methodNode = new Node();

            state.allowYield = true;
            params = parseParams();
            state.allowYield = previousAllowYield;

            state.allowYield = false;
            value = parsePropertyFunction(methodNode, params, true);
            state.allowYield = previousAllowYield;

            return node.finishProperty('init', key, computed, value, true, false);
        }

        if (key && match('(')) {
            value = parsePropertyMethodFunction();
            return node.finishProperty('init', key, computed, value, true, false);
        }

        // Not a MethodDefinition.
        return null;
    }

    function parseObjectProperty(hasProto) {
        var token = lookahead, node = new Node(), computed, key, maybeMethod, proto, value;

        computed = match('[');
        if (match('*')) {
            lex();
        } else {
            key = parseObjectPropertyKey();
        }
        maybeMethod = tryParseMethodDefinition(token, key, computed, node);
        if (maybeMethod) {
            return maybeMethod;
        }

        if (!key) {
            throwUnexpectedToken(lookahead);
        }

        // Check for duplicated __proto__
        if (!computed) {
            proto = (key.type === Syntax.Identifier && key.name === '__proto__') ||
                (key.type === Syntax.Literal && key.value === '__proto__');
            if (hasProto.value && proto) {
                tolerateError(Messages.DuplicateProtoProperty);
            }
            hasProto.value |= proto;
        }

        if (match(':')) {
            lex();
            value = inheritCoverGrammar(parseAssignmentExpression);
            return node.finishProperty('init', key, computed, value, false, false);
        }

        if (token.type === Token.Identifier) {
            if (match('=')) {
                firstCoverInitializedNameError = lookahead;
                lex();
                value = isolateCoverGrammar(parseAssignmentExpression);
                return node.finishProperty('init', key, computed,
                    new WrappingNode(token).finishAssignmentPattern(key, value), false, true);
            }
            return node.finishProperty('init', key, computed, key, false, true);
        }

        throwUnexpectedToken(lookahead);
    }

    function parseObjectInitializer() {
        var properties = [], hasProto = {value: false}, node = new Node();

        expect('{');

        while (!match('}')) {
            properties.push(parseObjectProperty(hasProto));

            if (!match('}')) {
                expectCommaSeparator();
            }
        }

        expect('}');

        return node.finishObjectExpression(properties);
    }

    function reinterpretExpressionAsPattern(expr) {
        var i;
        switch (expr.type) {
        case Syntax.Identifier:
        case Syntax.MemberExpression:
        case Syntax.RestElement:
        case Syntax.AssignmentPattern:
            break;
        case Syntax.SpreadElement:
            expr.type = Syntax.RestElement;
            reinterpretExpressionAsPattern(expr.argument);
            break;
        case Syntax.ArrayExpression:
            expr.type = Syntax.ArrayPattern;
            for (i = 0; i < expr.elements.length; i++) {
                if (expr.elements[i] !== null) {
                    reinterpretExpressionAsPattern(expr.elements[i]);
                }
            }
            break;
        case Syntax.ObjectExpression:
            expr.type = Syntax.ObjectPattern;
            for (i = 0; i < expr.properties.length; i++) {
                reinterpretExpressionAsPattern(expr.properties[i].value);
            }
            break;
        case Syntax.AssignmentExpression:
            expr.type = Syntax.AssignmentPattern;
            reinterpretExpressionAsPattern(expr.left);
            break;
        }
    }

    // ECMA-262 12.2.9 Template Literals

    function parseTemplateElement(option) {
        var node, token;

        if (lookahead.type !== Token.Template || (option.head && !lookahead.head)) {
            throwUnexpectedToken();
        }

        node = new Node();
        token = lex();

        return node.finishTemplateElement({ raw: token.value.raw, cooked: token.value.cooked }, token.tail);
    }

    function parseTemplateLiteral() {
        var quasi, quasis, expressions, node = new Node();

        quasi = parseTemplateElement({ head: true });
        quasis = [quasi];
        expressions = [];

        while (!quasi.tail) {
            expressions.push(parseExpression());
            quasi = parseTemplateElement({ head: false });
            quasis.push(quasi);
        }

        return node.finishTemplateLiteral(quasis, expressions);
    }

    // ECMA-262 12.2.10 The Grouping Operator

    function parseGroupExpression() {
        var expr, expressions, startToken, i, params = [];

        expect('(');

        if (match(')')) {
            lex();
            if (!match('=>')) {
                expect('=>');
            }
            return {
                type: PlaceHolders.ArrowParameterPlaceHolder,
                params: [],
                rawParams: []
            };
        }

        startToken = lookahead;
        if (match('...')) {
            expr = parseRestElement(params);
            expect(')');
            if (!match('=>')) {
                expect('=>');
            }
            return {
                type: PlaceHolders.ArrowParameterPlaceHolder,
                params: [expr]
            };
        }

        isBindingElement = true;
        expr = inheritCoverGrammar(parseAssignmentExpression);

        if (match(',')) {
            isAssignmentTarget = false;
            expressions = [expr];

            while (startIndex < length) {
                if (!match(',')) {
                    break;
                }
                lex();

                if (match('...')) {
                    if (!isBindingElement) {
                        throwUnexpectedToken(lookahead);
                    }
                    expressions.push(parseRestElement(params));
                    expect(')');
                    if (!match('=>')) {
                        expect('=>');
                    }
                    isBindingElement = false;
                    for (i = 0; i < expressions.length; i++) {
                        reinterpretExpressionAsPattern(expressions[i]);
                    }
                    return {
                        type: PlaceHolders.ArrowParameterPlaceHolder,
                        params: expressions
                    };
                }

                expressions.push(inheritCoverGrammar(parseAssignmentExpression));
            }

            expr = new WrappingNode(startToken).finishSequenceExpression(expressions);
        }


        expect(')');

        if (match('=>')) {
            if (expr.type === Syntax.Identifier && expr.name === 'yield') {
                return {
                    type: PlaceHolders.ArrowParameterPlaceHolder,
                    params: [expr]
                };
            }

            if (!isBindingElement) {
                throwUnexpectedToken(lookahead);
            }

            if (expr.type === Syntax.SequenceExpression) {
                for (i = 0; i < expr.expressions.length; i++) {
                    reinterpretExpressionAsPattern(expr.expressions[i]);
                }
            } else {
                reinterpretExpressionAsPattern(expr);
            }

            expr = {
                type: PlaceHolders.ArrowParameterPlaceHolder,
                params: expr.type === Syntax.SequenceExpression ? expr.expressions : [expr]
            };
        }
        isBindingElement = false;
        return expr;
    }


    // ECMA-262 12.2 Primary Expressions

    function parsePrimaryExpression() {
        var type, token, expr, node;

        if (match('(')) {
            isBindingElement = false;
            return inheritCoverGrammar(parseGroupExpression);
        }

        if (match('[')) {
            return inheritCoverGrammar(parseArrayInitializer);
        }

        if (match('{')) {
            return inheritCoverGrammar(parseObjectInitializer);
        }

        type = lookahead.type;
        node = new Node();

        if (type === Token.Identifier) {
            if (state.sourceType === 'module' && lookahead.value === 'await') {
                tolerateUnexpectedToken(lookahead);
            }
            expr = node.finishIdentifier(lex().value);
        } else if (type === Token.StringLiteral || type === Token.NumericLiteral) {
            isAssignmentTarget = isBindingElement = false;
            if (strict && lookahead.octal) {
                tolerateUnexpectedToken(lookahead, Messages.StrictOctalLiteral);
            }
            expr = node.finishLiteral(lex());
        } else if (type === Token.Keyword) {
            if (!strict && state.allowYield && matchKeyword('yield')) {
                return parseNonComputedProperty();
            }
            if (!strict && matchKeyword('let')) {
                return node.finishIdentifier(lex().value);
            }
            isAssignmentTarget = isBindingElement = false;
            if (matchKeyword('function')) {
                return parseFunctionExpression();
            }
            if (matchKeyword('this')) {
                lex();
                return node.finishThisExpression();
            }
            if (matchKeyword('class')) {
                return parseClassExpression();
            }
            throwUnexpectedToken(lex());
        } else if (type === Token.BooleanLiteral) {
            isAssignmentTarget = isBindingElement = false;
            token = lex();
            token.value = (token.value === 'true');
            expr = node.finishLiteral(token);
        } else if (type === Token.NullLiteral) {
            isAssignmentTarget = isBindingElement = false;
            token = lex();
            token.value = null;
            expr = node.finishLiteral(token);
        } else if (match('/') || match('/=')) {
            isAssignmentTarget = isBindingElement = false;
            index = startIndex;

            if (typeof extra.tokens !== 'undefined') {
                token = collectRegex();
            } else {
                token = scanRegExp();
            }
            lex();
            expr = node.finishLiteral(token);
        } else if (type === Token.Template) {
            expr = parseTemplateLiteral();
        } else {
            throwUnexpectedToken(lex());
        }

        return expr;
    }

    // ECMA-262 12.3 Left-Hand-Side Expressions

    function parseArguments() {
        var args = [], expr;

        expect('(');

        if (!match(')')) {
            while (startIndex < length) {
                if (match('...')) {
                    expr = new Node();
                    lex();
                    expr.finishSpreadElement(isolateCoverGrammar(parseAssignmentExpression));
                } else {
                    expr = isolateCoverGrammar(parseAssignmentExpression);
                }
                args.push(expr);
                if (match(')')) {
                    break;
                }
                expectCommaSeparator();
            }
        }

        expect(')');

        return args;
    }

    function parseNonComputedProperty() {
        var token, node = new Node();

        token = lex();

        if (!isIdentifierName(token)) {
            throwUnexpectedToken(token);
        }

        return node.finishIdentifier(token.value);
    }

    function parseNonComputedMember() {
        expect('.');

        return parseNonComputedProperty();
    }

    function parseComputedMember() {
        var expr;

        expect('[');

        expr = isolateCoverGrammar(parseExpression);

        expect(']');

        return expr;
    }

    // ECMA-262 12.3.3 The new Operator

    function parseNewExpression() {
        var callee, args, node = new Node();

        expectKeyword('new');

        if (match('.')) {
            lex();
            if (lookahead.type === Token.Identifier && lookahead.value === 'target') {
                if (state.inFunctionBody) {
                    lex();
                    return node.finishMetaProperty('new', 'target');
                }
            }
            throwUnexpectedToken(lookahead);
        }

        callee = isolateCoverGrammar(parseLeftHandSideExpression);
        args = match('(') ? parseArguments() : [];

        isAssignmentTarget = isBindingElement = false;

        return node.finishNewExpression(callee, args);
    }

    // ECMA-262 12.3.4 Function Calls

    function parseLeftHandSideExpressionAllowCall() {
        var quasi, expr, args, property, startToken, previousAllowIn = state.allowIn;

        startToken = lookahead;
        state.allowIn = true;

        if (matchKeyword('super') && state.inFunctionBody) {
            expr = new Node();
            lex();
            expr = expr.finishSuper();
            if (!match('(') && !match('.') && !match('[')) {
                throwUnexpectedToken(lookahead);
            }
        } else {
            expr = inheritCoverGrammar(matchKeyword('new') ? parseNewExpression : parsePrimaryExpression);
        }

        for (;;) {
            if (match('.')) {
                isBindingElement = false;
                isAssignmentTarget = true;
                property = parseNonComputedMember();
                expr = new WrappingNode(startToken).finishMemberExpression('.', expr, property);
            } else if (match('(')) {
                isBindingElement = false;
                isAssignmentTarget = false;
                args = parseArguments();
                expr = new WrappingNode(startToken).finishCallExpression(expr, args);
            } else if (match('[')) {
                isBindingElement = false;
                isAssignmentTarget = true;
                property = parseComputedMember();
                expr = new WrappingNode(startToken).finishMemberExpression('[', expr, property);
            } else if (lookahead.type === Token.Template && lookahead.head) {
                quasi = parseTemplateLiteral();
                expr = new WrappingNode(startToken).finishTaggedTemplateExpression(expr, quasi);
            } else {
                break;
            }
        }
        state.allowIn = previousAllowIn;

        return expr;
    }

    // ECMA-262 12.3 Left-Hand-Side Expressions

    function parseLeftHandSideExpression() {
        var quasi, expr, property, startToken;
        assert(state.allowIn, 'callee of new expression always allow in keyword.');

        startToken = lookahead;

        if (matchKeyword('super') && state.inFunctionBody) {
            expr = new Node();
            lex();
            expr = expr.finishSuper();
            if (!match('[') && !match('.')) {
                throwUnexpectedToken(lookahead);
            }
        } else {
            expr = inheritCoverGrammar(matchKeyword('new') ? parseNewExpression : parsePrimaryExpression);
        }

        for (;;) {
            if (match('[')) {
                isBindingElement = false;
                isAssignmentTarget = true;
                property = parseComputedMember();
                expr = new WrappingNode(startToken).finishMemberExpression('[', expr, property);
            } else if (match('.')) {
                isBindingElement = false;
                isAssignmentTarget = true;
                property = parseNonComputedMember();
                expr = new WrappingNode(startToken).finishMemberExpression('.', expr, property);
            } else if (lookahead.type === Token.Template && lookahead.head) {
                quasi = parseTemplateLiteral();
                expr = new WrappingNode(startToken).finishTaggedTemplateExpression(expr, quasi);
            } else {
                break;
            }
        }
        return expr;
    }

    // ECMA-262 12.4 Postfix Expressions

    function parsePostfixExpression() {
        var expr, token, startToken = lookahead;

        expr = inheritCoverGrammar(parseLeftHandSideExpressionAllowCall);

        if (!hasLineTerminator && lookahead.type === Token.Punctuator) {
            if (match('++') || match('--')) {
                // ECMA-262 11.3.1, 11.3.2
                if (strict && expr.type === Syntax.Identifier && isRestrictedWord(expr.name)) {
                    tolerateError(Messages.StrictLHSPostfix);
                }

                if (!isAssignmentTarget) {
                    tolerateError(Messages.InvalidLHSInAssignment);
                }

                isAssignmentTarget = isBindingElement = false;

                token = lex();
                expr = new WrappingNode(startToken).finishPostfixExpression(token.value, expr);
            }
        }

        return expr;
    }

    // ECMA-262 12.5 Unary Operators

    function parseUnaryExpression() {
        var token, expr, startToken;

        if (lookahead.type !== Token.Punctuator && lookahead.type !== Token.Keyword) {
            expr = parsePostfixExpression();
        } else if (match('++') || match('--')) {
            startToken = lookahead;
            token = lex();
            expr = inheritCoverGrammar(parseUnaryExpression);
            // ECMA-262 11.4.4, 11.4.5
            if (strict && expr.type === Syntax.Identifier && isRestrictedWord(expr.name)) {
                tolerateError(Messages.StrictLHSPrefix);
            }

            if (!isAssignmentTarget) {
                tolerateError(Messages.InvalidLHSInAssignment);
            }
            expr = new WrappingNode(startToken).finishUnaryExpression(token.value, expr);
            isAssignmentTarget = isBindingElement = false;
        } else if (match('+') || match('-') || match('~') || match('!')) {
            startToken = lookahead;
            token = lex();
            expr = inheritCoverGrammar(parseUnaryExpression);
            expr = new WrappingNode(startToken).finishUnaryExpression(token.value, expr);
            isAssignmentTarget = isBindingElement = false;
        } else if (matchKeyword('delete') || matchKeyword('void') || matchKeyword('typeof')) {
            startToken = lookahead;
            token = lex();
            expr = inheritCoverGrammar(parseUnaryExpression);
            expr = new WrappingNode(startToken).finishUnaryExpression(token.value, expr);
            if (strict && expr.operator === 'delete' && expr.argument.type === Syntax.Identifier) {
                tolerateError(Messages.StrictDelete);
            }
            isAssignmentTarget = isBindingElement = false;
        } else {
            expr = parsePostfixExpression();
        }

        return expr;
    }

    function binaryPrecedence(token, allowIn) {
        var prec = 0;

        if (token.type !== Token.Punctuator && token.type !== Token.Keyword) {
            return 0;
        }

        switch (token.value) {
        case '||':
            prec = 1;
            break;

        case '&&':
            prec = 2;
            break;

        case '|':
            prec = 3;
            break;

        case '^':
            prec = 4;
            break;

        case '&':
            prec = 5;
            break;

        case '==':
        case '!=':
        case '===':
        case '!==':
            prec = 6;
            break;

        case '<':
        case '>':
        case '<=':
        case '>=':
        case 'instanceof':
            prec = 7;
            break;

        case 'in':
            prec = allowIn ? 7 : 0;
            break;

        case '<<':
        case '>>':
        case '>>>':
            prec = 8;
            break;

        case '+':
        case '-':
            prec = 9;
            break;

        case '*':
        case '/':
        case '%':
            prec = 11;
            break;
        }

        return prec;
    }

    // ECMA-262 12.6 Multiplicative Operators
    // ECMA-262 12.7 Additive Operators
    // ECMA-262 12.8 Bitwise Shift Operators
    // ECMA-262 12.9 Relational Operators
    // ECMA-262 12.10 Equality Operators
    // ECMA-262 12.11 Binary Bitwise Operators
    // ECMA-262 12.12 Binary Logical Operators

    function parseBinaryExpression() {
        var marker, markers, expr, token, prec, stack, right, operator, left, i;

        marker = lookahead;
        left = inheritCoverGrammar(parseUnaryExpression);

        token = lookahead;
        prec = binaryPrecedence(token, state.allowIn);
        if (prec === 0) {
            return left;
        }
        isAssignmentTarget = isBindingElement = false;
        token.prec = prec;
        lex();

        markers = [marker, lookahead];
        right = isolateCoverGrammar(parseUnaryExpression);

        stack = [left, token, right];

        while ((prec = binaryPrecedence(lookahead, state.allowIn)) > 0) {

            // Reduce: make a binary expression from the three topmost entries.
            while ((stack.length > 2) && (prec <= stack[stack.length - 2].prec)) {
                right = stack.pop();
                operator = stack.pop().value;
                left = stack.pop();
                markers.pop();
                expr = new WrappingNode(markers[markers.length - 1]).finishBinaryExpression(operator, left, right);
                stack.push(expr);
            }

            // Shift.
            token = lex();
            token.prec = prec;
            stack.push(token);
            markers.push(lookahead);
            expr = isolateCoverGrammar(parseUnaryExpression);
            stack.push(expr);
        }

        // Final reduce to clean-up the stack.
        i = stack.length - 1;
        expr = stack[i];
        markers.pop();
        while (i > 1) {
            expr = new WrappingNode(markers.pop()).finishBinaryExpression(stack[i - 1].value, stack[i - 2], expr);
            i -= 2;
        }

        return expr;
    }


    // ECMA-262 12.13 Conditional Operator

    function parseConditionalExpression() {
        var expr, previousAllowIn, consequent, alternate, startToken;

        startToken = lookahead;

        expr = inheritCoverGrammar(parseBinaryExpression);
        if (match('?')) {
            lex();
            previousAllowIn = state.allowIn;
            state.allowIn = true;
            consequent = isolateCoverGrammar(parseAssignmentExpression);
            state.allowIn = previousAllowIn;
            expect(':');
            alternate = isolateCoverGrammar(parseAssignmentExpression);

            expr = new WrappingNode(startToken).finishConditionalExpression(expr, consequent, alternate);
            isAssignmentTarget = isBindingElement = false;
        }

        return expr;
    }

    // ECMA-262 14.2 Arrow Function Definitions

    function parseConciseBody() {
        if (match('{')) {
            return parseFunctionSourceElements();
        }
        return isolateCoverGrammar(parseAssignmentExpression);
    }

    function checkPatternParam(options, param) {
        var i;
        switch (param.type) {
        case Syntax.Identifier:
            validateParam(options, param, param.name);
            break;
        case Syntax.RestElement:
            checkPatternParam(options, param.argument);
            break;
        case Syntax.AssignmentPattern:
            checkPatternParam(options, param.left);
            break;
        case Syntax.ArrayPattern:
            for (i = 0; i < param.elements.length; i++) {
                if (param.elements[i] !== null) {
                    checkPatternParam(options, param.elements[i]);
                }
            }
            break;
        case Syntax.YieldExpression:
            break;
        default:
            assert(param.type === Syntax.ObjectPattern, 'Invalid type');
            for (i = 0; i < param.properties.length; i++) {
                checkPatternParam(options, param.properties[i].value);
            }
            break;
        }
    }
    function reinterpretAsCoverFormalsList(expr) {
        var i, len, param, params, defaults, defaultCount, options, token;

        defaults = [];
        defaultCount = 0;
        params = [expr];

        switch (expr.type) {
        case Syntax.Identifier:
            break;
        case PlaceHolders.ArrowParameterPlaceHolder:
            params = expr.params;
            break;
        default:
            return null;
        }

        options = {
            paramSet: {}
        };

        for (i = 0, len = params.length; i < len; i += 1) {
            param = params[i];
            switch (param.type) {
            case Syntax.AssignmentPattern:
                params[i] = param.left;
                if (param.right.type === Syntax.YieldExpression) {
                    if (param.right.argument) {
                        throwUnexpectedToken(lookahead);
                    }
                    param.right.type = Syntax.Identifier;
                    param.right.name = 'yield';
                    delete param.right.argument;
                    delete param.right.delegate;
                }
                defaults.push(param.right);
                ++defaultCount;
                checkPatternParam(options, param.left);
                break;
            default:
                checkPatternParam(options, param);
                params[i] = param;
                defaults.push(null);
                break;
            }
        }

        if (strict || !state.allowYield) {
            for (i = 0, len = params.length; i < len; i += 1) {
                param = params[i];
                if (param.type === Syntax.YieldExpression) {
                    throwUnexpectedToken(lookahead);
                }
            }
        }

        if (options.message === Messages.StrictParamDupe) {
            token = strict ? options.stricted : options.firstRestricted;
            throwUnexpectedToken(token, options.message);
        }

        if (defaultCount === 0) {
            defaults = [];
        }

        return {
            params: params,
            defaults: defaults,
            stricted: options.stricted,
            firstRestricted: options.firstRestricted,
            message: options.message
        };
    }

    function parseArrowFunctionExpression(options, node) {
        var previousStrict, previousAllowYield, body;

        if (hasLineTerminator) {
            tolerateUnexpectedToken(lookahead);
        }
        expect('=>');

        previousStrict = strict;
        previousAllowYield = state.allowYield;
        state.allowYield = true;

        body = parseConciseBody();

        if (strict && options.firstRestricted) {
            throwUnexpectedToken(options.firstRestricted, options.message);
        }
        if (strict && options.stricted) {
            tolerateUnexpectedToken(options.stricted, options.message);
        }

        strict = previousStrict;
        state.allowYield = previousAllowYield;

        return node.finishArrowFunctionExpression(options.params, options.defaults, body, body.type !== Syntax.BlockStatement);
    }

    // ECMA-262 14.4 Yield expression

    function parseYieldExpression() {
        var argument, expr, delegate, previousAllowYield;

        argument = null;
        expr = new Node();
        delegate = false;

        expectKeyword('yield');

        if (!hasLineTerminator) {
            previousAllowYield = state.allowYield;
            state.allowYield = false;
            delegate = match('*');
            if (delegate) {
                lex();
                argument = parseAssignmentExpression();
            } else {
                if (!match(';') && !match('}') && !match(')') && lookahead.type !== Token.EOF) {
                    argument = parseAssignmentExpression();
                }
            }
            state.allowYield = previousAllowYield;
        }

        return expr.finishYieldExpression(argument, delegate);
    }

    // ECMA-262 12.14 Assignment Operators

    function parseAssignmentExpression() {
        var token, expr, right, list, startToken;

        startToken = lookahead;
        token = lookahead;

        if (!state.allowYield && matchKeyword('yield')) {
            return parseYieldExpression();
        }

        expr = parseConditionalExpression();

        if (expr.type === PlaceHolders.ArrowParameterPlaceHolder || match('=>')) {
            isAssignmentTarget = isBindingElement = false;
            list = reinterpretAsCoverFormalsList(expr);

            if (list) {
                firstCoverInitializedNameError = null;
                return parseArrowFunctionExpression(list, new WrappingNode(startToken));
            }

            return expr;
        }

        if (matchAssign()) {
            if (!isAssignmentTarget) {
                tolerateError(Messages.InvalidLHSInAssignment);
            }

            // ECMA-262 12.1.1
            if (strict && expr.type === Syntax.Identifier) {
                if (isRestrictedWord(expr.name)) {
                    tolerateUnexpectedToken(token, Messages.StrictLHSAssignment);
                }
                if (isStrictModeReservedWord(expr.name)) {
                    tolerateUnexpectedToken(token, Messages.StrictReservedWord);
                }
            }

            if (!match('=')) {
                isAssignmentTarget = isBindingElement = false;
            } else {
                reinterpretExpressionAsPattern(expr);
            }

            token = lex();
            right = isolateCoverGrammar(parseAssignmentExpression);
            expr = new WrappingNode(startToken).finishAssignmentExpression(token.value, expr, right);
            firstCoverInitializedNameError = null;
        }

        return expr;
    }

    // ECMA-262 12.15 Comma Operator

    function parseExpression() {
        var expr, startToken = lookahead, expressions;

        expr = isolateCoverGrammar(parseAssignmentExpression);

        if (match(',')) {
            expressions = [expr];

            while (startIndex < length) {
                if (!match(',')) {
                    break;
                }
                lex();
                expressions.push(isolateCoverGrammar(parseAssignmentExpression));
            }

            expr = new WrappingNode(startToken).finishSequenceExpression(expressions);
        }

        return expr;
    }

    // ECMA-262 13.2 Block

    function parseStatementListItem() {
        if (lookahead.type === Token.Keyword) {
            switch (lookahead.value) {
            case 'export':
                if (state.sourceType !== 'module') {
                    tolerateUnexpectedToken(lookahead, Messages.IllegalExportDeclaration);
                }
                return parseExportDeclaration();
            case 'import':
                if (state.sourceType !== 'module') {
                    tolerateUnexpectedToken(lookahead, Messages.IllegalImportDeclaration);
                }
                return parseImportDeclaration();
            case 'const':
                return parseLexicalDeclaration({inFor: false});
            case 'function':
                return parseFunctionDeclaration(new Node());
            case 'class':
                return parseClassDeclaration();
            }
        }

        if (matchKeyword('let') && isLexicalDeclaration()) {
            return parseLexicalDeclaration({inFor: false});
        }

        return parseStatement();
    }

    function parseStatementList() {
        var list = [];
        while (startIndex < length) {
            if (match('}')) {
                break;
            }
            list.push(parseStatementListItem());
        }

        return list;
    }

    function parseBlock() {
        var block, node = new Node();

        expect('{');

        block = parseStatementList();

        expect('}');

        return node.finishBlockStatement(block);
    }

    // ECMA-262 13.3.2 Variable Statement

    function parseVariableIdentifier(kind) {
        var token, node = new Node();

        token = lex();

        if (token.type === Token.Keyword && token.value === 'yield') {
            if (strict) {
                tolerateUnexpectedToken(token, Messages.StrictReservedWord);
            } if (!state.allowYield) {
                throwUnexpectedToken(token);
            }
        } else if (token.type !== Token.Identifier) {
            if (strict && token.type === Token.Keyword && isStrictModeReservedWord(token.value)) {
                tolerateUnexpectedToken(token, Messages.StrictReservedWord);
            } else {
                if (strict || token.value !== 'let' || kind !== 'var') {
                    throwUnexpectedToken(token);
                }
            }
        } else if (state.sourceType === 'module' && token.type === Token.Identifier && token.value === 'await') {
            tolerateUnexpectedToken(token);
        }

        return node.finishIdentifier(token.value);
    }

    function parseVariableDeclaration(options) {
        var init = null, id, node = new Node(), params = [];

        id = parsePattern(params, 'var');

        // ECMA-262 12.2.1
        if (strict && isRestrictedWord(id.name)) {
            tolerateError(Messages.StrictVarName);
        }

        if (match('=')) {
            lex();
            init = isolateCoverGrammar(parseAssignmentExpression);
        } else if (id.type !== Syntax.Identifier && !options.inFor) {
            expect('=');
        }

        return node.finishVariableDeclarator(id, init);
    }

    function parseVariableDeclarationList(options) {
        var opt, list;

        opt = { inFor: options.inFor };
        list = [parseVariableDeclaration(opt)];

        while (match(',')) {
            lex();
            list.push(parseVariableDeclaration(opt));
        }

        return list;
    }

    function parseVariableStatement(node) {
        var declarations;

        expectKeyword('var');

        declarations = parseVariableDeclarationList({ inFor: false });

        consumeSemicolon();

        return node.finishVariableDeclaration(declarations);
    }

    // ECMA-262 13.3.1 Let and Const Declarations

    function parseLexicalBinding(kind, options) {
        var init = null, id, node = new Node(), params = [];

        id = parsePattern(params, kind);

        // ECMA-262 12.2.1
        if (strict && id.type === Syntax.Identifier && isRestrictedWord(id.name)) {
            tolerateError(Messages.StrictVarName);
        }

        if (kind === 'const') {
            if (!matchKeyword('in') && !matchContextualKeyword('of')) {
                expect('=');
                init = isolateCoverGrammar(parseAssignmentExpression);
            }
        } else if ((!options.inFor && id.type !== Syntax.Identifier) || match('=')) {
            expect('=');
            init = isolateCoverGrammar(parseAssignmentExpression);
        }

        return node.finishVariableDeclarator(id, init);
    }

    function parseBindingList(kind, options) {
        var list = [parseLexicalBinding(kind, options)];

        while (match(',')) {
            lex();
            list.push(parseLexicalBinding(kind, options));
        }

        return list;
    }


    function tokenizerState() {
        return {
            index: index,
            lineNumber: lineNumber,
            lineStart: lineStart,
            hasLineTerminator: hasLineTerminator,
            lastIndex: lastIndex,
            lastLineNumber: lastLineNumber,
            lastLineStart: lastLineStart,
            startIndex: startIndex,
            startLineNumber: startLineNumber,
            startLineStart: startLineStart,
            lookahead: lookahead,
            tokenCount: extra.tokens ? extra.tokens.length : 0
        };
    }

    function resetTokenizerState(ts) {
        index = ts.index;
        lineNumber = ts.lineNumber;
        lineStart = ts.lineStart;
        hasLineTerminator = ts.hasLineTerminator;
        lastIndex = ts.lastIndex;
        lastLineNumber = ts.lastLineNumber;
        lastLineStart = ts.lastLineStart;
        startIndex = ts.startIndex;
        startLineNumber = ts.startLineNumber;
        startLineStart = ts.startLineStart;
        lookahead = ts.lookahead;
        if (extra.tokens) {
            extra.tokens.splice(ts.tokenCount, extra.tokens.length);
        }
    }

    function isLexicalDeclaration() {
        var lexical, ts;

        ts = tokenizerState();

        lex();
        lexical = (lookahead.type === Token.Identifier) || match('[') || match('{') ||
            matchKeyword('let') || matchKeyword('yield');

        resetTokenizerState(ts);

        return lexical;
    }

    function parseLexicalDeclaration(options) {
        var kind, declarations, node = new Node();

        kind = lex().value;
        assert(kind === 'let' || kind === 'const', 'Lexical declaration must be either let or const');

        declarations = parseBindingList(kind, options);

        consumeSemicolon();

        return node.finishLexicalDeclaration(declarations, kind);
    }

    function parseRestElement(params) {
        var param, node = new Node();

        lex();

        if (match('{')) {
            throwError(Messages.ObjectPatternAsRestParameter);
        }

        params.push(lookahead);

        param = parseVariableIdentifier();

        if (match('=')) {
            throwError(Messages.DefaultRestParameter);
        }

        if (!match(')')) {
            throwError(Messages.ParameterAfterRestParameter);
        }

        return node.finishRestElement(param);
    }

    // ECMA-262 13.4 Empty Statement

    function parseEmptyStatement(node) {
        expect(';');
        return node.finishEmptyStatement();
    }

    // ECMA-262 12.4 Expression Statement

    function parseExpressionStatement(node) {
        var expr = parseExpression();
        consumeSemicolon();
        return node.finishExpressionStatement(expr);
    }

    // ECMA-262 13.6 If statement

    function parseIfStatement(node) {
        var test, consequent, alternate;

        expectKeyword('if');

        expect('(');

        test = parseExpression();

        expect(')');

        consequent = parseStatement();

        if (matchKeyword('else')) {
            lex();
            alternate = parseStatement();
        } else {
            alternate = null;
        }

        return node.finishIfStatement(test, consequent, alternate);
    }

    // ECMA-262 13.7 Iteration Statements

    function parseDoWhileStatement(node) {
        var body, test, oldInIteration;

        expectKeyword('do');

        oldInIteration = state.inIteration;
        state.inIteration = true;

        body = parseStatement();

        state.inIteration = oldInIteration;

        expectKeyword('while');

        expect('(');

        test = parseExpression();

        expect(')');

        if (match(';')) {
            lex();
        }

        return node.finishDoWhileStatement(body, test);
    }

    function parseWhileStatement(node) {
        var test, body, oldInIteration;

        expectKeyword('while');

        expect('(');

        test = parseExpression();

        expect(')');

        oldInIteration = state.inIteration;
        state.inIteration = true;

        body = parseStatement();

        state.inIteration = oldInIteration;

        return node.finishWhileStatement(test, body);
    }

    function parseForStatement(node) {
        var init, forIn, initSeq, initStartToken, test, update, left, right, kind, declarations,
            body, oldInIteration, previousAllowIn = state.allowIn;

        init = test = update = null;
        forIn = true;

        expectKeyword('for');

        expect('(');

        if (match(';')) {
            lex();
        } else {
            if (matchKeyword('var')) {
                init = new Node();
                lex();

                state.allowIn = false;
                declarations = parseVariableDeclarationList({ inFor: true });
                state.allowIn = previousAllowIn;

                if (declarations.length === 1 && matchKeyword('in')) {
                    init = init.finishVariableDeclaration(declarations);
                    lex();
                    left = init;
                    right = parseExpression();
                    init = null;
                } else if (declarations.length === 1 && declarations[0].init === null && matchContextualKeyword('of')) {
                    init = init.finishVariableDeclaration(declarations);
                    lex();
                    left = init;
                    right = parseAssignmentExpression();
                    init = null;
                    forIn = false;
                } else {
                    init = init.finishVariableDeclaration(declarations);
                    expect(';');
                }
            } else if (matchKeyword('const') || matchKeyword('let')) {
                init = new Node();
                kind = lex().value;

                if (!strict && lookahead.value === 'in') {
                    init = init.finishIdentifier(kind);
                    lex();
                    left = init;
                    right = parseExpression();
                    init = null;
                } else {
                    state.allowIn = false;
                    declarations = parseBindingList(kind, {inFor: true});
                    state.allowIn = previousAllowIn;

                    if (declarations.length === 1 && declarations[0].init === null && matchKeyword('in')) {
                        init = init.finishLexicalDeclaration(declarations, kind);
                        lex();
                        left = init;
                        right = parseExpression();
                        init = null;
                    } else if (declarations.length === 1 && declarations[0].init === null && matchContextualKeyword('of')) {
                        init = init.finishLexicalDeclaration(declarations, kind);
                        lex();
                        left = init;
                        right = parseAssignmentExpression();
                        init = null;
                        forIn = false;
                    } else {
                        consumeSemicolon();
                        init = init.finishLexicalDeclaration(declarations, kind);
                    }
                }
            } else {
                initStartToken = lookahead;
                state.allowIn = false;
                init = inheritCoverGrammar(parseAssignmentExpression);
                state.allowIn = previousAllowIn;

                if (matchKeyword('in')) {
                    if (!isAssignmentTarget) {
                        tolerateError(Messages.InvalidLHSInForIn);
                    }

                    lex();
                    reinterpretExpressionAsPattern(init);
                    left = init;
                    right = parseExpression();
                    init = null;
                } else if (matchContextualKeyword('of')) {
                    if (!isAssignmentTarget) {
                        tolerateError(Messages.InvalidLHSInForLoop);
                    }

                    lex();
                    reinterpretExpressionAsPattern(init);
                    left = init;
                    right = parseAssignmentExpression();
                    init = null;
                    forIn = false;
                } else {
                    if (match(',')) {
                        initSeq = [init];
                        while (match(',')) {
                            lex();
                            initSeq.push(isolateCoverGrammar(parseAssignmentExpression));
                        }
                        init = new WrappingNode(initStartToken).finishSequenceExpression(initSeq);
                    }
                    expect(';');
                }
            }
        }

        if (typeof left === 'undefined') {

            if (!match(';')) {
                test = parseExpression();
            }
            expect(';');

            if (!match(')')) {
                update = parseExpression();
            }
        }

        expect(')');

        oldInIteration = state.inIteration;
        state.inIteration = true;

        body = isolateCoverGrammar(parseStatement);

        state.inIteration = oldInIteration;

        return (typeof left === 'undefined') ?
                node.finishForStatement(init, test, update, body) :
                forIn ? node.finishForInStatement(left, right, body) :
                    node.finishForOfStatement(left, right, body);
    }

    // ECMA-262 13.8 The continue statement

    function parseContinueStatement(node) {
        var label = null, key;

        expectKeyword('continue');

        // Optimize the most common form: 'continue;'.
        if (source.charCodeAt(startIndex) === 0x3B) {
            lex();

            if (!state.inIteration) {
                throwError(Messages.IllegalContinue);
            }

            return node.finishContinueStatement(null);
        }

        if (hasLineTerminator) {
            if (!state.inIteration) {
                throwError(Messages.IllegalContinue);
            }

            return node.finishContinueStatement(null);
        }

        if (lookahead.type === Token.Identifier) {
            label = parseVariableIdentifier();

            key = '$' + label.name;
            if (!Object.prototype.hasOwnProperty.call(state.labelSet, key)) {
                throwError(Messages.UnknownLabel, label.name);
            }
        }

        consumeSemicolon();

        if (label === null && !state.inIteration) {
            throwError(Messages.IllegalContinue);
        }

        return node.finishContinueStatement(label);
    }

    // ECMA-262 13.9 The break statement

    function parseBreakStatement(node) {
        var label = null, key;

        expectKeyword('break');

        // Catch the very common case first: immediately a semicolon (U+003B).
        if (source.charCodeAt(lastIndex) === 0x3B) {
            lex();

            if (!(state.inIteration || state.inSwitch)) {
                throwError(Messages.IllegalBreak);
            }

            return node.finishBreakStatement(null);
        }

        if (hasLineTerminator) {
            if (!(state.inIteration || state.inSwitch)) {
                throwError(Messages.IllegalBreak);
            }
        } else if (lookahead.type === Token.Identifier) {
            label = parseVariableIdentifier();

            key = '$' + label.name;
            if (!Object.prototype.hasOwnProperty.call(state.labelSet, key)) {
                throwError(Messages.UnknownLabel, label.name);
            }
        }

        consumeSemicolon();

        if (label === null && !(state.inIteration || state.inSwitch)) {
            throwError(Messages.IllegalBreak);
        }

        return node.finishBreakStatement(label);
    }

    // ECMA-262 13.10 The return statement

    function parseReturnStatement(node) {
        var argument = null;

        expectKeyword('return');

        if (!state.inFunctionBody) {
            tolerateError(Messages.IllegalReturn);
        }

        // 'return' followed by a space and an identifier is very common.
        if (source.charCodeAt(lastIndex) === 0x20) {
            if (isIdentifierStart(source.charCodeAt(lastIndex + 1))) {
                argument = parseExpression();
                consumeSemicolon();
                return node.finishReturnStatement(argument);
            }
        }

        if (hasLineTerminator) {
            // HACK
            return node.finishReturnStatement(null);
        }

        if (!match(';')) {
            if (!match('}') && lookahead.type !== Token.EOF) {
                argument = parseExpression();
            }
        }

        consumeSemicolon();

        return node.finishReturnStatement(argument);
    }

    // ECMA-262 13.11 The with statement

    function parseWithStatement(node) {
        var object, body;

        if (strict) {
            tolerateError(Messages.StrictModeWith);
        }

        expectKeyword('with');

        expect('(');

        object = parseExpression();

        expect(')');

        body = parseStatement();

        return node.finishWithStatement(object, body);
    }

    // ECMA-262 13.12 The switch statement

    function parseSwitchCase() {
        var test, consequent = [], statement, node = new Node();

        if (matchKeyword('default')) {
            lex();
            test = null;
        } else {
            expectKeyword('case');
            test = parseExpression();
        }
        expect(':');

        while (startIndex < length) {
            if (match('}') || matchKeyword('default') || matchKeyword('case')) {
                break;
            }
            statement = parseStatementListItem();
            consequent.push(statement);
        }

        return node.finishSwitchCase(test, consequent);
    }

    function parseSwitchStatement(node) {
        var discriminant, cases, clause, oldInSwitch, defaultFound;

        expectKeyword('switch');

        expect('(');

        discriminant = parseExpression();

        expect(')');

        expect('{');

        cases = [];

        if (match('}')) {
            lex();
            return node.finishSwitchStatement(discriminant, cases);
        }

        oldInSwitch = state.inSwitch;
        state.inSwitch = true;
        defaultFound = false;

        while (startIndex < length) {
            if (match('}')) {
                break;
            }
            clause = parseSwitchCase();
            if (clause.test === null) {
                if (defaultFound) {
                    throwError(Messages.MultipleDefaultsInSwitch);
                }
                defaultFound = true;
            }
            cases.push(clause);
        }

        state.inSwitch = oldInSwitch;

        expect('}');

        return node.finishSwitchStatement(discriminant, cases);
    }

    // ECMA-262 13.14 The throw statement

    function parseThrowStatement(node) {
        var argument;

        expectKeyword('throw');

        if (hasLineTerminator) {
            throwError(Messages.NewlineAfterThrow);
        }

        argument = parseExpression();

        consumeSemicolon();

        return node.finishThrowStatement(argument);
    }

    // ECMA-262 13.15 The try statement

    function parseCatchClause() {
        var param, params = [], paramMap = {}, key, i, body, node = new Node();

        expectKeyword('catch');

        expect('(');
        if (match(')')) {
            throwUnexpectedToken(lookahead);
        }

        param = parsePattern(params);
        for (i = 0; i < params.length; i++) {
            key = '$' + params[i].value;
            if (Object.prototype.hasOwnProperty.call(paramMap, key)) {
                tolerateError(Messages.DuplicateBinding, params[i].value);
            }
            paramMap[key] = true;
        }

        // ECMA-262 12.14.1
        if (strict && isRestrictedWord(param.name)) {
            tolerateError(Messages.StrictCatchVariable);
        }

        expect(')');
        body = parseBlock();
        return node.finishCatchClause(param, body);
    }

    function parseTryStatement(node) {
        var block, handler = null, finalizer = null;

        expectKeyword('try');

        block = parseBlock();

        if (matchKeyword('catch')) {
            handler = parseCatchClause();
        }

        if (matchKeyword('finally')) {
            lex();
            finalizer = parseBlock();
        }

        if (!handler && !finalizer) {
            throwError(Messages.NoCatchOrFinally);
        }

        return node.finishTryStatement(block, handler, finalizer);
    }

    // ECMA-262 13.16 The debugger statement

    function parseDebuggerStatement(node) {
        expectKeyword('debugger');

        consumeSemicolon();

        return node.finishDebuggerStatement();
    }

    // 13 Statements

    function parseStatement() {
        var type = lookahead.type,
            expr,
            labeledBody,
            key,
            node;

        if (type === Token.EOF) {
            throwUnexpectedToken(lookahead);
        }

        if (type === Token.Punctuator && lookahead.value === '{') {
            return parseBlock();
        }
        isAssignmentTarget = isBindingElement = true;
        node = new Node();

        if (type === Token.Punctuator) {
            switch (lookahead.value) {
            case ';':
                return parseEmptyStatement(node);
            case '(':
                return parseExpressionStatement(node);
            }
        } else if (type === Token.Keyword) {
            switch (lookahead.value) {
            case 'break':
                return parseBreakStatement(node);
            case 'continue':
                return parseContinueStatement(node);
            case 'debugger':
                return parseDebuggerStatement(node);
            case 'do':
                return parseDoWhileStatement(node);
            case 'for':
                return parseForStatement(node);
            case 'function':
                return parseFunctionDeclaration(node);
            case 'if':
                return parseIfStatement(node);
            case 'return':
                return parseReturnStatement(node);
            case 'switch':
                return parseSwitchStatement(node);
            case 'throw':
                return parseThrowStatement(node);
            case 'try':
                return parseTryStatement(node);
            case 'var':
                return parseVariableStatement(node);
            case 'while':
                return parseWhileStatement(node);
            case 'with':
                return parseWithStatement(node);
            }
        }

        expr = parseExpression();

        // ECMA-262 12.12 Labelled Statements
        if ((expr.type === Syntax.Identifier) && match(':')) {
            lex();

            key = '$' + expr.name;
            if (Object.prototype.hasOwnProperty.call(state.labelSet, key)) {
                throwError(Messages.Redeclaration, 'Label', expr.name);
            }

            state.labelSet[key] = true;
            labeledBody = parseStatement();
            delete state.labelSet[key];
            return node.finishLabeledStatement(expr, labeledBody);
        }

        consumeSemicolon();

        return node.finishExpressionStatement(expr);
    }

    // ECMA-262 14.1 Function Definition

    function parseFunctionSourceElements() {
        var statement, body = [], token, directive, firstRestricted,
            oldLabelSet, oldInIteration, oldInSwitch, oldInFunctionBody,
            node = new Node();

        expect('{');

        while (startIndex < length) {
            if (lookahead.type !== Token.StringLiteral) {
                break;
            }
            token = lookahead;

            statement = parseStatementListItem();
            body.push(statement);
            if (statement.expression.type !== Syntax.Literal) {
                // this is not directive
                break;
            }
            directive = source.slice(token.start + 1, token.end - 1);
            if (directive === 'use strict') {
                strict = true;
                if (firstRestricted) {
                    tolerateUnexpectedToken(firstRestricted, Messages.StrictOctalLiteral);
                }
            } else {
                if (!firstRestricted && token.octal) {
                    firstRestricted = token;
                }
            }
        }

        oldLabelSet = state.labelSet;
        oldInIteration = state.inIteration;
        oldInSwitch = state.inSwitch;
        oldInFunctionBody = state.inFunctionBody;

        state.labelSet = {};
        state.inIteration = false;
        state.inSwitch = false;
        state.inFunctionBody = true;

        while (startIndex < length) {
            if (match('}')) {
                break;
            }
            body.push(parseStatementListItem());
        }

        expect('}');

        state.labelSet = oldLabelSet;
        state.inIteration = oldInIteration;
        state.inSwitch = oldInSwitch;
        state.inFunctionBody = oldInFunctionBody;

        return node.finishBlockStatement(body);
    }

    function validateParam(options, param, name) {
        var key = '$' + name;
        if (strict) {
            if (isRestrictedWord(name)) {
                options.stricted = param;
                options.message = Messages.StrictParamName;
            }
            if (Object.prototype.hasOwnProperty.call(options.paramSet, key)) {
                options.stricted = param;
                options.message = Messages.StrictParamDupe;
            }
        } else if (!options.firstRestricted) {
            if (isRestrictedWord(name)) {
                options.firstRestricted = param;
                options.message = Messages.StrictParamName;
            } else if (isStrictModeReservedWord(name)) {
                options.firstRestricted = param;
                options.message = Messages.StrictReservedWord;
            } else if (Object.prototype.hasOwnProperty.call(options.paramSet, key)) {
                options.stricted = param;
                options.message = Messages.StrictParamDupe;
            }
        }
        options.paramSet[key] = true;
    }

    function parseParam(options) {
        var token, param, params = [], i, def;

        token = lookahead;
        if (token.value === '...') {
            param = parseRestElement(params);
            validateParam(options, param.argument, param.argument.name);
            options.params.push(param);
            options.defaults.push(null);
            return false;
        }

        param = parsePatternWithDefault(params);
        for (i = 0; i < params.length; i++) {
            validateParam(options, params[i], params[i].value);
        }

        if (param.type === Syntax.AssignmentPattern) {
            def = param.right;
            param = param.left;
            ++options.defaultCount;
        }

        options.params.push(param);
        options.defaults.push(def);

        return !match(')');
    }

    function parseParams(firstRestricted) {
        var options;

        options = {
            params: [],
            defaultCount: 0,
            defaults: [],
            firstRestricted: firstRestricted
        };

        expect('(');

        if (!match(')')) {
            options.paramSet = {};
            while (startIndex < length) {
                if (!parseParam(options)) {
                    break;
                }
                expect(',');
            }
        }

        expect(')');

        if (options.defaultCount === 0) {
            options.defaults = [];
        }

        return {
            params: options.params,
            defaults: options.defaults,
            stricted: options.stricted,
            firstRestricted: options.firstRestricted,
            message: options.message
        };
    }

    function parseFunctionDeclaration(node, identifierIsOptional) {
        var id = null, params = [], defaults = [], body, token, stricted, tmp, firstRestricted, message, previousStrict,
            isGenerator, previousAllowYield;

        previousAllowYield = state.allowYield;

        expectKeyword('function');

        isGenerator = match('*');
        if (isGenerator) {
            lex();
        }

        if (!identifierIsOptional || !match('(')) {
            token = lookahead;
            id = parseVariableIdentifier();
            if (strict) {
                if (isRestrictedWord(token.value)) {
                    tolerateUnexpectedToken(token, Messages.StrictFunctionName);
                }
            } else {
                if (isRestrictedWord(token.value)) {
                    firstRestricted = token;
                    message = Messages.StrictFunctionName;
                } else if (isStrictModeReservedWord(token.value)) {
                    firstRestricted = token;
                    message = Messages.StrictReservedWord;
                }
            }
        }

        state.allowYield = !isGenerator;
        tmp = parseParams(firstRestricted);
        params = tmp.params;
        defaults = tmp.defaults;
        stricted = tmp.stricted;
        firstRestricted = tmp.firstRestricted;
        if (tmp.message) {
            message = tmp.message;
        }


        previousStrict = strict;
        body = parseFunctionSourceElements();
        if (strict && firstRestricted) {
            throwUnexpectedToken(firstRestricted, message);
        }
        if (strict && stricted) {
            tolerateUnexpectedToken(stricted, message);
        }

        strict = previousStrict;
        state.allowYield = previousAllowYield;

        return node.finishFunctionDeclaration(id, params, defaults, body, isGenerator);
    }

    function parseFunctionExpression() {
        var token, id = null, stricted, firstRestricted, message, tmp,
            params = [], defaults = [], body, previousStrict, node = new Node(),
            isGenerator, previousAllowYield;

        previousAllowYield = state.allowYield;

        expectKeyword('function');

        isGenerator = match('*');
        if (isGenerator) {
            lex();
        }

        state.allowYield = !isGenerator;
        if (!match('(')) {
            token = lookahead;
            id = (!strict && !isGenerator && matchKeyword('yield')) ? parseNonComputedProperty() : parseVariableIdentifier();
            if (strict) {
                if (isRestrictedWord(token.value)) {
                    tolerateUnexpectedToken(token, Messages.StrictFunctionName);
                }
            } else {
                if (isRestrictedWord(token.value)) {
                    firstRestricted = token;
                    message = Messages.StrictFunctionName;
                } else if (isStrictModeReservedWord(token.value)) {
                    firstRestricted = token;
                    message = Messages.StrictReservedWord;
                }
            }
        }

        tmp = parseParams(firstRestricted);
        params = tmp.params;
        defaults = tmp.defaults;
        stricted = tmp.stricted;
        firstRestricted = tmp.firstRestricted;
        if (tmp.message) {
            message = tmp.message;
        }

        previousStrict = strict;
        body = parseFunctionSourceElements();
        if (strict && firstRestricted) {
            throwUnexpectedToken(firstRestricted, message);
        }
        if (strict && stricted) {
            tolerateUnexpectedToken(stricted, message);
        }
        strict = previousStrict;
        state.allowYield = previousAllowYield;

        return node.finishFunctionExpression(id, params, defaults, body, isGenerator);
    }

    // ECMA-262 14.5 Class Definitions

    function parseClassBody() {
        var classBody, token, isStatic, hasConstructor = false, body, method, computed, key;

        classBody = new Node();

        expect('{');
        body = [];
        while (!match('}')) {
            if (match(';')) {
                lex();
            } else {
                method = new Node();
                token = lookahead;
                isStatic = false;
                computed = match('[');
                if (match('*')) {
                    lex();
                } else {
                    key = parseObjectPropertyKey();
                    if (key.name === 'static' && (lookaheadPropertyName() || match('*'))) {
                        token = lookahead;
                        isStatic = true;
                        computed = match('[');
                        if (match('*')) {
                            lex();
                        } else {
                            key = parseObjectPropertyKey();
                        }
                    }
                }
                method = tryParseMethodDefinition(token, key, computed, method);
                if (method) {
                    method['static'] = isStatic; // jscs:ignore requireDotNotation
                    if (method.kind === 'init') {
                        method.kind = 'method';
                    }
                    if (!isStatic) {
                        if (!method.computed && (method.key.name || method.key.value.toString()) === 'constructor') {
                            if (method.kind !== 'method' || !method.method || method.value.generator) {
                                throwUnexpectedToken(token, Messages.ConstructorSpecialMethod);
                            }
                            if (hasConstructor) {
                                throwUnexpectedToken(token, Messages.DuplicateConstructor);
                            } else {
                                hasConstructor = true;
                            }
                            method.kind = 'constructor';
                        }
                    } else {
                        if (!method.computed && (method.key.name || method.key.value.toString()) === 'prototype') {
                            throwUnexpectedToken(token, Messages.StaticPrototype);
                        }
                    }
                    method.type = Syntax.MethodDefinition;
                    delete method.method;
                    delete method.shorthand;
                    body.push(method);
                } else {
                    throwUnexpectedToken(lookahead);
                }
            }
        }
        lex();
        return classBody.finishClassBody(body);
    }

    function parseClassDeclaration(identifierIsOptional) {
        var id = null, superClass = null, classNode = new Node(), classBody, previousStrict = strict;
        strict = true;

        expectKeyword('class');

        if (!identifierIsOptional || lookahead.type === Token.Identifier) {
            id = parseVariableIdentifier();
        }

        if (matchKeyword('extends')) {
            lex();
            superClass = isolateCoverGrammar(parseLeftHandSideExpressionAllowCall);
        }
        classBody = parseClassBody();
        strict = previousStrict;

        return classNode.finishClassDeclaration(id, superClass, classBody);
    }

    function parseClassExpression() {
        var id = null, superClass = null, classNode = new Node(), classBody, previousStrict = strict;
        strict = true;

        expectKeyword('class');

        if (lookahead.type === Token.Identifier) {
            id = parseVariableIdentifier();
        }

        if (matchKeyword('extends')) {
            lex();
            superClass = isolateCoverGrammar(parseLeftHandSideExpressionAllowCall);
        }
        classBody = parseClassBody();
        strict = previousStrict;

        return classNode.finishClassExpression(id, superClass, classBody);
    }

    // ECMA-262 15.2 Modules

    function parseModuleSpecifier() {
        var node = new Node();

        if (lookahead.type !== Token.StringLiteral) {
            throwError(Messages.InvalidModuleSpecifier);
        }
        return node.finishLiteral(lex());
    }

    // ECMA-262 15.2.3 Exports

    function parseExportSpecifier() {
        var exported, local, node = new Node(), def;
        if (matchKeyword('default')) {
            // export {default} from 'something';
            def = new Node();
            lex();
            local = def.finishIdentifier('default');
        } else {
            local = parseVariableIdentifier();
        }
        if (matchContextualKeyword('as')) {
            lex();
            exported = parseNonComputedProperty();
        }
        return node.finishExportSpecifier(local, exported);
    }

    function parseExportNamedDeclaration(node) {
        var declaration = null,
            isExportFromIdentifier,
            src = null, specifiers = [];

        // non-default export
        if (lookahead.type === Token.Keyword) {
            // covers:
            // export var f = 1;
            switch (lookahead.value) {
                case 'let':
                case 'const':
                    declaration = parseLexicalDeclaration({inFor: false});
                    return node.finishExportNamedDeclaration(declaration, specifiers, null);
                case 'var':
                case 'class':
                case 'function':
                    declaration = parseStatementListItem();
                    return node.finishExportNamedDeclaration(declaration, specifiers, null);
            }
        }

        expect('{');
        while (!match('}')) {
            isExportFromIdentifier = isExportFromIdentifier || matchKeyword('default');
            specifiers.push(parseExportSpecifier());
            if (!match('}')) {
                expect(',');
                if (match('}')) {
                    break;
                }
            }
        }
        expect('}');

        if (matchContextualKeyword('from')) {
            // covering:
            // export {default} from 'foo';
            // export {foo} from 'foo';
            lex();
            src = parseModuleSpecifier();
            consumeSemicolon();
        } else if (isExportFromIdentifier) {
            // covering:
            // export {default}; // missing fromClause
            throwError(lookahead.value ?
                    Messages.UnexpectedToken : Messages.MissingFromClause, lookahead.value);
        } else {
            // cover
            // export {foo};
            consumeSemicolon();
        }
        return node.finishExportNamedDeclaration(declaration, specifiers, src);
    }

    function parseExportDefaultDeclaration(node) {
        var declaration = null,
            expression = null;

        // covers:
        // export default ...
        expectKeyword('default');

        if (matchKeyword('function')) {
            // covers:
            // export default function foo () {}
            // export default function () {}
            declaration = parseFunctionDeclaration(new Node(), true);
            return node.finishExportDefaultDeclaration(declaration);
        }
        if (matchKeyword('class')) {
            declaration = parseClassDeclaration(true);
            return node.finishExportDefaultDeclaration(declaration);
        }

        if (matchContextualKeyword('from')) {
            throwError(Messages.UnexpectedToken, lookahead.value);
        }

        // covers:
        // export default {};
        // export default [];
        // export default (1 + 2);
        if (match('{')) {
            expression = parseObjectInitializer();
        } else if (match('[')) {
            expression = parseArrayInitializer();
        } else {
            expression = parseAssignmentExpression();
        }
        consumeSemicolon();
        return node.finishExportDefaultDeclaration(expression);
    }

    function parseExportAllDeclaration(node) {
        var src;

        // covers:
        // export * from 'foo';
        expect('*');
        if (!matchContextualKeyword('from')) {
            throwError(lookahead.value ?
                    Messages.UnexpectedToken : Messages.MissingFromClause, lookahead.value);
        }
        lex();
        src = parseModuleSpecifier();
        consumeSemicolon();

        return node.finishExportAllDeclaration(src);
    }

    function parseExportDeclaration() {
        var node = new Node();
        if (state.inFunctionBody) {
            throwError(Messages.IllegalExportDeclaration);
        }

        expectKeyword('export');

        if (matchKeyword('default')) {
            return parseExportDefaultDeclaration(node);
        }
        if (match('*')) {
            return parseExportAllDeclaration(node);
        }
        return parseExportNamedDeclaration(node);
    }

    // ECMA-262 15.2.2 Imports

    function parseImportSpecifier() {
        // import {<foo as bar>} ...;
        var local, imported, node = new Node();

        imported = parseNonComputedProperty();
        if (matchContextualKeyword('as')) {
            lex();
            local = parseVariableIdentifier();
        }

        return node.finishImportSpecifier(local, imported);
    }

    function parseNamedImports() {
        var specifiers = [];
        // {foo, bar as bas}
        expect('{');
        while (!match('}')) {
            specifiers.push(parseImportSpecifier());
            if (!match('}')) {
                expect(',');
                if (match('}')) {
                    break;
                }
            }
        }
        expect('}');
        return specifiers;
    }

    function parseImportDefaultSpecifier() {
        // import <foo> ...;
        var local, node = new Node();

        local = parseNonComputedProperty();

        return node.finishImportDefaultSpecifier(local);
    }

    function parseImportNamespaceSpecifier() {
        // import <* as foo> ...;
        var local, node = new Node();

        expect('*');
        if (!matchContextualKeyword('as')) {
            throwError(Messages.NoAsAfterImportNamespace);
        }
        lex();
        local = parseNonComputedProperty();

        return node.finishImportNamespaceSpecifier(local);
    }

    function parseImportDeclaration() {
        var specifiers = [], src, node = new Node();

        if (state.inFunctionBody) {
            throwError(Messages.IllegalImportDeclaration);
        }

        expectKeyword('import');

        if (lookahead.type === Token.StringLiteral) {
            // import 'foo';
            src = parseModuleSpecifier();
        } else {

            if (match('{')) {
                // import {bar}
                specifiers = specifiers.concat(parseNamedImports());
            } else if (match('*')) {
                // import * as foo
                specifiers.push(parseImportNamespaceSpecifier());
            } else if (isIdentifierName(lookahead) && !matchKeyword('default')) {
                // import foo
                specifiers.push(parseImportDefaultSpecifier());
                if (match(',')) {
                    lex();
                    if (match('*')) {
                        // import foo, * as foo
                        specifiers.push(parseImportNamespaceSpecifier());
                    } else if (match('{')) {
                        // import foo, {bar}
                        specifiers = specifiers.concat(parseNamedImports());
                    } else {
                        throwUnexpectedToken(lookahead);
                    }
                }
            } else {
                throwUnexpectedToken(lex());
            }

            if (!matchContextualKeyword('from')) {
                throwError(lookahead.value ?
                        Messages.UnexpectedToken : Messages.MissingFromClause, lookahead.value);
            }
            lex();
            src = parseModuleSpecifier();
        }

        consumeSemicolon();
        return node.finishImportDeclaration(specifiers, src);
    }

    // ECMA-262 15.1 Scripts

    function parseScriptBody() {
        var statement, body = [], token, directive, firstRestricted;

        while (startIndex < length) {
            token = lookahead;
            if (token.type !== Token.StringLiteral) {
                break;
            }

            statement = parseStatementListItem();
            body.push(statement);
            if (statement.expression.type !== Syntax.Literal) {
                // this is not directive
                break;
            }
            directive = source.slice(token.start + 1, token.end - 1);
            if (directive === 'use strict') {
                strict = true;
                if (firstRestricted) {
                    tolerateUnexpectedToken(firstRestricted, Messages.StrictOctalLiteral);
                }
            } else {
                if (!firstRestricted && token.octal) {
                    firstRestricted = token;
                }
            }
        }

        while (startIndex < length) {
            statement = parseStatementListItem();
            /* istanbul ignore if */
            if (typeof statement === 'undefined') {
                break;
            }
            body.push(statement);
        }
        return body;
    }

    function parseProgram() {
        var body, node;

        peek();
        node = new Node();

        body = parseScriptBody();
        return node.finishProgram(body, state.sourceType);
    }

    function filterTokenLocation() {
        var i, entry, token, tokens = [];

        for (i = 0; i < extra.tokens.length; ++i) {
            entry = extra.tokens[i];
            token = {
                type: entry.type,
                value: entry.value
            };
            if (entry.regex) {
                token.regex = {
                    pattern: entry.regex.pattern,
                    flags: entry.regex.flags
                };
            }
            if (extra.range) {
                token.range = entry.range;
            }
            if (extra.loc) {
                token.loc = entry.loc;
            }
            tokens.push(token);
        }

        extra.tokens = tokens;
    }

    function tokenize(code, options, delegate) {
        var toString,
            tokens;

        toString = String;
        if (typeof code !== 'string' && !(code instanceof String)) {
            code = toString(code);
        }

        source = code;
        index = 0;
        lineNumber = (source.length > 0) ? 1 : 0;
        lineStart = 0;
        startIndex = index;
        startLineNumber = lineNumber;
        startLineStart = lineStart;
        length = source.length;
        lookahead = null;
        state = {
            allowIn: true,
            allowYield: true,
            labelSet: {},
            inFunctionBody: false,
            inIteration: false,
            inSwitch: false,
            lastCommentStart: -1,
            curlyStack: []
        };

        extra = {};

        // Options matching.
        options = options || {};

        // Of course we collect tokens here.
        options.tokens = true;
        extra.tokens = [];
        extra.tokenValues = [];
        extra.tokenize = true;
        extra.delegate = delegate;

        // The following two fields are necessary to compute the Regex tokens.
        extra.openParenToken = -1;
        extra.openCurlyToken = -1;

        extra.range = (typeof options.range === 'boolean') && options.range;
        extra.loc = (typeof options.loc === 'boolean') && options.loc;

        if (typeof options.comment === 'boolean' && options.comment) {
            extra.comments = [];
        }
        if (typeof options.tolerant === 'boolean' && options.tolerant) {
            extra.errors = [];
        }

        try {
            peek();
            if (lookahead.type === Token.EOF) {
                return extra.tokens;
            }

            lex();
            while (lookahead.type !== Token.EOF) {
                try {
                    lex();
                } catch (lexError) {
                    if (extra.errors) {
                        recordError(lexError);
                        // We have to break on the first error
                        // to avoid infinite loops.
                        break;
                    } else {
                        throw lexError;
                    }
                }
            }

            tokens = extra.tokens;
            if (typeof extra.errors !== 'undefined') {
                tokens.errors = extra.errors;
            }
        } catch (e) {
            throw e;
        } finally {
            extra = {};
        }
        return tokens;
    }

    function parse(code, options) {
        var program, toString;

        toString = String;
        if (typeof code !== 'string' && !(code instanceof String)) {
            code = toString(code);
        }

        source = code;
        index = 0;
        lineNumber = (source.length > 0) ? 1 : 0;
        lineStart = 0;
        startIndex = index;
        startLineNumber = lineNumber;
        startLineStart = lineStart;
        length = source.length;
        lookahead = null;
        state = {
            allowIn: true,
            allowYield: true,
            labelSet: {},
            inFunctionBody: false,
            inIteration: false,
            inSwitch: false,
            lastCommentStart: -1,
            curlyStack: [],
            sourceType: 'script'
        };
        strict = false;

        extra = {};
        if (typeof options !== 'undefined') {
            extra.range = (typeof options.range === 'boolean') && options.range;
            extra.loc = (typeof options.loc === 'boolean') && options.loc;
            extra.attachComment = (typeof options.attachComment === 'boolean') && options.attachComment;

            if (extra.loc && options.source !== null && options.source !== undefined) {
                extra.source = toString(options.source);
            }

            if (typeof options.tokens === 'boolean' && options.tokens) {
                extra.tokens = [];
            }
            if (typeof options.comment === 'boolean' && options.comment) {
                extra.comments = [];
            }
            if (typeof options.tolerant === 'boolean' && options.tolerant) {
                extra.errors = [];
            }
            if (extra.attachComment) {
                extra.range = true;
                extra.comments = [];
                extra.bottomRightStack = [];
                extra.trailingComments = [];
                extra.leadingComments = [];
            }
            if (options.sourceType === 'module') {
                // very restrictive condition for now
                state.sourceType = options.sourceType;
                strict = true;
            }
        }

        try {
            program = parseProgram();
            if (typeof extra.comments !== 'undefined') {
                program.comments = extra.comments;
            }
            if (typeof extra.tokens !== 'undefined') {
                filterTokenLocation();
                program.tokens = extra.tokens;
            }
            if (typeof extra.errors !== 'undefined') {
                program.errors = extra.errors;
            }
        } catch (e) {
            throw e;
        } finally {
            extra = {};
        }

        return program;
    }

    // Sync with *.json manifests.
    exports.version = '2.7.3';

    exports.tokenize = tokenize;

    exports.parse = parse;

    // Deep copy.
    /* istanbul ignore next */
    exports.Syntax = (function () {
        var name, types = {};

        if (typeof Object.create === 'function') {
            types = Object.create(null);
        }

        for (name in Syntax) {
            if (Syntax.hasOwnProperty(name)) {
                types[name] = Syntax[name];
            }
        }

        if (typeof Object.freeze === 'function') {
            Object.freeze(types);
        }

        return types;
    }());

}));
/* vim: set sw=4 ts=4 et tw=80 : */
});

/** This function parses the code and returns a table that gives the variable use
 * in the passed function. The var info table has the following content
 * - it is a map with an entry for each variable accessed. (This refers just to
 * a variable and not to field access on that variable.
 * - the key for an entry is the name of the variable
 * - for each entry there is an array of usages. Each usage as the following info:
 * -- nameUse.path: an array of names constructing the field accessed.
   -- nameUse.scope: a reference to a scope object
   -- nameUse.node: the AST node that identifies this variable
   -- nameUse.isLocal: true if this is a reference to a local variable
   -- nameUse.decalredScope: for local variables only, gives the scope in which the lcoal variable is declared.
 * - additionally, there is a flag indicating if all uses of a name are local variables
 * -- isLocal: true if all uses of a varaible entry are local variables
 **/ 

/** Syntax for AST, names from Esprima.
 * Each entry is a list of nodes inside a node of a given type. the list
 * contains entries with the given fields:
 * {
 *     name:[the name of the field in the node]
 *     list:[true if the field is a list of nodes]
 *     declaration:[boolean indicating if the field corrsponds to a field declaration]
 * @private */
const syntax = {
    AssignmentExpression: [{name:'left'},{name:'right'}],
    ArrayExpression: [{name:'elements',list:true}],
    ArrayPattern: [{name:'elements',list:true}],
    ArrowFunctionExpression: [{name:'params',list:true,declaration:true},{name:'body'},{name:'defaults',list:true}],
    BlockStatement: [{name:'body',list:true}],
    BinaryExpression: [
        {name:'left'},
        {name:'right'}
        //I'm not sure I know all of these. Some may modify the object but we will skip that check here
    ],         
    BreakStatement: [],
    CallExpression: [{name:'callee'},{name:'arguments',list:true}],
    CatchClause: [
        {name:'param',declaration:true},
        {name:'body'}
        //guards omitted - moz specific
    ],
    ConditionalExpression: [{name:'test'},{name:'alternate'},{name:'consequent'}],
    ContinueStatement: [],
    DoWhileStatement: [{name:'body'},{name:'test',list:true}],
    EmptyStatement: [],
    ExpressionStatement: [{name:'expression'}],
    ForStatement: [{name:'init'},{name:'test'},{name:'update',list:true},{name:'body'}],
    ForOfStatement: [{name:'left'},{name:'right'},{name:'body'}],
    ForInStatement: [{name:'left'},{name:'right'},{name:'body'}],
    FunctionDeclaration: [
        {name:'id',declaration:true},
        {name:'params',list:true,declaration:true},
        {name:'body'}
        //no supporting default functions values
    ],
    FunctionExpression: [
        {name:'id',declaration:true},
        {name:'params',list:true,declaration:true},
        {name:'body'}
        //no supporting default functions values
    ],
    Identifier: [], //this is handled specially
    IfStatement: [{name:'test'},{name:'consequent'},{name:'alternate'}],
    Literal: [],
    LabeledStatement: [{name:'body'}],
    LogicalExpression: [{name:'left'},{name:'right'}],
    MemberExpression: [], //this handled specially
    NewExpression: [{name:'callee'},{name:'arguments',list:true}],
    Program: [{name:'body',list:true}],
    Property: [{name:'key'},{name:'value'}], //this is handled specially
    ReturnStatement: [{name:'argument'}],
    RestElement: [{name:'argument'}],
    SequenceExpression: [{name:'expressions',list:true}],
    ObjectExpression: [{name:'properties',list:true}], //this is handled specially 
    ObjectPattern: [{name:'properties',list:true}], 
    SpreadElement: [{name:'argument'}],
    SwitchCase: [{name:'test'},{name:'consequent',list:true}],
    SwitchStatement: [{name:'discriminant'},{name:'cases',list:true}],
    TemplateElement: [],
    TemplateLiteral: [{name:'quasis',list:true},{name:'expressions',list:true}],
    ThisExpression: [],
    ThrowStatement: [{name:'argument'}],
    TryStatement: [
        {name:'block'},
        {name:'handler'},
        {name:'finalizer',list:true}
        //guards omitted, moz specific
    ],
    UnaryExpression: [
        {name:'argument'}
        //the delete operator modifies, but we will skip that error check here
        //"-" | "+" | "!" | "~" | "typeof" | "void" | "delete"
    ],
    UpdateExpression: [{identifierNode:'argument'}],
    VariableDeclaration: [{name:'declarations',list:true,declaration:true}],
    VariableDeclarator: [{name:'id',declaration:true},{name:'init'}],
    WhileStatement: [{name:'body'},{name:'test',list:true}],
    WithStatement: [{name:'object'},{name:'body'}],
    YieldExpression: [
        {name:'argument'}
        //moz spidermonkey specific
    ],

    

    //no support
    AssignmentPattern: null,
    ClassBody: null,
    ClassDeclaration: null,
    ClassExpression: null,
    DebuggerStatement: null,
    ExportAllDeclaration: null,
    ExportDefaultDeclaration: null,
    ExportNamedDeclaration: null,
    ExportSpecifier: null,
    ImportDeclaration: null,
    ImportDefaultSpecifier: null,
    ImportNamespaceSpecifier: null,
    ImportSpecifier: null,
    MetaProperty: null,
    MethodDefinition: null,
    Super: null,
    TaggedTemplateExpression: null

    //if we allowed module import, it would look like this I think
    //but we can not do this in a function, only a module
    //as of the time of this writing, esprima did not support parsing dynamic es6 imports
    // ImportDeclaration: [{name:'specifiers',list:true},{name:'source'}],
    // ImportDefaultSpecifier: [{name:'local'}],
    // ImportNamespaceSpecifier: [{name:'local'}],
    // ImportSpecifier: [{name:'local'},{name:'imported'}],
    
};

/** These are javascript keywords */
const KEYWORDS = {
	"abstract": true,
	"arguments": true,
	"boolean": true,
	"break": true,
	"byte": true,
	"case": true,
	"catch": true,
	"char": true,
	"class": true,
	"const": true,
	"continue": true,
	"debugger": true,
	"default": true,
	"delete": true,
	"do": true,
	"double": true,
	"else": true,
	"enum": true,
	"eval": true,
	"export": true,
	"extends": true,
	"false": true,
	"final": true,
	"finally": true,
	"float": true,
	"for": true,
	"function": true,
	"goto": true,
	"if": true,
	"implements": true,
	"import": true,
	"in": true,
	"instanceof": true,
	"int": true,
	"interface": true,
	"let": true,
	"long": true,
	"native": true,
	"new": true,
	"null": true,
	"package": true,
	"private": true,
	"protected": true,
	"public": true,
	"return": true,
	"short": true,
	"static": true,
	"super": true,
	"switch": true,
	"synchronized": true,
	"this": true,
	"throw": true,
	"throws": true,
	"transient": true,
	"true": true,
	"try": true,
	"typeof": true,
	"var": true,
	"void": true,
	"volatile": true,
	"while": true,
	"with": true,
	"yield": true,
};

/** These are variable names we will not call out in setting the context.
 * NOTE - it is OK if we do not exclude a global variable. It will still work. */
const EXCLUSION_NAMES = {
    "undefined": true,
    "Infinity": true,
    "NaN": true,
    
    "String": true,
    "Number": true,
    "Math": true,
    "Date": true,
    "Array": true,
    "Boolean": true,
    "Error": true,
    "RegExp": true,
    
    "console": true
};

////////////////////////////////////////////////////////////////////////////////
/** This method returns the error list for this formula. It is only valid
 * after a failed call to analyzeCode. 
 *
 *  Error format: (some fields may not be present)
 *  {
 *      "description":String, //A human readable description of the error
 *      "lineNumber":Integer, //line of error, with line 0 being the function declaration, and line 1 being the start of the formula
 *      "index":Integer, //the character number of the error, including the function declaration:  "function() {\n" 
 *      "column":Integer, //the column of the error
 *      "stack":String, //an error stack
 *  }
 * */
////////////////////////////////////////////////////////////////////////////////

/** This method parses the code and returns a list of variabls accessed. It throws
 * an exception if there is an error parsing.
 **/
function analyzeCode(functionText) {

    var returnValue = {};
    
    try {
        var ast = esprima.parse(functionText, { tolerant: true, loc: true });
    
        //check for errors in parsing
        if((ast.errors)&&(ast.errors.length > 0)) {
            returnValue.success = false;
            returnValue.errors = ast.errors;
            return returnValue;
        }
        
        //get the variable list
        var varInfo = getVariableInfo(ast);

        //return the variable info
        returnValue.success = true;
        returnValue.varInfo = varInfo;
        return returnValue;
    }
    catch(exception) {
        returnValue.errors = [];
        returnValue.errors.push(exception);
        return returnValue;
    }
}

/** This method analyzes the AST to find the variabls accessed from the formula.
 * This is done to find the dependencies to determine the order of calculation. 
 * 
 * - The tree is composed of nodes. Each nodes has a type which correspondds to
 * a specific statement or other program syntax element. In particular, some
 * nodes correspond to variables, which we are collecting here.
 * - The variables are in two types of nodes, a simple Identifier node or a
 * MemberExpression, which is a sequence of Identifers.
 * - If the variable is a table, then this table is stored in the "depends on map"
 * - In addition to determining which variables a fucntion depends on, some modifiers
 * are also collected for how the variable is used. 
 * -- is declaration - this node should contain an identifier that is a declaration
 * of a local variable
 * @private */
function getVariableInfo(ast) {
    
    //create the var to hold the parse data
    var processInfo = {};
    processInfo.nameTable = {};
    processInfo.scopeTable = {};
    
    //create the base scope
    var scope = startScope(processInfo);

    //traverse the tree, recursively
    processTreeNode(processInfo,ast,false);
    
    //finish the base scope
    endScope(processInfo);
    
    //finish analyzing the accessed variables
    markLocalVariables(processInfo);
    
    //return the variable names accessed
    return processInfo.nameTable;
}
    
/** This method starts a new loca variable scope, it should be called
 * when a function starts. 
 * @private */
function startScope(processInfo) {
    //initailize id gerneator
    if(processInfo.scopeIdGenerator === undefined) {
        processInfo.scopeIdGenerator = 0;
    }
    
    //create scope
    var scope = {};
    scope.id = String(processInfo.scopeIdGenerator++);
    scope.parent = processInfo.currentScope;
    scope.localVariables ={};
    
    //save this as the current scope
    processInfo.scopeTable[scope.id] = scope;
    processInfo.currentScope = scope;
}

/** This method ends a local variable scope, reverting to the parent scope.
 * It should be called when a function exits. 
 * @private */
function endScope(processInfo) {
    var currentScope = processInfo.currentScope;
    if(!currentScope) return;
    
    //set the scope to the parent scope.
    processInfo.currentScope = currentScope.parent;
}

/** This method analyzes the AST (abstract syntax tree). 
 * @private */
function processTreeNode(processInfo,node,isDeclaration) {
    
    //process the node type
    if((node.type == "Identifier")||(node.type == "MemberExpression")) {
        //process a variable
        processVariable(processInfo,node,isDeclaration);
    } 
    else if((node.type == "FunctionDeclaration")||(node.type == "FunctionExpression")) {
        //process the functoin
        processFunction(processInfo,node);
        
    }
    else if((node.type === "NewExpression")&&(node.callee.type === "Function")) {
        //we currently do not support the function constructor
        //to add it we need to add the local variables and parse the text body
        throw createParsingError("Function constructor not currently supported!",node.loc); 
    }
    else {
        //process some other node
        processGenericNode(processInfo,node);
    }
}
   
/** This method process nodes that are not variabls identifiers. This traverses 
 * down the syntax tree.
 * @private */
function processGenericNode(processInfo,node) {
    //load the syntax node info list for this node
    var nodeInfoList = syntax[node.type];
    
    //process this list
    if(nodeInfoList === undefined) {
        //node not found
        throw createParsingError("Syntax Tree Node not found: " + node.type,node.loc);
    }
    else if(nodeInfoList === null) {
        //node not supported
        throw createParsingError("Syntax node not supported: " + node.type,node.loc);
    }
    else {
        //this is a good node - process it

        //-------------------------
        // process the node list
        //-------------------------
        for(var i = 0; i < nodeInfoList.length; i++) {
            //get node info
            var nodeInfo = nodeInfoList[i];
            
            //check if this field exists in node
            var childField = node[nodeInfo.name];
            if(childField) {
                
                if(nodeInfo.list) {
                    //this is a list of child nodes
                    for(var j = 0; j < childField.length; j++) {
                        processTreeNode(processInfo,childField[j],nodeInfo.declaration);
                    }
                }
                else {
                    //this is a single node
                    processTreeNode(processInfo,childField,nodeInfo.declaration);
                }
            }
        }
    }
}

/** This method processes nodes that are function. For functions a new scope is created 
 * for the body of the function.
 * @private */
function processFunction(processInfo,node) {
    var nodeType = node.type;
    var idNode = node.id;
    var params = node.params;
    var body = node.body;
    
    //difference here between the declaration and expression
    // - in declaration the name of the function is a variable in the parent scope
    // - in expression the name is typically left of. But it can be included, in which case
    //   it is a variable only in the child (function) scope. This lets the function call
    //   itself.
    
    if((nodeType === "FunctionDeclaration")&&(idNode)) {
        //parse id node (variable name) in the parent scope
        processTreeNode(processInfo,idNode,true);
    }
    
    //create a new scope for this function
    var scope = startScope(processInfo);
    
    if((nodeType === "FunctionExpression")&&(idNode)) {
        //parse id node (variable name) in the parent scope
        processTreeNode(processInfo,idNode,true);
    }
    
    //process the variable list
    for(var i = 0; i < params.length; i++) {
        processTreeNode(processInfo,params[i],true);
    }
    
    //process the function body
    processTreeNode(processInfo,body,false);
    
    //end the scope for this function
    endScope(processInfo);
}

/** This method processes nodes that are variables (identifiers and member expressions), adding
 * them to the list of variables which are used in tehe formula.
 * @private */
function processVariable(processInfo,node,isDeclaration) {
    
    //get the variable path and the base name
    var namePath = getVariableDotPath(processInfo,node);
    if(!namePath) return;
    
    var baseName = namePath[0];
    
    //check if it is an excluded name - such as a variable name used by javascript
    if(EXCLUSION_NAMES[baseName]) {
        return;
    }
    
    //add to the name table
    var nameEntry = processInfo.nameTable[baseName];
    if(!nameEntry) {
        nameEntry = {};
        nameEntry.name = baseName;
        nameEntry.uses = [];
        
        processInfo.nameTable[baseName] = nameEntry;
    }
    
    //add a name use entry
    var nameUse = {};
    nameUse.path = namePath;
    nameUse.scope = processInfo.currentScope;
    nameUse.node = node;
    
    nameEntry.uses.push(nameUse);
    
    //if this is a declaration store it as a local varaible
    if(isDeclaration) {
        //store this in the local variables for this scope
        var scopeLocalVariables = processInfo.currentScope.localVariables;
        if(!scopeLocalVariables[baseName]) {
            scopeLocalVariables[baseName] = true;
        }
    }
}

/** This method returns the variable and its fields which are given by the node.
 * It may return null, meaning there is no variable to add to the dependency.  
 * See notes embedded in the code. It is possible to fool this into making a
 * dependecne on a parent (and all children) when all that is required is a 
 * single child. 
 * @private */
function getVariableDotPath(processInfo,node) {
    if(node.type == "Identifier") {
        //read the identifier name
        return [node.name];
    }
    else if(node.type == "MemberExpression") {
        if((node.object.type == "MemberExpression")||(node.object.type == "Identifier")) {
            //MEMBER EXPRESSION OR IDENTIFIER - variable name and/or path
            var variable = getVariableDotPath(processInfo,node.object);

            if(node.computed) {
                //COMPUTED CASE
                //We will not try to figure out what the child is. We will only make a dependence on 
                //the parent. This should work but it is too strong. For example
                //we may be including dependence on a while folder when really we depend
                //on a single child in the folder.
                processTreeNode(processInfo,node.property,false);
            }
            else {
                //append the member expression property to it
                variable.push(node.property.name);
            }

            return variable;
        }
        else {
            //something other than a variable as the object for the member expressoin
            //ignore the variable path after the call. We will set a dependence
            //on the parent which should work but is too strong. For example
            //we may be including dependence on a while folder when really we depend
            //on a single child in the folder.
            processTreeNode(processInfo,node.object,false);
            
            return null;
        }
    }
    else {
        //this shouldn't happen. If it does we didn't code the syntax tree right
        throw createParsingError("Unknown application error: expected a variable identifier node.",node.loc);
    }
}

/** This method annotates the variable usages that are local variables. 
 * @private */
function markLocalVariables(processInfo) {
    for(var key in processInfo.nameTable) {
        var nameEntry = processInfo.nameTable[key];
        var name = nameEntry.name;
        var existNonLocal = false;
        for(var i = 0; i < nameEntry.uses.length; i++) {
            var nameUse = nameEntry.uses[i];
            var scope = nameUse.scope;
            //check if this name is a local variable in this scope or a parent scope
            var varScope = null;
            for(var testScope = scope; testScope; testScope = testScope.parent) {
                if(testScope.localVariables[name]) {
                    varScope = testScope;
                    break;
                }
            }
            if(varScope) {
                //this is a local variable
                nameUse.isLocal = true;
                nameUse.declarationScope = varScope;
            }
            else {
                existNonLocal = true;
            }
        }
        //add a flag to the name enry if all uses are local
        if(!existNonLocal) {
            nameEntry.isLocal = true;
        }
    }
}


/** This method creates an error object. 
 * format:
 * {
 *     description:[string description],
 *     lineNumber:[integer line number, including function declaration line prepended to formula],
 *     column;[integer column on line number]
 * }
 * @private */
function createParsingError(errorMsg,location) {
    var error = new Error(errorMsg);
    if(location) {
        error.lineNumber = location.start.line;
        error.column = location.start.column;
    }
    return error;
}

/** @private */
const APOGEE_FORBIDDEN_NAMES = {
    "apogeeMessenger": true,
    "__initializer": true,
    "__memberFunction": true,
    "__memberGenerator": true,
    "__memberFunctionDebugHook": true
};

/** @private */
const NAME_PATTERN = /[a-zA-Z_$][0-9a-zA-Z_$]*/;

/** This function validates a table name. It returns 
 * [valid,errorMsg]. */
function validateTableName(name) {
    var nameResult = {};

    //check if it is a keyword
    if(KEYWORDS[name]) {
        nameResult.errorMessage = "Illegal name: " + name + " - Javascript reserved keyword";
        nameResult.valid = false;
    }  
    else if(EXCLUSION_NAMES[name]) {
        nameResult.errorMessage = "Illegal name: " + name + " - Javascript variable or value name";
        nameResult.valid = false;
    }
    else if(APOGEE_FORBIDDEN_NAMES[name]) {
        nameResult.errorMessage = "Illegal name: " + name + " - Apogee reserved keyword";
        nameResult.valid = false;
    }
    else {
        //check the pattern
        var nameResult = NAME_PATTERN.exec(name);
        if((!nameResult)||(nameResult[0] !== name)) {
            if(!nameResult) nameResult = {};
            nameResult.errorMessage = "Illegal name format: " + name;
            nameResult.valid = false;
        }
        else {
            nameResult.valid = true;
        }
    }
    return nameResult;
}

/** This method analyzes the code and creates the object function and dependencies. 
 * The results are loaded into the passed object processedCodeData. */
function processCode(argList,functionBody,supplementalCode,codeLabel) {
    
    //analyze the code
    var combinedFunctionBody = createCombinedFunctionBody(argList,functionBody,supplementalCode,codeLabel);
        
    //get the accessed variables
    //
    //parse the code and get variable dependencies
    var effectiveCombinedFunctionBody = MEMBER_LOCALS_TEXT + combinedFunctionBody;
    var analyzeOutput = analyzeCode(effectiveCombinedFunctionBody);
    
    var compiledInfo = {};
    
    if(analyzeOutput.success) {
        compiledInfo.varInfo = analyzeOutput.varInfo;
    }
    else {
        compiledInfo.errors = analyzeOutput.errors;
        compiledInfo.valid = false;
        return compiledInfo;
    }

    //create and execute the generator function to get the member function generator
    //and the memberFunctionContextInitializer
    var generatorFunction = createGeneratorFunction(compiledInfo.varInfo, combinedFunctionBody);
    try {
        //get the generated fucntion
        var generatedFunctions = generatorFunction();
        compiledInfo.memberFunctionGenerator = generatedFunctions.memberGenerator;
        compiledInfo.memberFunctionContextInitializer = generatedFunctions.initializer;  
        compiledInfo.valid = true;                     
    }
    catch(ex) {
        compiledInfo.errors = [ex];
        compiledInfo.valid = false;
    }
    
    return compiledInfo;   
}


/** This method creates the user code object function body. 
 * @private */
function createCombinedFunctionBody(argList,
        functionBody, 
        supplementalCode,
        codeLabel) {
    
    var argListString = argList.join(",");
    
    //create the code body
    var combinedFunctionBody = apogeeutil.formatString(
        MEMBER_FUNCTION_FORMAT_TEXT,
		codeLabel,
        argListString,
        functionBody,
        supplementalCode
    );
        
    return combinedFunctionBody;
}

/** This method creates (1) a closure function that returns another generator function
 * which makes the member function and (2) a function that initializes any external 
 * variables needed in the member function.
 * This closure wraps the variables that are external to this member, meaning other
 * members in the model.
 * This initializer function allows the code to be compiled once and then used with different
 * values for other data in the model.
 * The generator that makes the member function is a closure to wrap the member private
 * code and any other needed data with the member function.
 * @private */
function createGeneratorFunction(varInfo, combinedFunctionBody) {
    
    var contextDeclarationText = "";
    var initializerBody = "";

    //add the messenger as a local variable
    contextDeclarationText += "var apogeeMessenger\n";
    initializerBody += "apogeeMessenger = __messenger\n";
    
    //set the context - here we only defined the variables that are actually used.
	for(var baseName in varInfo) {        
        var baseNameInfo = varInfo[baseName];
        
        //do not add context variable for local or "returnValue", which is explicitly defined
        if((baseName === "returnValue")||(baseNameInfo.isLocal)) continue;
        
        //add a declaration
        contextDeclarationText += "var " + baseName + ";\n";
        
        //add to the context setter
        initializerBody += baseName + ' = __contextManager.getValue(__model,"' + baseName + '");\n';
    }
    
    //create the generator for the object function
    var generatorBody = apogeeutil.formatString(
        GENERATOR_FUNCTION_FORMAT_TEXT,
		contextDeclarationText,
        initializerBody,
        combinedFunctionBody
    );
        
    var generatorFunction = new Function(generatorBody);
    return generatorFunction;    
}


/** This is the format string to create the code body for the object function
 * Input indices:
 * 0: unique member name
 * 1: function argument list with parentheses
 * 2: member formula text
 * 3: supplemental code text
 * 
 * @private
 */
const MEMBER_FUNCTION_FORMAT_TEXT = [
"//{0}",
"",
"//supplemental code--------------",
"{3}",
"//end supplemental code----------",
"",
"//member function----------------",
"function __memberFunction({1}) {",
"//overhead code",
"__memberFunctionDebugHook('{0}');",
"",
"//user code",
"{2}",
"};",
"//end member function------------",
   ].join("\n");
   
/** This line is added when getting the dependencies to account for some local 
 * variables in the member function.
 * @private */
const MEMBER_LOCALS_TEXT = "var apogeeMessenger, __memberFunction, __memberFunctionDebugHook;";
   
/** This is the format string to create the code body for the object function
 * Input indices:
 * 0: context declaration text
 * 1: context setter body
 * 2: object function body
 * @private
 */
const GENERATOR_FUNCTION_FORMAT_TEXT = [
"'use strict'",
"//declare context variables",
"{0}",
"//context setter",
"function __initializer(__model,__contextManager,__messenger) {",
"{1}};",
"",
"//user code",
"function __memberGenerator() {",
"{2}",
"return __memberFunction",
"}",
"return {",
"'memberGenerator': __memberGenerator,",
"'initializer': __initializer",
"};"
   ].join("\n");

/** This is a messenger class for sending action messages. 
 * If the send fails, and exception will be thrown. */
class Messenger {
    
    constructor(model,fromMember) {
        this.model = model;
        this.contextManager = fromMember.getContextManager();
        this.fromMember = fromMember;
    }

    /** This is a convenience method to set a member to a given value.
     * updateMemberName - This is a member name as it would be accessed from the local code
     * data - This is the data to set on the given member. Aside from a JSON value, additional 
     * options are a Promise, to do an asynchronous update, a Error, to send an error to 
     * that table, or apogeeutil.INVALID_VALUE to send the invalid value.
     * These updates are applied after the current calculation is completed. See documentation
     * for more information on the messenger. */
    dataUpdate(updateMemberName,data) {
        
        var member = this._getMemberObject(updateMemberName);
        if(!member) {
            throw new Error("Error calling messenger - member not fond: " + updateMemberName);
        }
        
        //set the data for the table, along with triggering updates on dependent tables.
        var actionData = {};
        actionData.action = "updateData";
        actionData.memberId = member.getId();
        actionData.data = data;
        
        //return is handled above asynchronously
        if(this.model.getIsLocked()) {
            //the messenger would work improperly here
            throw new Error("Error: Messenger must only be called during member formula calculation.");
        }
        else {
            doAction(this.model,actionData);
        }
    }

    /** This is similar to dataUpdate except is allows multiple values to be set.
     * The argument update info is an array with each element representing an individual
     * data update. Each element shoudl be a 2-element array with the first entry being
     * the table name and the second being the data value. */
    compoundDataUpdate(updateInfo) { 
        
        //make the action list
        var actionList = [];
        for(var i = 0; i < updateInfo.length; i++) {
            let updateEntry = updateInfo[i];
            let subActionData = {};
            
            let member = this._getMemberObject(updateEntry[0]);
            if(!member) {
                throw new Error("Error calling messenger - member not fond: " + updateMemberName);
            }
            let data = updateEntry[1];
            
            subActionData.action = "updateData";
            subActionData.memberId = member.getId();
            subActionData.data = data;
            actionList.push(subActionData);
        }
        
        //create the single compound action
        var actionData = {};
        actionData.action = "compoundAction";
        actionData.actions = actionList;
        
        //return is handled above asynchronously
        if(this.model.getIsLocked()) {
            //the messenger would work improperly here
            throw new Error("Error: Messenger must only be called during member formula calculation.");
        }
        else {
            doAction(this.model,actionData);
        }
    }
    
    //=====================
    // Private Functions
    //=====================
    
    
    /** This method returns the member instance for a given local member name,
     * as defined from the source object context. */
    _getMemberObject(localMemberName) { 
        var pathArray = localMemberName.split(".");
        var member = this.contextManager.getMember(this.model,pathArray);
        return member;
    }
}

/** This method takes the varInfo table from the code analysis and returns
 * a lit of member objects which this member depends on.
 */
function getDependencyInfo(varInfo,model,contextManager) {
	var dependsOnMap = {};
	
	//cycle through the variables used
	for(var baseName in varInfo) {
			
        //for each use of this name that is not local, find the referenced object
        var nameEntry = varInfo[baseName];
        for(var i = 0; i < nameEntry.uses.length; i++) {
            var nameUse = nameEntry.uses[i];
            if(!nameUse.isLocal) {
                //look up the object
                var namePath = nameUse.path;

                //lookup this object, along with the passthrough dependencies
                let passThroughDependencies = [];
                var impactor = contextManager.getMember(model,namePath,passThroughDependencies);

                //add the impactor to the dependency map
                if(impactor) {
                    //add as dependent
                    var memberId = impactor.getId();
                    if(dependsOnMap[memberId] != apogeeutil.NORMAL_DEPENDENCY) {
                        dependsOnMap[memberId] = apogeeutil.NORMAL_DEPENDENCY;
                    }
                }

                //add the pass through members to the dependency map (give precedence to normal dependencies)
                passThroughDependencies.forEach(passThroughMember => {
                    var memberId = passThroughMember.getId();
                    if(dependsOnMap[memberId] == undefined) {
                        dependsOnMap[memberId] = apogeeutil.PASS_THROUGH_DEPENDENCY;
                    }
                });
            }
		}
	}
	
	return dependsOnMap;
}

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
class Member extends FieldObject {

    constructor(name,parentId,instanceToCopy,keepUpdatedFixed,specialCaseIdValue) {
        super("member",instanceToCopy,keepUpdatedFixed,specialCaseIdValue);
        
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
        };
        var asynchErrorCallback = errorMsg => {
            let actionData = {};
            actionData.action = "updateData";
            actionData.memberId = this.getId();
            actionData.sourcePromise = promise;
            actionData.data = new Error(errorMsg);
            model.doFutureAction(actionData);
        };

        //call appropriate action when the promise completes
        promise.then(asynchCallback).catch(asynchErrorCallback);
    }

    /** This method can be called to set data without setting the state. It is intended to be
     * used by the folder to set the data value when an error, pending or invalid state is present. This
     * data value is used for pass-through dependenceis. */
    forceUpdateDataWithoutStateChange(data) {
        this.setField("data",data);
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

/** This mixin encapsulates an member whose value depends on on another
 * member. The dependent allows for a recalculation based on an update of the 
 * objects it depends on.
 * 
 * This is a mixin and not a class. It is used for the prototype of the objects that inherit from it.
 * 
 * COMPONENT DEPENDENCIES:
 * 
 */
class DependentMember extends Member {

    /** This initializes the component */
    constructor(name,parentId,instanceToCopy,keepUpdatedFixed,specialCaseIdValue) {
        super(name,parentId,instanceToCopy,keepUpdatedFixed,specialCaseIdValue);

        //==============
        //Fields
        //==============
        //Initailize these if this is a new instance
        if(!instanceToCopy) {
            //this is the list of dependencies
            this.setField("dependsOnMap",{});
        }

        //==============
        //Working variables
        //==============
        this.calcPending = false;
    }

    /** This property tells if this object is a dependent.
     * This property should not be implemented on non-dependents. */
    get isDependent() {
        return true;
    }

    /** This returns a list of the members that this member depends on. */
    getDependsOn() {
        return this.getField("dependsOnMap");
    }

    /** This returns the calc pending flag.  */
    getCalcPending() {
        return this.calcPending;
    }

    /** This sets the calc pending flag to false. It should be called when the 
     * calcultion is no longer needed.  */
    clearCalcPending() {
        this.calcPending = false;
    }

    //Must be implemented in extending object
    ///** This method udpates the dependencies if needed because
    // *a variable was added or removed from the model. Any member that has its dependencies udpated
    // * should be added to the additionalUpdatedObjects list. */
    //updateDependeciesForModelChange(model,additionalUpdatedMembers);

    ///** This is a check to see if the object should be checked for dependencies 
    // * for recalculation. It is safe for this method to always return false and
    // allow the calculation to happen. 
    // * @private */
    //memberUsesRecalculation();

    /** This does any init needed for calculation.  */
    prepareForCalculate() {
        this.calcPending = true;
        //clear any errors, and other state info
        this.clearState();
    }

    ///** This updates the member based on a change in a dependency.  */
    //calculate(model);

    /** This method makes sure any impactors are set. It sets a dependency 
     * error if one or more of the dependencies has a error. */
    initializeImpactors(model) {
        var errorDependencies = [];
        var resultPending = false;
        var resultInvalid = false;
        
        //make sure dependencies are up to date
        let dependsOnMap = this.getField("dependsOnMap");
        for(var idString in dependsOnMap) {
            let dependsOnType = dependsOnMap[idString];
            let impactor = model.lookupMemberById(idString);
            if((impactor.isDependent)&&(impactor.getCalcPending())) {
                impactor.calculate(model);
            }

            //inherit the the state of the impactor only if it is a normal dependency, as oppose to a pass through dependency
            if(dependsOnType == apogeeutil.NORMAL_DEPENDENCY) {
                let impactorState = impactor.getState();
                if(impactorState == apogeeutil.STATE_ERROR) {
                    errorDependencies.push(impactor);
                } 
                else if(impactorState == apogeeutil.STATE_PENDING) {
                    resultPending = true;
                }
                else if(impactorState == apogeeutil.STATE_INVALID) {
                    resultInvalid = true;
                }
            }
        }

        if(errorDependencies.length > 0) {
            this.createDependencyError(model,errorDependencies);
        }
        else if(resultPending) {
            this.setResultPending();
        }
        else if(resultInvalid) {
            this.setResultInvalid();
        }
    }

    /** This method removes this dependent from the model impacts map. */
    onDeleteMember(model) {
        super.onDeleteMember(model);

        //remove this dependent from the impactor
        let dependsOnMap = this.getField("dependsOnMap");
        for(var remoteMemberIdString in dependsOnMap) {
            //remove from imacts list
            model.removeFromImpactsList(this.getId(),remoteMemberIdString);
        }
    }
    //===================================
    // Private Functions
    //===================================

    /** This sets the dependencies based on the code for the member. */
    updateDependencies(model,newDependsOnMap) {
        let dependenciesUpdated = false;

        let oldDependsOnMap = this.getField("dependsOnMap");
        for(var idString in newDependsOnMap) {
            if(newDependsOnMap[idString] != oldDependsOnMap[idString]) {
                dependenciesUpdated = true;
                if(!oldDependsOnMap[idString]) model.addToImpactsList(this.getId(),idString);
            }
        }
        for(var idString in oldDependsOnMap) {
            if(newDependsOnMap[idString] != oldDependsOnMap[idString]) {
                dependenciesUpdated = true;
                if(!newDependsOnMap[idString]) model.removeFromImpactsList(this.getId(),idString);
            }
        }

        if(dependenciesUpdated) {
            this.setField("dependsOnMap",newDependsOnMap);
//            this.calcPending = true;
        }

        return dependenciesUpdated;
    }

    /** This method creates an dependency error, given a list of impactors that have an error. 
     * @private */
    createDependencyError(model,errorDependencies) {
            //dependency error found
            var message = "Error in dependency: ";
            for(var i = 0; i < errorDependencies.length; i++) {
                if(i > 0) message += ", ";
                message += errorDependencies[i].getFullName(model);
            }
            this.setError(message);   
    }
}

/** This mixin encapsulates an object in that can be coded. It contains a function
 * and supplemental code. Object that are codeable should also be a member and
 * dependent.
 * 
 * This is a mixin and not a class. It is used in the prototype of the objects that inherit from it.
 * 
 * COMPONENT DEPENDENCIES: 
 * - A Codeable must be ContextHolder
 * 
 * FIELD NAMES (from update event):
 * - argList
 * - functionBody
 * - private
 */
class CodeableMember extends DependentMember {

    /** This initializes the component. argList is the arguments for the object function. */
    constructor(name,parentId,instanceToCopy,keepUpdatedFixed,specialCaseIdValue) {
        super(name,parentId,instanceToCopy,keepUpdatedFixed,specialCaseIdValue);

        //mixin init where needed. This is not a scoep root. Parent scope is inherited in this object
        this.contextHolderMixinInit(false);
        
        //this should be set to true by any extending class that supresses the messenger
        //see the supressMessenger function for details.
        this.doSupressMessenger = false;
        
        //==============
        //Fields
        //==============
        //Initailize these if this is a new instance
        if(!instanceToCopy) {
            //arguments of the member function
            this.setField("argList",[]);
            //"functionBody";
            //"supplementalCode";
            //"compiledInfo"
        }
        
        //==============
        //Working variables
        //==============
        this.dependencyInitInProgress = false;
    }

    /** This property tells if this object is a codeable.
     * This property should not be implemented on non-codeables. */
    get isCodeable() {
        return true;
    } 

    getSetCodeOk() {
        return this.constructor.generator.setCodeOk;
    }

    /** This method returns the argument list.  */
    getArgList() {
        return this.getField("argList");
    }

    /** This method returns the fucntion body for this member.  */
    getFunctionBody() {
        return this.getField("functionBody");
    }

    /** This method returns the supplemental code for this member.  */
    getSupplementalCode() {
        return this.getField("supplementalCode");
    }

    /** This is a helper method that compiles the code as needed for setCodeInfo.*/
    applyCode(argList,functionBody,supplementalCode) {

        //save the code
        if(this.getField("argList").toString() != argList.toString()) {
            this.setField("argList",argList);
        }
        
        if(this.getField("functionBody") != functionBody) {
            this.setField("functionBody",functionBody);
        }
        
        if(this.getField("supplementalCode") != supplementalCode) {
            this.setField("supplementalCode",supplementalCode);
        }
        
        //process the code text into javascript code
        var codeLabel = this.getName();
        var compiledInfo = processCode(argList,functionBody,supplementalCode,codeLabel);
        this.setField("compiledInfo",compiledInfo);
    }

    /** This method clears the function body and supplemental code, and
     * updates any associated variables, including the dependencies.  */
    clearCode(model) {
        if(this.getField("functionBody") != "") {
            this.setField("functionBody","");
        }
        if(this.getField("supplementalCode") != "") {
            this.setField("supplementalCode","");
        }
        this.clearField("compiledInfo");
        
        this.clearCalcPending();

        this.updateDependencies(model,[]);
    }

    /** This method returns the formula for this member.  */
    initializeDependencies(model) {

        let compiledInfo = this.getField("compiledInfo");
        
        if((this.hasCode())&&(compiledInfo.valid)) {
            //set the dependencies
            var dependsOnMap = getDependencyInfo(compiledInfo.varInfo,model,this.getContextManager());
            this.updateDependencies(model,dependsOnMap);
            
        }
        else {
            //will not be calculated - has no dependencies
            this.updateDependencies(model,{});
        }
    }

    /** This method udpates the dependencies if needed because
     *the passed variable was added.  */
    updateDependeciesForModelChange(model,additionalUpdatedMembers) {
        let compiledInfo = this.getField("compiledInfo");
        if((compiledInfo)&&(compiledInfo.valid)) {
                    
            //calculate new dependencies
            let oldDependsOnMap = this.getDependsOn();
            let newDependsOnMap = getDependencyInfo(compiledInfo.varInfo,model,this.getContextManager());

            if(!apogeeutil.jsonEquals(oldDependsOnMap,newDependsOnMap)) {
                //if dependencies changes, make a new mutable copy and add this to 
                //the updated values list
                let mutableMemberCopy = model.getMutableMember(this.getId());
                mutableMemberCopy.updateDependencies(model,newDependsOnMap);
                additionalUpdatedMembers.push(mutableMemberCopy);
            }
        }
    }

    /** This method returns the formula for this member.  */
    hasCode() {
        return this.getField("compiledInfo") ? true : false;
    }

    /** If this is true the member is ready to be executed. */
    memberUsesRecalculation() {
        return this.hasCode();
    }

    /** This method sets the data object for the member.  */
    calculate(model) {
        let compiledInfo = this.getField("compiledInfo");
        if(!compiledInfo) {
            this.setError("Code not found for member: " + this.getName());
            this.clearCalcPending();
            return;
        }
        else if(!compiledInfo.valid) {
            this.setErrors(compiledInfo.errors);
            this.clearCalcPending();
            return;
        }

//temporary - re create the initializer
let memberFunctionInitializer = this.createMemberFunctionInitializer(model);
      
        try {
            this.processMemberFunction(model,memberFunctionInitializer,compiledInfo.memberFunctionGenerator);
        }
        catch(error) {
            
            if(error == apogeeutil.MEMBER_FUNCTION_INVALID_THROWABLE) {
                //This is not an error. I don't like to throw an error
                //for an expected condition, but I didn't know how else
                //to do this. See notes where this is thrown.
                this.setResultInvalid();
            }
            else if(error == apogeeutil.MEMBER_FUNCTION_PENDING_THROWABLE) {
                //This is not an error. I don't like to throw an error
                //for an expected condition, but I didn't know how else
                //to do this. See notes where this is thrown.
                this.setResultPending();
            }
            //--------------------------------------
            else {
                //normal error in member function execution
            
                //this is an error in the code
                if(error.stack) {
                    console.error("Error calculating member " + this.getFullName(model));
                    console.error(error.stack);
                }

                this.setError(error);
            }
        }
        
        this.clearCalcPending();
    }

    //------------------------------
    // Member Methods
    //------------------------------

    /** This gets an update structure to upsate a newly instantiated member
    /* to match the current object. */
    getUpdateData() {
        var updateData = {};
        if(this.hasCode()) {
            updateData.argList = this.getArgList();
            updateData.functionBody = this.getFunctionBody();
            updateData.supplementalCode = this.getSupplementalCode();
        }
        else {
            let state = this.getState();

            //handle the possible data value cases
            if(state == apogeeutil.STATE_INVALID) {
                //invalid valude
                updateData.invalidValue = true;
            }
            else if(state == apogeeutil.STATE_PENDING) {
                //pending value - we can't do anything with this
                alert("There is a pending result in a field being saved. This may not be saved properly.");
                updateData.data = "<unknown pending value>";
            }
            else if(state == apogeeutil.STATE_ERROR) {
                //save the errors as strings only
                updateData.errorList = this.getErrors().map(error => error.toString());
            }
            else {
                //save the data value
                updateData.data = this.getData();
            }
        }
        return updateData;
    }

    //------------------------------
    //ContextHolder methods
    //------------------------------

    /** This method retrieve creates the loaded context manager. */
    createContextManager() {
        return new ContextManager(this);
    }

    //===================================
    // Protected Functions
    //===================================

    /** This method is used to remove access to the messenger from the formula for
     * this member. This should be done if the data from the member includes user runnable
     * code. The messenger should only be called in creating a data result for the member.
     * (Specifically, calling the messenger is only valid while the member is being calculated.
     * If it is called after that it will throw an error.) One place this supression is done is
     * in a FunctionMember.
     */
    supressMessenger(doSupressMessenger) {
        this.doSupressMessenger = doSupressMessenger;
    }

    //===================================
    // Private Functions
    //===================================

    //implementations must implement this function
    //This method takes the object function generated from code and processes it
    //to set the data for the object. (protected)
    //processMemberFunction 
    
    /** This makes sure user code of object function is ready to execute.  */
    createMemberFunctionInitializer(model) {
        //we want to hold these as closure variables
        let functionInitialized = false;
        let functionInitializedSuccess = false;

        let memberFunctionInitializer = () => {
            
            if(functionInitialized) return functionInitializedSuccess;
            
            //make sure this in only called once
            if(this.dependencyInitInProgress) {
                this.setError("Circular reference error");
                //clear calc in progress flag
                this.dependencyInitInProgress = false;
                functionInitialized = true;
                functionInitializedSuccess = false;
                return functionInitializedSuccess;
            }
            this.dependencyInitInProgress = true;
            
            try {
                //make sure the data is set in each impactor
                this.initializeImpactors(model);
                let state = this.getState();
                if((state == apogeeutil.STATE_ERROR)||(state == apogeeutil.STATE_PENDING)||(state == apogeeutil.STATE_INVALID)) {
                    this.dependencyInitInProgress = false;
                    functionInitialized = true;
                    functionInitializedSuccess = false;
                    return functionInitializedSuccess;
                }
                
                //set the context
                let compiledInfo = this.getField("compiledInfo");
                let messenger = this.doSupressMessenger ? undefined : new Messenger(model,this);
                compiledInfo.memberFunctionContextInitializer(model,this.getContextManager(),messenger);
                
                functionInitializedSuccess = true;
            }
            catch(error) {
                //this is an error in the code
                if(error.stack) {
                    console.error(error.stack);
                }

                this.setError(error);
                functionInitializedSuccess = false;
            }
            
            this.dependencyInitInProgress = false;
            functionInitialized = true;
            return functionInitializedSuccess;
        };

        return memberFunctionInitializer;

    }


}

//add components to this class
apogeeutil.mixin(CodeableMember,ContextHolder);

/** This class encapsulatees a data table for a JSON object. 
 * (This object does also support function objects as elements of the json, though
 * objects using this, such as the JsonTableComponent, may not.)
*/
class JsonTable extends CodeableMember {

    constructor(name,parentId,instanceToCopy,keepUpdatedFixed,specialCaseIdValue) {
        super(name,parentId,instanceToCopy,keepUpdatedFixed,specialCaseIdValue);
    }

    //------------------------------
    // Codeable Methods
    //------------------------------

    /** This method returns the argument list. We override it because
     * for JsonTable it gets cleared when data is set. However, whenever code
     * is used we want the argument list to be this value. */
    getArgList() {
        return [];
    }
        
    processMemberFunction(model,memberFunctionInitializer,memberGenerator) {
        let initialized = memberFunctionInitializer();
        if(initialized) {
            //the data is the output of the function
            let memberFunction = memberGenerator();
            let data = memberFunction();
            this.applyData(data);

            //we must separately apply the asynch data set promise if there is one
            if((data)&&(data instanceof Promise)) {
                this.applyAsynchData(model,data);
            }
        } 
    }

    /** This is an optional method that, when present will allow the member data to be set if the 
     * member function is cleared. */
    getDefaultDataValue() {
        return "";
    }

    //------------------------------
    // Member Methods
    //------------------------------

    /** This method extends set data from member. It also
     * freezes the object so it is immutable. (in the future we may
     * consider copying instead, or allowing a choice)*/
    setData(data) {
        
        //make this object immutable
        apogeeutil.deepFreeze(data);

        //store the new object
        return super.setData(data);
    }

    /** This method creates a member from a json. It should be implemented as a static
     * method in a non-abstract class. */ 
    static fromJson(parentId,json) {
        let member = new JsonTable(json.name,parentId,null,null,json.specialIdValue);

        //set initial data
        let initialData = json.updateData;
        if(!initialData) {
            //default initail value
            initialData = {};
            initialData.data = "";
        }  

        //apply the initial data
        if(initialData.functionBody !== undefined) {
            //apply initial code
            member.applyCode(initialData.argList,
                initialData.functionBody,
                initialData.supplementalCode);
        }
        else {
            //apply initial data
            let data;
            let errorList;

            if(initialData.errorList) errorList = initialData.errorList;
            else if(initialData.invalidError) data = apogeeutil.INVALID_VALUE;
            else if(initialData.data !== undefined) data = initialData.data;
            else data = "";

            //apply the initial data
            //note for now this can not be a promise, so we do not need to also call applyAsynchData.
            member.applyData(data,errorList);

            //set the code fields to empty strings
            member.setField("functionBody","");
            member.setField("supplementalCode","");
        }

        return member;
    }
}

//============================
// Static methods
//============================

JsonTable.generator = {};
JsonTable.generator.displayName = "JSON Member";
JsonTable.generator.type = "apogee.JsonMember";
JsonTable.generator.createMember = JsonTable.fromJson;
JsonTable.generator.setDataOk = true;
JsonTable.generator.setCodeOk = true;

//register this member
Model.addMemberGenerator(JsonTable.generator);

/** This is a function. */
class FunctionTable extends CodeableMember {

    constructor(name,parentId,instanceToCopy,keepUpdatedFixed,specialCaseIdValue) {
        super(name,parentId,instanceToCopy,keepUpdatedFixed,specialCaseIdValue);
        
        //The messenger should not be available from the formula for this member
        //see details in the CodeableMember function below.
        this.supressMessenger(true);
    }

    //------------------------------
    // Codeable Methods
    //------------------------------

    processMemberFunction(model,memberFunctionInitializer,memberGenerator) {
        var memberFunction = this.getLazyInitializedMemberFunction(memberFunctionInitializer,memberGenerator);
        this.setData(memberFunction);
    }

    getLazyInitializedMemberFunction(memberFunctionInitializer,memberGenerator) {

        //create init member function for lazy initialization
        //we need to do this for recursive functions, or else we will get a circular reference
        var initMember = () => {
            var impactorSuccess = memberFunctionInitializer();
            if(impactorSuccess) {
                return memberGenerator();
            }
            else {
                //error handling
                let issue;
                let state = this.getState();

                //in the case of "result invalid" or "result pending" this is 
                //NOT an error. But I don't know
                //how else to stop the calculation other than throwing an error, so 
                //we do that here. It should be handled by anyone calling a function.
                if(state == apogeeutil.STATE_ERROR) {
                    issue = new Error("Error in dependency: " + this.getName());
                }
                else if(state == apogeeutil.STATE_PENDING) {
                    issue = apogeeutil.MEMBER_FUNCTION_PENDING_THROWABLE;
                }
                else if(state == apogeeutil.STATE_INVALID) {
                    issue = apogeeutil.MEMBER_FUNCTION_INVALID_THROWABLE;
                }
                else {
                    issue = new Error("Unknown problem in initializing: " + this.getName());
                }
                
                throw issue;
            } 
        };

        //this is called from separate code to make debugging more readable
        return __functionTableWrapper(initMember,this.getName());
    }

    /** Add to the base lock function - The function is lazy initialized so it can call itself without a 
     * ciruclar reference. The initialization happens on the first actual call. This is OK if we are doing the
     * model calculation. but if it is first called _AFTER_ the model has completed being calculated, such as
     * externally, then we will get a locked error when the lazy initialization happens. Instead, we will
     * complete the lazy initialization before the lock is done. At this point we don't need to worry about
     * circular refernce anyway, since the model has already completed its calculation. */
    lock() {
        //check if the function is initialized
        let memberFunction = this.getData();
        if((memberFunction)&&(memberFunction.initializeIfNeeded)) {
            try {
                memberFunction.initializeIfNeeded();
            }
            catch(error) {
                //handle potential error cases!!!:
                
                if(error == apogeeutil.MEMBER_FUNCTION_INVALID_THROWABLE) {
                    //This is not an error. I don't like to throw an error
                    //for an expected condition, but I didn't know how else
                    //to do this. See notes where this is thrown.
                    this.setResultInvalid();
                }
                else if(error == apogeeutil.MEMBER_FUNCTION_PENDING_THROWABLE) {
                    //This is not an error. I don't like to throw an error
                    //for an expected condition, but I didn't know how else
                    //to do this. See notes where this is thrown.
                    this.setResultPending();
                }
                //--------------------------------------
                else {
                    //normal error in member function execution
                
                    //this is an error in the code
                    if(error.stack) {
                        console.error(error.stack);
                    }
    
                    this.setError(error);
                }
            }

        }
        super.lock();
    }

    //------------------------------
    // Member Methods
    //------------------------------

    /** This method creates a member from a json. It should be implemented as a static
     * method in a non-abstract class. */ 
    static fromJson(parentId,json) {
        let member = new FunctionTable(json.name,parentId,null,null,json.specialIdValue);

        //set initial data
        let initialData = json.updateData;

        var argList = initialData.argList ? initialData.argList : [];
        var functionBody = initialData.functionBody ? initialData.functionBody : "";
        var supplementalCode = initialData.supplementalCode ? initialData.supplementalCode : "";
        member.applyCode(argList,functionBody,supplementalCode);

        return member;
    }

    /** This method extends the base method to get the property values
     * for the property editting. */
    static readProperties(member,values) {
        var argList = member.getArgList();
        var argListString = argList.toString();
        values.argListString = argListString;
        return values;
    }

    /** This method executes a property update. */
    static getPropertyUpdateAction(member,newValues) {
        if((newValues.updateData)&&(newValues.updateData.argList !== undefined)) {
            var actionData = {};
            actionData.action = "updateCode";
            actionData.memberId = member.getId();
            actionData.argList = newValues.updateData.argList;
            actionData.functionBody = member.getFunctionBody();
            actionData.supplementalCode = member.getSupplementalCode();
            return actionData;
        }
        else {
            return null;
        }
    }

}

//============================
// Static methods
//============================

FunctionTable.generator = {};
FunctionTable.generator.displayName = "Function";
FunctionTable.generator.type = "apogee.FunctionMember";
FunctionTable.generator.createMember = FunctionTable.fromJson;
FunctionTable.generator.readProperties = FunctionTable.readProperties;
FunctionTable.generator.getPropertyUpdateAction = FunctionTable.getPropertyUpdateAction;
FunctionTable.generator.setDataOk = false;
FunctionTable.generator.setCodeOk = true;

//register this member
Model.addMemberGenerator(FunctionTable.generator);

/** This is a folder. */
class Folder extends DependentMember {

    constructor(name,parent,instanceToCopy,keepUpdatedFixed,specialCaseIdValue) {
        super(name,parent,instanceToCopy,keepUpdatedFixed,specialCaseIdValue);

        //mixin init where needed
        //This is not a root. Scope is inherited from the parent.
        this.contextHolderMixinInit(false);
        this.parentMixinInit(instanceToCopy);

        //initialize data value if this is a new folder
        if(!instanceToCopy) {
            let dataMap = {};
            Object.freeze(dataMap);
            this.setData(dataMap);
        }
    }

    //------------------------------
    // Parent Methods
    //------------------------------

    onAddChild(model,child) {
        //set all children as dependents
        let dependsOnMap = this.calculateDependents(model);
        this.updateDependencies(model,dependsOnMap);
    }

    onRemoveChild(model,child) {
        //set all children as dependents
        let dependsOnMap = this.calculateDependents(model);
        this.updateDependencies(model,dependsOnMap);
    }

    /** this method gets the hame the children inherit for the full name. */
    getPossesionNameBase(model) {
        return this.getFullName(model) + ".";
    }

    //------------------------------
    // Dependent Methods
    //------------------------------

    /** There is no calculation for the folder base on dependents. */
    memberUsesRecalculation() {
        return true;
    }

    /** Calculate the data.  */
    calculate(model) {
        //make sure impactors are calculated
        this.initializeImpactors(model);
        
        //folders work slightly different because of pass thorugh dependencies. We will set the folder data
        //value regardless of the state, meaning if the state is error or pending or invalid, we still set
        //the data, along with maintaining the current state.

        //make an immutable map of the data for each child
        let childIdMap = this.getChildIdMap();
        let dataMap = {};
        for(let name in childIdMap) {
            let childId = childIdMap[name];
            let child = model.lookupMemberById(childId);
            if(child) {
                dataMap[name] = child.getData();
            }
        }
        Object.freeze(dataMap);

        let state = this.getState();
        if((state != apogeeutil.STATE_ERROR)&&(state != apogeeutil.STATE_PENDING)&&(state != apogeeutil.STATE_INVALID)) {
            //set the data state if there is no child error or other exceptional case
            this.setData(dataMap);
        }
        else {
            //if there is a child exceptional case, still set the data for the sake of pass through dependencies
            this.forceUpdateDataWithoutStateChange(dataMap);
        }
        
        //clear calc pending flag
        this.clearCalcPending();
    }

    /** This method updates the dependencies of any children
     * based on an object being added. */
    updateDependeciesForModelChange(model,additionalUpdatedMembers) {

        //update dependencies of this folder
        let oldDependsOnMap = this.getDependsOn();
        let newDependsOnMap = this.calculateDependents(model);
        if(!apogeeutil.jsonEquals(oldDependsOnMap,newDependsOnMap)) {
            //if dependencies changes, make a new mutable copy and add this to 
            //the updated values list
            let mutableMemberCopy = model.getMutableMember(this.getId());
            mutableMemberCopy.updateDependencies(model,newDependsOnMap);
            additionalUpdatedMembers.push(mutableMemberCopy);
        }

        //call update in children
        let childIdMap = this.getChildIdMap();
        for(var name in childIdMap) {
            let childId = childIdMap[name];
            var child = model.lookupMemberById(childId);
            if((child)&&(child.isDependent)) {
                child.updateDependeciesForModelChange(model,additionalUpdatedMembers);
            }
        }
    }

    //------------------------------
    // Member Methods
    //------------------------------

    /** This method creates a member from a json. It should be implemented as a static
     * method in a non-abstract class. */ 
    static fromJson(parentId,json) {
        var folder = new Folder(json.name,parentId,null,null,json.specialIdValue);

        if(json.childrenNotWriteable) {
            folder.setChildrenWriteable(false);
        }

        return folder;
    }

    /** This method adds any additional data to the json to save for this member. 
     * @protected */
    addToJson(model,json) {
        json.children = {};
        
        if(!this.getChildrenWriteable()) {
            json.childrenNotWriteable = true;
        }
        
        let childIdMap = this.getChildIdMap();
        for(var name in childIdMap) {
            let childId = childIdMap[name];
            let child = model.lookupMemberById(childId);
            json.children[name] = child.toJson(model);
        }
    }

    //------------------------------
    // context holder Methods
    //------------------------------

    /** This method retrieve creates the loaded context manager. */
    createContextManager() {
        //set the context manager
        var contextManager = new ContextManager(this);
        
        //add an entry for this folder
        var myEntry = {};
        myEntry.contextHolderAsParent = true;
        contextManager.addToContextList(myEntry);
        
        return contextManager;
    }

    //============================
    // Private methods
    //============================

    /** This method calculates the dependencies for this folder. 
     * @private */
    calculateDependents(model) {
        let dependsOnMap = [];
        let childIdMap = this.getChildIdMap();
        for(var name in childIdMap) {
            var childId = childIdMap[name];
            dependsOnMap[childId] = apogeeutil.NORMAL_DEPENDENCY;
        }
        return dependsOnMap;
    }
}

//add components to this class                     
apogeeutil.mixin(Folder,ContextHolder);
apogeeutil.mixin(Folder,Parent);

//============================
// Static methods
//============================


Folder.generator = {};
Folder.generator.displayName = "Folder";
Folder.generator.type = "apogee.Folder";
Folder.generator.createMember = Folder.fromJson;
Folder.generator.setDataOk = false;
Folder.generator.setCodeOk = false;

//register this member
Model.addMemberGenerator(Folder.generator);

/** This is a folderFunction, which is basically a function
 * that is expanded into data objects. */
class FolderFunction extends DependentMember {

    constructor(name,parentId,instanceToCopy,keepUpdatedFixed,specialCaseIdValue) {
        super(name,parentId,instanceToCopy,keepUpdatedFixed,specialCaseIdValue);

        //mixin init where needed
        this.contextHolderMixinInit();
        this.parentMixinInit(instanceToCopy);

        //==============
        //Fields
        //==============
        //Initailize these if this is a new instance
        if(!instanceToCopy) {
            //set to an empty function
            this.setData(function(){});

            //this field is used to disable the calculation of the value of this function
            //It is used in the "virtual model" to prevent any unnecessary downstream calculations
            this.setField("sterilized",false);
        }

        //@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
        this.temporaryVirtualModelRunContext = {
            doAsynchActionCommand: function(modelId,actionData) {
                let msg = "NOT IPLEMENTED: Asynchronous actions in folder function!";
                alert(msg);
                throw new Error(msg);
            }
        };
        //@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
    }

    /** This gets the internal forlder for the folderFunction. */
    getInternalFolder(model) {
        return this.lookupChild(model,"body");
    }

    /** This gets the name of the return object for the folderFunction function. */
    getReturnValueString() {
        return this.getField("returnValue");
    }

    /** This gets the arg list of the folderFunction function. */
    getArgList() {
        return this.getField("argList");
    }

    //------------------------------
    // Member Methods
    //------------------------------

    /** This method creates a member from a json. It should be implemented as a static
     * method in a non-abstract class. */ 
    static fromJson(parentId,json) {
        let member = new FolderFunction(json.name,parentId,null,null,json.specialIdValue);

        //set initial data
        let initialData = json.updateData;
        let argList = ((initialData)&&(initialData.argList !== undefined)) ? initialData.argList : [];
        member.setField("argList",argList);
        let returnValueString = ((initialData)&&(initialData.returnValue !== undefined)) ? initialData.returnValue : [];
        member.setField("returnValue",returnValueString);
        
        return member;
    }

    /** This method adds any additional data to the json saved for this member. 
     * @protected */
    addToJson(model,json) {
        json.updateData = {};
        json.updateData.argList = this.getField("argList");
        json.updateData.returnValue = this.getField("returnValue");
        json.children = {};
        let childIdMap = this.getChildIdMap();
        for(var name in childIdMap) {
            var childId = childIdMap[name];
            let child = model.lookupMemberById(childId);
            if(child) {
                json.children[name] = child.toJson(model);
            }
        }
    }

    /** This method extends the base method to get the property values
     * for the property editting. */
    static readProperties(member,values) {
        var argList = member.getArgList();
        var argListString = argList.toString();
        values.argListString = argListString;
        values.returnValueString = member.getReturnValueString();
        return values;
    }

    /** This method executes a property update. */
    static getPropertyUpdateAction(folderFunction,newValues) {
        let updateData = newValues.updateData;
        if((updateData)&&((updateData.argList !== undefined)||(updateData.returnValue !== undefined))) {

            var argList = updateData.argList ? updateData.argList : folderFunction.getArgList();
            var returnValueString = updateData.returnValue ? updateData.returnValue : folderFunction.getReturnValueString();
    
            var actionData = {};
            actionData.action = "updateFolderFunction";
            actionData.memberId = folderFunction.getId();
            actionData.argList = argList;
            actionData.returnValueString = returnValueString;
            return actionData;
        }    
        else {
            return null;
        }
    }

    //-------------------------------
    // Dependent Methods
    //-------------------------------
        

    /** If this is true the member must be executed. */
    memberUsesRecalculation() {
        return true;
    }

    /** This updates the member data based on the function. It returns
     * true for success and false if there is an error.  */
    calculate(model) {  

        //if this function is sterilized, we will just set the value to invalid value.
        //This prevents any object which calls this function from updating. It is inended to be 
        //used in the virtual workspace assoicated with this folder function
        if(this.getField("sterilized")) {
            this.setResultInvalid();
            this.clearCalcPending();
            return;
        }

        //make sure the data is set in each impactor
        this.initializeImpactors(model);

        let state = this.getState();
        if((state != apogeeutil.STATE_ERROR)&&(state != apogeeutil.STATE_PENDING)&&(state != apogeeutil.STATE_INVALID)) {
            //check for code errors, if so set a data error
            try {
                var folderFunctionFunction = this.getFolderFunctionFunction(model);
                this.setData(folderFunctionFunction);
            }
            catch(error) {
                if(error.stack) console.error(error.stack);
                
                //error in calculation
                this.setError(error);
            }
        }
        
        this.clearCalcPending();
    }

    /** This method updates the dependencies of any children
     * based on an object being added. */
    updateDependeciesForModelChange(model,additionalUpdatedMembers) {

        //update dependencies of this folder
        let oldDependsOnMap = this.getDependsOn();
        let newDependsOnMap = this.calculateDependents(model);
        if(!apogeeutil.jsonEquals(oldDependsOnMap,newDependsOnMap)) {
            //if dependencies changes, make a new mutable copy and add this to 
            //the updated values list
            let mutableMemberCopy = model.getMutableMember(this.getId());
            mutableMemberCopy.updateDependencies(model,newDependsOnMap);
            additionalUpdatedMembers.push(mutableMemberCopy);
        }

        //call update in children
        let childIdMap = this.getChildIdMap();
        for(var name in childIdMap) {
            var childId = childIdMap[name];
            let child = model.lookupMemberById(childId);
            if((child)&&(child.isDependent)) {
                child.updateDependeciesForModelChange(model,additionalUpdatedMembers);
            }
        }
    }

    //------------------------------
    //ContextHolder methods
    //------------------------------

    /** This method retrieve creates the loaded context manager. */
    createContextManager() {
        //set the context manager
        var contextManager = new ContextManager(this);
        
        //add an entry for this folder
        var myEntry = {};
        myEntry.contextHolderAsParent = true;
        contextManager.addToContextList(myEntry);
        
        return contextManager;
    }

    //------------------------------
    //Parent methods
    //------------------------------

    onAddChild(model,child) {
        //set all children as dependents
        let dependsOnMap = this.calculateDependents(model);
        this.updateDependencies(model,dependsOnMap);
    }

    onRemoveChild(model,child) {
        //set all children as dependents
        let dependsOnMap = this.calculateDependents(model);
        this.updateDependencies(model,dependsOnMap);
    }

    /** this method gets the hame the children inherit for the full name. */
    getPossesionNameBase(model) {
        return this.getFullName(model) + ".";
    }

    //============================
    // Private methods
    //============================

    /** This method updates the table data object in the folder data map. 
     * @private */
    calculateDependents(model) {
        let dependsOnMap = [];
        let childIdMap = this.getChildIdMap();
        for(var name in childIdMap) {
            var childId = childIdMap[name];
            dependsOnMap[childId] = apogeeutil.NORMAL_DEPENDENCY;
        }
        return dependsOnMap;
    }

    /** This is called from the update action. It should not be called externally. */
    setReturnValueString(returnValueString) {
        let existingRVS = this.getField("returnValue");
        if(existingRVS != returnValueString) {
            this.setField("returnValue",returnValueString);
        }
    }

    /** This is called from the update action. It should not be called externally. */
    setArgList(argList) {
        let existingArgList = this.getField("argList");
        if(existingArgList != argList) {
            this.setField("argList",argList);
        }
    }

    /** This method creates the folderFunction function. It is called from the update action 
     * and should not be called externally. 
     * @private */
    getFolderFunctionFunction(model) {

        //create a copy of the model to do the function calculation - we don't update the UI display version
        var virtualModel;
        var inputMemberIdArray;
        var returnValueMemberId; 
        
        var initialized = false;
        
        var folderFunctionFunction = (...argumentArray) => {
            
            if(!initialized) {
                //get the ids of the inputs and outputs. We can use the real instance to look these up since they don't change.
                let internalFolder = this.getInternalFolder(model);
                inputMemberIdArray = this.loadInputElementIds(model,internalFolder);
                returnValueMemberId = this.loadOutputElementId(model,internalFolder); 

                //prepare the virtual function
                //this is a copy of the original model, but with any member that is unlocked replaced.
                //to prevent us from modifying an object in use by our current real model calculation.
                virtualModel = model.getCleanCopy(this.temporaryVirtualModelRunContext);

                //we want to set the folder function as "sterilized" - this prevents any downstream work from the folder function updating
                let commandData = {};
                commandData.action = "setField";
                commandData.memberId = this.getId();
                commandData.fieldName = "sterilized";
                commandData.fieldValue = "true";
                let actionResult = doAction(virtualModel,commandData);

                //we should do something with the action result
                if(!actionResult.actionDone) {
                    throw new Error("Error calculating folder function");
                }
                
                initialized = true;
            }
            
            //create an update array to set the table values for the input elements  
            var updateActionList = [];
            for(var i = 0; i < inputMemberIdArray.length; i++) {
                var entry = {};
                entry.action = "updateData";
                entry.memberId = inputMemberIdArray[i];
                entry.data = argumentArray[i];
                updateActionList.push(entry);
            }
            
            var actionData = {};
            actionData.action = "compoundAction";
            actionData.actions = updateActionList;

            //apply the update
            let workingVirtualModel = virtualModel.getMutableModel();
            var actionResult = doAction(workingVirtualModel,actionData);        
            if(actionResult.actionDone) {
                //retrieve the result
                if(returnValueMemberId) {
                    let returnValueMember = workingVirtualModel.lookupMemberById(returnValueMemberId);
                    
                    if(returnValueMember.getState() == apogeeutil.STATE_PENDING) {
                        throw new Error("A folder function must not be asynchronous: " + this.getFullName(workingVirtualModel));
                    }
                    
                    //get the resulting output
                    return returnValueMember.getData();
                }
                else {
                    //no return value found
                    return undefined;
                }
            }
            else {
                let errorMsg = actionResult.errorMsg ? actionResult.errorMsg : "Unknown error evaluating Folder Function " + this.getName();
                throw new Error(errorMsg);
            }
        };
        
        return folderFunctionFunction;    
    }

    /** This method loads the input argument members from the virtual model. 
     * @private */
    loadInputElementIds(model,internalFolder) {
        let argMembers = [];
        let argList = this.getField("argList");
        for(var i = 0; i < argList.length; i++) {
            var argName = argList[i];
            var argMember = internalFolder.lookupChild(model,argName);
            if(argMember) {
                argMembers.push(argMember.getId());
            }     
        }
        return argMembers;
    }

    /** This method loads the output member from the virtual model. 
     * @private  */
    loadOutputElementId(model,internalFolder) {
        let returnValueString = this.getField("returnValue");
        var returnValueMember = internalFolder.lookupChild(model,returnValueString);
        return returnValueMember.getId();
    }
}

//add components to this class
apogeeutil.mixin(FolderFunction,ContextHolder);
apogeeutil.mixin(FolderFunction,Parent);

FolderFunction.INTERNAL_FOLDER_NAME = "body";

        
//============================
// Static methods
//============================

FolderFunction.generator = {};
FolderFunction.generator.displayName = "Folder Function";
FolderFunction.generator.type = "apogee.FolderFunction";
FolderFunction.generator.createMember = FolderFunction.fromJson;
FolderFunction.generator.readProperties = FolderFunction.readProperties;
FolderFunction.generator.getPropertyUpdateAction = FolderFunction.getPropertyUpdateAction;
FolderFunction.generator.setDataOk = false;
FolderFunction.generator.setCodeOk = false;

//register this member
Model.addMemberGenerator(FolderFunction.generator);

/** This class encapsulatees a table with no specific functionality. It
 * is intended to be used as a placeholder when a table generator is not found. */
class ErrorTable extends Member {

    constructor(name,parentId,instanceToCopy,keepUpdatedFixed,specialCaseIdValue) {
        super(name,parentId,instanceToCopy,keepUpdatedFixed,specialCaseIdValue);

        var dummyData = "";
        this.setData(dummyData);
    }

    //------------------------------
    // Member Methods
    //------------------------------

    /** This method extends set data from member. It also
     * freezes the object so it is immutable. (in the future we may
     * consider copying instead, or allowing a choice)*/
    setData(data) {
        
        //make this object immutable
        apogeeutil.deepFreeze(data);

        //store the new object
        return super.setData(data);
    }

    /** This overrides the commplete json to just pass back the entire json sent in. */
    toJson(model) {
        return this.getField("completeJson");
    }

    /** This method creates a member from a json. It should be implemented as a static
     * method in a non-abstract class. */ 
    static fromJson(parentId,json) {
        //note - we send in the complete JSON so we can return is on saving
        let member = new ErrorTable(json.name,parentId,null,null,json.specialIdValue);

        //set the initial data
        member.setField("completeJson",json);

        return member;
    }

    //------------------------------
    // Dependent Methods
    //------------------------------

    /** This method udpates the dependencies if needed because
     *a variable was added or removed from the model.  */
    updateDependeciesForModelChange(model,additionalUpdatedMembers) {
        //no action
    }

    /** This is a check to see if the object should be checked for dependencies 
     * for recalculation. It is safe for this method to always return false and
     allow the calculation to happen.  */
   memberUsesRecalculation() {
        return false;
    }

}
//============================
// Static methods
//============================

ErrorTable.generator = {};
ErrorTable.generator.displayName = "Error Member";
ErrorTable.generator.type = "apogee.ErrorMember";
ErrorTable.generator.createMember = ErrorTable.fromJson;
ErrorTable.generator.setDataOk = false;

//register this member
Model.addMemberGenerator(ErrorTable.generator);

/** This is self installing command module. This must be imported to install the command.
 * Note that this module also contains an export, unlike most command modules. 
 * The export us used so other actions can load child members. 
 *
 * Action Data format:
 * {
 *  "action": "createMember",
 *  "parentId": (parent for new member),
 *  "name": (name of the new member),
 *  "createData": 
 *      - name
 *      - unique table type name
 *      - additional table specific data
 *      - specialIdValue (this is only to be used in special cases, to set the ID of the created object)
 *  
 * }
 *
 * MEMBER CREATED EVENT: "created"
 * Event member format:
 * {
 *  "member": (member)
 * }
 */


/** This is the action function to create a member. 
 * @private */
function createMemberAction(model,actionData) {
    
    let parent;
    if(actionData.modelIsParent) {
        //the parent is the model (It should already be mutable)
        parent = model;
    }
    else {
        //get the parent, as a new mutable instance
        parent = model.getMutableMember(actionData.parentId);

        if(!parent) {
            let actionResult = {};
            actionResult.actionDone = false;
            actionResult.errorMsg = "Parent not found for created member";
            return actionResult;
        }
    }

    let memberJson = actionData.createData;
    let actionResult = createMember(model,parent,memberJson);
    return actionResult;
}

/** This function creates a member and any children for that member, returning an action result for
 * the member. This is exported so create member can be used by other actions, such as load model. */
function createMember(model,parent,memberJson) {

    let member;
    let actionResult = {};
    actionResult.event = ACTION_EVENT;
    
    //create member
    let generator;
    if(memberJson) {
        generator = Model.getMemberGenerator(memberJson.type);
    }

    if(generator) {
        member = generator.createMember(parent.getId(),memberJson); 

        //this codde attempts to write  the member ID into the command that created the member.
        //We want this in our stored commands so we can use it for "redo" and have a member created
        //with the same ID. That way subsequent redo commands will correctly access the replacement member.
        //This doesn't seem like an optimal way to add this info to the input command. 
        //However, for now this is the earliest peice of code that actually touches each create action.
        //An alternative is to place a predetermined ID in the command before it is executed, in the 
        //command code. However, I didn't do that for now because there is not a one-to-one map from 
        //commands to actions. A single command often creates a hierarchy of members, all of which we 
        //would want to "modify". 
        try {
            if(!memberJson.specialIdValue) {
                memberJson.specialIdValue = member.getId();
            }
        }
        catch(error) {
            //we couldn't write into the command. It may be immutable
            //downstream redo commands won't work, but we'll cleanly handle that case then
            //with a failed redo.
        }

        //pass this child to the parent
        parent.addChild(model,member);

        //register member with model
        model.registerMember(member);

        //set action flags for successfull new member
        actionResult.updateModelDependencies = true;
        if((member.hasCode)&&(member.hasCode())) {
            actionResult.recalculateMember = true;
        }
        else {
            actionResult.recalculateDependsOnMembers = true;
        }

        //instantiate children if there are any
        if(memberJson.children) {
            actionResult.childActionResults = [];
            for(let childName in memberJson.children) {
                let childJson = memberJson.children[childName];
                let childActionResult = createMember(model,member,childJson);
                actionResult.childActionResults.push(childActionResult);
            }
        }
    }
    else {
        //type not found! - create a dummy object and add an error to it
        let errorTableGenerator = Model.getMemberGenerator("apogee.ErrorMember");
        member = errorTableGenerator.createMember(parent,memberJson);
        member.setError("Member type not found: " + memberJson.type);
        
        //store an error message, but this still counts as command done.
        actionResult.errorMsg = "Error creating member: member type not found: " + memberJson.type;
    }

    actionResult.member = member;
    actionResult.actionDone = true;

    return actionResult;
}

let ACTION_EVENT = "created";

//This line of code registers the action 
addActionInfo("createMember",createMemberAction);

/** This is self installing command module. It has no exports
 * but it must be imported to install the command. 
 *
 * Action Data format:
 * {
 *  "action": "updateData",
 *  "memberId": (member to update),
 *  "data": (new value for the table)
 *  "sourcePromise": (OPTIONAL - If this is the completion of an asynchronous action, the
 *      source promise shoudl be included to make sure it has not been overwritten with a
 *      more recent operation.)
 *  "promiseRefresh": (OPTIONAL - If this action reinstates a previously set promise,
 *      this flag will prevent setting additional then/catch statements on the promise)
 * }
 * 
 * Action Data format:
 * {
 *  "action": "updateCode",
 *  "memberId": (member to update),
 *  "argList": (arg list for the table)
 *  "functionBody": (function body for the table)
 *  "supplementalCode": (supplemental code for the table)
 * }
 */


/** member UPDATED EVENT: "updated"
 * Event member format:
 * {
 *  "member": (member)
 * }
 */


/** Update code action function. */
function updateCode(model,actionData) {

    let actionResult = {};
    actionResult.event = ACTION_EVENT$1;
    
    var member = model.getMutableMember(actionData.memberId);
    if(!member) {
        actionResult.actionDone = false;
        actionResult.errorMsg = "Member not found for update member code";
        return actionResult;
    }
    actionResult.member = member;

    if((!member.isCodeable)||(!member.getSetCodeOk())) {
        actionResult.actionDone = false;
        actionResult.errorMsg = "can not set code on member: " + member.getFullName(model);
        return actionResult;
    }
          
    member.applyCode(actionData.argList,
        actionData.functionBody,
        actionData.supplementalCode);
        
    actionResult.actionDone = true;
    actionResult.updateMemberDependencies = true;
    actionResult.recalculateMember = true;

    return actionResult;
}

/** Update data action function. */
function updateData(model,actionData) {

    let actionResult = {};
    actionResult.event = ACTION_EVENT$1;
    
    var member = model.getMutableMember(actionData.memberId);
    if(!member) {
        actionResult.actionDone = false;
        actionResult.errorMsg = "Member not found for update member data";
        return actionResult;
    }
    actionResult.member = member;
    
    if(!member.getSetDataOk()) {
        actionResult.actionDone = false;
        actionResult.errorMsg = "Can not set data on member: " + member.getFullName(model);
        return actionResult;
    }
        
    var data = actionData.data;

    //see if there were any dependents, to know if we need to update them
    //on setting data there will be none.
    let hadDependents = ((member.getDependsOn)&&(apogeeutil.jsonObjectLength(member.getDependsOn()) > 0));
    
    //if this is the resolution (or rejection) of a previously set promise
    //make sure the source promise matches the pending promise. Otherwise
    //we just ignore it (it is out of date)
    if(actionData.sourcePromise) {
        if(!member.pendingPromiseMatches(actionData.sourcePromise)) {
            //no action - this is from an asynch action that has been overwritten. Ignore this command.
            actionResult.actionDone = true;
            return actionResult;
        }
    }
    
    //some cleanup for new data
    if((member.isCodeable)&&(actionData.sourcePromise === undefined)) {
        //clear the code - so the data is used
        //UNLESS this is a delayed set date from a promise, in what case we want to keep the code.
        member.clearCode(model);
    }

    //apply the data
    member.applyData(data);

    //if the data is a promise, we must also initiate the asynchronous setting of the data
    if((data)&&(data instanceof Promise)) {
        member.applyAsynchData(model,data);
    }
    
    actionResult.actionDone = true;
    if(hadDependents) {
        actionResult.updateMemberDependencies = true;
    }
    actionResult.recalculateDependsOnMembers = true;

    return actionResult;
}

let ACTION_EVENT$1 = "updated";

//The following code registers the actions
addActionInfo("updateCode",updateCode);
addActionInfo("updateData",updateData);

/** This is self installing command module. It has no exports
 * but it must be imported to install the command. 
 *
 * Action Data format:
 * {
 *  "action": "moveMember",
 *  "member": (member to move),
 *  "targetName": (optional new name for the member - defaults to no new name)
 *  "targetParentId": (optiona new parent id - defaults to old parent id)
 *  
 *  \
 * }
 */

/** Move member action function */
function moveMember(model,actionData) {

    let actionResult = {};
    actionResult.event = ACTION_EVENT$2;
        
    var member = model.getMutableMember(actionData.memberId);
    if(!member) {
        actionResult.actionDone = false;
        actionResult.errorMsg = "Member not found for move member";
        return;
    }
    actionResult.member = member;

    //get the name
    let targetName;
    if(actionData.targetName) {
        targetName = actionData.targetName;
    }
    else {
        targetName = member.getName();
    }

    //get the parent
    let targetParentId;
    if(actionData.targetParentId) {
        targetParentId = actionData.targetParentId;
    }
    else {
        targetParentId = member.getParentId();
    }
    var targetParent = model.getMutableMember(targetParentId);
    if(!targetParent) {
        actionResult.actionDone = false;
        actionResult.errorMsg = "Parent not found for move member";
        return actionResult;
    }

    //if the parent changes, remove this child from the parent
    //remove from old named object from the new or old parent - if it stays, we still have the new name
    let currentParentId = member.getParentId();
    let currentParent = model.getMutableMember(currentParentId);
    if(currentParent.isParent) {
        currentParent.removeChild(model,member);
    }
        
    //appl the move to the member
    member.move(targetName,targetParent);

    //set the member in the new/old parent (rest in old parent to handle a name change)
    if(targetParent.isParent) {
        targetParent.addChild(model,member);
    }

    //create the action result
    actionResult.actionDone = true;
    actionResult.updateModelDependencies = true;
    actionResult.recalculateDependsOnMembers = true;
    
    //add the child action results
    let childActionResults = addChildResults(model,member);
    if(childActionResults) {
        actionResult.childActionResults = childActionResults;
    }
    
    return actionResult;
}

function addChildResults(model,member) {
    let childActionResults = [];
    
    if((member.isParent)||(member.isRootHolder)) {  
        var childIdMap = member.getChildIdMap();
        for(var childName in childIdMap) {
            var childId = childIdMap[childName];
            let child = model.lookupMemberById(childId);
            if(child) {
                let childActionResult = {};
                childActionResult.actionDone = true;
                childActionResult.member = child;
                childActionResult.event = ACTION_EVENT$2;
                childActionResult.updateModelDependencies = true;
                
                childActionResults.push(childActionResult);
                
                //add results for children to this member
                let grandchildActionResults = addChildResults(model,child);
                if(grandchildActionResults) {
                    childActionResult.childActionResults = grandchildActionResults;
                }
            }
        }
    }

    if(childActionResults.length > 0) {
        return childActionResults;
    }
    else {
        return null;
    }
}

let ACTION_EVENT$2 = "updated";


//This line of code registers the action 
addActionInfo("moveMember",moveMember);

/** This is self installing command module. It has no exports
 * but it must be imported to install the command. 
 *
 * Action Data format:
 * {
 *  "action": "deleteMember",
 *  "member": (member to delete),
 *  
 *  "eventInfo": (OUTPUT - event info for the associated delete event)
 * }
 *
 * MEMBER DELETED EVENT: "deleted"
 * Event object Format:
 * {
 *  "member": (member),
 *  }
 */


/** Delete member action function */
function deleteMember(model,actionData) {
    
    //get a new instance in case any changes are made during delete
    let member = model.lookupMemberById(actionData.memberId);
    if(!member) {
        let actionResult = {};
        actionResult.actionDone = false;
        actionResult.errorMsg = "Member not found for delete member";
        return actionResult;
    }
    
    let actionResult = doDelete(model, member);

    //remove the top-most deleted member from its parent
    let parentId = member.getParentId();
    let parent = model.getMutableMember(parentId);
    if(parent) {
        parent.removeChild(model,member);
    }

    return actionResult;
    
}


/** Here we take any actions for deleting the member and its children,
 * except "remove from parent", which we will do only for the top deleted member. 
 * @private */
function doDelete(model, member) {

    let actionResult = {};
    actionResult.member = member;
    actionResult.event = ACTION_EVENT$3;
    
    //delete children first
    if((member.isParent)||(member.isRootHolder)) {
        actionResult.childActionResults = [];
        
        //standard children for parent
        var childIdMap = member.getChildIdMap();
        for(var childName in childIdMap) {
            let childId = childIdMap[childName];
            let child = model.lookupMemberById(childId);
            if(child) {
                let childActionResult = doDelete(model, child);
                actionResult.childActionResults.push(childActionResult);
            }
        }
    }

    //delete member actions
    member.onDeleteMember(model);
    model.unregisterMember(member);
    
    actionResult.actionDone = true;
    actionResult.updateModelDependencies = true;

    return actionResult;
}

let ACTION_EVENT$3 = "deleted";


//This line of code registers the action 
addActionInfo("deleteMember",deleteMember);

/** This is self installing command module. It has no exports
 * but it must be imported to install the command. 
 *
 * Action Data format:
 * {
 *  "action": "updateFolderFunction",
 *  "member": (member to move),
 *  "argList": (argument list, as an array of strings)
 *  "returnValueString": (name of the return value table)
 *  
 *  "eventInfo": (OUTPUT - event info for the associated delete event)
 * }
 */

/** Update folder function action function */
function updateProperties(model,actionData) { 

    let actionResult = {};
    actionResult.event = ACTION_EVENT$4;
    
    var folderFunction = model.getMutableMember(actionData.memberId);
    if(!folderFunction) {
        actionResult.actionDone = false;
        actionResult.errorMsg = "Member not found for update member code";
        return;
    }
    actionResult.member = folderFunction;
    
    folderFunction.setArgList(actionData.argList);
    folderFunction.setReturnValueString(actionData.returnValueString);
    
    actionResult.actionDone = true;
    actionResult.recalculateMember = true;

    return actionResult;
}

let ACTION_EVENT$4 = "updated";

//This line of code registers the action 
addActionInfo("updateFolderFunction",updateProperties);

/** This is self installing command module. It has no exports
 * but it must be imported to install the command. 
 *
 * Action Data format:
 * {
 *  "action": "loadModel",
 *  
 *  "modelJson": model json
 *  
 * }
 *
 * MEMBER CREATED EVENT: "modelUpdated"
 * Event member format:
 * {
 *  "member": (member)
 * }
 */


/** This method instantiates a member, without setting the update data. 
 *@private */
function loadModel(model,actionData) {

    let actionResult = {};
    actionResult.event = ACTION_EVENT$5;

    let modelJson = actionData.modelJson;
    
    //check the file format
    var fileType = modelJson.fileType;
    if(fileType !== Model.SAVE_FILE_TYPE) {
        throw new Error("Bad file format.");
    }
    if(modelJson.version !== Model.SAVE_FILE_VERSION) {
        throw new Error("Incorrect file version. CHECK APOGEEJS.COM FOR VERSION CONVERTER.");
    }

    //set the model name
    if(modelJson.name !== undefined) {
        model.setName(modelJson.name);
    }

    //load the model members (root folder and its children)
    actionResult.childActionResults = [];
    for(let childName in modelJson.children) {
        let childJson = modelJson.children[childName];
        let memberActionResult = createMember(model,model,childJson);
        actionResult.childActionResults.push(memberActionResult);
    }

    actionResult.actionDone = true;
    
    return actionResult;
}

let ACTION_EVENT$5 = "updated";

//This line of code registers the action 
addActionInfo("loadModel",loadModel);

/** This is self installing command module. It has no exports
 * but it must be imported to install the command. 
 *
 * Action Data format:
 * {
 *  "action": "updated",
 *  "model": (model to update),
 *  "properties": (properties to set) //currently only "name"
 * }
 *
 * member UPDATED EVENT: "modelUpdated"
 * Event member format:
 * {
 *  "member": (member)
 * }
 */

/** Update code action function. */
function updateModel(model,actionData) { 

    let actionResult = {};
    actionResult.event = ACTION_EVENT$6;
    
    var properties = actionData.properties;
    if(properties) {
        if(properties.name) model.setName(properties.name);
    }
    
    actionResult.actionDone = true;

    return actionResult;
}

let ACTION_EVENT$6 = "updated";

//The following code registers the actions
addActionInfo("updateModel",updateModel);

/** This is self installing command module. It has no exports
 * but it must be imported to install the command. 
 * 
 * This sets a field value on a member.
 *
 * Action Data format:
 * {
 *  "action": "setField",
 *  "memberId": (member to update),
 *  "fieldName": (the name of the field to update)
 *  "fieldValue": (the new field value)
 * }
 */


/** member UPDATED EVENT: "updated"
 * Event member format:
 * {
 *  "member": (member)
 * }
 */


/** Update code action function. */
function setField(model,actionData) {

    let actionResult = {};
    actionResult.event = ACTION_EVENT$7;
    
    var member = model.getMutableMember(actionData.memberId);
    if(!member) {
        actionResult.actionDone = false;
        actionResult.errorMsg = "Member not found for update member code";
        return;
    }
    actionResult.member = member;
          
    member.setField(actionData.fieldName,actionData.fieldValue);
        
    actionResult.actionDone = true;
    actionResult.recalculateMember = true;

    return actionResult;
}

let ACTION_EVENT$7 = "updated";

//The following code registers the actions
addActionInfo("setField",setField);

//This module exports the public interface to the Apogee Core Library

var apogeeCoreLib = /*#__PURE__*/Object.freeze({
    __proto__: null,
    Model: Model,
    doAction: doAction,
    validateTableName: validateTableName,
    Messenger: Messenger
});

export { apogeeCoreLib as apogee, apogeeutil };
