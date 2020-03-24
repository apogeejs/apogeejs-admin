/** This class manages variable scope for the user code. It is used to look up 
 * variables both to find dependencies in member code or to find the value for
 * member code execution.
 * 
 * It has two lookup functions. "getMember" looks up members and is used to 
 * find dependencies. "getValue" looks up member values, for evaluating member values.
 * 
 * When a lookup is done, the named member/value is looked up in the local member scope. If it is not found,
 * the search is then done in the parent of the member. This chain continues until we reach a "root" object,
 * an example of which is the model object itself.
 * 
 * The root object has a lookup like the other context manager objects, however, if a lookup fails
 * to fins something, it does a lookup on global javascript variables. (Any filtering on this is TBD)
 * 
 * In the local scope for each context holder there is a context list, that allows for a number of entries. 
 * Currently the only one type of entry - parent entry. It looks up children of the current object.
 * 
 * In the future we can add imports for the local scope, and potentially other lookup types. 
 * */
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
    var data = this.lookupValue(model,varName);
    
    //if the name is not in this context, check with the parent context
    if(data === undefined) {
        if((this.contextHolder)&&(!this.contextHolder.getIsScopeRoot())) {
            var parent = this.contextHolder.getParent(model);
            if(parent) {
                var parentContextManager = parent.getContextManager();
                data = parentContextManager.getValue(model,varName);
            }
        }
    }
    
    return data;
}

ContextManager.prototype.getMember = function(model,pathArray,optionalParentMembers) {
    let index = 0;
    var impactor = this.lookupMember(model,pathArray,index,optionalParentMembers);
    
    //if the object is not in this context, check with the parent context
    if(!impactor) {
        if((this.contextHolder)&&(!this.contextHolder.getIsScopeRoot())) {
            var parent = this.contextHolder.getParent(model);
            if(parent) {
                var parentContextManager = parent.getContextManager();
                impactor = parentContextManager.getMember(model,pathArray,optionalParentMembers);
            }
        }
    }
    
    return impactor;
}

//==================================
// Private Methods
//==================================

/** Check each entry of the context list to see if the data is present. */
ContextManager.prototype.lookupValue = function(model,varName) {
    var data;
    let childFound = false;
    for(var i = 0; i < this.contextList.length; i++) {
        var entry = this.contextList[i];        
        if(entry.contextHolderAsParent) {
            //for parent entries, look up the child and read the data
            var child = this.contextHolder.lookupChild(model,varName);
            if(child) {
                data = child.getData();
                childFound = true;
            }
        }
        
        if(childFound) return data;
    }

    if(this.contextHolder.getIsScopeRoot()) {
        data = this.getValueFromGlobals(varName);

        if(data != undefined) {
            return data;
        }
    }
    
    return undefined;
}

ContextManager.prototype.lookupMember = function(model,pathArray,index,optionalParentMembers) {
    var impactor;
    for(var i = 0; i < this.contextList.length; i++) {
        var entry = this.contextList[i];        
        if(entry.contextHolderAsParent) {
            //for parent entries, look up the child and read the data
            impactor = this.contextHolder.lookupChild(model,pathArray[index]);

            if((impactor)&&(impactor.isContextHolder)) {
                let childImpactor = impactor.getContextManager().lookupMember(model,pathArray,index+1);
                if(childImpactor) {
                    if(optionalParentMembers) {
                        optionalParentMembers.push(impactor);
                    }
                    impactor = childImpactor;
                }
            }

        }
        //no lookup in data entries
        
        if(impactor) return impactor;
    }
    
    return undefined;
}

ContextManager.prototype.getValueFromGlobals = function(varName) {
    //for now don't do any filtering
    //in the future we may want to do something so people don't deine their own globals - TBD
    return __globals__[varName];
}



