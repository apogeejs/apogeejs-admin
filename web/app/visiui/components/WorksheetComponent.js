/** This component represents a worksheet, which is a function that is programmed using
 *visicomp tables rather than writing code. */
visicomp.app.visiui.WorksheetComponent = function(workspaceUI,worksheet,componentJson) {
    //base init
    visicomp.app.visiui.Component.init.call(this,workspaceUI,worksheet,visicomp.app.visiui.WorksheetComponent.generator,componentJson);
    visicomp.visiui.ParentContainer.init.call(this,this.getContentElement(),this.getWindow());
    
    //register this object as a parent container
    var internalFolder = worksheet.getInternalFolder();
    workspaceUI.registerMember(internalFolder,null);
    workspaceUI.addComponentContainer(internalFolder,this);
    
    this.memberUpdated();
};

//add components to this class
visicomp.core.util.mixin(visicomp.app.visiui.WorksheetComponent,visicomp.app.visiui.Component);
visicomp.core.util.mixin(visicomp.app.visiui.WorksheetComponent,visicomp.visiui.ParentContainer);

//----------------------
// ParentContainer Methods
//----------------------

/** This method must be implemented in inheriting objects. */
visicomp.app.visiui.WorksheetComponent.prototype.getContentIsShowing = function() {
    return this.getWindow().getContentIsShowing();
}

//==============================
// Protected and Private Instance Methods
//==============================

/** This serializes the worksheet component. */
visicomp.app.visiui.WorksheetComponent.prototype.writeToJson = function(json) {
    var worksheet = this.getObject();
    var internalFolder = worksheet.getInternalFolder();
    var workspaceUI = this.getWorkspaceUI();
    json.children = workspaceUI.getFolderComponentContentJson(internalFolder);
}

/** This method populates the frame for this component. 
 * @protected */
visicomp.app.visiui.WorksheetComponent.prototype.populateFrame = function() {
    
    var menuItemInfoList = this.getMenuItemInfoList();
    
    var itemInfo1 = {};
    itemInfo1.title = "Edit&nbsp;Arg&nbsp;List";
    itemInfo1.callback = this.createEditArgListDialogCallback();
  
    var itemInfo2 = {};
    itemInfo2.title = "Edit&nbsp;Return&nbspValue";
    itemInfo2.callback = this.createEditReturnValueDialogCallback();
    
    //add these at the start of the menu
    menuItemInfoList.splice(0,0,itemInfo1,itemInfo2);
}

/** This method updates the component when the data changes. 
 * @private */    
visicomp.app.visiui.WorksheetComponent.prototype.memberUpdated = function() {
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
visicomp.app.visiui.WorksheetComponent.prototype.createEditArgListDialogCallback = function() {
    var worksheet = this.getObject();
    
    //create save handler
    var onSave = function(argList) {
        var actionResponse = visicomp.core.updateworksheet.updateArgList(worksheet,argList);
        
        if(!actionResponse.getSuccess()) {
            //show an error message
            var msg = actionResponse.getErrorMsg();
            alert(msg);
        }
        
        //return true to close the dialog
        return true; 
    };
    
    return function() {
        visicomp.app.visiui.dialog.showUpdateArgListDialog(worksheet,onSave);
    }
}

/** This method creates a callback for editing a standard codeable object
 *  @private */
visicomp.app.visiui.WorksheetComponent.prototype.createEditReturnValueDialogCallback = function() {
    var worksheet = this.getObject();
    
    //create save handler
    var onSave = function(returnValueString) {
        var actionResponse = visicomp.core.updateworksheet.updateReturnValue(worksheet,returnValueString);
        
        if(!actionResponse.getSuccess()) {
            //show an error message
            var msg = actionResponse.getErrorMsg();
            alert(msg);
        }
        
        //return true to close the dialog
        return true; 
    };
    
    return function() {
        visicomp.app.visiui.dialog.showUpdateWorksheetReturnDialog(worksheet,onSave);
    }
}

//======================================
// Static methods
//======================================

/** This method creates the component. */
visicomp.app.visiui.WorksheetComponent.createComponent = function(workspaceUI,parent,name) {
    
    var json = {};
    json.name = name;
    json.type = visicomp.core.Worksheet.generator.type;
    var actionResponse = visicomp.core.createmember.createMember(parent,json);
    
    var worksheet = actionResponse.member;
    if(actionResponse.getSuccess()) {
        var worksheetComponent = new visicomp.app.visiui.WorksheetComponent(workspaceUI,worksheet);
        actionResponse.component = worksheetComponent;
    }
    return actionResponse;
}

visicomp.app.visiui.WorksheetComponent.createComponentFromJson = function(workspaceUI,member,componentJson) {
    var worksheetComponent = new visicomp.app.visiui.WorksheetComponent(workspaceUI,member,componentJson);
    if((componentJson)&&(componentJson.children)) {
        var folder = member.getInternalFolder();
        workspaceUI.loadFolderComponentContentFromJson(folder,componentJson.children);
    }
    return worksheetComponent;
}

//======================================
// This is the component generator, to register the component
//======================================

visicomp.app.visiui.WorksheetComponent.generator = {};
visicomp.app.visiui.WorksheetComponent.generator.displayName = "Worksheet";
visicomp.app.visiui.WorksheetComponent.generator.uniqueName = "visicomp.app.visiui.WorksheetComponent";
visicomp.app.visiui.WorksheetComponent.generator.createComponent = visicomp.app.visiui.WorksheetComponent.createComponent;
visicomp.app.visiui.WorksheetComponent.generator.createComponentFromJson = visicomp.app.visiui.WorksheetComponent.createComponentFromJson;
visicomp.app.visiui.WorksheetComponent.generator.DEFAULT_WIDTH = 500;
visicomp.app.visiui.WorksheetComponent.generator.DEFAULT_HEIGHT = 500;
