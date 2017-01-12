/** Editor that uses json edit area
 * 
 * @param {type} onSave - should take a json object that should be saved.
 */
haxapp.app.JsonFormEditor = function(onSave) {
	
	this.editorDiv = haxapp.ui.createElement("div",null,{
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
        onSave(currentData);
    }
}

haxapp.app.JsonFormEditor.prototype.getElement = function() {
	return this.editorDiv;
}

haxapp.app.JsonFormEditor.prototype.showData = function(data,editOk) {
    if((data === this.workingData)&&(this.editOk === editOk)) {
        //no need to update
        return;
    }
	
	//the value undefined will break things. It is not a valid json value.
	//I should verify I handle this consistently through app.
	if(data === undefined) data = null;
    
    this.workingData = hax.util.deepJsonCopy(data);
    this.editOk = editOk;
    
	haxapp.ui.removeAllChildren(this.editorDiv);
	this.editor = new haxapp.jsonedit.JsonEditArea(this.editorDiv,data,editOk);
    
    this.editor.setEditCallback(this.editCallback);
    
    //set the background color
    if(this.editOk) {
        this.editorDiv.style.backgroundColor = "";
    }
    else {
        this.editorDiv.style.backgroundColor = haxapp.app.EditComponentDisplay.NO_EDIT_BACKGROUND_COLOR;
    }
}

