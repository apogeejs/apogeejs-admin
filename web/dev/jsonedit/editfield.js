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
        this.editField.setSelectionRange(0,String(this.value).length);
        this.editField.focus();
        
        //event handlers to end edit
        var instance = this;
        this.editField.onblur = function() {
            instance.endEdit();
        };
        this.editField.onkeydown = function(event) {
            instance.onKeyDown(event);
        };
    }
}

//console.log("--------------------");
//console.log(this.editField.selectionStart + " " + this.editField.selectionEnd);

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
EditField.DIRECTION_UP = 1;
EditField.DIRECTION_DOWN = 2;
EditField.DIRECTION_RIGHT = 3;
EditField.DIRECTION_LEFT = 4;
EditField.DIRECTION_NEXT = 5;
EditField.DIRECTION_PREV = 6;

EditField.ENTER_KEY = 13;
EditField.TAB_KEY = 9;
EditField.UP_KEY = 38;
EditField.DOWN_KEY = 40;
EditField.RIGHT_KEY = 39;
EditField.LEFT_KEY = 37;

//navigation rules:
//- tab/enter and shift tab/enter go to the next and previous active field
//This visits only values on array and both keys and values on object
//- right goes from key to value (object only) if it is in the last selection spot
//- left goes from value to key (object only) if it is in the first selection spot
//- up goes to the same element (key or value) in the previous entry
//- down goes to the same element (key or value) in the next entry
//- navigation only happens when the field is a editable key or a simple value. If
//the entry is an array or object, we do not go there.
//- any time we don not go to the given field, we go nowhere, ending navigation
//- when we enter a field through navigation or click, it should select the entire field.




EditField.prototype.onKeyDown = function(event) {
    var doExit = false;
    var direction = EditField.DIRECTION_NONE;
    var cancelDefault = false;
    if(event.keyCode == EditField.ENTER_KEY) {
        //next or prev, based on shift key
        doExit = true;
        direction = event.shiftKey ? EditField.DIRECTION_PREV : EditField.DIRECTION_NEXT;
        cancelDefault = true;
	}
    else if(event.keyCode == EditField.TAB_KEY) {
        //next or prev, based on shift key
        doExit = true;
        direction = event.shiftKey ? EditField.DIRECTION_PREV : EditField.DIRECTION_NEXT;
        cancelDefault = true;
    }
    else if(event.keyCode == EditField.UP_KEY) {
        doExit = true;
        direction = EditField.DIRECTION_UP;
        cancelDefault = true;
    }
    else if(event.keyCode == EditField.DOWN_KEY) {
        doExit = true;
        direction = EditField.DIRECTION_DOWN;
        cancelDefault = true;
    }
    else if(event.keyCode == EditField.RIGHT_KEY) {
        if(this.cursorAtEndOfEditField()) {
            doExit = true;
            direction = EditField.DIRECTION_RIGHT;
            cancelDefault = true;
        }
    }
    else if(event.keyCode == EditField.LEFT_KEY) {
        if(this.cursorAtStartOfEditField()) {
            doExit = true;
            direction = EditField.DIRECTION_LEFT;
            cancelDefault = true;
        }
    }
    
    if(cancelDefault) {
        event.preventDefault();
        event.stopPropagation();
    }
    
    if(doExit) {
        this.endEdit();
        if((direction != EditField.DIRECTION_NONE)&&(this.onNavigate)) {
            this.onNavigate(direction);
        }
    }
}

EditField.prototype.cursorAtStartOfEditField = function() {
    return ((this.editField.selectionStart == 0)&&(this.editField.selectionEnd == 0));
}

EditField.prototype.cursorAtEndOfEditField = function() {
    var length = String(this.editField.value).length;
    return ((this.editField.selectionStart == length)&&(this.editField.selectionEnd == length));
}