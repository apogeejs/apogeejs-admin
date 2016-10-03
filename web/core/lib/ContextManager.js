
    
/** This class manages context for the user code. This is used to provide the object 
 * associated with a given name in the code, following the relevent namespace hierarchy.*/
hax.core.ContextManager = function(contextParent) {
    this.parentOwner = contextParent;
    this.contextList = [];
}

hax.core.ContextManager.prototype.addToContextList = function(entry) {
    this.contextList.push(entry);
}

hax.core.ContextManager.prototype.removeFromContextList = function(entry) {
    var index = this.contextList.indexOf(entry);
    if(index >= 0) {
        this.contextList.splice(index,1);
    }
}

hax.core.ContextManager.prototype.clearContextList = function() {
    this.contextList = [];
}

hax.core.ContextManager.prototype.getBaseData = function(baseName,generation) {
    return this.hierarchicalLookup("lookupData",baseName,generation);
}

hax.core.ContextManager.prototype.getImpactor = function(path,generation) {
    return this.hierarchicalLookup("lookupImpactor",path,generation);
}

//==================================
// Private Methods
//==================================

hax.core.ContextManager.prototype.hierarchicalLookup = function(lookupFunctionName,lookupKey,generation) {
    if(generation === undefined) generation = 0;

    //lookup base name in the context list
    var result = this.lookup(lookupFunctionName,lookupKey,generation);
    
    if(result !== undefined) {
        return result;
    }
    else if(this.parentOwner) {
		var ownerContextManager = this.parentOwner.getContextManager();
		return ownerContextManager.hierarchicalLookup(lookupFunctionName,lookupKey,generation + 1);
    }
    
    return undefined;
}

hax.core.ContextManager.prototype.lookup = function(lookupFunctionName,lookupKey,generation) {
	//cycle through the variables used
	for(var i = 0; i < this.contextList.length; i++) {
        var entry = this.contextList[i];
        if(!((entry.isLocal)&&(generation > 1))) {
            var result = this[lookupFunctionName](entry,lookupKey); 
            if(result !== undefined) {
                return result;
            }
        }
    }
    //not found
    return undefined;
}

hax.core.ContextManager.prototype.lookupData = function(entry,baseName) {   
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

hax.core.ContextManager.prototype.lookupImpactor = function(entry,path) {
    if(entry.parent) {
        return entry.parent.lookupChildFromPath(path);
    }
    else {
        return undefined;
    }
}



