
    
/** This class manages context for the user code. This is used to associate names
 *from the user code with objects from the workspace. The argument passed here is
 *the object assoicatd with the context manager. */
apogee.ContextManager = function(contextHolder) {
    this.contextHolder = contextHolder;
    this.contextList = [];
}

apogee.ContextManager.prototype.addToContextList = function(entry) {
    this.contextList.push(entry);
}

apogee.ContextManager.prototype.removeFromContextList = function(entry) {
    var index = this.contextList.indexOf(entry);
    if(index >= 0) {
        this.contextList.splice(index,1);
    }
}

apogee.ContextManager.prototype.clearContextList = function() {
    this.contextList = [];
}

apogee.ContextManager.prototype.getBaseData = function(baseName) {
    return this.hierarchicalLookup("lookupData",baseName);
}

apogee.ContextManager.prototype.getImpactor = function(path) {
    return this.hierarchicalLookup("lookupImpactor",path);
}

//==================================
// Private Methods
//==================================

apogee.ContextManager.prototype.hierarchicalLookup = function(lookupFunctionName,lookupKey) {

    //lookup base name in the context list
    var result = this.lookup(lookupFunctionName,lookupKey);
    
    if(result !== undefined) {
        return result;
    }
    else if((this.contextHolder)&&(this.contextHolder.getOwner)) {
        var owner = this.contextHolder.getOwner();
        if(owner) {
            var ownerContextManager = owner.getContextManager();
            return ownerContextManager.hierarchicalLookup(lookupFunctionName,lookupKey);
        }
    }
    
    return undefined;
}

apogee.ContextManager.prototype.lookup = function(lookupFunctionName,lookupKey) {
	//cycle through the variables used
	for(var i = 0; i < this.contextList.length; i++) {
        var entry = this.contextList[i];
        var result = this[lookupFunctionName](entry,lookupKey); 
        if(result !== undefined) {
            return result;
        }
    }
    //not found
    return undefined;
}

apogee.ContextManager.prototype.lookupData = function(entry,baseName) {   
    if(entry.parent) {
        var child = entry.parent.lookupChild(baseName);
        if(child) {
            return child.getData();
        }
        else {
            return undefined;
        }
    }
    else if(entry.data) {
        return entry.data[baseName];
    }
}

apogee.ContextManager.prototype.lookupImpactor = function(entry,path) {
    if(entry.parent) {
        return entry.parent.lookupChildFromPathArray(path);
    }
    else {
        return undefined;
    }
}



