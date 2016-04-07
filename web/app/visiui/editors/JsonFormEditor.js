/** Editor that uses json edit area
 * 
 * @param {type} onSave - should take a json object that should be saved.
 */
visicomp.app.visiui.JsonFormEditor = function(onSave) {
	
	this.editorDiv = visicomp.visiui.createElement("div",null,{
		"position":"absolute",
        "top":"0px",
        "left":"0px",
		"bottom":"0px",
        "right":"0px",
		"overflow":"auto"
	});
    
    this.workingData = null;
	this.editOk = false;
	
	this.editor = null;

	var instance = this;
	this.editCallback = function() {
        var currentData = instance.editor.getCurrentValue();
        instance.workingData = currentData;
        onSave(currentData);
    }
}

visicomp.app.visiui.JsonFormEditor.prototype.getElement = function() {
	return this.editorDiv;
}

visicomp.app.visiui.JsonFormEditor.prototype.showData = function(data,editOk) {
    if((data === this.workingData)&&(this.editOk === editOk)) {
        //no need to update
        return;
    }
    
    this.workingData = visicomp.core.util.deepCopy(data);
    this.editOk = editOk;
    
	visicomp.core.util.removeAllChildren(this.editorDiv);
	this.editor = new visicomp.jsonedit.JsonEditArea(this.editorDiv,data,editOk);
    
    this.editor.setEditCallback(this.editCallback);
}

