/** Editor that uses json edit area
 * 
 * @param {type} onSave - should take a json object that should be saved.
 */
hax.app.visiui.JsonFormEditor = function(onSave) {
	
	this.editorDiv = hax.visiui.createElement("div",null,{
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

hax.app.visiui.JsonFormEditor.prototype.getElement = function() {
	return this.editorDiv;
}

hax.app.visiui.JsonFormEditor.prototype.showData = function(data,editOk) {
    if((data === this.workingData)&&(this.editOk === editOk)) {
        //no need to update
        return;
    }
	
	//the value undefined will break things. It is not a valid json value.
	//I should verify I handle this consistently through app.
	if(data === undefined) data = null;
    
    this.workingData = hax.core.util.deepJsonCopy(data);
    this.editOk = editOk;
    
	hax.core.util.removeAllChildren(this.editorDiv);
	this.editor = new hax.jsonedit.JsonEditArea(this.editorDiv,data,editOk);
    
    this.editor.setEditCallback(this.editCallback);
    
    //set the background color
    if(this.editOk) {
        this.editorDiv.style.backgroundColor = "";
    }
    else {
        this.editorDiv.style.backgroundColor = hax.app.visiui.TableEditComponent.NO_EDIT_BACKGROUND_COLOR;
    }
}

