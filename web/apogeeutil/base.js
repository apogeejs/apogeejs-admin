/** This namespace contains some basic functions for the application. */
let base = {};

export {base as default};

base.MEMBER_FUNCTION_INVALID_THROWABLE = {"apogeeException":"invalid"};
base.MEMBER_FUNCTION_PENDING_THROWABLE = {"apogeeException":"pending"};

/** This function reads any proeprty of the mixinObject and adds it
 * fo the prototypr of the destObject. This is intended to apend functions and
 * other properties to a cless directly without going through inheritance. 
 * Note this will overwrite and similarly named object in the dest class.*/
base.mixin = function(destObject,mixinObject) {
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
base.deepFreeze = function(obj) {
    if((obj === null)||(obj === undefined)) return;
    
    //retrieve the property names defined on obj
    var propNames = Object.getOwnPropertyNames(obj);

    //freeze properties before freezing self
    propNames.forEach(function(name) {
        var prop = obj[name];

        //freeze prop if it is an object
        if(typeof prop == 'object' && prop !== null) base.deepFreeze(prop);
    });

    //freeze self (no-op if already frozen)
    return Object.freeze(obj);
}

/** This method creates an error object, which has a "message" in the format
 *of a system error. The isFatal flag can be set to specify if this is a fatal or nonfatal
 *error. It may also be omitted. A base error may also be set. */
base.createError = function(msg,optionalIsFatal,optionalBaseError) {
    var error = new Error(msg);
	if(optionalIsFatal !== undefined) {
		error.isFatal = optionalIsFatal;
	}
	if(optionalBaseError !== undefined) {
		error.baseError = optionalBaseError;
	}
    return error;
}

