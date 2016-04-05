/** This component represents a json table object. */
visicomp.app.visiui.JsonTableComponent = function(workspaceUI,table,componentJson) {
    //base init
    visicomp.app.visiui.Component.init.call(this,workspaceUI,table,visicomp.app.visiui.JsonTableComponent.generator,componentJson);
    
    this.memberUpdated();
};

//add components to this class
visicomp.core.util.mixin(visicomp.app.visiui.JsonTableComponent,visicomp.app.visiui.Component);

visicomp.app.visiui.JsonTableComponent.VIEW_TEXT = "Text";
visicomp.app.visiui.JsonTableComponent.VIEW_FORM = "Form";
visicomp.app.visiui.JsonTableComponent.VIEW_CODE = "Code";

visicomp.app.visiui.JsonTableComponent.DEFAULT_VIEW = visicomp.app.visiui.JsonTableComponent.VIEW_FORM;

/** This method populates the frame for this component. 
 * @protected */
visicomp.app.visiui.JsonTableComponent.prototype.setViewType = function(viewType) {
	//return if there is no change
	if(this.viewType === viewType) return;
	
	//if there is an old view, remove it
	if(this.viewElement) {
		this.viewElement.destroy();
		this.showElement(null);
	}
	
	//create the new view element;
	switch(viewType) {
		case visicomp.app.visiui.JsonTableComponent.VIEW_TEXT:
			this.viewElement = new visicomp.app.visiui.JsonTableComponent.TextView(this);
            this.viewType = visicomp.app.visiui.JsonTableComponent.VIEW_TEXT;
			break;
			
		case visicomp.app.visiui.JsonTableComponent.VIEW_FORM:
			this.viewElement = new visicomp.app.visiui.JsonTableComponent.FormView(this);
            this.viewType = visicomp.app.visiui.JsonTableComponent.VIEW_FORM;
			break;
			
		default:
//temporary error handling...
			alert("unrecognized view element!");
			break;
	}
}

//==============================
// Protected and Private Instance Methods
//==============================

/** This method populates the frame for this component. 
 * @protected */
visicomp.app.visiui.JsonTableComponent.prototype.populateFrame = function() {
    
    //create the menu
    var menuItemInfoList = this.getMenuItemInfoList();
  
    var itemInfo1 = {};
    itemInfo1.title = "Edit Data";
    itemInfo1.callback = this.createEditDataDialog();
    
    var itemInfo2 = {};
    itemInfo2.title = "Edit Formula";
    itemInfo2.callback = this.createEditCodeableDialogCallback(itemInfo2.title,visicomp.app.visiui.JsonTableComponent.editorCodeWrapper);
	
	var itemInfo3 = {};
    itemInfo3.title = "Set View";
    itemInfo3.callback = this.createViewDialogCallback();
    
    //add these at the start of the menu
    menuItemInfoList.splice(0,0,itemInfo1,itemInfo2,itemInfo3);
    
	//show the view
	this.viewElementShowing = null;
	this.setViewType(visicomp.app.visiui.JsonTableComponent.DEFAULT_VIEW);
}

/** This method should include an needed functionality to clean up after a delete. */
visicomp.app.visiui.JsonTableComponent.prototype.onDelete = function() {
    if(this.viewElement) {
		this.viewElement.destroy();
		this.viewElement = null;
	}
}

/** This is the format character use to display tabs in the display editor. 
 * @private*/
visicomp.app.visiui.JsonTableComponent.formatString = "\t";

/** This method updates the table data 
 * @private */    
visicomp.app.visiui.JsonTableComponent.prototype.memberUpdated = function() {
    var object = this.getObject();
    if(object.hasError()) {
		if(!this.errorElement) {
			this.errorElement = new visicomp.app.visiui.JsonTableComponent.ErrorView(this);
		}
		
		if(this.viewElementShowing !== this.errorElement) {
			this.showElement(this.errorElement);
		}
		
		this.errorElement.showData(object.getErrors());
    }
    else {
		if(this.viewElementShowing !== this.viewElement) {
			this.showElement(this.viewElement);
		}
        
        var editable = !object.hasCode();
		
		this.viewElement.showData(object.getData(),editable);
	}
}

/** @private */
visicomp.app.visiui.JsonTableComponent.prototype.showElement = function(viewElement) {
    
	var contentDiv = this.getContentElement();
	visicomp.core.util.removeAllChildren(contentDiv);
	
    if(viewElement) {
		var viewDiv = viewElement.getElement();
		contentDiv.appendChild(viewDiv);
	}
	
	this.viewElementShowing = viewElement;
}


