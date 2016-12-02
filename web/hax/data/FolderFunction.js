/** This is a folderFunction, which is basically a function
 * that is expanded into data objects. */
hax.FolderFunction = function(name,owner,initialData,createEmptyInternalFolder) {
    //base init
    hax.Child.init.call(this,name,hax.FolderFunction.generator);
    hax.DataHolder.init.call(this);
    hax.Dependent.init.call(this);
    hax.ContextHolder.init.call(this);
    hax.Owner.init.call(this);
    hax.RootHolder.init.call(this);
    
    this.initOwner(owner);
    
    //set initial data
    this.argList = initialData.argList !== undefined ? initialData.argList : "";
    this.returnValueString = initialData.returnValue !== undefined ? initialData.returnValue : [];
    //set to an empty function
    this.setData(function(){});
    
    //recreate the root folder if info is specified
    if(createEmptyInternalFolder) {
        var internalFolder = new hax.Folder(name,this);
        this.setRoot(internalFolder);
    }
}

//add components to this class
hax.base.mixin(hax.FolderFunction,hax.Child);
hax.base.mixin(hax.FolderFunction,hax.DataHolder);
hax.base.mixin(hax.FolderFunction,hax.Dependent);
hax.base.mixin(hax.FolderFunction,hax.ContextHolder);
hax.base.mixin(hax.FolderFunction,hax.Owner);
hax.base.mixin(hax.FolderFunction,hax.RootHolder);

/** This gets the internal forlder for the folderFunction. */
hax.FolderFunction.prototype.getInternalFolder = function() {
    return this.internalFolder;
}

/** Implemnetation of get root for folder function. */
hax.FolderFunction.prototype.getRoot = function() {
    return this.getInternalFolder();
}

/** This method sets the root object - implemented from RootHolder.  */
hax.FolderFunction.prototype.setRoot = function(child) {
    this.internalFolder = child;
    var newDependsOn = [];
    if(child) newDependsOn.push(child);
    this.updateDependencies(newDependsOn);
}

/** This gets the name of the return object for the folderFunction function. */
hax.FolderFunction.prototype.getReturnValueString = function() {
    return this.returnValueString;
}

/** This gets the arg list of the folderFunction function. */
hax.FolderFunction.prototype.getArgList = function() {
    return this.argList;
}

//------------------------------
// Child Methods
//------------------------------

/** This overrides the get displaymethod of child to return the function declaration. */
hax.FolderFunction.prototype.getDisplayName = function() {
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
hax.FolderFunction.prototype.onDelete = function() {
    
    var returnValue;
    
    if(this.internalFolder) {
        var actionResponse = hax.deletemember.deleteMember(this.internalFolder);
        if(!actionResponse.getSuccess()) {
            //show an error message
            var msg = actionResponse.getErrorMsg();
            alert(msg);
        }
    }
    
//I don't know what to do if this fails. Figure that out.
    
    //call the base delete
    returnValue = hax.Child.onDelete.call(this);
	return returnValue;
}

/** This method creates a child from a json. It should be implemented as a static
 * method in a non-abstract class. */ 
hax.FolderFunction.fromJson = function(owner,json,childrenJsonOutputList) {
    var initialData = {};
    initialData.argList = json.argList;
    initialData.returnValue = json.returnValue;
    
    var createEmptyInternalFolder;
    if(json.internalFolder) {
        childrenJsonOutputList.push(json.internalFolder);
        createEmptyInternalFolder = false;
    }
    else {
        createEmptyInternalFolder = true;
    }

    
    return new hax.FolderFunction(json.name,owner,initialData,createEmptyInternalFolder);
}

/** This method adds any additional data to the json saved for this child. 
 * @protected */
hax.FolderFunction.prototype.addToJson = function(json) {
    json.argList = this.argList;
    json.returnValue = this.returnValueString;
    json.internalFolder = this.internalFolder.toJson();
}

//-------------------------------
// Dependent Methods
//-------------------------------
    

/** If this is true the member must be executed. */
hax.FolderFunction.prototype.needsCalculating = function() {
	return true;
}

/** This updates the member data based on the function. It returns
 * true for success and false if there is an error.  */
hax.FolderFunction.prototype.calculate = function() {  
    //make sure the data is set in each impactor
    this.initializeImpactors();
    
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
    
    this.clearCalcPending();
}

/** This method updates the dependencies of any children
 * based on an object being added. */
hax.FolderFunction.prototype.updateDependeciesForModelChange = function(recalculateList) {
    if(this.internalFolder) {
        this.internalFolder.updateDependeciesForModelChange(recalculateList);
    }
}

//------------------------------
//ContextHolder methods
//------------------------------

/** This method retrieve creates the loaded context manager. */
hax.FolderFunction.prototype.createContextManager = function() {
    return new hax.ContextManager(this);
}

//------------------------------
//Owner methods
//------------------------------

/** this method gets the hame the children inherit for the full name. */
hax.FolderFunction.prototype.getPossesionNameBase = function() {
    return this.getFullName() + ":";
}


//==============================
// Private Methods
//==============================

/** This is called from the update action. It should not be called externally. */
hax.FolderFunction.prototype.setReturnValueString = function(returnValueString) {
    this.returnValueString = returnValueString;
}

/** This is called from the update action. It should not be called externally. */
hax.FolderFunction.prototype.setArgList = function(argList) {
    this.argList = argList;
}

/** This method creates the folderFunction function. It is called from the update action 
 * and should not be called externally. 
 * @private */
hax.FolderFunction.prototype.getFolderFunctionFunction = function(folderFunctionErrors) {

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
            rootFolder = virtualWorkspace.getRoot();
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
        var actionResponse = hax.updatemember.updateObjects(updateDataList);        
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
            throw hax.base.createError(actionResponse.getErrorMsg());
        }
    }
    
    return folderFunctionFunction;    
}

/** This method creates a copy of the workspace to be used for the function evvaluation. 
 * @private */
hax.FolderFunction.prototype.createVirtualWorkspace = function(folderFunctionErrors) {
    try {
		return hax.Workspace.createVirtualWorkpaceFromFolder("temp",this.internalFolder,this.getOwner());
	}
	catch(error) {
        var actionError = hax.ActionError.processException(exception,"FolderFunction - Code",false);
		folderFunctionErrors.push(actionError);
		return null;
	}
}

/** This method loads the input argument members from the virtual workspace. 
 * @private */
hax.FolderFunction.prototype.loadInputElements = function(rootFolder,folderFunctionErrors) {
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
//            var actionError = new hax.ActionError(msg,"FolderFunction - Code",this);
//            folderFunctionErrors.push(actionError);
//        }       
    }
    return argMembers;
}

/** This method loads the output member from the virtual workspace. 
 * @private  */
hax.FolderFunction.prototype.loadOutputElement = function(rootFolder,folderFunctionErrors) {
    var returnValueMember = rootFolder.lookupChild(this.returnValueString);
//    if(!returnValueMember) {
//        //missing input element
//        var msg = "Return element not found in folderFunction: " + this.returnValueString;
//        var actionError = new hax.ActionError(msg,"FolderFunction - Code",this);
//        folderFunctionErrors.push(actionError);
//    }
    return returnValueMember;
}

        
//============================
// Static methods
//============================

hax.FolderFunction.generator = {};
hax.FolderFunction.generator.displayName = "Folder Function";
hax.FolderFunction.generator.type = "hax.FolderFunction";
hax.FolderFunction.generator.createMember = hax.FolderFunction.fromJson;

//register this member
hax.Workspace.addMemberGenerator(hax.FolderFunction.generator);