
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
    
    //create the menu
    var menuItemInfoList = this.getMenuItemInfoList();
  
    var itemInfo1 = {};
    itemInfo1.title = "Edit Data";
    itemInfo1.callback = this.createEditDataDialog();
    
    var itemInfo2 = {};
    itemInfo2.title = "Edit Formula";
    itemInfo2.callback = this.createEditCodeableDialogCallback(itemInfo2.title,visicomp.app.visiui.GridTableComponent.editorCodeWrapper);
    
    //add these at the start of the menu
    menuItemInfoList.splice(0,0,itemInfo1,itemInfo2);
    
    //editor - only for display, read only
    var contentDiv = this.getContentElement();
    
var bufferDiv = visicomp.visiui.createElement("div",null,{
        "display":"block",
        "top":"0px",
        "left":"0px",
        "bottom":"0px",
        "right":"0px",
        "position":"absolute",
        "overflow":"hidden"   
	});
	contentDiv.appendChild(bufferDiv); 
    
	this.gridDiv = visicomp.visiui.createElement("div",null,{
        "width":contentDiv.clientWidth + "px",
        "height":contentDiv.clientHeight + "px",
		"overflow":"hidden",
        "zIndex":0
	});
//	contentDiv.appendChild(this.gridDiv);
bufferDiv.appendChild(this.gridDiv);    
    
    //resize the editor on window size change
    var instance = this;
    var resizeCallback = function() {
        instance.gridDiv.style.width = contentDiv.clientWidth + "px";
        instance.gridDiv.style.height = contentDiv.clientHeight + "px";
        if(instance.gridControl) {
            instance.gridControl.render();
        }
    }
//    window.addListener(visicomp.visiui.WindowFrame.RESIZE_ENDED, resizeCallback);
    addResizeListener(contentDiv, resizeCallback);
    
    //internal grid edited function
    this.gridEdited = function() {
        //no action for this case
        if(arguments[1] == "loadData") return;

        //update working data before calling update
        instance.workingData = visicomp.core.util.deepCopy(instance.gridControl.getData());
        visicomp.core.updatemember.updateData(instance.getObject(),instance.workingData);
    }

    //create the grid
    this.createNewGrid();
}

/** This method should be called if the grid is edited inline.
 * @private */
visicomp.app.visiui.GridTableComponent.prototype.gridEdited = function() {
    
}

/** This method creates a new grid. 
 * @private */
visicomp.app.visiui.GridTableComponent.prototype.createNewGrid = function() {
    if(this.gridControl) {
        this.gridControl.destroy();
        this.gridControl = null;
    }
    
    //grid is NOT editable if it has a formula
    var object = this.getObject();
    var editable = !object.hasCode();
    
    var gridOptions; 
    if(editable) {
        gridOptions = {
            rowHeaders: true,
            colHeaders: true,
            contextMenu: true,
            //edit callbacks
            afterChange:this.gridEdited,
            afterCreateCol:this.gridEdited,
            afterCreateRow:this.gridEdited,
            afterRemoveCol:this.gridEdited,
            afterRemoveRow:this.gridEdited
        }
        this.gridEditable = true;
    }
    else {
        gridOptions = {
            readOnly: true,
            rowHeaders: true,
            colHeaders: true
        }
        this.gridEditable = false;
    }
        
    this.gridControl = new Handsontable(this.gridDiv,gridOptions); 
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
        var data = object.getData();
        
        //grid editable should NOT EQUAL object.hasCode
        if(this.gridEditable == object.hasCode()) {
            this.createNewGrid();
        }
        else if(data === this.workingData) {
            //no need for an update
            return;
        }
        
        //update data for display
        if(data === null) {
            data = [["null"]];
        }
        else if(data === undefined) {
            data = [["undefined"]];
        }
        
        //make a working copy of the data that we can edit
        this.workingData = visicomp.core.util.deepCopy(data);
        
        //load the grid
        this.gridControl.loadData(this.workingData);
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
visicomp.app.visiui.GridTableComponent.generator.DEFAULT_WIDTH = 200;
visicomp.app.visiui.GridTableComponent.generator.DEFAULT_HEIGHT = 200;

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


