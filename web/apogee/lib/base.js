/** This namespace contains some basic functions for the application. */
apogee.base = {};

apogee.base.MEMBER_FUNCTION_INVALID_THROWABLE = {"apogeeException":"invalid"};
apogee.base.MEMBER_FUNCTION_PENDING_THROWABLE = {"apogeeException":"pending"};

/** This method creates an integer has value for a string. */
apogee.base.mixin = function(destObject,mixinObject) {
    for(var key in mixinObject) {
        destObject.prototype[key] = mixinObject[key];
    }
}

/** This method takes a field which can be an object, 
 *array or other value. If it is an object or array it 
 *freezes that object and all of its children, recursively.
 * Warning - this does not check for cycles (which are not in JSON 
 * objects but can be in javascript objects)
 * Implementation from Mozilla */
apogee.base.deepFreeze = function(obj) {
    if((obj === null)||(obj === undefined)) return;
    
    //retrieve the property names defined on obj
    var propNames = Object.getOwnPropertyNames(obj);

    //freeze properties before freezing self
    propNames.forEach(function(name) {
        var prop = obj[name];

        //freeze prop if it is an object
        if(typeof prop == 'object' && prop !== null) apogee.base.deepFreeze(prop);
    });

    //freeze self (no-op if already frozen)
    return Object.freeze(obj);
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