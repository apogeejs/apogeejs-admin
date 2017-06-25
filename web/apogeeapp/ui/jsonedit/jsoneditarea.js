
apogeeapp.jsonedit.JsonEditArea = function(divElement,initialValue,isEditable) {
    this.body = divElement;
	this.isEditable = isEditable;
	
	//undefined is not a valid json value and will screw things up
	if(initialValue === undefined) {
		initialValue = "";
	}
    
	this.valueEntry = new apogeeapp.jsonedit.ValueEntry(this,this,initialValue,this.isEditable);
    this.valueEntry.setExpanded(true);
 
	this.formatBody();
}

apogeeapp.jsonedit.JsonEditArea.prototype.setEditCallback = function(editCallback) {
	this.editCallback = editCallback;
}

apogeeapp.jsonedit.JsonEditArea.prototype.getCurrentValue = function() {
	return this.valueEntry.getCurrentValue();
}

apogeeapp.jsonedit.JsonEditArea.prototype.getElement = function() {
	return this.body;
}

apogeeapp.jsonedit.JsonEditArea.prototype.getParentValueObject = function() {
	return undefined;
}

apogeeapp.jsonedit.JsonEditArea.prototype.getIndentLevel = function() {
	return 0;
}

apogeeapp.jsonedit.JsonEditArea.prototype.formatBody = function() {
    var elementList = this.valueEntry.getElementList();
    for(var i = 0; i < elementList.length; i++) {
        this.body.appendChild(elementList[i]);
    }
    
    this.loadContextMenu();
}


apogeeapp.jsonedit.JsonEditArea.prototype.loadContextMenu = function() {

    var instance = this;
    var element = this.body;
    var valueEntry = this.valueEntry;
    var valueType = valueEntry.getType();
    element.oncontextmenu = function(event) {
        event.preventDefault();
        event.stopPropagation();
        
        var contextMenu = new apogeeapp.ui.MenuBody();
        
        contextMenu.addCallbackMenuItem("Get Value",function() {alert(JSON.stringify(valueEntry.getCurrentValue()));});
        
		if(instance.isEditable) {
			if(valueType == "value") {
				contextMenu.addCallbackMenuItem("Convert To Object",function() {valueEntry.valueToObject()});
				contextMenu.addCallbackMenuItem("Convert To Array",function() {valueEntry.valueToArray()});
				
				  if(valueEntry.convertibleToNumber()) {
                    contextMenu.addCallbackMenuItem("Convert To Number",function() {valueEntry.valueToNonString()});
                }

                if(valueEntry.convertibleToBool()) {
                    contextMenu.addCallbackMenuItem("Convert To Boolean",function() {valueEntry.valueToNonString()});
                }

                if(valueEntry.convertibleToNull()) {
                    contextMenu.addCallbackMenuItem("Convert To Null",function() {valueEntry.valueToNonString()});
                }

                if(valueEntry.convertibleToString()) {
                    contextMenu.addCallbackMenuItem("Convert To String",function() {valueEntry.valueToString()});
                }
			}
			else if(valueType == "object") {
				contextMenu.addCallbackMenuItem("Convert To Value",function() {valueEntry.convertToValue()});
				contextMenu.addCallbackMenuItem("Convert To Array",function() {valueEntry.objectToArray()});
			}
			else if(valueType == "array") {
				contextMenu.addCallbackMenuItem("Convert To Value",function() {valueEntry.convertToValue()});
				contextMenu.addCallbackMenuItem("Convert To Object",function() {valueEntry.arrayToObject()});
			}
		}
        
        apogeeapp.ui.Menu.showContextMenu(contextMenu,event);
    }
  
}

apogeeapp.jsonedit.JsonEditArea.prototype.updateValueElements = function() {
    //remove all from element
	apogeeapp.ui.removeAllChildren(this.body);
    //recreate
    this.formatBody();
}

/** This methd is called internally when an edit takes place in the edit are. 
 * @private */
apogeeapp.jsonedit.JsonEditArea.prototype.valueEdited = function() {
    if(this.editCallback) {
        this.editCallback();
    }
}




