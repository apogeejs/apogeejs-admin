/** This namespace contains some basic functions for the application. */
apogee.base = {};

/** This method creates an integer has value for a string. */
apogee.base.mixin = function(destObject,mixinObject) {
    for(var key in mixinObject) {
        destObject.prototype[key] = mixinObject[key];
    }
}

/** This method creates an integer has value for a string. */
apogee.base.isPromise = function(object) {
    if(object === null) return false;
    return (typeof object === "object")&&(object.constructor === Promise);
}

/** This method takes a field which can be an object, 
 *array or other value. If it is an object or array it 
 *freezes that object and all of its children, recursively. */
apogee.base.deepFreeze = function(field) {
    if((field === null)||(field === undefined)) return;
    
    var type = apogee.util.getObjectType(field);
	var i;
	if(type == "Object") {
		Object.freeze(field);
		for(i in field) {
			apogee.base.deepFreeze(field[i]);
		}
	}
	else if(type == "Array") {
		Object.freeze(field);
		for(i = 0; i < field.length; i++) {
			apogee.base.deepFreeze(field[i]);
		}
	}
}

/** This method creates an error object, which has a "message" in the format
 *of a system error. The isFatal flag can be set to specify if this is a fatal or nonfatal
 *error. It may also be omitted. A base error may also be set. */
apogee.base.createError = function(msg,optionalIsFatal,optionalBaseError) {
    var error = new Error(msg);
	if(optionalIsFatal !== undefined) {
		error.isFatal = optionalIsFatal;
	}
	if(optionalBaseError !== undefined) {
		error.baseError = optionalBaseError;
	}
    return error;
}

/** This creates a new array with elements from the first that are not in the second. 
 * I wasn't really sure where to put this. So it ended up here. */
apogee.base.getListInFirstButNotSecond = function(firstList,secondList) {
    var newList = [];
    for(var i = 0; i < firstList.length; i++) {
        var entry = firstList[i];
        if(secondList.indexOf(entry) < 0) {
            newList.push(entry);
        }
    }
    return newList;
}