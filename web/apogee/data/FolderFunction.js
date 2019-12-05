import base from "/apogeeutil/base.js";
import {doAction} from "/apogee/actions/action.js";
import Workspace from "/apogee/data/Workspace.js";
import ActionError from "/apogee/lib/ActionError.js";
import ContextManager from "/apogee/lib/ContextManager.js";
import Member from "/apogee/datacomponents/Member.js";
import Dependent from "/apogee/datacomponents/Dependent.js";
import ContextHolder from "/apogee/datacomponents/ContextHolder.js";
import Owner from "/apogee/datacomponents/Owner.js";
import RootHolder from "/apogee/datacomponents/RootHolder.js";
import CommandManager from "/apogeeapp/app/commands/CommandManager.js";

/** This is a folderFunction, which is basically a function
 * that is expanded into data objects. */
function FolderFunction(name,owner,initialData) {
    //base init
    Member.init.call(this,name,FolderFunction.generator);
    Dependent.init.call(this);
    ContextHolder.init.call(this);
    Owner.init.call(this);
    RootHolder.init.call(this);
    
    this.initOwner(owner);
    
    //set initial data
    this.argList = initialData.argList !== undefined ? initialData.argList : [];
    this.returnValueString = initialData.returnValue !== undefined ? initialData.returnValue : [];
    //set to an empty function
    this.setData(function(){});
    this.fieldUpdated("argList");
    this.fieldUpdated("returnValue");
}

//add components to this class
base.mixin(FolderFunction,Member);
base.mixin(FolderFunction,Dependent);
base.mixin(FolderFunction,ContextHolder);
base.mixin(FolderFunction,Owner);
base.mixin(FolderFunction,RootHolder);

FolderFunction.INTERNAL_FOLDER_NAME = "root";

/** This gets the internal forlder for the folderFunction. */
FolderFunction.prototype.getInternalFolder = function() {
    return this.internalFolder;
}

/** Implemnetation of get root for folder function. */
FolderFunction.prototype.getRoot = function() {
    return this.getInternalFolder();
}

/** This method sets the root object - implemented from RootHolder.  */
FolderFunction.prototype.setRoot = function(child) {
    this.internalFolder = child;
    var newDependsOn = [];
    if(child) newDependsOn.push(child);
    this.updateDependencies(newDependsOn);
}

/** This gets the name of the return object for the folderFunction function. */
FolderFunction.prototype.getReturnValueString = function() {
    return this.returnValueString;
}

/** This gets the arg list of the folderFunction function. */
FolderFunction.prototype.getArgList = function() {
    return this.argList;
}

//------------------------------
// Member Methods
//------------------------------

/** This method removes any data from this workspace on closing. */
FolderFunction.prototype.close = function() {
    this.internalFolder.onClose();
}

/** This method creates a member from a json. It should be implemented as a static
 * method in a non-abstract class. */ 
FolderFunction.fromJson = function(owner,json) {
    return new FolderFunction(json.name,owner,json.updateData);
}

/** This method adds any additional data to the json saved for this member. 
 * @protected */
FolderFunction.prototype.addToJson = function(json) {
    json.updateData = {};
    json.updateData.argList = this.argList;
    json.updateData.returnValue = this.returnValueString;
    json.children = {};
    json.children[FolderFunction.INTERNAL_FOLDER_NAME] = this.internalFolder.toJson();
}

/** This method extends the base method to get the property values
 * for the property editting. */
FolderFunction.readProperties = function(member,values) {
    var argList = member.getArgList();
    var argListString = argList.toString();
    values.argListString = argListString;
    values.returnValueString = member.getReturnValueString();
    return values;
}

