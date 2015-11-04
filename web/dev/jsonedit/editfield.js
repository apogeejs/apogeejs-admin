
function EditField(value,className) {
    this.value = value;
    this.element = document.createElement("div");
    this.element.className = className;
    this.element.innerHTML = value;
    
    //this will be set while the element is being edited
    this.editField = null;
    
    //start editing on a click
    var instance = this;
    this.element.onclick = function() {
		instance.onClick();
	};
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
		if(this.value !== null) {
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
        if(this.value === undefined) {
            //we need to turn this into a real row
            //LATER
//            //real row - update value
//            cellEntry.entryData = {};
//            cellEntry.entryData.key = undefined;
//            cellEntry.entryCell.entryCell = "valueCell";
//            cellEntry.entryCell.keyCell = "keyCell";
//
//            //add the new entry
//            var parent = cellEntry.parent;
//            parent.data.entries.push(cellEntry.entryData);
//
//            //add a new virtual row
//            var virtualCellEntry = {};
//            virtualCellEntry.parent = parent;
//            insertEntryRow(parent.entryTable,virtualCellEntry);
//            parent.rows.push(virtualCellEntry);

        }
        
        //store the new value
        this.value = this.editField.value;
        this.editField = null;
        this.element.innerHTML = this.value;
    }
}

EditField.prototype.onKeyPress = function(event) {
    if(event.keyCode == 13) {
        this.endEdit();
	}
}

