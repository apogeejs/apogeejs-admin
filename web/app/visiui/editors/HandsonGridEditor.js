/** Editor that uses the Ace text editor.
 * 
 * @param {type} component - the visicomp component
 * @param {type} aceMode - the display format, such as "ace/mode/json"
 * @param {type} onSave - takes a text json representation for saving. returns true if the edit should end.
 * @param {type} onCancel - returns true if the edit should end
 */
visicomp.app.visiui.HandsonGridEditor = function(component,onSave,onCancel) {
   
	this.outsideDiv = visicomp.visiui.createElement("div",null,{
		"position":"absolute",
        "top":"0px",
        "left":"0px",
		"bottom":"0px",
        "right":"0px",
		"overflow":"hidden"
	});
	
//TBR initial sizing. now I just set it to a dummy number	
	
	this.gridDiv = visicomp.visiui.createElement("div",null,{
		"position":"absolute",
        "top":"0px",
        "left":"0px",
        "width":"50px",
        "height":"50px",
		"overflow":"hidden",
        "zIndex":0
	});
	this.outsideDiv.appendChild(this.gridDiv);
	
//----------------------------------------------------
//CLEAN THIS UP!
	
	var styleJson = {
		"position":"absolute",
        "top":"0px",
        "left":"0px",
		"height":"100%",
        "width":"100%",
		"overflow":"hidden",
		"zIndex":-1
	};
	this.dummyFrameElement = visicomp.visiui.createElement("iframe",null,styleJson);
	this.outsideDiv.appendChild(this.dummyFrameElement);
	
//-----------------------------------------------------	
	
	this.component = component;
	this.table = component.getObject();
	this.inputData = null;
	this.editOk = false;
	
	this.parentSave = onSave;
	this.parentCancel = onCancel;
	
	//resize the editor on window size change
    var instance = this;
    var resizeCallback = function() {
        instance.gridDiv.style.width = instance.outsideDiv.clientWidth + "px";
        instance.gridDiv.style.height = instance.outsideDiv.clientHeight + "px";
        if(instance.gridControl) {
            instance.gridControl.render();
        }
    }
//    addResizeListener(this.outsideDiv, resizeCallback);

	var onLoadCallback = function() {
		
		instance.dummyFrameBody = instance.dummyFrameElement.contentDocument.body;
		instance.dummyFrameBody.onresize = resizeCallback;
		
		resizeCallback();
	}
	
	//do a resize on load too
	this.dummyFrameElement.onload = onLoadCallback;
	
	//grid edited function
	this.gridEdited = function(args) {
		instance.save(arguments);
	}
	
}

visicomp.app.visiui.HandsonGridEditor.prototype.save = function(argArray) {
	//no action for this case
	if(argArray[1] == "loadData") return;

	//update "input" data before calling update
	this.inputData = visicomp.core.util.deepCopy(this.gridControl.getData());

	this.parentSave(this.inputData);
}

visicomp.app.visiui.HandsonGridEditor.prototype.cancel = function() {
	//reset the original data
	this.parentCancel();
}

//=============================
// "Package" Methods
//=============================

visicomp.app.visiui.HandsonGridEditor.prototype.getElement = function() {
	return this.outsideDiv;
}
	
visicomp.app.visiui.HandsonGridEditor.prototype.showData = function(json,editOk) {
	if((this.inputData === json)&&(editOk)) return;
	
	var oldEditOk = this.editOk;
	this.editOk = editOk;
	this.inputData = json;
	var editData = visicomp.core.util.deepCopy(json);
	
	if((!this.gridControl)||(oldEditOk !== editOk)) {
		this.createNewGrid();
	}
	
	this.gridControl.loadData(editData);
}

visicomp.app.visiui.HandsonGridEditor.prototype.destroy = function() {
	if(this.gridControl) {
        this.gridControl.destroy();
        this.gridControl = null;
    }
}

//==============================
// Private Methods
//==============================

/** This method creates a new grid. 
 * @private */
visicomp.app.visiui.HandsonGridEditor.prototype.createNewGrid = function() {
    if(this.gridControl) {
        this.gridControl.destroy();
        this.gridControl = null;
    }
    
    var gridOptions; 
    if(this.editOk) {
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

