/** This is a folderFunction, which is basically a function
 * that is expanded into data objects. */
apogee.FolderFunction = function(name,owner,initialData,createEmptyInternalFolder) {
    //base init
    apogee.Member.init.call(this,name,apogee.FolderFunction.generator);
    apogee.Dependent.init.call(this);
    apogee.ContextHolder.init.call(this);
    apogee.Owner.init.call(this);
    apogee.RootHolder.init.call(this);
    
    this.initOwner(owner);
    
    //set initial data
    this.argList = initialData.argList !== undefined ? initialData.argList : "";
    this.returnValueString = initialData.returnValue !== undefined ? initialData.returnValue : [];
    //set to an empty function
    this.setData(function(){});
    
    //recreate the root folder if info is specified
    if(createEmptyInternalFolder) {
        var internalFolder = new apogee.Folder(apogee.FolderFunction.INTERNAL_FOLDER_NAME,this);
        this.setRoot(internalFolder);
    }
}

//add components to this class
apogee.base.mixin(apogee.FolderFunction,apogee.Member);
apogee.base.mixin(apogee.FolderFunction,apogee.Dependent);
apogee.base.mixin(apogee.FolderFunction,apogee.ContextHolder);
apogee.base.mixin(apogee.FolderFunction,apogee.Owner);
apogee.base.mixin(apogee.FolderFunction,apogee.RootHolder);

apogee.FolderFunction.INTERNAL_FOLDER_NAME = "root";

/** This gets the internal forlder for the folderFunction. */
apogee.FolderFunction.prototype.getInternalFolder = function() {
    return this.internalFolder;
}

/** Implemnetation of get root for folder function. */
apogee.FolderFunction.prototype.getRoot = function() {
    return this.getInternalFolder();
}

/** This method sets the root object - implemented from RootHolder.  */
apogee.FolderFunction.prototype.setRoot = function(child) {
    this.internalFolder = child;
    var newDependsOn = [];
    if(child) newDependsOn.push(child);
    this.updateDependencies(newDependsOn);
}

/** This gets the name of the return object for the folderFunction function. */
apogee.FolderFunction.prototype.getReturnValueString = function() {
    return this.returnValueString;
}

/** This gets the arg list of the folderFunction function. */
apogee.FolderFunction.prototype.getArgList = function() {
    return this.argList;
}

//------------------------------
// Member Methods
//------------------------------

/** This overrides the get displaymethod of member to return the function declaration. */
apogee.FolderFunction.prototype.getDisplayName = function(useFullPath) {
    var name = useFullPath ? this.getFullName() : this.getName();
    var argList = this.getArgList();
    var argListString = argList.join(",");
    
    var displayName = name + "(" + argListString + ")";
    if((this.returnValueString != null)&&(this.returnValueString.length > 0)) {
        displayName += " = " + this.returnValueString;
    }
    
    return displayName;
}

/** This method removes any data from this workspace on closing. */
apogee.FolderFunction.prototype.close = function() {
    this.internalFolder.onClose();
}

/** This method is called when the member is deleted. If necessary the implementation
 * can extend this function, but it should call this base version of the function
 * if it does.  */
apogee.FolderFunction.prototype.onDelete = function() {
    
    var returnValue;
    
    if(this.internalFolder) {
        var json = {};
        json.action = "deleteMember";
        json.member = this.internalFolder;
        var actionResponse = apogee.action.doAction(json,false);
        if(!actionResponse.getSuccess()) {
            //show an error message
            var msg = actionResponse.getErrorMsg();
            alert(msg);
        }
    }
    
//I don't know what to do if this fails. Figure that out.
    
    //call the base delete
    returnValue = apogee.Member.onDelete.call(this);
	return returnValue;
}

/** This method creates a member from a json. It should be implemented as a static
 * method in a non-abstract class. */ 
apogee.FolderFunction.fromJson = function(owner,json,childrenJsonOutputList) {
    var initialData = {};
    initialData.argList = json.argList;
    initialData.returnValue = json.returnValue;
    
    var createEmptyInternalFolder;
    if(json.internalFolder) {
        //enforce name of internal folder
        //this is needed for importing a workspace as a folder function
        //this will fail quietly if we change the format, but it will still run
        json.internalFolder.name = apogee.FolderFunction.INTERNAL_FOLDER_NAME;
        
        childrenJsonOutputList.push(json.internalFolder);
        createEmptyInternalFolder = false;
    }
    else {
        createEmptyInternalFolder = true;
    }

    
    return new apogee.FolderFunction(json.name,owner,initialData,createEmptyInternalFolder);
}

/** This method adds any additional data to the json saved for this member. 
 * @protected */
apogee.FolderFunction.prototype.addToJson = function(json) {
    json.argList = this.argList;
    json.returnValue = this.returnValueString;
    json.internalFolder = this.internalFolder.toJson();
}

/** This method extends the base method to get the property values
 * for the property editting. */
apogee.FolderFunction.addPropValues = function(member,values) {
    var argList = member.getArgList();
    var argListString = argList.toString();
    values.argListString = argListString;
    values.returnValueString = member.getReturnValueString();
    return values;
}

/** This method executes a property update. */
apogee.FolderFunction.getPropertyUpdateAction = function(folderFunction,oldValues,newValues) {
    if((oldValues.argListString !== newValues.argListString)||(oldValues.returnValueString !== newValues.returnValueString)) {
        var newArgList = apogee.FunctionTable.parseStringArray(newValues.argListString);
        
        folderFunction.setArgList(newArgList);
        folderFunction.setReturnValueString(newValues.returnValueString);
        
        var actionData = {};
        actionData.action = "updateFolderFunction";
        actionData.member = folderFunction;
        actionData.argList = newArgList;
        actionData.returnValueString = newValues.returnValueString;
        return actionData;
    }    
    else {
        return null;
    }
}

