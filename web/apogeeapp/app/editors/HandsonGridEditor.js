/** This is a grid editor using hands on table*/
apogeeapp.app.HandsonGridEditor = function(viewMode) {
   
	this.outsideDiv = apogeeapp.ui.createElement("div",null,{
		"position":"absolute",
        "top":"0px",
        "left":"0px",
		"bottom":"0px",
        "right":"0px",
		"overflow":"hidden"
	});
	
//TBR initial sizing. now I just set it to a dummy number	
	
	this.gridDiv = apogeeapp.ui.createElement("div",null,{
		"position":"absolute",
        "top":"0px",
        "left":"0px",
        "width":"50px",
        "height":"50px",
		"overflow":"hidden",
        "zIndex":0
	});
	this.outsideDiv.appendChild(this.gridDiv);
	
	this.viewMode = viewMode;
	this.inputData = null;
	this.editOk = false;
    this.activeEditOk = undefined;
    this.dataCached = false;
	
	//resize the editor on window size change
    var instance = this;
    
   this.callbackAttached = false;
   
   //we have to make sure the element is loaded before initailizing for handsontable to work properly
   this.loaded = false;
   
	//grid edited function
	this.gridEdited = function(args) {
		instance.save(arguments);
	}
    
    //on a paste, the event is fired for each row created. We delay it here to haev fewer updates of the rest of the sheet
    this.timerInProcess = false;
    var REFRESH_DELAY = 50;
    
    this.delayGridEdited = function(args) {
        //if there is no timer waiting, start a timer
        if(!instance.timerInProcess) {
            instance.timerInProcess = true;
            var callEditEvent = function(args) {
                instance.timerInProcess = false;
                instance.gridEdited(arguments);
            }
            setTimeout(callEditEvent,REFRESH_DELAY);
        }
    }
    
}

apogeeapp.app.HandsonGridEditor.prototype.save = function(argArray) {
	//no action for this case
	if(argArray[1] == "loadData") return;

	//update "input" data before calling update
	this.inputData = apogee.util.deepJsonCopy(this.gridControl.getData());

	this.viewMode.onSave(this.inputData);
}

apogeeapp.app.HandsonGridEditor.prototype.cancel = function() {
	//reset the original data
	this.viewMode.onCancel();
}

//=============================
// "Package" Methods
//=============================

apogeeapp.app.HandsonGridEditor.prototype.getElement = function() {
	return this.outsideDiv;
}
	
apogeeapp.app.HandsonGridEditor.prototype.showData = function(json,editOk) {
    
	if((this.inputData === json)&&(editOk)) return;
	
	this.editOk = editOk;
	this.inputData = json;
    this.dataCached = true;
	
    if(this.loaded) {
        this.displayData();
    }
}
    

//we must be loaded before creating objects
apogeeapp.app.HandsonGridEditor.prototype.displayData = function() {
    
    //clear the cached data flag, if it is present
    this.dataCached = false;
    
    var editData = apogee.util.deepJsonCopy(this.inputData);
    if(!editData) {
        editData = [[]];
    }

    if((!this.gridControl)||(this.activeEditOk !== this.editOk)) {
        this.createNewGrid(editData);
        this.activeEditOk = this.editOk;
    }
    else {
        this.gridControl.loadData(editData);
    }
    
    //set the background color
    if(this.editOk) {
        this.gridDiv.style.backgroundColor = "";
    }
    else {
        this.gridDiv.style.backgroundColor = apogeeapp.app.EditWindowComponentDisplay.NO_EDIT_BACKGROUND_COLOR;
    }
}

apogeeapp.app.HandsonGridEditor.prototype.onLoad = function() {
    this.loaded = true;
    if(this.dataCached) {
        this.displayData();
    }
}

apogeeapp.app.HandsonGridEditor.prototype.onUnload = function() {
    this.loaded = false;
}

apogeeapp.app.HandsonGridEditor.prototype.onResize = function() {
    this.setSize();
}
    
apogeeapp.app.HandsonGridEditor.prototype.setSize = function() {  
    if(this.gridDiv) {
        this.gridDiv.style.width = this.outsideDiv.clientWidth + "px";
        this.gridDiv.style.height = this.outsideDiv.clientHeight + "px";
        if(this.gridControl) {
            this.gridControl.render();
        }
    }
}

apogeeapp.app.HandsonGridEditor.prototype.destroy = function() {
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
apogeeapp.app.HandsonGridEditor.prototype.createNewGrid = function(initialData) {
    if(this.gridControl) {
        this.gridControl.destroy();
        this.gridControl = null;
    }
    
    var gridOptions; 
    if(this.editOk) {
        gridOptions = {
            data: initialData,
            rowHeaders: true,
            colHeaders: true,
            contextMenu: true,
            //edit callbacks
            afterChange:this.gridEdited,
            afterCreateCol:this.delayGridEdited,
            afterCreateRow:this.delayGridEdited,
            afterRemoveCol:this.gridEdited,
            afterRemoveRow:this.gridEdited
        }
        this.gridEditable = true;
    }
    else {
        gridOptions = {
            data: initialData,
            readOnly: true,
            rowHeaders: true,
            colHeaders: true,
        }
        this.gridEditable = false;
    }
        
    this.gridControl = new Handsontable(this.gridDiv,gridOptions); 
    
    this.setSize();
}

