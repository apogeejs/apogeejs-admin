/** This namespace includes some utility function available to the user. They 
 * are also used in the applictaion. */
hax.util = {};

/** This method creates an integer has value for a string. */
hax.util.stringHash = function(string) {
    var HASH_SIZE = 0xffffffff;
    var hash = 0;
    var ch;
    for (var i = 0; i < string.length; i++) {
        ch = string.charCodeAt(i);
        hash = (31 * hash + ch) & HASH_SIZE;
    }
    return hash;
}

/** This method creates an integer hash value for an object. */
hax.util.objectHash = function(object) {
    //this is not real efficient. It should be implemented differently
    var string = JSON.stringify(object);
    return stringHash(string);
}

hax.util.constructors = {
    "String": ("").constructor,
    "Number": (3).constructor,
    "Boolean": (true).constructor,
    "Date": (new Date()).constructor,
    "Object": ({}).constructor,
    "Array": ([]).constructor,
    "Function": (function(){}).constructor
}

/** This method returns the object type. */
hax.util.getObjectType = function(object) {
    var constructor = object.constructor;
    for(var key in hax.util.constructors) {
        if(constructor == hax.util.constructors[key]) {
            return key;
        }	
    }
    //not found
    return "Unknown";
}

/** This method creates a deep copy of an object, array or value. Note that
 * undefined is not a valid value in JSON. */
hax.util.deepJsonCopy = function(data) {
    if(data === null) return null;
    if(data === undefined) return undefined;
    return JSON.parse(JSON.stringify(data));
}

/** This method does format string functionality. Text should include
 * {i} to insert the ith string argument passed. */
hax.util.formatString = function(format,stringArgs) {
    var formatParams = arguments;
    return format.replace(/{(\d+)}/g, function(match,p1) {
        var index = Number(p1) + 1;
        return formatParams[index]; 
    });
};

/** This method reads the query string from a url */
hax.util.readQueryField = function(field,url) {
    var href = url ? url : window.location.href;
    var reg = new RegExp( '[?&]' + field + '=([^&#]*)', 'i' );
    var string = reg.exec(href);
    return string ? string[1] : null;
}

/** This method returns a copied json that has the order in all object normalized to alphabetical. 
 * This is intended for the purpose of comparing json objects. */
hax.util.getNormalizedCopy = function(json) {
    var copiedJson;

    var objectType = hax.util.getObjectType(json);
    
    switch(objectType) {
        case "Object":
            copiedJson = hax.util.getNormalizedObjectCopy(json);
            break;
            
        case "Array": 
            copiedJson = hax.util.getNormalizedArrayCopy(json);
            break;
            
        default:
            copiedJson = json;
    }
    
    return copiedJson;
}

/** this orders the keys apphabetically, since order is not important in a json object */
hax.util.getNormalizedObjectCopy = function(json) {
    var copiedJson = {};
    
    var keys = [];
    var key;
    for(key in json) {
        keys.push(key);
    }
    
    keys.sort();
    
    for(var i = 0; i < keys.length; i++) {
        key = keys[i];
        copiedJson[key] = hax.util.getNormalizedCopy(json[key]);
    }
    return copiedJson;
}

/** This makes a copy of with any contained objects normalized. */
hax.util.getNormalizedArrayCopy = function(json) {
    var copiedJson = [];
    for(var i = 0; i < json.length; i++) {
        var element = json[i];
        copiedJson.push(hax.util.getNormalizedCopy(element));
    }
    return copiedJson;
}