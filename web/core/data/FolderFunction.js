/** This is a folderFunction, which is basically a function
 * that is expanded into data objects. */
visicomp.core.FolderFunction = function(name) {
    //base init
    visicomp.core.Child.init.call(this,name,visicomp.core.FolderFunction.generator);
    visicomp.core.DataHolder.init.call(this);
    visicomp.core.Dependent.init.call(this);
    visicomp.core.ContextHolder.init.call(this);
    visicomp.core.Owner.init.call(this);
    
    this.returnValueString = "";
    this.argList = [];
    
    //create the internal folder as a root folder (no parent). But give it
    //the full path name
    var folder = new visicomp.core.Folder(name);
    folder.setOwner(this);
    this.setInternalFolder(folder);
    
    //set to an empty function
    this.setData(function(){});
}

//add components to this class
visicomp.core.util.mixin(visicomp.core.FolderFunction,visicomp.core.Child);
visicomp.core.util.mixin(visicomp.core.FolderFunction,visicomp.core.DataHolder);
visicomp.core.util.mixin(visicomp.core.FolderFunction,visicomp.core.Dependent);
visicomp.core.util.mixin(visicomp.core.FolderFunction,visicomp.core.ContextHolder);
visicomp.core.util.mixin(visicomp.core.FolderFunction,visicomp.core.Owner);

/** This gets the internal forlder for the folderFunction. */
visicomp.core.FolderFunction.prototype.getInternalFolder = function() {
    return this.internalFolder;
}

/** This gets the name of the return object for the folderFunction function. */
visicomp.core.FolderFunction.prototype.getReturnValueString = function() {
    return this.returnValueString;
}

/** This gets the arg list of the folderFunction function. */
visicomp.core.FolderFunction.prototype.getArgList = function() {
    return this.argList;
}

//------------------------------
// Child Methods
//------------------------------

/** This overrides the get displaymethod of child to return the function declaration. */
visicomp.core.FolderFunction.prototype.getDisplayName = function() {
    var name = this.getName();
    var argList = this.getArgList();
    var argListString = argList.join(",");
    
    var displayName = name + "(" + argListString + ")";
    if((this.returnValueString != null)&&(this.returnValueString.length > 0)) {
        displayName += " = " + this.returnValueString;
    }
    
    return displayName;
}

/** This method is called when the child is deleted. If necessary the implementation
 * can extend this function, but it should call this base version of the function
 * if it does.  */
visicomp.core.FolderFunction.prototype.onDelete = function() {
    
    var returnValue;
    
    if(this.internalFolder) {
        var actionResponse = visicomp.core.deletemember.deleteMember(this.internalFolder);
        if(!actionResponse.getSuccess()) {
            //show an error message
            var msg = actionResponse.getErrorMsg();
            alert(msg);
        }
    }
    
//I don't know what to do if this fails. Figure that out.
    
    //call the base delete
    returnValue = visicomp.core.Child.onDelete.call(this);
	return returnValue;
}

/** This method creates a child from a json. It should be implemented as a static
 * method in a non-abstract class. */ 
visicomp.core.FolderFunction.fromJson = function(owner,json,updateDataList,actionResponse) {
    var folderFunction = new visicomp.core.FolderFunction(json.name);
    folderFunction.setOwner(owner);
    if(json.argList !== undefined) {
        folderFunction.setArgList(json.argList);
    }
    if(json.returnValue !== undefined) {
        folderFunction.setReturnValueString(json.returnValue);
    }
    
    //recreate the root folder if info is specified
    if(json.internalFolder) {
        var internalFolder = visicomp.core.Folder.fromJson(folderFunction,json.internalFolder,updateDataList,actionResponse);
        folderFunction.setInternalFolder(internalFolder);
    }
    
    return folderFunction;

}

/** This method adds any additional data to the json saved for this child. 
 * @protected */
visicomp.core.FolderFunction.prototype.addToJson = function(json) {
    json.argList = this.argList;
    json.returnValue = this.returnValueString;
    json.internalFolder = this.internalFolder.toJson();
}

//-------------------------------
// Dependent Methods
//-------------------------------
    

/** If this is true the member must be executed. */
visicomp.core.FolderFunction.prototype.needsCalculating = function() {
	return true;
}

/** This updates the member data based on the function. It returns
 * true for success and false if there is an error.  */
visicomp.core.FolderFunction.prototype.calculate = function() {
    
    var folderFunctionErrors = [];
    
	//check for code errors, if so set a data error
    var folderFunctionFunction = this.getFolderFunctionFunction(folderFunctionErrors);
    
    if(folderFunctionErrors.length == 0) {
        this.clearErrors();
        this.setData(folderFunctionFunction);
    }
    else {
        //for now I can only set a single error. I will set the first.
        //I should get way to set multiple
        this.addErrors(folderFunctionErrors);
    }
}

/** This method updates the dependencies of any children
 * based on an object being added. */
visicomp.core.FolderFunction.prototype.updateForAddedVariable = function(object,recalculateList) {
}

/** This method updates the dependencies of any children
 * based on an object being deleted. */
