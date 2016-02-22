/** This is a worksheet, which is basically a function
 * that is expanded into data objects. */
visicomp.core.Worksheet = function(owner,name) {
    //base init
    visicomp.core.Impactor.init.call(this);
    visicomp.core.Child.init.call(this,owner,name,visicomp.core.Worksheet.generator);
    visicomp.core.DataHolder.init.call(this);
    visicomp.core.Owner.init.call(this);
    
    //create the internal folder as a root folder (no parent). But give it
    //the full path name
    this.internalFolder = new visicomp.core.Folder(this,this.getFullName());
    
    this.returnValueString = "";
    this.argList = [];
    
    //this is the internal workspace in which function evaluations are done.
    this.virtualWorkspace = null;
    
//-----------------------------------------------
//we need to do this a better way!
    //set initial worksheet function
    var worksheetFunction = this.getWorksheetFunction();
    this.setData(worksheetFunction);
//---------------------------------------------------
    
    //subscribe to the update event for this table
    //whenever the output object is updated we will update the worksheet function
    var instance = this;
    var memberUpdatedCallback = function(member) {
        if(instance.isBaseReturnObject(member)) {
            //we recalculate this unnecessarily sometimes - as in when the input argument value
            //in the workshet changes. That's ok though.
            var actionResponse = visicomp.core.updateworksheet.recalculateFunction(instance);
//----------------------------------------------
//we need a proper way to show this!
if(!actionResponse.success) {
    alert(actionResponse.msg);
}
//---------------------------------------
        }    
    }
    this.getWorkspace().addListener(visicomp.core.updatemember.MEMBER_UPDATED_EVENT, memberUpdatedCallback);
}

//add components to this class
visicomp.core.util.mixin(visicomp.core.Worksheet,visicomp.core.Child);
visicomp.core.util.mixin(visicomp.core.Worksheet,visicomp.core.DataHolder);
visicomp.core.util.mixin(visicomp.core.Worksheet,visicomp.core.Impactor);
visicomp.core.util.mixin(visicomp.core.Worksheet,visicomp.core.Owner);

/** */
visicomp.core.Worksheet.prototype.getInternalFolder = function() {
    return this.internalFolder;
}

/** */
visicomp.core.Worksheet.prototype.getReturnValueString = function() {
    return this.returnValueString;
}

/** */
visicomp.core.Worksheet.prototype.getArgList = function() {
    return this.argList;
}

//------------------------------
// Child Methods
//------------------------------

/** This overrides the get title method of child to return the function declaration. */
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
    var worksheet = new visicomp.core.Worksheet(owner,json.name);
    if(json.argList !== undefined) {
        worksheet.setArgList(json.argList);
    }
    if(json.returnValue !== undefined) {
        worksheet.setReturnValueString(json.returnValue);
    }
    
    //recreate the root folder if info is specified
    if(json.internalFolder) {
        worksheet.internalFolder = visicomp.core.Folder.fromJson(worksheet,json.internalFolder,updateDataList,actionResponse);
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

//------------------------------
// Owner Methods
//------------------------------

/** this method s implemented for the Owner component/mixin. */
visicomp.core.Worksheet.prototype.getBaseName = function() {
    return this.getFullName();
}
    
//==============================
// Private Methods
//==============================

/** This is called from the update action. It should not be called externally. */
visicomp.core.Worksheet.prototype.setReturnValueString = function(returnValueString) {
    this.returnValueString = returnValueString;
}

/** This is called from the update action. It should not be called externally. */
visicomp.core.Worksheet.prototype.setArgList = function(argList) {
    this.argList = argList;
}

/** This method creates the worksheet function. It is called from the update action 
 * and should not be called externally.  */
visicomp.core.Worksheet.prototype.getWorksheetFunction = function() {
    var instance = this;
    
    var worksheetFunction = function(args) {
        
//this is really inefficient. it needs to be improved.
        
        //if the virtual workspace does not exist, create it
        var virtualWorkspace = instance.createVirtualWorkspace();
        
        //lookup elements from virtual workspace
        var rootFolder = virtualWorkspace.getRootFolder();
        
        //get the input elements
        var inputElementArray = instance.loadInputElements(rootFolder);
        
        //create update array
        var updateDataList = [];
        for(var i = 0; i < inputElementArray.length; i++) {
            var entry = {};
            entry.member = inputElementArray[i];
            entry.data = arguments[i];
            updateDataList.push(entry);
        }
        
        //do the update
        var actionResponse = visicomp.core.updatemember.updateObjects(updateDataList);        
        if(actionResponse.getSuccess()) {
            //retrieve the result
            return instance.loadOutputElement(rootFolder);
        }
        else {
///////////////////////////////////
//set an error for the worksheet
///////////////////////////////////
            return null;
        }
    }
    
    return worksheetFunction;    
}

/** This method creates a copy of the workspace to be used for the function evvaluation.  */
visicomp.core.Worksheet.prototype.createVirtualWorkspace = function() {
    var json = this.internalFolder.toJson();
    var virtualWorkspace = new visicomp.core.Workspace("temp");
    var updateDataList = [];
    var virtualRootFolder = visicomp.core.Folder.fromJson(virtualWorkspace,json,updateDataList);
    virtualWorkspace.rootFolder = virtualRootFolder;
    var actionResponse = visicomp.core.updatemember.updateObjects(updateDataList);
    if(!actionResponse.getSuccess()) {
        //show an error message
        var msg = actionResponse.getErrorMsg();
        alert(msg);
    }

    return virtualWorkspace;
}

/** This method loads the input argument members from the virtual workspace.  */
visicomp.core.Worksheet.prototype.loadInputElements = function(rootFolder) {
    var argMembers = [];
    for(var i = 0; i < this.argList.length; i++) {
        var argName = this.argList[i];
        var argMember = rootFolder.lookupChild(argName);
        if(!argMember) {
///////////////////////////////////
//set an error for the worksheet
///////////////////////////////////
            var actionError = visicomp.core.ActionError("Input element not found in worksheet: " + argName,this);
            this.worksheetError = actionError;
        }
        argMembers.push(argMember);
    }
    return argMembers;
}

/** This method gets the output member from the virtual workspace.  */
visicomp.core.Worksheet.prototype.loadOutputElement = function(rootFolder) {
    if((this.returnValueString != null)&&(this.returnValueString.length > 0)) {
        var member = rootFolder.lookupChild(this.returnValueString);
        if(member != null) {
            return member.getData();
        }
        else {
///////////////////////////////////
//set an error for the worksheet
///////////////////////////////////
            return undefined;
        }
    }
    else {
        return undefined;
    }
}

/** This method gets the output member from the virtual workspace.  */
visicomp.core.Worksheet.prototype.isBaseReturnObject = function(member) {
    return ((member.getRootFolder() == this.internalFolder)&&
            (member.getName() == this.returnValueString));
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