/** This component represents a folderFunction, which is a function that is programmed using
 *visicomp tables rather than writing code. */
visicomp.app.visiui.FolderFunctionComponent = function(workspaceUI,folderFunction,componentJson) {
    //base init
    visicomp.app.visiui.Component.init.call(this,workspaceUI,folderFunction,visicomp.app.visiui.FolderFunctionComponent.generator,componentJson);
    visicomp.visiui.ParentContainer.init.call(this,this.getContentElement(),this.getWindow());
    
    //register this object as a parent container
    var internalFolder = folderFunction.getInternalFolder();
    workspaceUI.registerMember(internalFolder,null);
    workspaceUI.addComponentContainer(internalFolder,this);
    
    this.memberUpdated();
};

//add components to this class
visicomp.core.util.mixin(visicomp.app.visiui.FolderFunctionComponent,visicomp.app.visiui.Component);
visicomp.core.util.mixin(visicomp.app.visiui.FolderFunctionComponent,visicomp.visiui.ParentContainer);

//----------------------
// ParentContainer Methods
//----------------------

/** This method must be implemented in inheriting objects. */
visicomp.app.visiui.FolderFunctionComponent.prototype.getContentIsShowing = function() {
    return this.getWindow().getContentIsShowing();
}

//==============================
// Protected and Private Instance Methods
//==============================

/** This serializes the folderFunction component. */
visicomp.app.visiui.FolderFunctionComponent.prototype.writeToJson = function(json) {
    var folderFunction = this.getObject();
    var internalFolder = folderFunction.getInternalFolder();
    var workspaceUI = this.getWorkspaceUI();
    json.children = workspaceUI.getFolderComponentContentJson(internalFolder);
}

/** This method populates the frame for this component. 
 * @protected */
visicomp.app.visiui.FolderFunctionComponent.prototype.populateFrame = function() {
    
    var menuItemInfoList = this.getMenuItemInfoList();
    
    var itemInfo1 = {};
    itemInfo1.title = "Edit Arg List";
    itemInfo1.callback = this.createEditArgListDialogCallback();
  
    var itemInfo2 = {};
    itemInfo2.title = "Edit Return Value";
    itemInfo2.callback = this.createEditReturnValueDialogCallback();
    
    //add these at the start of the menu
    menuItemInfoList.splice(0,0,itemInfo1,itemInfo2);
}

/** This method updates the component when the data changes. 
 * @private */    
visicomp.app.visiui.FolderFunctionComponent.prototype.memberUpdated = function() {
    //make sure the title is up to data
    var window = this.getWindow();
    if(window) {
        var functionObject = this.getObject();
        var displayName = functionObject.getDisplayName();
        var windowTitle = window.getTitle();
        if(windowTitle != displayName) {
            window.setTitle(displayName);
        }
    }
}

//=============================
// Action UI Entry Points
//=============================

/** This method creates a callback for editing a standard codeable object
 *  @private */
visicomp.app.visiui.FolderFunctionComponent.prototype.createEditArgListDialogCallback = function() {
    var folderFunction = this.getObject();
    
    //create save handler
    var onSave = function(argList) {
        var actionResponse = visicomp.core.updatefolderFunction.updateArgList(folderFunction,argList);
        
        if(!actionResponse.getSuccess()) {
            //show an error message
            var msg = actionResponse.getErrorMsg();
            alert(msg);
        }
        
        //return true to close the dialog
        return true; 
    };
    
    return function() {
        visicomp.app.visiui.dialog.showUpdateArgListDialog(folderFunction,onSave);
    }
}

/** This method creates a callback for editing a standard codeable object
 *  @private */
visicomp.app.visiui.FolderFunctionComponent.prototype.createEditReturnValueDialogCallback = function() {
    var folderFunction = this.getObject();
    
    //create save handler
    var onSave = function(returnValueString) {
        var actionResponse = visicomp.core.updatefolderFunction.updateReturnValue(folderFunction,returnValueString);
        
        if(!actionResponse.getSuccess()) {
            //show an error message
            var msg = actionResponse.getErrorMsg();
            alert(msg);
        }
        
        //return true to close the dialog
        return true; 
    };
    
    return function() {
        visicomp.app.visiui.dialog.showUpdateFolderFunctionReturnDialog(folderFunction,onSave);
    }
}

//======================================
// Static methods
//======================================

/** This method creates the component. */
visicomp.app.visiui.FolderFunctionComponent.createComponent = function(workspaceUI,parent,name) {
    
    var json = {};
    json.name = name;
    json.type = visicomp.core.FolderFunction.generator.type;
    var actionResponse = visicomp.core.createmember.createMember(parent,json);
    
    var folderFunction = actionResponse.member;
    if(actionResponse.getSuccess()) {
        var folderFunctionComponent = new visicomp.app.visiui.FolderFunctionComponent(workspaceUI,folderFunction);
        actionResponse.component = folderFunctionComponent;
    }
    return actionResponse;
}

visicomp.app.visiui.FolderFunctionComponent.createComponentFromJson = function(workspaceUI,member,componentJson) {
    var folderFunctionComponent = new visicomp.app.visiui.FolderFunctionComponent(workspaceUI,member,componentJson);
    if((componentJson)&&(componentJson.children)) {
        var folder = member.getInternalFolder();
        workspaceUI.loadFolderComponentContentFromJson(folder,componentJson.children);
    }
    return folderFunctionComponent;
}

//======================================
// This is the component generator, to register the component
//======================================

visicomp.app.visiui.FolderFunctionComponent.generator = {};
visicomp.app.visiui.FolderFunctionComponent.generator.displayName = "Folder Function";
visicomp.app.visiui.FolderFunctionComponent.generator.uniqueName = "visicomp.app.visiui.FolderFunctionComponent";
visicomp.app.visiui.FolderFunctionComponent.generator.createComponent = visicomp.app.visiui.FolderFunctionComponent.createComponent;
visicomp.app.visiui.FolderFunctionComponent.generator.createComponentFromJson = visicomp.app.visiui.FolderFunctionComponent.createComponentFromJson;
visicomp.app.visiui.FolderFunctionComponent.generator.DEFAULT_WIDTH = 500;
visicomp.app.visiui.FolderFunctionComponent.generator.DEFAULT_HEIGHT = 500;
