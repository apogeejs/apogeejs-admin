/* 
 * This file contains elements for a singleton event manager.
 */
visicomp.core.EventManager = function() {
    /** This field holds the event listeners
    * @private */
    this.listenerTable = {};
    
    /** This field holds the event handlers
    * @private */
    this.handlerTable = {};
}

/** This method adds a listener for the given event. */
visicomp.core.EventManager.prototype.addListener = function(eventName, callback) {
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
}

/** This method removes a listener for the event. */
visicomp.core.EventManager.prototype.removeListener = function(eventName, callback) {
    var callbackList = this.listenerTable[eventName];
    if(callbackList) {
        for(var i = 0; i < callbackList.length; i++) {
            var l = callbackList[i];
            if(l == callback) {
                //it only appears once
                callbackList.splice(2,1);
                return;
            }
        }
    }
}

/** THis method dispatches an event. */
visicomp.core.EventManager.prototype.dispatchEvent = function(eventName, eventData) {
    var callbackList = this.listenerTable[eventName];
    if(callbackList) {
        for(var i = 0; i < callbackList.length; i++) {
            var callback = callbackList[i];
            callback.call(null,eventData);
        }
    }
}


/** This method adds a handler. */
visicomp.core.EventManager.prototype.addHandler = function(handlerName, callback) {
    this.handlerTable[handlerName] = callback;
}

/** This method clears a handler. */
visicomp.core.EventManager.prototype.removeHandler = function(handlerName) {
    delete this.handlerTable[handlerName];
}

/** This method calls a handler by name and returns the result. If no 
 * handler is found an error is thrown. */
visicomp.core.EventManager.prototype.callHandler = function(handlerName, handlerData) {
    var callback = this.handlerTable[handlerName];
    if(callback) {
        return callback(handlerData)
    }
    else {
        throw "Handler not found: " + handlerName;
    }
}

