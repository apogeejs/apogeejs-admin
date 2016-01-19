/** This is an edit field. If an overide change callback is added
 * it will be called after an edit and the value of this field will
 * be returned to the previous value. Otherwise, the value of the field
 * fill be updated to match the edit.
 */
function EditField(value,className) {
    this.value = value;
    this.element = document.createElement("div");
    this.element.className = className;
    this.element.innerHTML = value;
    
    this.onCompleteCallback = null;
    
    //this will be set while the element is being edited
    this.editField = null;
    
    //start editing on a click
    var instance = this;
    this.element.onclick = function() {
		instance.onClick();
	};
}

EditField.prototype.setOnCompleteCallback= function(onCompleteCallback) {
    return this.onCompleteCallback = onCompleteCallback;
}

EditField.prototype.getValue= function() {
    return this.value;
}

EditField.prototype.setValue = function(value) {
    this.value = value;
    if(this.editField) {
        this.editField.value = value;
    }
    this.element.innerHTML = value;
}

EditField.prototype.getElement = function() {
    return this.element;
}

EditField.prototype.onClick = function() {
    if(!this.editField) {
        this.startEdit();
    }
 
}

EditField.prototype.startEdit = function() {
    if(!this.editField) {
        this.editField = document.createElement("input");
		this.editField.type = "text";
		if(this.value !== undefined) {
			this.editField.value = this.value;
		}
		
        this.element.innerHTML = "";
        this.element.appendChild(this.editField);
        
        //event handlers to end edit
        var instance = this;
        this.editField.onblur = function() {
            instance.endEdit();
        };
        this.editField.onkeypress = function(event) {
            instance.onKeyPress(event);
        };
    }
}

EditField.prototype.endEdit = function() {
    if(this.editField) {
        this.value = this.editField.value;     
        this.editField = null;
        this.element.innerHTML = this.value;
        
        if(this.onCompleteCallback) {
            this.onCompleteCallback(this.value);
        }
    }
}

EditField.prototype.onKeyPress = function(event) {
    if(event.keyCode == 13) {
        this.endEdit();
	}
}

