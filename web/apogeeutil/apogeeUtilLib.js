/** 
 * This namespace includes some utility functions available to the user.
 * @namespace
 */
let apogeeutil = {};

export {apogeeutil as default};

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
apogeeutil.NORMAL_DEPENDENCY = 1

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
}

/** This function reads any proeprty of the mixinObject and adds it
 * fo the prototypr of the destObject. This is intended to apend functions and
 * other properties to a cless directly without going through inheritance. 
 * Note this will overwrite and similarly named object in the dest class.
 * @private */
apogeeutil.mixin = function(destObject,mixinObject) {
    for(var key in mixinObject) {
        destObject.prototype[key] = mixinObject[key];
    }
}

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
}

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
}

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
}

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
}

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
}

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
}

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
apogeeutil.jsonEquals = function(json1,json2) {
    var string1 = JSON.stringify(apogeeutil.getNormalizedCopy(json1));
    var string2 = JSON.stringify(apogeeutil.getNormalizedCopy(json2));
    return (string1 == string2);
}

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
}

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
}

/** This method counts the properties in a object. */
apogeeutil.jsonObjectLength = function(jsonObject) {
    var count = 0;

    for(var key in jsonObject) {
        count++;
    }

    return count;
}

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
}

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
}

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
    }

    if(!options) options = {};
    
    var method = options.method ? options.method : "GET";
    xmlhttp.open(method,url,true);
    
    if(options.header) {
        for(var key in options.header) {
            xmlhttp.setRequestHeader(key,options.header[key]);
        }
    }
    
    xmlhttp.send(options.body);
}

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
}

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
}
