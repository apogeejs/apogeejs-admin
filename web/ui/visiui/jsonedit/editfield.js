/** This is an edit field. If an overide change callback is added
 * it will be called after an edit and the value of this field will
 * be returned to the previous value. Otherwise, the value of the field
 * fill be updated to match the edit.
 */
visicomp.jsonedit.EditField = function (value,fieldType,isEditable,isVirtual) {
	this.fieldType = fieldType;
	this.isEditable = isEditable;
	this.isVirtual = isVirtual;
	
    this.element = document.createElement("div");
       
    this.onEdit = null;
    this.onNavigate = null;
    
    //this will be set while the element is being edited
    this.editField = null;
    
    //start editing on a click
    var instance = this;
    this.element.onclick = function() {
		instance.onClick();
	};
   
    this.setValue(value);
}

visicomp.jsonedit.EditField.FIELD_TYPE_VALUE = "value";
visicomp.jsonedit.EditField.FIELD_TYPE_KEY = "key";
visicomp.jsonedit.EditField.FIELD_TYPE_INDEX = "index";

visicomp.jsonedit.EditField.prototype.setOnEditCallback= function(onEdit) {
    return this.onEdit = onEdit;
}

visicomp.jsonedit.EditField.prototype.setNavCallback = function(onNavigate) {
    this.onNavigate = onNavigate;
}

visicomp.jsonedit.EditField.prototype.setIsVirtual = function(isVirtual) {
    this.isVirtual = isVirtual;
	this.setCssClass();
}

visicomp.jsonedit.EditField.prototype.getValue= function() {
    return this.value;
}

visicomp.jsonedit.EditField.prototype.setValue = function(value) {
	
	if(value === undefined) {
		value = null;
		console.log("The value undefined is not valid for a JSON. It has been converted to null.");
	}
	
    this.value = value;
    this.isString = (visicomp.jsonedit.getValueType(value) === "string");
	this.setCssClass();

	//display value (with one exception - show "null" for null value
	if(value === null) {
		this.element.innerHTML = "null"
	}
	else {
		this.element.innerHTML = value;
	}
}

/** @private */
visicomp.jsonedit.EditField.prototype.setCssClass = function() {
	var cssName = "cell_" + this.fieldType;
	if(this.isVirtual) {
		cssName += "_virtual";
	}
	else if(this.fieldType === "value") {
		if(this.isString) {
			cssName += "_string";
		}
		else {
			cssName += "_nonstring";
		}
	}
	
	this.element.className = cssName;
}

visicomp.jsonedit.EditField.prototype.getElement = function() {
    return this.element;
}

visicomp.jsonedit.EditField.prototype.onClick = function() {
    if((this.isEditable)&&(!this.editField)) {
        this.startEdit();
    }
 
}

visicomp.jsonedit.EditField.prototype.startEdit = function() {
    if(!this.editField) {
        this.editField = document.createElement("input");
		this.editField.type = "text";
		if(this.value !== undefined) {
			this.editField.value = this.value;
		}
		
		visicomp.core.util.removeAllChildren(this.element);
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

//value output conversion rules
// - if the initial value was a non-string or an empty string, try to convert the contents of the edit cell to a non-string
// - otherwise keep the value as a string when it is loaded from the edit field

visicomp.jsonedit.EditField.prototype.endEdit = function() {
    if(this.editField) {
        var newValue = this.editField.value;
        if(newValue != this.value) {
            //read the value, in the appropriate format
            var editStringValue = this.editField.value;
            var editValue;
            if((!this.isString)||(this.value === "")) {
				//try to convert to a number if the original value was a number if it was an empty string
                if(visicomp.jsonedit.canBeConvertedToNonString(editStringValue)) {
                    editValue = visicomp.jsonedit.stringToNonString(editStringValue);
                }
                else {
                    editValue = editStringValue;
                }
            }
            else {
                editValue = editStringValue;
            }
            
            this.editField = null;
            this.setValue(editValue);
            
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

visicomp.jsonedit.EditField.DIRECTION_NONE = 0;
visicomp.jsonedit.EditField.DIRECTION_UP = 1;
visicomp.jsonedit.EditField.DIRECTION_DOWN = 2;
visicomp.jsonedit.EditField.DIRECTION_RIGHT = 3;
visicomp.jsonedit.EditField.DIRECTION_LEFT = 4;
visicomp.jsonedit.EditField.DIRECTION_NEXT = 5;
visicomp.jsonedit.EditField.DIRECTION_PREV = 6;

visicomp.jsonedit.EditField.ENTER_KEY = 13;
visicomp.jsonedit.EditField.TAB_KEY = 9;
visicomp.jsonedit.EditField.UP_KEY = 38;
visicomp.jsonedit.EditField.DOWN_KEY = 40;
visicomp.jsonedit.EditField.RIGHT_KEY = 39;
visicomp.jsonedit.EditField.LEFT_KEY = 37;

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


visicomp.jsonedit.EditField.prototype.onKeyDown = function(event) {
    var doExit = false;
    var direction = visicomp.jsonedit.EditField.DIRECTION_NONE;
    var cancelDefault = false;
    if(event.keyCode == visicomp.jsonedit.EditField.ENTER_KEY) {
        //next or prev, based on shift key
        doExit = true;
        direction = event.shiftKey ? visicomp.jsonedit.EditField.DIRECTION_PREV : visicomp.jsonedit.EditField.DIRECTION_NEXT;
        cancelDefault = true;
	}
    else if(event.keyCode == visicomp.jsonedit.EditField.TAB_KEY) {
        //next or prev, based on shift key
        doExit = true;
        direction = event.shiftKey ? visicomp.jsonedit.EditField.DIRECTION_PREV : visicomp.jsonedit.EditField.DIRECTION_NEXT;
        cancelDefault = true;
    }
    else if(event.keyCode == visicomp.jsonedit.EditField.UP_KEY) {
        doExit = true;
        direction = visicomp.jsonedit.EditField.DIRECTION_UP;
        cancelDefault = true;
    }
    else if(event.keyCode == visicomp.jsonedit.EditField.DOWN_KEY) {
        doExit = true;
        direction = visicomp.jsonedit.EditField.DIRECTION_DOWN;
        cancelDefault = true;
    }
    else if(event.keyCode == visicomp.jsonedit.EditField.RIGHT_KEY) {
        if(this.cursorAtEndOfEditField()) {
            doExit = true;
            direction = visicomp.jsonedit.EditField.DIRECTION_RIGHT;
            cancelDefault = true;
        }
    }
    else if(event.keyCode == visicomp.jsonedit.EditField.LEFT_KEY) {
        if(this.cursorAtStartOfEditField()) {
            doExit = true;
            direction = visicomp.jsonedit.EditField.DIRECTION_LEFT;
            cancelDefault = true;
        }
    }
    
    if(cancelDefault) {
        event.preventDefault();
        event.stopPropagation();
    }
    
    if(doExit) {
        this.endEdit();
        if((direction != visicomp.jsonedit.EditField.DIRECTION_NONE)&&(this.onNavigate)) {
            this.onNavigate(direction);
        }
    }
}

visicomp.jsonedit.EditField.prototype.cursorAtStartOfEditField = function() {
    return ((this.editField.selectionStart == 0)&&(this.editField.selectionEnd == 0));
}

visicomp.jsonedit.EditField.prototype.cursorAtEndOfEditField = function() {
    var length = String(this.editField.value).length;
    return ((this.editField.selectionStart == length)&&(this.editField.selectionEnd == length));
}