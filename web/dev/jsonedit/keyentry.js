/** Constructor */
apogeeapp.jsonedit.KeyEntry = function(editArea,parentValue,key,keyType,data,isEditable,isVirtual) {
    this.editArea = editArea;
	this.key = key;
	this.type = keyType; //apogeeapp.jsonedit.EditField.FIELD_TYPE_KEY ro apogeeapp.jsonedit.EditField.FIELD_TYPE_INDEX
	this.data = data;
	this.isEditable = isEditable;
	this.indentLevel = parentValue.getIndentLevel() + 1;
    this.parentValue = parentValue;
    
    //thse are for virtual key entries
    this.isVirtual = isVirtual;
	this.body = null;
    
    //this is the edit control for the key
    this.keyEditObject = null;
    
    this.valueEntry = null;
	
	this.createBody(this.data);
}

//=======================
// Accessors
//=======================

apogeeapp.jsonedit.KeyEntry.prototype.setKey = function(key) {
	this.key = key;
    this.keyEditObject.setValue(key);
}

apogeeapp.jsonedit.KeyEntry.prototype.getInitialKey = function() {
	return this.key;
}

apogeeapp.jsonedit.KeyEntry.prototype.getCurrentKey = function() {
	return this.keyEditObject.getValue();
}

apogeeapp.jsonedit.KeyEntry.prototype.getCurrentValue = function() {
	return this.valueEntry.getCurrentValue();
}

apogeeapp.jsonedit.KeyEntry.prototype.getElement = function() {
	return this.body;
}

apogeeapp.jsonedit.KeyEntry.prototype.getParentValueObject = function() {
	return this.parentValue;
}

apogeeapp.jsonedit.KeyEntry.prototype.getIndentLevel = function() {
	return this.indentLevel;
}

apogeeapp.jsonedit.KeyEntry.prototype.setIsVirtual = function(isVirtual) {
	this.isVirtual = isVirtual;
	this.keyEditObject.setIsVirtual(isVirtual);

    this.valueEntry.setIsVirtual(isVirtual);
}

apogeeapp.jsonedit.KeyEntry.prototype.updateValueElements = function() {
    //remove all from element
	apogeeapp.ui.removeAllChildren(this.body);
    //recreate
    this.formatBody();
}

//=================================
// Others Methods
//=================================

/** This method created the key entry, clearing the old one if applicable.
 * @private */
apogeeapp.jsonedit.KeyEntry.prototype.createBody = function(entryData) {
	
	//create main row
	//create row div
	this.body = document.createElement("div");
	this.body.className = "jsonBody";
    
    //create the key
    this.createKeyElement();
    
    //create value entry
	this.valueEntry = new apogeeapp.jsonedit.ValueEntry(this.editArea,this,entryData,this.isEditable,this.isVirtual);
	
    this.formatBody();
}

/** @private */
apogeeapp.jsonedit.KeyEntry.prototype.formatBody = function() {
	//add indent
	this.body.appendChild(apogeeapp.jsonedit.createIndentElement(this.indentLevel));
	
	//add key
	this.body.appendChild(this.keyEditObject.getElement());
	
    //add the value elements
	var valueElementList = this.valueEntry.getElementList();
    for(var i = 0; i < valueElementList.length; i++) {
        this.body.appendChild(valueElementList[i]);
    }
}

/** This wraps the list elements into the proper format. 
* @private */
apogeeapp.jsonedit.KeyEntry.prototype.createKeyElement = function() {
    
	var isEditable = (this.type === apogeeapp.jsonedit.EditField.FIELD_TYPE_KEY) ? this.isEditable : false;
	
    this.keyEditObject = new apogeeapp.jsonedit.EditField(this.key,this.type,isEditable,this.isVirtual);
    
    //make the edit field editable if it is a key
    if(isEditable) {
        var instance = this;
        var onEdit = function(editValue) {
            if(instance.isVirtual) {
                instance.parentValue.makeVirtualEntryReal();
            }
            
            //notify of edit
            instance.editArea.valueEdited();
        }
        this.keyEditObject.setOnEditCallback(onEdit);
        
        //set the navgation callback
        var navCallback = function(direction) {
            instance.navigateCells(direction);
        }
        this.keyEditObject.setNavCallback(navCallback);
    }
}

//navigation rules
apogeeapp.jsonedit.KeyEntry.prototype.navigateCells = function(direction) {
    if(this.parentValue) {
        this.parentValue.navigateChildren(this,true,direction);
    }
}

/** This loads the context menu for the key. It should be update if
 *the key index changes. */
apogeeapp.jsonedit.KeyEntry.prototype.loadContextMenu = function(parentKeyCount,keyIndex) {

    var instance = this;
    var parentValue = this.parentValue; 
    var element = this.keyEditObject.getElement();
    var valueEntry = this.valueEntry;
    var valueType = valueEntry.getType();
    var isVirtual = this.isVirtual;
    
    element.oncontextmenu = function(event) {
        event.preventDefault();
        event.stopPropagation();
		
		//for now no context menu if nto editable
		if(!instance.isEditable) return;
        
        var contextMenu = new apogeeapp.ui.MenuBody();
        
        if(!isVirtual) {
            //insert elements
            contextMenu.addCallbackMenuItem("Insert Above",function() {parentValue.insertElement("","",keyIndex);});
            contextMenu.addCallbackMenuItem("Insert Below",function() {parentValue.insertElement("","",keyIndex+1);});

            if(keyIndex > 0) {
                contextMenu.addCallbackMenuItem("Move Up",function() {parentValue.moveChildKeyToNextIndex(keyIndex-1);});
            }
            if(keyIndex < parentKeyCount - 1) {
                contextMenu.addCallbackMenuItem("Move Down",function() {parentValue.moveChildKeyToNextIndex(keyIndex);});
            }

            //delete elements
            if(!instance.isVirtual) {
                contextMenu.addCallbackMenuItem("Delete Entry",function() {parentValue.deleteChildElement(instance);});
            }

            //conversions
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
    
    //if this is a value entry, set the same context menu on the value element
    if(valueType == "value") {
        var valueEditObject = this.valueEntry.getValueEditObject();
        valueEditObject.getElement().oncontextmenu = element.oncontextmenu;
    }
  
}

//======================================
// Actions
//======================================

apogeeapp.jsonedit.KeyEntry.prototype.convertToKeyType = function(key) {
    if(this.type == apogeeapp.jsonedit.EditField.FIELD_TYPE_KEY) return;
    
    this.type = apogeeapp.jsonedit.EditField.FIELD_TYPE_KEY;
    this.key = String(key);
    
    //create the key
    this.createKeyElement();
    
    //remove and reset all from element
	apogeeapp.ui.removeAllChildren(this.body);
    this.formatBody();
}

apogeeapp.jsonedit.KeyEntry.prototype.convertToIndexType = function(index) {
    if(this.type == apogeeapp.jsonedit.EditField.FIELD_TYPE_INDEX) return;
    
    this.type = apogeeapp.jsonedit.EditField.FIELD_TYPE_INDEX;
    this.key = index;
    
    //create the key
    this.createKeyElement();
    
    //remove and reset all from element
    apogeeapp.ui.removeAllChildren(this.body);
    this.formatBody();
}


