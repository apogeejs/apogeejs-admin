/** This is a worksheet, which is basically a function
 * that is expanded into data objects. */
visicomp.core.Worksheet = function(name) {
    //base init
    visicomp.core.Child.init.call(this,name,visicomp.core.Worksheet.generator);
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
visicomp.core.util.mixin(visicomp.core.Worksheet,visicomp.core.Child);
visicomp.core.util.mixin(visicomp.core.Worksheet,visicomp.core.DataHolder);
visicomp.core.util.mixin(visicomp.core.Worksheet,visicomp.core.Dependent);
visicomp.core.util.mixin(visicomp.core.Worksheet,visicomp.core.ContextHolder);
visicomp.core.util.mixin(visicomp.core.Worksheet,visicomp.core.Owner);

/** This gets the internal forlder for the worksheet. */
visicomp.core.Worksheet.prototype.getInternalFolder = function() {
    return this.internalFolder;
}

/** This gets the name of the return object for the worksheet function. */
visicomp.core.Worksheet.prototype.getReturnValueString = function() {
    return this.returnValueString;
}

/** This gets the arg list of the worksheet function. */
visicomp.core.Worksheet.prototype.getArgList = function() {
    return this.argList;
}

//------------------------------
// Child Methods
//------------------------------

/** This overrides the get displaymethod of child to return the function declaration. */
visicomp.core.Worksheet.prototype.getDisplayName = function() {
    var name = this.getName();
    var argList = this.getArgList();
    var argListString = argList.join(",");
    
    var displayName = name + "(" + argListString + ")";
    if((this.returnValueString != null)&&(this.returnValueString.length > 1)) {
        displayName += " = " + this.returnValueString;
    }
    
    return displayName;
}

/** This method is called when the child is deleted. If necessary the implementation
 * can extend this function, but it should call this base version of the function
 * if it does.  */
visicomp.core.Worksheet.prototype.onDelete = function() {
    
    var returnValue;
    
    if(this.internalFolder) {
        var actionResponse = visicomp.core.deletechild.deleteChild(this.internalFolder);
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
visicomp.core.Worksheet.fromJson = function(owner,json,updateDataList,actionResponse) {
    var worksheet = new visicomp.core.Worksheet(json.name);
    worksheet.setOwner(owner);
    if(json.argList !== undefined) {
        worksheet.setArgList(json.argList);
    }
    if(json.returnValue !== undefined) {
        worksheet.setReturnValueString(json.returnValue);
    }
    
    //recreate the root folder if info is specified
    if(json.internalFolder) {
        var internalFolder = visicomp.core.Folder.fromJson(worksheet,json.internalFolder,updateDataList,actionResponse);
        worksheet.setInternalFolder(internalFolder);
    }
    
    return worksheet;

}

/** This method adds any additional data to the json saved for this child. 
 * @protected */
visicomp.core.Worksheet.prototype.addToJson = function(json) {
    json.argList = this.argList;
    json.returnValue = this.returnValueString;
    json.internalFolder = this.internalFolder.toJson();
}

//-------------------------------
// Dependent Methods
//-------------------------------
    

/** If this is true the member must be executed. */
visicomp.core.Worksheet.prototype.needsCalculating = function() {
	return true;
}

/** This updates the member data based on the function. It returns
 * true for success and false if there is an error.  */
visicomp.core.Worksheet.prototype.calculate = function() {
    
    var worksheetErrors = [];
    
	//check for code errors, if so set a data error
    var worksheetFunction = this.getWorksheetFunction(worksheetErrors);
    
    if(worksheetErrors.length == 0) {
        this.clearErrors();
        this.setData(worksheetFunction);
    }
    else {
        //for now I can only set a single error. I will set the first.
        //I should get way to set multiple
        this.addErrors(worksheetErrors);
    }
}

/** This method updates the dependencies of any children
 * based on an object being added. */
visicomp.core.Worksheet.prototype.updateForAddedVariable = function(object,recalculateList) {
}

/** This method updates the dependencies of any children
 * based on an object being deleted. */
visicomp.core.Worksheet.prototype.updateForDeletedVariable = function(object,recalculateList) {
}

//------------------------------
//ContextHolder methods
//------------------------------

/** This method retrieve creates the loaded context manager. */
visicomp.core.Worksheet.prototype.createContextManager = function() {
    return new visicomp.core.ContextManager(this.getOwner());
}

//------------------------------
//Owner methods
//------------------------------

/** this method gets the hame the children inherit for the full name. */
visicomp.core.Worksheet.prototype.getPossesionNameBase = function() {
    return this.getFullName() + ":";
}


//==============================
// Private Methods
//==============================

/** This is called from the update action. It should not be called externally. 
 * @private */
visicomp.core.Worksheet.prototype.setInternalFolder = function(folder) {
    this.internalFolder = folder;
    this.updateDependencies([folder]);
}

/** This is called from the update action. It should not be called externally. */
visicomp.core.Worksheet.prototype.setReturnValueString = function(returnValueString) {
    this.returnValueString = returnValueString;
}

/** This is called from the update action. It should not be called externally. */
visicomp.core.Worksheet.prototype.setArgList = function(argList) {
    this.argList = argList;
}

/** This method creates the worksheet function. It is called from the update action 
 * and should not be called externally. 
 * @private */
visicomp.core.Worksheet.prototype.getWorksheetFunction = function(worksheetErrors) {

    //create a copy of the workspace to do the function calculation - we don't update the UI display version
    var virtualWorkspace = this.createVirtualWorkspace(worksheetErrors);
	
	if(!virtualWorkspace) {
		return null;
	}

    //lookup elements from virtual workspace
    var rootFolder = virtualWorkspace.getRootFolder();
    var inputElementArray = this.loadInputElements(rootFolder,worksheetErrors);
    var returnValueTable = this.loadOutputElement(rootFolder,worksheetErrors); 
    
    var worksheetFunction = function(args) {
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
            //error exectuing worksheet function - thro wan exception
            throw visicomp.core.util.createError("Error executing worksheet: " + actionResponse.getErrorMsg());
        }
    }
    
    return worksheetFunction;    
}

/** This method creates a copy of the workspace to be used for the function evvaluation. 
 * @private */
visicomp.core.Worksheet.prototype.createVirtualWorkspace = function(worksheetErrors) {
    try {
		return visicomp.core.Workspace.createVirtualWorkpaceFromFolder("temp",this.internalFolder,this.getContextManager());
	}
	catch(error) {
        var actionError = visicomp.core.ActionError.processMemberModelException(exception,"Worksheet - Code");
		worksheetErrors.push(actionError);
		return null;
	}
}

/** This method loads the input argument members from the virtual workspace. 
 * @private */
visicomp.core.Worksheet.prototype.loadInputElements = function(rootFolder,worksheetErrors) {
    var argMembers = [];
    for(var i = 0; i < this.argList.length; i++) {
        var argName = this.argList[i];
        var argMember = rootFolder.lookupChild(argName);
        if(!argMember) {
            //missing input element
            var msg = "Input element not found in worksheet: " + argName;
            var actionError = new visicomp.core.ActionError(msg,"Worksheet - Code",this);
            worksheetErrors.push(actionError);
        }
        argMembers.push(argMember);
    }
    return argMembers;
}

/** This method loads the output member from the virtual workspace. 
 * @private  */
visicomp.core.Worksheet.prototype.loadOutputElement = function(rootFolder,worksheetErrors) {
    var returnValueMember = rootFolder.lookupChild(this.returnValueString);
    if(!returnValueMember) {
        //missing input element
        var msg = "Return element not found in worksheet: " + this.returnValueString;
        var actionError = new visicomp.core.ActionError(msg,"Worksheet - Code",this);
        worksheetErrors.push(actionError);
    }
    return returnValueMember;
}

        
//============================
// Static methods
//============================

visicomp.core.Worksheet.generator = {};
visicomp.core.Worksheet.generator.displayName = "Worksheet";
visicomp.core.Worksheet.generator.type = "visicomp.core.Worksheet";
visicomp.core.Worksheet.generator.createMember = visicomp.core.Worksheet.fromJson;

//register this member
visicomp.core.Workspace.addMemberGenerator(visicomp.core.Worksheet.generator);