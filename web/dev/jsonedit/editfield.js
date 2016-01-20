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
    
    this.onEdit = null;
    this.onNavigate = null;
    
    //this will be set while the element is being edited
    this.editField = null;
    
    //start editing on a click
    var instance = this;
    this.element.onclick = function() {
		instance.onClick();
	};
}

EditField.prototype.setOnEditCallback= function(onEdit) {
    return this.onEdit = onEdit;
}

EditField.prototype.setNavCallback = function(onNavigate) {
    this.onNavigate = onNavigate;
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

EditField.prototype.setClassName = function(className) {
    this.element.className = className;
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
        
        //select the entry
        this.editField.setSelectionRange(0,this.value.length);
        this.editField.focus();
        
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
        var newValue = this.editField.value;
        if(newValue != this.value) {
            this.value = this.editField.value;     
            this.editField = null;
            this.element.innerHTML = this.value;
            if(this.onEdit) {
                this.onEdit(this.value);
            }
        }
        else {
            this.editField = null;
            this.element.innerHTML = this.value;
        }
    }
}

EditField.DIRECTION_NONE = 0;
EditField.DIRECTION_UP = 1
EditField.DIRECTION_DOWN = 2
EditField.DIRECTION_RIGHT = 3
EditField.DIRECTION_LEFT = 4

EditField.prototype.onKeyPress = function(event) {
    var doExit = false;
    var direction = EditField.DIRECTION_NONE;
    if(event.keyCode == 13) {
console.log("end pressed: " + this.value);
        doExit = true;
        direction = EditField.DIRECTION_DOWN;
	}
    
    if(doExit) {
        this.endEdit();
        if((direction != EditField.DIRECTION_NONE)&&(this.onNavigate)) {
            this.onNavigate(direction);
        }
    }
}

