/** This is a folderFunction, which is basically a function
 * that is expanded into data objects. */
hax.core.FolderFunction = function(name,owner) {
    //base init
    hax.core.Child.init.call(this,name,hax.core.FolderFunction.generator);
    hax.core.DataHolder.init.call(this);
    hax.core.Dependent.init.call(this);
    hax.core.ContextHolder.init.call(this);
    hax.core.Owner.init.call(this);
    
    this.returnValueString = "";
    this.argList = [];
    
    this.initOwner(owner);
    
    //create the internal folder as a root folder (no parent). But give it
    //the full path name
    var folder = new hax.core.Folder(name,this);
    this.setInternalFolder(folder);
    
    //set to an empty function
    this.setData(function(){});
}

//add components to this class
hax.core.util.mixin(hax.core.FolderFunction,hax.core.Child);
hax.core.util.mixin(hax.core.FolderFunction,hax.core.DataHolder);
hax.core.util.mixin(hax.core.FolderFunction,hax.core.Dependent);
hax.core.util.mixin(hax.core.FolderFunction,hax.core.ContextHolder);
hax.core.util.mixin(hax.core.FolderFunction,hax.core.Owner);

/** This gets the internal forlder for the folderFunction. */
hax.core.FolderFunction.prototype.getInternalFolder = function() {
    return this.internalFolder;
}

/** This gets the name of the return object for the folderFunction function. */
hax.core.FolderFunction.prototype.getReturnValueString = function() {
    return this.returnValueString;
}

/** This gets the arg list of the folderFunction function. */
hax.core.FolderFunction.prototype.getArgList = function() {
    return this.argList;
}

//------------------------------
// Child Methods
//------------------------------

/** This overrides the get displaymethod of child to return the function declaration. */
hax.core.FolderFunction.prototype.getDisplayName = function() {
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
hax.core.FolderFunction.prototype.onDelete = function() {
    
    var returnValue;
    
    if(this.internalFolder) {
        var actionResponse = hax.core.deletemember.deleteMember(this.internalFolder);
        if(!actionResponse.getSuccess()) {
            //show an error message
            var msg = actionResponse.getErrorMsg();
            alert(msg);
        }
    }
    
//I don't know what to do if this fails. Figure that out.
    
    //call the base delete
    returnValue = hax.core.Child.onDelete.call(this);
	return returnValue;
}

/** This method creates a child from a json. It should be implemented as a static
 * method in a non-abstract class. */ 
hax.core.FolderFunction.fromJson = function(owner,json,updateDataList,actionResponse) {
    var folderFunction = new hax.core.FolderFunction(json.name,owner);
    if(json.argList !== undefined) {
        folderFunction.setArgList(json.argList);
    }
    if(json.returnValue !== undefined) {
        folderFunction.setReturnValueString(json.returnValue);
    }
    
    //recreate the root folder if info is specified
    if(json.internalFolder) {
        var internalFolder = hax.core.Folder.fromJson(folderFunction,json.internalFolder,updateDataList,actionResponse);
        folderFunction.setInternalFolder(internalFolder);
    }
    
    return folderFunction;

}

/** This method adds any additional data to the json saved for this child. 
 * @protected */
hax.core.FolderFunction.prototype.addToJson = function(json) {
    json.argList = this.argList;
    json.returnValue = this.returnValueString;
    json.internalFolder = this.internalFolder.toJson();
}

//-------------------------------
// Dependent Methods
//-------------------------------
    

/** If this is true the member must be executed. */
hax.core.FolderFunction.prototype.needsCalculating = function() {
	return true;
}

/** This updates the member based on a change in a dependency.  */
hax.core.FolderFunction.prototype.prepareForCalculate = function() {
    this.clearDataSet();
}

//add these fields to object
//this.impactorDataSet = true;

/** This updates the member data based on the function. It returns
 * true for success and false if there is an error.  */
hax.core.FolderFunction.prototype.calculate = function() {
    
    var folderFunctionErrors = [];
    
	//check for code errors, if so set a data error
    var folderFunctionFunction = this.getFolderFunctionFunction(folderFunctionErrors);
    
    if(folderFunctionErrors.length == 0) {
        this.setData(folderFunctionFunction);
    }
    else {
        //for now I can only set a single error. I will set the first.
        //I should get way to set multiple
        this.addErrors(folderFunctionErrors);
    }
    
    //make sure the data is set in each impactor
    this.initializeImpactors();
}

/** This method updates the dependencies of any children
 * based on an object being added. */
hax.core.FolderFunction.prototype.updateForAddedVariable = function(object,recalculateList) {
    this.internalFolder.updateForAddedVariable(object,recalculateList);
}

/** This method updates the dependencies of any children
 * based on an object being deleted. */
hax.core.FolderFunction.prototype.updateForDeletedVariable = function(object,recalculateList) {
     this.internalFolder.updateForDeletedVariable(object,recalculateList);
}

//------------------------------
//ContextHolder methods
//------------------------------

/** This method retrieve creates the loaded context manager. */
hax.core.FolderFunction.prototype.createContextManager = function() {
    return new hax.core.ContextManager(this);
}

//------------------------------
//Owner methods
//------------------------------

/** this method gets the hame the children inherit for the full name. */
hax.core.FolderFunction.prototype.getPossesionNameBase = function() {
    return this.getFullName() + ":";
}


//==============================
// Private Methods
//==============================

/** This is called from the update action. It should not be called externally. 
 * @private */
hax.core.FolderFunction.prototype.setInternalFolder = function(folder) {
    this.internalFolder = folder;
    this.updateDependencies([folder]);
}

/** This is called from the update action. It should not be called externally. */
hax.core.FolderFunction.prototype.setReturnValueString = function(returnValueString) {
    this.returnValueString = returnValueString;
}

/** This is called from the update action. It should not be called externally. */
hax.core.FolderFunction.prototype.setArgList = function(argList) {
    this.argList = argList;
}

/** This method creates the folderFunction function. It is called from the update action 
 * and should not be called externally. 
 * @private */
hax.core.FolderFunction.prototype.getFolderFunctionFunction = function(folderFunctionErrors) {

    //create a copy of the workspace to do the function calculation - we don't update the UI display version
    var virtualWorkspace;
    var rootFolder;
    var inputElementArray;
    var returnValueTable; 
    
    var initialized = false;
    var instance = this;
    
    var folderFunctionFunction = function(args) {
        
        if(!initialized) {
            //create a copy of the workspace to do the function calculation - we don't update the UI display version
            virtualWorkspace = instance.createVirtualWorkspace(folderFunctionErrors);
	
    //HANDLE THIS ERROR CASE DIFFERENTLY!!!
            if(!virtualWorkspace) {
                return null;
            }

            //lookup elements from virtual workspace
            rootFolder = virtualWorkspace.getRootFolder();
            inputElementArray = instance.loadInputElements(rootFolder,folderFunctionErrors);
            returnValueTable = instance.loadOutputElement(rootFolder,folderFunctionErrors);     
        }
        
        //create an update array to set the table values to the elements
        var updateDataList = [];
        for(var i = 0; i < inputElementArray.length; i++) {
            var entry = {};
            entry.member = inputElementArray[i];
            entry.data = arguments[i];
            updateDataList.push(entry);
        }

        //apply the update
        var actionResponse = hax.core.updatemember.updateObjects(updateDataList);        
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
            throw hax.core.util.createError(actionResponse.getErrorMsg());
        }
    }
    
    return folderFunctionFunction;    
}

