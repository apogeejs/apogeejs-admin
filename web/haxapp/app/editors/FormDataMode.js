
haxapp.app.FormDataMode = function(componentDisplay) {
	haxapp.app.ViewMode.call(this,componentDisplay,true);	
}

haxapp.app.FormDataMode.prototype = Object.create(haxapp.app.ViewMode.prototype);
haxapp.app.FormDataMode.prototype.constructor = haxapp.app.FormDataMode;

haxapp.app.FormDataMode.prototype.showData = function() {
		
	var json = this.member.getData();	
	
    if(!this.editor) {
        this.editor = new haxapp.app.JsonFormEditor(this);
    }
	this.editor.showData(json,this.getIsDataEditable());
}

//==============================
// internal
//==============================

haxapp.app.FormDataMode.prototype.onSave = function(data) {
    
    var actionData = {};
    actionData.action = "updateData";
    actionData.member = this.member;
    actionData.data = data;
	var actionResponse =  hax.action.doAction(this.member.getWorkspace(),actionData);
	
	return true;
}

