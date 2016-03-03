
    
/** This class manages context for the user code. */
visicomp.core.ContextManager = function(child) {
    this.child = child;
    this.contextList = [];
}

visicomp.core.ContextManager.prototype.addToContextList = function(entry) {
    this.contextList.push(entry);
}

visicomp.core.ContextManager.prototype.removeFromContextList = function(entry) {
    var index = this.contextList.indexOf(entry);
    if(index >= 0) {
        this.contextList.splice(index,1);
    }
}

visicomp.core.ContextManager.prototype.clearContextList = function() {
    this.contextList = [];
}

visicomp.core.ContextManager.prototype.getBaseData = function(baseName,generation) {
    return hierarchicalLookup(this.getLocalBaseData,baseName,generation);
}

visicomp.core.ContextManager.prototype.getImpactor = function(path,generation) {
    return hierarchicalLookup(this.getLocalImpactor,path,generation);
}

//==================================
// Private Methods
//==================================

visicomp.core.ContextManager.prototype.hierarchicalLookup = function(lookupFunction,lookupKey,generation) {
    if(generation === undefined) generation = 0;

    //lookup base name in the context list
    var result = lookupFunction.call(this,lookupKey,generation);
    
    if(result !== undefined) {
        return result;
    }
    else if(this.child) {
//OOPS - we don't store the owner! We might need to add it, and use it elsewhere too.
        var owner = this.child.getOwner();
        if(owner) {
            return lookupFunction.call(owner,lookupKey,generation);
        }
    }
    
    return undefined;
}

visicomp.core.ContextManager.prototype.getLocalBaseData = function(baseName,generation) {
	//cycle through the variables used
	for(var entry in this.contextList) {
        if(entry.generation <= generation) {
            var baseData;
            if(entry.parent) {
//make sure child returns undefined and not null!
                baseData = entry.parent.lookupChild(baseName);
            }
            else if(entry.data) {
                baseData = entry.data[baseName];
            }
            if(baseData !== undefined) return baseData;
        }
    }
    //if we get here the object was not found
    return undefined;
}

visicomp.core.ContextManager.prototype.getLocalImpactor = function(path,generation) {
	//cycle through the variables used
	for(var entry in this.contextList) {
        if((entry.generation <= generation)&&(entry.parent)) {
            var impactor = entry.parent.lookupChildFromPath(path);
            if(impactor) return impactor;
        }
    }
    //if we get here the object was not found
    return undefined;
}