//-------------------------------
// Dependent Methods
//-------------------------------
    

/** If this is true the member must be executed. */
apogee.FolderFunction.prototype.needsCalculating = function() {
	return true;
}

/** This updates the member data based on the function. It returns
 * true for success and false if there is an error.  */
apogee.FolderFunction.prototype.calculate = function() {  
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
apogee.FolderFunction.prototype.updateDependeciesForModelChange = function(recalculateList) {
    if(this.internalFolder) {
        this.internalFolder.updateDependeciesForModelChange(recalculateList);
    }
}

//------------------------------
//ContextHolder methods
//------------------------------

/** This method retrieve creates the loaded context manager. */
apogee.FolderFunction.prototype.createContextManager = function() {
    return new apogee.ContextManager(this);
}

//------------------------------
//Parent methods
//------------------------------

/** this method gets the table map. */
apogee.FolderFunction.prototype.getChildMap = function() {
    return this.internalFolder.childMap;
}

/** This method looks up a child from this folder.  */
apogee.FolderFunction.prototype.lookupChild = function(name) {
    //check look for object in this folder
    return this.internalFolder.childMap[name];
}

//------------------------------
//Owner methods
//------------------------------

/** this method gets the hame the children inherit for the full name. */
apogee.FolderFunction.prototype.getPossesionNameBase = function() {
    return this.getFullName() + ".";
}

/** This method looks up a member by its full name. */
apogee.FolderFunction.prototype.getMemberByPathArray = function(path,startElement) {
    if(startElement === undefined) startElement = 0;
    if(path[startElement] === apogee.FolderFunction.INTERNAL_FOLDER_NAME) return this.internalFolder;
    return this.internalFolder.lookupChildFromPathArray(path,startElement);
}


//==============================
// Private Methods
//==============================

/** This is called from the update action. It should not be called externally. */
apogee.FolderFunction.prototype.setReturnValueString = function(returnValueString) {
    this.returnValueString = returnValueString;
}

/** This is called from the update action. It should not be called externally. */
apogee.FolderFunction.prototype.setArgList = function(argList) {
    this.argList = argList;
}

/** This method creates the folderFunction function. It is called from the update action 
 * and should not be called externally. 
 * @private */
apogee.FolderFunction.prototype.getFolderFunctionFunction = function(folderFunctionErrors) {

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
            
            initialized = true;
        }
        
        //create an update array to set the table values to the elements  
        var updateActionList = [];
        for(var i = 0; i < inputElementArray.length; i++) {
            var entry = {};
            entry.action = "updateData";
            entry.member = inputElementArray[i];
            entry.data = arguments[i];
            updateActionList.push(entry);
        }
        
        var actionData = {};
        actionData.action = "compoundAction";
        actionData.actions = updateActionList;
        actionData.workspace = virtualWorkspace;

        //apply the update
        var actionResponse = apogee.action.doAction(actionData,false);        
        if(actionResponse.getSuccess()) {
            //retrieve the result
            if(returnValueTable) {
                
                if(returnValueTable.getResultPending()) {
                    throw new Error("A folder function must not be asynchronous: " + instance.getFullName());
                }
                
                return returnValueTable.getData();
            }
            else {
                //no return value found
                return undefined;
            }
        }
        else {
            //error exectuing folderFunction function - thro wan exception
            throw apogee.base.createError(actionResponse.getErrorMsg());
        }
    }
    
    return folderFunctionFunction;    
}

/** This method creates a copy of the workspace to be used for the function evvaluation. 
 * @private */
apogee.FolderFunction.prototype.createVirtualWorkspace = function(folderFunctionErrors) {
    try {
		return apogee.Workspace.createVirtualWorkpaceFromFolder(this.getName(),this.internalFolder,this.getOwner());
	}
	catch(error) {
        var actionError = apogee.ActionError.processException(exception,"FolderFunction - Code",false);
		folderFunctionErrors.push(actionError);
		return null;
	}
}

/** This method loads the input argument members from the virtual workspace. 
 * @private */
apogee.FolderFunction.prototype.loadInputElements = function(rootFolder,folderFunctionErrors) {
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
//            var actionError = new apogee.ActionError(msg,"FolderFunction - Code",this);
//            folderFunctionErrors.push(actionError);
//        }       
    }
    return argMembers;
}

/** This method loads the output member from the virtual workspace. 
 * @private  */
apogee.FolderFunction.prototype.loadOutputElement = function(rootFolder,folderFunctionErrors) {
    var returnValueMember = rootFolder.lookupChild(this.returnValueString);
//    if(!returnValueMember) {
//        //missing input element
//        var msg = "Return element not found in folderFunction: " + this.returnValueString;
//        var actionError = new apogee.ActionError(msg,"FolderFunction - Code",this);
//        folderFunctionErrors.push(actionError);
//    }
    return returnValueMember;
}

        
//============================
// Static methods
//============================

apogee.FolderFunction.generator = {};
apogee.FolderFunction.generator.displayName = "Folder Function";
apogee.FolderFunction.generator.type = "apogee.FolderFunction";
apogee.FolderFunction.generator.createMember = apogee.FolderFunction.fromJson;
apogee.FolderFunction.generator.addPropFunction = apogee.FolderFunction.addPropValues;
apogee.FolderFunction.generator.getPropertyUpdateAction = apogee.FolderFunction.getPropertyUpdateAction;
apogee.FolderFunction.generator.setDataOk = false;
apogee.FolderFunction.generator.setCodeOk = false;

//register this member
apogee.Workspace.addMemberGenerator(apogee.FolderFunction.generator);


