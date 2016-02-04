visicomp.core.util = {};

/** This method creates an error object, which has a "message" in the format
 *of a system error. The type and base error are optional. 
 * Based on the error type, additional data can be added to the error object
 * before it is thrown. */
visicomp.core.util.createError = function(msg,optionalType,optionalBaseError) {
    var error = new Error(msg);
    error.type = optionalType;
    error.baseError = optionalBaseError;
    return error;
}

/** This method creates an integer has value for a string. */
visicomp.core.util.mixin = function(destObject,mixinObject) {
    for(var key in mixinObject) {
        destObject.prototype[key] = mixinObject[key];
    }
}

/** This method creates an integer has value for a string. */
visicomp.core.util.stringHash = function(string) {
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
visicomp.core.util.objectHash = function(object) {
    //this is not real efficient. It should be implemented differently
    var string = JSON.stringify(object);
    return stringHash(string);
}

visicomp.core.util.constructors = {
    "String": ("").constructor,
    "Number": (3).constructor,
    "Boolean": (true).constructor,
    "Date": (new Date()).constructor,
    "Object": ({}).constructor,
    "Array": ([]).constructor,
    "Function": (function(){}).constructor
}

/** This method returns the object type. */
visicomp.core.util.getObjectType = function(object) {
    var constructor = object.constructor;
    for(var key in visicomp.core.util.constructors) {
        if(constructor == visicomp.core.util.constructors[key]) {
            return key;
        }	
    }
    //not found
    return "Unknown";
}

/** This method takes a field which can be an object, 
 *array or other value. If it is an object or array it 
 *freezes that object and all of its children, recursively. */
visicomp.core.util.deepFreeze = function(field) {
    if((field === null)||(field === undefined)) return;
    
    var type = visicomp.core.util.getObjectType(field);
	var i;
	if(type == "Object") {
		Object.freeze(field);
		for(i in field) {
			visicomp.core.util.deepFreeze(field[i]);
		}
	}
	else if(type == "Array") {
		Object.freeze(field);
		for(i = 0; i < field.length; i++) {
			visicomp.core.util.deepFreeze(field[i]);
		}
	}
}

/** This method does format string functionality. Text should include
 * {i} to insert the ith string argument passed. */
visicomp.core.util.formatString = function(format,stringArgs) {
    var formatParams = arguments;
    return format.replace(/{(\d+)}/g, function(match,p1) {
        var index = Number(p1) + 1;
        return formatParams[index]; 
    });
};

/** This method removes all the content from a DOM element. */
visicomp.core.util.removeAllChildren = function(element) {
	while(element.lastChild) {
		element.removeChild(element.lastChild);
	}
}