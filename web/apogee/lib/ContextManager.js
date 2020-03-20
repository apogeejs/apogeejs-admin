/** This class manages context for the user code. It is used to look up 
 * variables from the scope defined by the context. 
 * It contains a context list, that allows for a number of entries. There are two
 * types of entries, "parent" entries and "data" entries.
 * A "parent" entry is an sopogee parent, which contains apogee members. From the "parent" entry 
 * you can lookup either a member object (getMember) or a member object value (getValue)
 * A "data" entry is a map of variables. Thse are not apogee members. With a "data" entry 
 * you can look up the variable values only. This is used to give access to other
 * variables besides the apogee members. */
export default function ContextManager(contextHolder) {
    this.contextHolder = contextHolder;
    this.contextList = [];
}

ContextManager.prototype.addToContextList = function(entry) {
    this.contextList.push(entry);
}

ContextManager.prototype.removeFromContextList = function(entry) {
    var index = this.contextList.indexOf(entry);
    if(index >= 0) {
        this.contextList.splice(index,1);
    }
}

ContextManager.prototype.clearContextList = function() {
    this.contextList = [];
}

ContextManager.prototype.getValue = function(model,varName) {
    var data = this.lookupValue(varName);
    
    //if the name is not in this context, check with the parent context
    if(data === undefined) {
        if((this.contextHolder)&&(this.contextHolder.getOwner)) {
            var owner = this.contextHolder.getOwner(model);
            if(owner) {
                var ownerContextManager = owner.getContextManager();
                data = ownerContextManager.getValue(model,varName);
            }
        }
    }
    
    return data;
}

ContextManager.prototype.getMember = function(model,path,optionalParentMembers) {
    var impactor = this.lookupMember(path,optionalParentMembers);
    
    //if the object is not in this context, check with the parent context
    if(impactor === undefined) {
        if((this.contextHolder)&&(this.contextHolder.getOwner)) {
            var owner = this.contextHolder.getOwner(model);
            if(owner) {
                var ownerContextManager = owner.getContextManager();
                impactor = ownerContextManager.getMember(model,path,optionalParentMembers);
            }
        }
    }
    
    return impactor;
}

//==================================
// Private Methods
//==================================

/** Check each entry of the context list to see if the data is present. */
ContextManager.prototype.lookupValue = function(varName) {
    var data;
    for(var i = 0; i < this.contextList.length; i++) {
        var entry = this.contextList[i];        
        if(entry.contextHolderAsParent) {
            //for parent entries, look up the child and read the data
            var child = this.contextHolder.lookupChild(varName);
            if(child) {
                data = child.getData();
            }
        }
        else if(entry.data) {
            //for data entries, look up the value from the data map
            data = entry.data[varName];
        }
        
        if(data !== undefined) return data;
    }
    
    return undefined;
}

ContextManager.prototype.lookupMember = function(path,optionalParentMembers) {
    var impactor;
    for(var i = 0; i < this.contextList.length; i++) {
        var entry = this.contextList[i];        
        if(entry.contextHolderAsParent) {
            //for parent entries, look up the child and read the data
            impactor = this.contextHolder.lookupChildFromPathArray(path,0,optionalParentMembers);
        }
        //no lookup in data entries
        
        if(impactor !== undefined) return impactor;
    }
    
    return undefined;
}



