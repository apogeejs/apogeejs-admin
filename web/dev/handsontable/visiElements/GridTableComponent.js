if(!visicomp.dev) visicomp.dev = {};
if(!visicomp.dev.handsontable) visicomp.dev.handsontable = {};

/** This component represents a json table object. */
visicomp.dev.handsontable.GridTableComponent = function(workspaceUI,table,componentJson) {
    //base init
    visicomp.app.visiui.Component.init.call(this,workspaceUI,table,visicomp.dev.handsontable.GridTableComponent.generator,componentJson);
    
    this.memberUpdated();
};

//add components to this class
visicomp.core.util.mixin(visicomp.dev.handsontable.GridTableComponent,visicomp.app.visiui.Component);

//==============================
// Protected and Private Instance Methods
//==============================

/** This method populates the frame for this component. 
 * @protected */
visicomp.dev.handsontable.GridTableComponent.prototype.populateFrame = function() {
    
    var window = this.getWindow();
    
    //create the menu
    var menuItemInfoList = this.getMenuItemInfoList();
  
    var itemInfo1 = {};
    itemInfo1.title = "Edit&nbsp;Data";
    itemInfo1.callback = this.createEditDataDialog();
    
    var itemInfo2 = {};
    itemInfo2.title = "Edit&nbsp;Formula";
    itemInfo2.callback = this.createEditCodeableDialogCallback(itemInfo2.title,visicomp.dev.handsontable.GridTableComponent.editorCodeWrapper);
    
    //add these at the start of the menu
    menuItemInfoList.splice(0,0,itemInfo1,itemInfo2);
    
    //editor - only for display, read only
    var contentDiv = this.getContentElement();
	var gridDiv = visicomp.visiui.createElement("div",null,{
		"position":"relative",
		"width":"500px",
		"height":"300px",
		"border":"1px solid darkgray",
		"overflow":"hidden",
		"zIndex":0
	});
	contentDiv.appendChild(gridDiv);
	var gridControl = new Handsontable(gridDiv, {
		readOnly: true,
		data: [[""]], //empty data
		rowHeaders: true,
		colHeaders: true
	});
    this.gridControl = gridControl;
    
    //resize the editor on window size change
    var resizeCallback = function() {
        gridControl.render();
    }
    window.addListener(visicomp.visiui.WindowFrame.RESIZED, resizeCallback);
}

/** This method should include an needed functionality to clean up after a delete. */
visicomp.dev.handsontable.GridTableComponent.prototype.onDelete = function() {
    if(this.gridControl) {
        this.gridControl.destroy();
        this.gridControl = null;
    }
}

/** This method updates the table data 
 * @private */    
visicomp.dev.handsontable.GridTableComponent.prototype.memberUpdated = function() {
    var object = this.getObject();
    if(object.hasDataError()) {
        this.showError(object.getDataError());
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

visicomp.dev.handsontable.GridTableComponent.prototype.showError = function(actionError) {
//temporarly error handling
    this.gridControl.loadData([["ERROR: ",actionError.msg]]);
}

visicomp.dev.handsontable.GridTableComponent.prototype.showData = function(data) {
    this.gridControl.loadData(data);
}

//=============================
// Action UI Entry Points
//=============================

/** This method displays the edit data dialog for this component. 
 * @private */
visicomp.dev.handsontable.GridTableComponent.prototype.createEditDataDialog = function() {
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
        visicomp.dev.handsontable.showUpdateGridDataDialog(instance.getObject(),onSave);
    }
}

//======================================
// Static methods
//======================================


visicomp.dev.handsontable.GridTableComponent.createComponent = function(workspaceUI,parent,name) {
    
    var json = {};
    json.name = name;
    json.type = visicomp.core.JsonTable.generator.type;
	json.updateData = {};
	json.updateData.data = [[""]]; //empty single cell
    var actionResponse = visicomp.core.createmember.createMember(parent,json);
    
    var table = actionResponse.member;
    if(table) {
        var tableComponent = new visicomp.dev.handsontable.GridTableComponent(workspaceUI,table);
        actionResponse.component = tableComponent;
    }
    return actionResponse;
}


visicomp.dev.handsontable.GridTableComponent.createComponentFromJson = function(workspaceUI,member,componentJson) {
    var tableComponent = new visicomp.dev.handsontable.GridTableComponent(workspaceUI,member,componentJson);
    return tableComponent;
}

//======================================
// This is the component generator, to register the component
//======================================

visicomp.dev.handsontable.GridTableComponent.generator = {};
visicomp.dev.handsontable.GridTableComponent.generator.displayName = "Grid Table";
visicomp.dev.handsontable.GridTableComponent.generator.uniqueName = "visicomp.dev.handsontable.GridTableComponent";
visicomp.dev.handsontable.GridTableComponent.generator.createComponent = visicomp.dev.handsontable.GridTableComponent.createComponent;
visicomp.dev.handsontable.GridTableComponent.generator.createComponentFromJson = visicomp.dev.handsontable.GridTableComponent.createComponentFromJson;
visicomp.dev.handsontable.GridTableComponent.generator.DEFAULT_WIDTH = 200;
visicomp.dev.handsontable.GridTableComponent.generator.DEFAULT_HEIGHT = 200;

//======================================
// This is a code wrapper so the user works with the formula rather than the function body
//======================================

visicomp.dev.handsontable.GridTableComponent.editorCodeWrapper = {};

visicomp.dev.handsontable.GridTableComponent.editorCodeWrapper.FUNCTION_PREFIX = "var value;\n";
visicomp.dev.handsontable.GridTableComponent.editorCodeWrapper.FUNCTION_SUFFIX = "\nreturn value;\n\n";

visicomp.dev.handsontable.GridTableComponent.editorCodeWrapper.displayName = "Formula";

visicomp.dev.handsontable.GridTableComponent.editorCodeWrapper.wrapCode = function(formula) { 
    return visicomp.dev.handsontable.GridTableComponent.editorCodeWrapper.FUNCTION_PREFIX + formula + 
        visicomp.dev.handsontable.GridTableComponent.editorCodeWrapper.FUNCTION_SUFFIX;
}

visicomp.dev.handsontable.GridTableComponent.editorCodeWrapper.unwrapCode = function(functionBody) {
	if((functionBody == null)||(functionBody.length = 0)) return "";
	
    var formula = functionBody.replace("var value;","");
    formula = formula.replace("return value;","");
    return formula.trim();
}


//auto registration
if(registerComponent) {
    registerComponent(visicomp.dev.handsontable.GridTableComponent.generator);
}

//external links
//https://handsontable.com/bower_components/handsontable/dist/handsontable.full.js
//https://handsontable.com/bower_components/handsontable/dist/handsontable.full.css


