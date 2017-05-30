
    
/** This class manages context for the user code. This is used to associate names
 *from the user code with objects from the workspace. The argument passed here is
 *the object assoicatd with the context manager. */
hax.ContextManager = function(member) {
    this.member = member;
    this.contextList = [];
}

hax.ContextManager.prototype.addToContextList = function(entry) {
    this.contextList.push(entry);
}

hax.ContextManager.prototype.removeFromContextList = function(entry) {
    var index = this.contextList.indexOf(entry);
    if(index >= 0) {
        this.contextList.splice(index,1);
    }
}

hax.ContextManager.prototype.clearContextList = function() {
    this.contextList = [];
}

hax.ContextManager.prototype.getBaseData = function(baseName) {
    return this.hierarchicalLookup("lookupData",baseName);
}

hax.ContextManager.prototype.getImpactor = function(path) {
    return this.hierarchicalLookup("lookupImpactor",path);
}

//==================================
// Private Methods
//==================================

hax.ContextManager.prototype.hierarchicalLookup = function(lookupFunctionName,lookupKey) {

    //lookup base name in the context list
    var result = this.lookup(lookupFunctionName,lookupKey);
    
    if(result !== undefined) {
        return result;
    }
    else if((this.member)&&(this.member.getOwner)) {
        var owner = this.member.getOwner();
        if(owner) {
            var ownerContextManager = owner.getContextManager();
            return ownerContextManager.hierarchicalLookup(lookupFunctionName,lookupKey);
        }
    }
    
    return undefined;
}

hax.ContextManager.prototype.lookup = function(lookupFunctionName,lookupKey) {
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

hax.ContextManager.prototype.lookupData = function(entry,baseName) {   
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

hax.ContextManager.prototype.lookupImpactor = function(entry,path) {
    if(entry.parent) {
        return entry.parent.lookupChildFromPathArray(path);
    }
    else {
        return undefined;
    }
}