/** This method executes a property update. */
FolderFunction.getPropertyUpdateAction = function(folderFunction,newValues) {
    let updateData = newValues.updateData;
    if((updateData)&&((updateData.argList !== undefined)||(updateData.returnValue !== undefined))) {

        var argList = updateData.argList ? updateData.argList : folderFunction.argList;
        var returnValueString = updateData.returnValue ? updateData.returnValue : folderFunction.returnValueString;
 
        var actionData = {};
        actionData.action = "updateFolderFunction";
        actionData.memberName = folderFunction.getFullName();
        actionData.argList = argList;
        actionData.returnValueString = returnValueString;
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
FolderFunction.prototype.needsCalculating = function() {
	return true;
}

/** This updates the member data based on the function. It returns
 * true for success and false if there is an error.  */
FolderFunction.prototype.calculate = function() {  
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
FolderFunction.prototype.updateDependeciesForModelChange = function(recalculateList) {
    if(this.internalFolder) {
        this.internalFolder.updateDependeciesForModelChange(recalculateList);
    }
}

//------------------------------
//ContextHolder methods
//------------------------------

/** This method retrieve creates the loaded context manager. */
FolderFunction.prototype.createContextManager = function() {
    return new ContextManager(this);
}

//------------------------------
//Parent methods
//------------------------------

/** this method gets the table map. */
FolderFunction.prototype.getChildMap = function() {
    return this.internalFolder.childMap;
}

/** This method looks up a child from this folder.  */
FolderFunction.prototype.lookupChild = function(name) {
    //check look for object in this folder
    return this.internalFolder.childMap[name];
}

//------------------------------
//Owner methods
//------------------------------

/** this method gets the hame the children inherit for the full name. */
FolderFunction.prototype.getPossesionNameBase = function() {
    return this.getFullName() + ".";
}

/** This method looks up a member by its full name. */
FolderFunction.prototype.getMemberByPathArray = function(path,startElement) {
    if(startElement === undefined) startElement = 0;
    if(path[startElement] === this.internalFolder.getName()) {
        if(startElement === path.length-1) {
            return this.internalFolder;
        }
        else {
            startElement++;
            return this.internalFolder.lookupChildFromPathArray(path,startElement);
        }
    }
    else {
        return null;
    }
}


//==============================
// Private Methods
//==============================

/** This is called from the update action. It should not be called externally. */
FolderFunction.prototype.setReturnValueString = function(returnValueString) {
    if(this.returnValueString != returnValueString) {
        this.fieldUpdated("returnValue");
    }
    this.returnValueString = returnValueString;
}

/** This is called from the update action. It should not be called externally. */
FolderFunction.prototype.setArgList = function(argList) {
    if(this.argList != argList) {
        this.fieldUpdated("argList");
    }
    this.argList = argList;
}

/** This method creates the folderFunction function. It is called from the update action 
 * and should not be called externally. 
 * @private */
FolderFunction.prototype.getFolderFunctionFunction = function(folderFunctionErrors) {

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
            entry.memberName = inputElementArray[i].getFullName();
            entry.data = arguments[i];
            updateActionList.push(entry);
        }
        
        var actionData = {};
        actionData.action = "compoundAction";
        actionData.actions = updateActionList;

        //apply the update
        var actionResult = doAction(virtualWorkspace,actionData);        
        if(actionResult.alertMsg) {
            CommandManager.errorAlert(actionResult.alertMsg);
        }
        if(actionResult.actionDone) {
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
    }
    
    return folderFunctionFunction;    
}

/** This method creates a copy of the workspace to be used for the function evvaluation. 
 * @private */
FolderFunction.prototype.createVirtualWorkspace = function(folderFunctionErrors) {
    try {
        var folderJson = this.internalFolder.toJson();
		var workspaceJson = Workspace.createWorkpaceJsonFromFolderJson(this.getName(),folderJson);
        var virtualWorkspace = new Workspace(this.getOwner());
        var actionResult = virtualWorkspace.loadFromJson(workspaceJson);
        
        //do something with action result!!!
        
        return virtualWorkspace;
	}
	catch(error) {
        var actionError = ActionError.processException(error,"FolderFunction - Code",false);
		folderFunctionErrors.push(actionError);
		return null;
	}
}

/** This method loads the input argument members from the virtual workspace. 
 * @private */
FolderFunction.prototype.loadInputElements = function(rootFolder,folderFunctionErrors) {
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
//            var actionError = new ActionError(msg,"FolderFunction - Code",this);
//            folderFunctionErrors.push(actionError);
//        }       
    }
    return argMembers;
}

/** This method loads the output member from the virtual workspace. 
 * @private  */
FolderFunction.prototype.loadOutputElement = function(rootFolder,folderFunctionErrors) {
    var returnValueMember = rootFolder.lookupChild(this.returnValueString);
//    if(!returnValueMember) {
//        //missing input element
//        var msg = "Return element not found in folderFunction: " + this.returnValueString;
//        var actionError = new ActionError(msg,"FolderFunction - Code",this);
//        folderFunctionErrors.push(actionError);
//    }
    return returnValueMember;
}

        
//============================
// Static methods
//============================

FolderFunction.generator = {};
FolderFunction.generator.displayName = "Folder Function";
FolderFunction.generator.type = "apogee.FolderFunction";
FolderFunction.generator.createMember = FolderFunction.fromJson;
FolderFunction.generator.readProperties = FolderFunction.readProperties;
FolderFunction.generator.getPropertyUpdateAction = FolderFunction.getPropertyUpdateAction;
FolderFunction.generator.setDataOk = false;
FolderFunction.generator.setCodeOk = false;

//register this member
Workspace.addMemberGenerator(FolderFunction.generator);


