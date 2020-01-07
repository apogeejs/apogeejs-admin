/* 
 * This is an event manager class, to be used as a base class.
 */


export default class EventManager {
        
    /** This serves as the constructor. */
    constructor() {
        /** This field holds the event listeners
        * @private */
        this.listenerTable = {};
        
        /** This field holds the event handlers
        * @private */
        this.handlerTable = {};
    }

    /** This method adds a listener for the given event. */
    addListener(eventName, callback) {
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
    removeListener(eventName, callback) {
        var callbackList = this.listenerTable[eventName];
        if(callbackList) {
            var index = callbackList.indexOf(callback);
            if(index >= 0) {
                callbackList.splice(index,1);
            }
        }
    }

    /** This method can be called to see if an event has listeners. */
    hasListeners(eventName) {
        let listenerList = this.listenerTable[eventName];
        return ((listenerList)&&(listenerList.length > 0));
    }

    /** THis method dispatches an event. */
    dispatchEvent(eventName, eventData) {
        var callbackList = this.listenerTable[eventName];
        if(callbackList) {
            for(var i = 0; i < callbackList.length; i++) {
                var callback = callbackList[i];
                callback.call(null,eventData);
            }
        }
    }


    /** This method adds a handler. */
    addHandler(handlerName, callback) {
        this.handlerTable[handlerName] = callback;
    }

    /** This method clears a handler. */
    removeHandlerction(handlerName) {
        delete this.handlerTable[handlerName];
    }

    /** This method calls a handler by name and returns the result. If no 
     * handler is found undefined is returned. */
    callHandler(handlerName, handlerData) {
        var callback = this.handlerTable[handlerName];
        if(callback) {
            return callback(handlerData)
        }
        else {
            return undefined;
        }
    }
}

