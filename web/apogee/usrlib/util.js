/** 
 * This namespace includes some utility functions available to the user.
 * @namespace
 */
apogee.util = {};

/** 
 * This value can be assigned to a data table to signify that data is not valid.
 * Any other member depending on this value will withhold the calcalation and also
 * return this invalid value.
 */
apogee.util.INVALID_VALUE = {"apogeeValue":"INVALID VALUE"};

/** 
 * This function should be called from the body of a function table
 * to indicate the function will not return a valid value. (The actual invalid value
 * can not be returned since this typically will not have the desired effect.)
 */
apogee.util.invalidFunctionReturn = function() {
    throw apogee.base.MEMBER_FUNCTION_INVALID_THROWABLE;
}

/** 
 * This method creates an integer hash value for a string. 
 * 
 * @param {String} string - This is the string for which a hash number is desired.
 * @return {integer} This is the hash value for the string.
 */
apogee.util.stringHash = function(string) {
    var HASH_SIZE = 0xffffffff;
    var hash = 0;
    var ch;
    for (var i = 0; i < string.length; i++) {
        ch = string.charCodeAt(i);
        hash = (31 * hash + ch) & HASH_SIZE;
    }
    return hash;
}

/** 
 * This method creates an integer hash value for a JSON object. 
 * 
 * @param {JSON} object - This is the json valued object for which a hash number is desired.
 * @return {integer} This is the hash value for the JSON.
 */
apogee.util.objectHash = function(object) {
    //this is not real efficient. It should be implemented differently
    var string = JSON.stringify(object);
    return stringHash(string);
}

/**
 * @private
 */
apogee.util.constructors = {
    "String": ("").constructor,
    "Number": (3).constructor,
    "Boolean": (true).constructor,
    "Date": (new Date()).constructor,
    "Object": ({}).constructor,
    "Array": ([]).constructor,
    "Function": (function(){}).constructor
}

/** This method returns the object type. The Allowed types are:
 * String, Number, Boolean, Date, Object, Array, Function, null, undefined.
 * @param {Object} object - This is the object for which the type is desired.
 * @returns {String} This is the type for the object. 
 */
apogee.util.getObjectType = function(object) {
    if(object === null) return "null";
    if(object === undefined) return "undefined";
    
    var constructor = object.constructor;
    for(var key in apogee.util.constructors) {
        if(constructor == apogee.util.constructors[key]) {
            return key;
        }	
    }
    //not found
    return "Unknown";
}

/** This method creates a deep copy of an object, array or value. Note that
 * undefined is not a valid value in JSON. 
 * 
 * @param {JSON} data - This is a JSON valued object
 * @returns {JSON} A JSON object which is a deep copy of the input.
 */
apogee.util.jsonCopy = function(data) {
    if(data === null) return null;
    if(data === undefined) return undefined;
    return JSON.parse(JSON.stringify(data));
}

/** This method does format string functionality. Text should include
 * {i} to insert the ith string argument passed. 
 *  @param {String} format - This is a format string to format the output.
 *  @param {Array} stringArgs - These are the values which should be placed into the format string.
 *  @returns {String} The format string with the proper inserted values is returned.  
 */
apogee.util.formatString = function(format,stringArgs) {
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
apogee.util.readQueryField = function(field,url) {
    var href = url ? url : window.location.href;
    var reg = new RegExp( '[?&]' + field + '=([^&#]*)', 'i' );
    var string = reg.exec(href);
    return string ? string[1] : null;
}

/** 
 * This is a not-so-efficient equals for json objects. For JSON objects it
 * does not require order matching of the keys. For JSON arrays it does require
 * order matching of the array values.
 * 
 *  @param {JSON} json1 - This is a JSON valued object 
 *  @param {JSON} json1 - This is a JSON valued object 
 *  @returns {Boolean}  - Returns whether or not the objects are equal
 */
apogee.util.jsonEquals = function(json1,json2) {
    var string1 = JSON.stringify(apogee.util.getNormalizedCopy(json1));
    var string2 = JSON.stringify(apogee.util.getNormalizedCopy(json2));
    return (string1 == string2);
}

/** 
 * This method returns a copied json that has the order in all JSON objects/"maps" normalized to alphabetical. 
 * The order of JSON arrays is NOT modified.
 * This is intended for the purpose of comparing json objects. 
 * 
 *  @param {JSON} json1 - This is a JSON valued object 
 *  @returns {Boolean}  - Returns whether or not the objects are equal
 */  
apogee.util.getNormalizedCopy = function(json) {
    var copiedJson;

    var objectType = apogee.util.getObjectType(json);
    
    switch(objectType) {
        case "Object":
            copiedJson = apogee.util.getNormalizedObjectCopy(json);
            break;
            
        case "Array": 
            copiedJson = apogee.util.getNormalizedArrayCopy(json);
            break;
            
        default:
            copiedJson = json;
    }
    
    return copiedJson;
}

/** this orders the keys apphabetically, since order is not important in a json object 
 * @private
 */
apogee.util.getNormalizedObjectCopy = function(json) {
    var copiedJson = {};
    
    var keys = [];
    var key;
    for(key in json) {
        keys.push(key);
    }
    
    keys.sort();
    
    for(var i = 0; i < keys.length; i++) {
        key = keys[i];
        copiedJson[key] = apogee.util.getNormalizedCopy(json[key]);
    }
    return copiedJson;
}

/** This method counts the properties in a object. */
apogee.util.jsonObjectLength = function(jsonObject) {
    var count = 0;

    for(var key in jsonObject) {
        count++;
    }

    return count;
}

/** This makes a copy of with any contained objects normalized. 
 * @private 
 */
apogee.util.getNormalizedArrayCopy = function(json) {
    var copiedJson = [];
    for(var i = 0; i < json.length; i++) {
        var element = json[i];
        copiedJson.push(apogee.util.getNormalizedCopy(element));
    }
    return copiedJson;
}

//=============================
// Field Update Info Methods
//=============================

/** This constant is used to field update info, to specify all fields are updated. */
apogee.util.ALL_FIELDS = "all";

/** This method takes a field update Info object (a set or map of names to a truthy value)
 * and either a single field name or an arrya of field names. In the case of a single
 * field name passed, it returns true if that field has been updated. In the case
 * of an array of field names, it checks if any of those fields have been updated.
 * The field update info object may have the value "all" set to true. In this case
 * any test against it will return true. */
apogee.util.isFieldUpdated = function(updateInfo,fieldOrFields) {
    if(updateInfo[apogee.util.ALL_FIELDS]) return true;
    if(Array.isArray(fieldOrFields)) {
        return fieldOrFields.any(fieldName => updateInfo[fieldName]);
    }
    else {
        if(updateInfo[fieldOrFields]) return true;
        else return false;
    }
    
}

/** This method returns a field update object for the given member that returns 
 * true for all fields checked. The event name can optionally be passed in.
 * Otherwise the event name will be set to "all".*/
apogee.util.getAllFieldsInfo = function(member,optionalEventName) {
    let updateInfo = {};
    updateInfo.member = member;
    updateInfo.updated = {};
    updateInfo.updated[apogee.util.ALL_FIELDS] = true;
    updateInfo.event = optionalEventName ? optionalEventName : "all";
    return updateInfo;
}