visicomp.core.FolderFunction.prototype.updateForDeletedVariable = function(object,recalculateList) {
}

//------------------------------
//ContextHolder methods
//------------------------------

/** This method retrieve creates the loaded context manager. */
visicomp.core.FolderFunction.prototype.createContextManager = function() {
    return new visicomp.core.ContextManager(this.getOwner());
}

//------------------------------
//Owner methods
//------------------------------

/** this method gets the hame the children inherit for the full name. */
visicomp.core.FolderFunction.prototype.getPossesionNameBase = function() {
    return this.getFullName() + ":";
}


//==============================
// Private Methods
//==============================

/** This is called from the update action. It should not be called externally. 
 * @private */
visicomp.core.FolderFunction.prototype.setInternalFolder = function(folder) {
    this.internalFolder = folder;
    this.updateDependencies([folder]);
}

/** This is called from the update action. It should not be called externally. */
visicomp.core.FolderFunction.prototype.setReturnValueString = function(returnValueString) {
    this.returnValueString = returnValueString;
}

/** This is called from the update action. It should not be called externally. */
visicomp.core.FolderFunction.prototype.setArgList = function(argList) {
    this.argList = argList;
}

/** This method creates the folderFunction function. It is called from the update action 
 * and should not be called externally. 
 * @private */
visicomp.core.FolderFunction.prototype.getFolderFunctionFunction = function(folderFunctionErrors) {

    //create a copy of the workspace to do the function calculation - we don't update the UI display version
    var virtualWorkspace = this.createVirtualWorkspace(folderFunctionErrors);
	
	if(!virtualWorkspace) {
		return null;
	}

    //lookup elements from virtual workspace
    var rootFolder = virtualWorkspace.getRootFolder();
    var inputElementArray = this.loadInputElements(rootFolder,folderFunctionErrors);
    var returnValueTable = this.loadOutputElement(rootFolder,folderFunctionErrors); 
    
    var folderFunctionFunction = function(args) {
        //create an update array to set the table values to the elements
        var updateDataList = [];
        for(var i = 0; i < inputElementArray.length; i++) {
            var entry = {};
            entry.member = inputElementArray[i];
            entry.data = arguments[i];
            updateDataList.push(entry);
        }

        //apply the update
        var actionResponse = visicomp.core.updatemember.updateObjects(updateDataList);        
        if(actionResponse.getSuccess()) {
            //retrieve the result
            if(returnValueTable) {
                return returnValueTable.getData();
            }
            else {
                //no return value found
                return undefined;
            }
        }
        else {
            //error exectuing folderFunction function - thro wan exception
            throw visicomp.core.util.createError("Error executing folderFunction: " + actionResponse.getErrorMsg());
        }
    }
    
    return folderFunctionFunction;    
}

/** This method creates a copy of the workspace to be used for the function evvaluation. 
 * @private */
visicomp.core.FolderFunction.prototype.createVirtualWorkspace = function(folderFunctionErrors) {
    try {
		return visicomp.core.Workspace.createVirtualWorkpaceFromFolder("temp",this.internalFolder,this.getContextManager());
	}
	catch(error) {
        var actionError = visicomp.core.ActionError.processMemberModelException(exception,"FolderFunction - Code");
		folderFunctionErrors.push(actionError);
		return null;
	}
}

/** This method loads the input argument members from the virtual workspace. 
 * @private */
visicomp.core.FolderFunction.prototype.loadInputElements = function(rootFolder,folderFunctionErrors) {
    var argMembers = [];
    for(var i = 0; i < this.argList.length; i++) {
        var argName = this.argList[i];
        var argMember = rootFolder.lookupChild(argName);
        if(argMember) {
			argMembers.push(argMember);
		}
//		else {
//            //missing input element
//            var msg = "Input element not found in folderFunction: " + argName;
//            var actionError = new visicomp.core.ActionError(msg,"FolderFunction - Code",this);
//            folderFunctionErrors.push(actionError);
//        }       
    }
    return argMembers;
}

/** This method loads the output member from the virtual workspace. 
 * @private  */
visicomp.core.FolderFunction.prototype.loadOutputElement = function(rootFolder,folderFunctionErrors) {
    var returnValueMember = rootFolder.lookupChild(this.returnValueString);
//    if(!returnValueMember) {
//        //missing input element
//        var msg = "Return element not found in folderFunction: " + this.returnValueString;
//        var actionError = new visicomp.core.ActionError(msg,"FolderFunction - Code",this);
//        folderFunctionErrors.push(actionError);
//    }
    return returnValueMember;
}

        
//============================
// Static methods
//============================

visicomp.core.FolderFunction.generator = {};
visicomp.core.FolderFunction.generator.displayName = "Folder Function";
visicomp.core.FolderFunction.generator.type = "visicomp.core.FolderFunction";
visicomp.core.FolderFunction.generator.createMember = visicomp.core.FolderFunction.fromJson;

//register this member
visicomp.core.Workspace.addMemberGenerator(visicomp.core.FolderFunction.generator);