visicomp.core.util = {};

/** This method creates an error object, which has a "message" in the format
 *of a system error. The isFatal flag can be set to specify if this is a fatal or nonfatal
 *error. It may also be omitted. A base error may also be set. */
visicomp.core.util.createError = function(msg,optionalIsFatal,optionalBaseError) {
    var error = new Error(msg);
	if(optionalIsFatal !== undefined) {
		error.isFatal = optionalIsFatal;
	}
	if(optionalBaseError !== undefined) {
		error.baseError = optionalBaseError;
	}
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

/** This method creates a deep copy of an object, array or value. Note that
 * undefined is not a valid value in JSON. */
visicomp.core.util.deepJsonCopy = function(data) {
    return JSON.parse(JSON.stringify(data));
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