/** This method creates a copy of the workspace to be used for the function evvaluation. 
 * @private */
hax.core.FolderFunction.prototype.createVirtualWorkspace = function(folderFunctionErrors) {
    try {
		return hax.core.Workspace.createVirtualWorkpaceFromFolder("temp",this.internalFolder,this.getOwner());
	}
	catch(error) {
        var actionError = hax.core.ActionError.processException(exception,"FolderFunction - Code",false);
		folderFunctionErrors.push(actionError);
		return null;
	}
}

/** This method loads the input argument members from the virtual workspace. 
 * @private */
hax.core.FolderFunction.prototype.loadInputElements = function(rootFolder,folderFunctionErrors) {
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
//            var actionError = new hax.core.ActionError(msg,"FolderFunction - Code",this);
//            folderFunctionErrors.push(actionError);
//        }       
    }
    return argMembers;
}

/** This method loads the output member from the virtual workspace. 
 * @private  */
hax.core.FolderFunction.prototype.loadOutputElement = function(rootFolder,folderFunctionErrors) {
    var returnValueMember = rootFolder.lookupChild(this.returnValueString);
//    if(!returnValueMember) {
//        //missing input element
//        var msg = "Return element not found in folderFunction: " + this.returnValueString;
//        var actionError = new hax.core.ActionError(msg,"FolderFunction - Code",this);
//        folderFunctionErrors.push(actionError);
//    }
    return returnValueMember;
}

        
//============================
// Static methods
//============================

hax.core.FolderFunction.generator = {};
hax.core.FolderFunction.generator.displayName = "Folder Function";
hax.core.FolderFunction.generator.type = "hax.core.FolderFunction";
hax.core.FolderFunction.generator.createMember = hax.core.FolderFunction.fromJson;

//register this member
hax.core.Workspace.addMemberGenerator(hax.core.FolderFunction.generator);