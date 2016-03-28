
/** This component represents a json table object. */
visicomp.app.visiui.GridTableComponent = function(workspaceUI,table,componentJson) {
    //base init
    visicomp.app.visiui.Component.init.call(this,workspaceUI,table,visicomp.app.visiui.GridTableComponent.generator,componentJson);
    
    this.memberUpdated();
};

//add components to this class
visicomp.core.util.mixin(visicomp.app.visiui.GridTableComponent,visicomp.app.visiui.Component);

//==============================
// Protected and Private Instance Methods
//==============================

/** This method populates the frame for this component. 
 * @protected */
visicomp.app.visiui.GridTableComponent.prototype.populateFrame = function() {
    
    var window = this.getWindow();
    
    //remove scrollbars from window content div
    window.setContentDivOverflowPolicy("hidden");
    
    //create the menu
    var menuItemInfoList = this.getMenuItemInfoList();
  
    var itemInfo1 = {};
    itemInfo1.title = "Edit&nbsp;Data";
    itemInfo1.callback = this.createEditDataDialog();
    
    var itemInfo2 = {};
    itemInfo2.title = "Edit&nbsp;Formula";
    itemInfo2.callback = this.createEditCodeableDialogCallback(itemInfo2.title,visicomp.app.visiui.GridTableComponent.editorCodeWrapper);
    
    //add these at the start of the menu
    menuItemInfoList.splice(0,0,itemInfo1,itemInfo2);
    
    //editor - only for display, read only
    var contentDiv = this.getContentElement();
    
	this.gridDiv = visicomp.visiui.createElement("div",null,{
//		"position":"absolute",
        "width":contentDiv.clientWidth + "px",
        "height":contentDiv.clientHeight + "px",
		"overflow":"hidden",
        "zIndex":0
	});
	contentDiv.appendChild(this.gridDiv);
    
    //resize the editor on window size change
    var instance = this;
    var resizeEndedCallback = function() {
        instance.gridDiv.style.width = contentDiv.clientWidth + "px";
        instance.gridDiv.style.height = contentDiv.clientHeight + "px";
        if(instance.gridControl) {
            instance.gridControl.render();
        }
    }
    window.addListener(visicomp.visiui.WindowFrame.RESIZE_ENDED, resizeEndedCallback);
}

/** This method should include an needed functionality to clean up after a delete. */
visicomp.app.visiui.GridTableComponent.prototype.onDelete = function() {
    if(this.gridControl) {
        this.gridControl.destroy();
        this.gridControl = null;
    }
}

/** This method updates the table data 
 * @private */    
visicomp.app.visiui.GridTableComponent.prototype.memberUpdated = function() {
    var object = this.getObject();
    if(object.hasError()) {
        this.showErrors(object.getErrors());
    }
    else {
        var data = this.getObject().getData();
        if(data === null) {
            data = [["null"]];
        }
        else if(data === undefined) {
            data = [["undefined"]];
        }
        this.showData(data);
    }
}

visicomp.app.visiui.GridTableComponent.prototype.showErrors = function(actionErrors) {
//temporarly error handling
    if(this.gridControl) {
        var errorData = [["Error:"]];
        for(var i = 0; i < actionErrors.length; i++) {
            var errorEntry = [actionErrors[i].msg];
            errorData.push(errorEntry);
        }
        this.gridControl.loadData(errorData);
    }
}

visicomp.app.visiui.GridTableComponent.prototype.showData = function(data) {
    if(this.gridControl) {
        this.gridControl.loadData(data);
    }
    else {       
        this.gridControl = new Handsontable(this.gridDiv, {
            readOnly: true,
            data: data,
            rowHeaders: true,
            colHeaders: true
        });
    }
}

//=============================
// Action UI Entry Points
//=============================

/** This method displays the edit data dialog for this component. 
 * @private */
visicomp.app.visiui.GridTableComponent.prototype.createEditDataDialog = function() {
    var instance = this;
	
    //create save handler
    var onSave = function(data) {
        var actionResponse = visicomp.core.updatemember.updateData(instance.getObject(),data);
        if(!actionResponse.getSuccess()) {
            //show an error message
            var msg = actionResponse.getErrorMsg();
            alert(msg);
        }
        
        //return true to close the dialog
        return true;  
    };
    
    return function() {
        visicomp.app.visiui.dialog.showUpdateGridDataDialog(instance.getObject(),onSave);
    }
}

//======================================
// Static methods
//======================================


visicomp.app.visiui.GridTableComponent.createComponent = function(workspaceUI,parent,name) {
    
    var json = {};
    json.name = name;
    json.type = visicomp.core.JsonTable.generator.type;
	json.updateData = {};
	json.updateData.data = [[""]]; //empty single cell
    var actionResponse = visicomp.core.createmember.createMember(parent,json);
    
    var table = actionResponse.member;
    if(table) {
        var tableComponent = new visicomp.app.visiui.GridTableComponent(workspaceUI,table);
        actionResponse.component = tableComponent;
    }
    return actionResponse;
}


visicomp.app.visiui.GridTableComponent.createComponentFromJson = function(workspaceUI,member,componentJson) {
    var tableComponent = new visicomp.app.visiui.GridTableComponent(workspaceUI,member,componentJson);
    return tableComponent;
}

//======================================
// This is the component generator, to register the component
//======================================

visicomp.app.visiui.GridTableComponent.generator = {};
visicomp.app.visiui.GridTableComponent.generator.displayName = "Grid Table";
visicomp.app.visiui.GridTableComponent.generator.uniqueName = "visicomp.app.visiui.GridTableComponent";
visicomp.app.visiui.GridTableComponent.generator.createComponent = visicomp.app.visiui.GridTableComponent.createComponent;
visicomp.app.visiui.GridTableComponent.generator.createComponentFromJson = visicomp.app.visiui.GridTableComponent.createComponentFromJson;
visicomp.app.visiui.GridTableComponent.generator.DEFAULT_WIDTH = 600;
visicomp.app.visiui.GridTableComponent.generator.DEFAULT_HEIGHT = 600;

//======================================
// This is a code wrapper so the user works with the formula rather than the function body
//======================================

visicomp.app.visiui.GridTableComponent.editorCodeWrapper = {};

visicomp.app.visiui.GridTableComponent.editorCodeWrapper.FUNCTION_PREFIX = "var value;\n";
visicomp.app.visiui.GridTableComponent.editorCodeWrapper.FUNCTION_SUFFIX = "\nreturn value;\n\n";

visicomp.app.visiui.GridTableComponent.editorCodeWrapper.displayName = "Formula";

visicomp.app.visiui.GridTableComponent.editorCodeWrapper.wrapCode = function(formula) { 
    return visicomp.app.visiui.GridTableComponent.editorCodeWrapper.FUNCTION_PREFIX + formula + 
        visicomp.app.visiui.GridTableComponent.editorCodeWrapper.FUNCTION_SUFFIX;
}

visicomp.app.visiui.GridTableComponent.editorCodeWrapper.unwrapCode = function(functionBody) {
	if((functionBody == null)||(functionBody.length = 0)) return "";
	
    var formula = functionBody.replace("var value;","");
    formula = formula.replace("return value;","");
    return formula.trim();
}

//external links
//https://handsontable.com/bower_components/handsontable/dist/handsontable.full.js
//https://handsontable.com/bower_components/handsontable/dist/handsontable.full.css


