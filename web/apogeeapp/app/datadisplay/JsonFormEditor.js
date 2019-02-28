/** Editor that uses json edit area. I am NOT using it for the time being because
 * I need to improve it a little before it is used.
 * 
 * OUT OF DATE!!!
 * 
 * @param {type} onSave - should take a json object that should be saved.
 */
apogeeapp.app.JsonFormEditor = function(displayContainer) {
	
	this.editorDiv = apogeeapp.ui.createElement("div",null,{
		"position":"absolute",
        "top":"0px",
        "left":"0px",
		"bottom":"0px",
        "right":"0px",
		"overflow":"auto"
	});
    
    this.workingData = {"d":"c"}; //we need to set it to someting that ntohing can ===
	this.editOk = false;
	
	this.editor = null;

	var instance = this;
	this.editCallback = function() {
        var currentData = instance.editor.getCurrentValue();
        instance.workingData = currentData;
        displayContainer.onSave(currentData);
    }
}

apogeeapp.app.JsonFormEditor.prototype.getElement = function() {
	return this.editorDiv;
}

apogeeapp.app.JsonFormEditor.prototype.showData = function(data,editOk) {
    if((data === this.workingData)&&(this.editOk === editOk)) {
        //no need to update
        return;
    }
	
	//the value undefined will break things. It is not a valid json value.
	//I should verify I handle this consistently through app.
	if(data === undefined) data = null;
    
    this.workingData = apogee.util.jsonCopy(data);
    this.editOk = editOk;
    
	apogeeapp.ui.removeAllChildren(this.editorDiv);
	this.editor = new apogeeapp.jsonedit.JsonEditArea(this.editorDiv,data,editOk);
    
    this.editor.setEditCallback(this.editCallback);
    
    //set the background color
    if(this.editOk) {
        this.editorDiv.style.backgroundColor = "";
    }
    else {
        this.editorDiv.style.backgroundColor = apogeeapp.app.EditWindowComponentDisplay.NO_EDIT_BACKGROUND_COLOR;
    }
}

apogeeapp.app.JsonFormEditor.prototype.destroy = function() {
	//no action
}