//=============================
// Action UI Entry Points
//=============================

/** This method displays the edit data dialog for this component. 
 * @private */
visicomp.app.visiui.JsonTableComponent.prototype.createEditDataDialog = function() {
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
        visicomp.app.visiui.dialog.showUpdateTableDataDialog(instance.getObject(),onSave);
    }
}

visicomp.app.visiui.JsonTableComponent.prototype.createViewDialogCallback = function() {
	//create dialog layout
    var layout = {};
    layout.lines = [];
    var line;
    
    line = {};
    line.type = "title";
    line.title = "Select View";
    layout.lines.push(line);
    
    var ddLine = {};
    ddLine.type = "dropdown";
    ddLine.heading = "View: "
    ddLine.entries = [
        visicomp.app.visiui.JsonTableComponent.VIEW_FORM,
        visicomp.app.visiui.JsonTableComponent.VIEW_TEXT
    ];
    ddLine.resultKey = "view";
    layout.lines.push(ddLine);
    
    line = {};
    line.type = "submit";
    line.submit = "OK";
    line.cancel = "Cancel";
    layout.lines.push(line);
    
    //create on submit function
    var instance = this;
    var onSubmit = function(result) {
        instance.setViewType(result.view);
        instance.memberUpdated();
        return true;
    }
    
    return function() {
        //set the current view type
        if(instance.viewType) {
            ddLine.initial = ddLine.entries.indexOf(instance.viewType);
        }
        else {
            ddLine.initial = ddLine.entries.indexOf(visicomp.app.visiui.JsonTableComponent.DEFAULT_VIEW);
        }
    
        //open dialog
		visicomp.app.visiui.dialog.showConfigurableDialog(layout,onSubmit);
	}
}

//======================================
// View Objects
//======================================

visicomp.app.visiui.JsonTableComponent.TextView = function(jsonTableComponent) {
   
	this.editorDiv = visicomp.visiui.createElement("div",null,{
		"position":"absolute",
        "top":"0px",
        "left":"0px",
		"bottom":"0px",
        "right":"0px",
		"overflow":"auto"
	});
	
	var editor = ace.edit(this.editorDiv);
	
//this stops an error message
editor.$blockScrolling = Infinity;

    editor.renderer.setShowGutter(true);
    editor.setReadOnly(true);
    editor.setTheme("ace/theme/eclipse"); //good
    editor.getSession().setMode("ace/mode/json"); 
    this.editor = editor;
	
	//resize the editor on window size change
    var resizeCallback = function() {
        editor.resize();
    }
	
    addResizeListener(this.editorDiv, resizeCallback);
}

/** This flag indicates the object does not edit data - because in text we can not enforce value json 
 * during each edit step. */
visicomp.app.visiui.JsonTableComponent.TextView.prototype.canEdit = false;

visicomp.app.visiui.JsonTableComponent.TextView.prototype.getElement = function() {
	return this.editorDiv;
}
	
visicomp.app.visiui.JsonTableComponent.TextView.prototype.showData = function(data) {
	var textData;
	if(data === null) {
		textData = "null";
	}
	else if(data === undefined) {
		textData = "undefined";
	}
	else {
		textData = JSON.stringify(data,null,visicomp.app.visiui.JsonTableComponent.formatString);
	}
	
	this.editor.getSession().setValue(textData);
}

visicomp.app.visiui.JsonTableComponent.TextView.prototype.destroy = function() {
	if(this.editor) {
        this.editor.destroy();
        this.editor = null;
    }
}

visicomp.app.visiui.JsonTableComponent.FormView = function(jsonTableComponent,editOk) {
	
	this.editorDiv = visicomp.visiui.createElement("div",null,{
		"position":"absolute",
        "top":"0px",
        "left":"0px",
		"bottom":"0px",
        "right":"0px",
		"overflow":"auto"
	});
    
    this.workingData = null;
    
    var instance = this;
    var table = jsonTableComponent.getObject();
    this.editCallback = function() {
        var currentData = instance.editor.getCurrentValue();
        instance.workingData = currentData;
        visicomp.core.updatemember.updateData(table,currentData);
    }
}

/** This flag indicates the element can or cannot edit data. */
visicomp.app.visiui.JsonTableComponent.FormView.prototype.canEdit = true;

visicomp.app.visiui.JsonTableComponent.FormView.prototype.getElement = function() {
	return this.editorDiv;
}

