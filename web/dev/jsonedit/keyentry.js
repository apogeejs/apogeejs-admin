
function KeyEntry(parentValue,key,keyType,data,isVirtual) {
	this.key = key;
	this.type = keyType; //"key" or "index"
	this.data = data;
	this.indentLevel = parentValue.getIndentLevel() + 1;
    this.parentValue = parentValue;
    
    //thse are for virtual key entries
    this.isVirtual = isVirtual;
	this.body = null;
    
    //this is the edit control for the key
    this.keyEditObject = null;
	
	this.createBody(this.data);
}

KeyEntry.prototype.setKey = function(key) {
	this.key = key;
    this.keyEditObject.setValue(key);
}

KeyEntry.prototype.getInitialKey = function() {
	return this.key;
}

KeyEntry.prototype.getCurrentKey = function() {
	return this.keyEditObject.getValue();
}

KeyEntry.prototype.getCurrentValue = function() {
	return this.valueEntry.getCurrentValue();
}

KeyEntry.prototype.getElement = function() {
	return this.body;
}

KeyEntry.prototype.getParentValueObject = function() {
	return this.parentValue;
}

KeyEntry.prototype.getIndentLevel = function() {
	return this.indentLevel;
}

KeyEntry.prototype.createBody = function(entryData) {
	
	//create main row
	//create row div
	this.body = document.createElement("div");
	this.body.className = "jsonBody";
    
    //create the key
    this.createKeyElement();
    
    //create value entry
	this.valueEntry = new ValueEntry(this,entryData,this.isVirtual);
	
    this.formatBody();
}

/** This wraps the list elements into the proper format. 
* @private */
KeyEntry.prototype.createKeyElement = function() {
    
    this.keyEditObject = util.createKeyElement(this.key,this.type,this.isVirtual);
    
    //make the edit field editable if it is a key
    if((this.type == "key")&&(this.isVirtual)) {
        var instance = this;
        var onCompleteCallback = function(editValue) {
            //create a new element with this key
            instance.parentValue.insertElement(editValue,"");
            //clear the data from the virtual entry
            instance.keyEditObject.setValue("");
        }
        this.keyEditObject.setOnCompleteCallback(onCompleteCallback);
    }
}

KeyEntry.prototype.formatBody = function() {
	//add indent
	this.body.appendChild(util.createIndentElement(this.indentLevel));
	
	//add key
	this.body.appendChild(this.keyEditObject.getElement());
	
	var valueElementList = this.valueEntry.getElementList();
    for(var i = 0; i < valueElementList.length; i++) {
        this.body.appendChild(valueElementList[i]);
    }
}

/** This loads the context menu for the key. It should be update if
 *the key index changes. */
KeyEntry.prototype.loadContextMenu = function(parentKeyCount,keyIndex) {

    var instance = this;
    var parentValue = this.parentValue; 
    var element = this.keyEditObject.getElement();
    var valueEntry = this.valueEntry;
    var valueType = valueEntry.getType();
    
    element.oncontextmenu = function(event) {
        event.preventDefault();
        event.stopPropagation();
        
        var contextMenu = new visicomp.visiui.MenuBody();
        
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
        }
        else if(valueType == "object") {
            contextMenu.addCallbackMenuItem("Convert To Value",function() {valueEntry.convertToValue()});
            contextMenu.addCallbackMenuItem("Convert To Array",function() {valueEntry.objectToArray()});
        }
        else if(valueType == "array") {
            contextMenu.addCallbackMenuItem("Convert To Value",function() {valueEntry.convertToValue()});
            contextMenu.addCallbackMenuItem("Convert To Object",function() {valueEntry.arrayToObject()});
        }
        
        visicomp.visiui.Menu.showContextMenu(contextMenu,event);
    }
    
    //if this is a value entry, set the same context menu on the value element
    if(valueType == "value") {
        var valueEditObject = this.valueEntry.getValueEditObject();
        valueEditObject.getElement().oncontextmenu = element.oncontextmenu;
    }
  
}

KeyEntry.prototype.convertToKeyType = function(key) {
    if(this.type == "key") return;
    
    this.type = "key";
    this.key = String(key);
    
    //create the key
    this.createKeyElement();
    
    //remove and reset all from element
    this.body.innerHTML = "";
    this.formatBody();
}

KeyEntry.prototype.convertToIndexType = function(index) {
    if(this.type == "index") return;
    
    this.type = "index";
    this.key = index;
    
    //create the key
    this.createKeyElement();
    
    //remove and reset all from element
    this.body.innerHTML = "";
    this.formatBody();
}

KeyEntry.prototype.updateValueElements = function() {
    //remove all from element
    this.body.innerHTML = "";
    //recreate
    this.formatBody();
}