visicomp.app.visiui.JsonTableComponent.FormView.prototype.showData = function(data,editOk) {
    if((data == this.workingData)&&(this.editOk == editOk)) {
        //no need to update
        return;
    }
    
    this.workingData = visicomp.core.util.deepCopy(data);
    this.editOk = editOk;
    
	visicomp.core.util.removeAllChildren(this.editorDiv);
	this.editor = new visicomp.jsonedit.JsonEditArea(this.editorDiv,data,editOk);
    
    this.editor.setEditCallback(this.editCallback);
}

visicomp.app.visiui.JsonTableComponent.FormView.prototype.destroy = function() {
}

visicomp.app.visiui.JsonTableComponent.ErrorView = function(jsonTableComponent) {
	this.displayDiv = visicomp.visiui.createElement("div",null,{
		"position":"absolute",
        "top":"0px",
        "left":"0px",
		"bottom":"0px",
        "right":"0px",
		"overflow":"auto",
		"color":"red"
	});
}

/** This flag indicates the object does not edit data. */
visicomp.app.visiui.JsonTableComponent.ErrorView.prototype.canEdit = false;

visicomp.app.visiui.JsonTableComponent.ErrorView.prototype.getElement = function() {
	return this.displayDiv;
}

visicomp.app.visiui.JsonTableComponent.ErrorView.prototype.showData = function(actionErrors) {
	var errorMsg = "Error: \n";
    for(var i = 0; i < actionErrors.length; i++) {
        errorMsg += actionErrors[i].msg + "\n";
    }
	
	this.displayDiv.innerHTML = errorMsg;
}

visicomp.app.visiui.JsonTableComponent.ErrorView.prototype.destroy = function() {
	
}


//======================================
// Static methods
//======================================


visicomp.app.visiui.JsonTableComponent.createComponent = function(workspaceUI,parent,name) {
    
    var json = {};
    json.name = name;
    json.type = visicomp.core.JsonTable.generator.type;
    var actionResponse = visicomp.core.createmember.createMember(parent,json);
    
    var table = actionResponse.member;
    if(table) {
        var tableComponent = new visicomp.app.visiui.JsonTableComponent(workspaceUI,table);
        actionResponse.component = tableComponent;
    }
    return actionResponse;
}


visicomp.app.visiui.JsonTableComponent.createComponentFromJson = function(workspaceUI,member,componentJson) {
    var tableComponent = new visicomp.app.visiui.JsonTableComponent(workspaceUI,member,componentJson);
    return tableComponent;
}

//======================================
// This is the component generator, to register the component
//======================================

visicomp.app.visiui.JsonTableComponent.generator = {};
visicomp.app.visiui.JsonTableComponent.generator.displayName = "Data Table";
visicomp.app.visiui.JsonTableComponent.generator.uniqueName = "visicomp.app.visiui.JsonTableComponent";
visicomp.app.visiui.JsonTableComponent.generator.createComponent = visicomp.app.visiui.JsonTableComponent.createComponent;
visicomp.app.visiui.JsonTableComponent.generator.createComponentFromJson = visicomp.app.visiui.JsonTableComponent.createComponentFromJson;
visicomp.app.visiui.JsonTableComponent.generator.DEFAULT_WIDTH = 200;
visicomp.app.visiui.JsonTableComponent.generator.DEFAULT_HEIGHT = 200;

//======================================
// This is a code wrapper so the user works with the formula rather than the function body
//======================================

visicomp.app.visiui.JsonTableComponent.editorCodeWrapper = {};

visicomp.app.visiui.JsonTableComponent.editorCodeWrapper.FUNCTION_PREFIX = "var value;\n";
visicomp.app.visiui.JsonTableComponent.editorCodeWrapper.FUNCTION_SUFFIX = "\nreturn value;\n\n";

visicomp.app.visiui.JsonTableComponent.editorCodeWrapper.displayName = "Formula";

visicomp.app.visiui.JsonTableComponent.editorCodeWrapper.wrapCode = function(formula) { 
    return visicomp.app.visiui.JsonTableComponent.editorCodeWrapper.FUNCTION_PREFIX + formula + 
        visicomp.app.visiui.JsonTableComponent.editorCodeWrapper.FUNCTION_SUFFIX;
}

visicomp.app.visiui.JsonTableComponent.editorCodeWrapper.unwrapCode = function(functionBody) {
	if((functionBody == null)||(functionBody.length = 0)) return "";
	
    var formula = functionBody.replace("var value;","");
    formula = formula.replace("return value;","");
    return formula.trim();
}

