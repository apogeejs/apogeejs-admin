
function KeyEntry(key,keyType,data,indentLevel,isVirtual,parentValue) {
	this.key = key;
	this.type = keyType; //"key" or "index"
	this.data = data;
	this.indentLevel = indentLevel;
    
    //thse are for virtual key entries
    this.isVirtual = isVirtual;
    this.parentValue = parentValue;
	
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

KeyEntry.prototype.createBody = function(entryData) {
	
	//create main row
	//create row div
	this.body = document.createElement("div");
	this.body.className = "jsonBody";
    
    //create the key
    this.keyEditObject = util.createKeyElement(this.key,this.type,this.isVirtual,this.parentValue);
    
    //create value entry
	this.valueEntry = new ValueEntry(this,entryData,this.indentLevel + 1,this.isVirtual,this.parentValue);
	
    this.formatBody();
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
    
    this.loadContextMenu();
    
}

KeyEntry.prototype.loadContextMenu = function() {

    var instance = this;
    var element = this.keyEditObject.getElement();
    var valueEntry = this.valueEntry;
    var valueType = valueEntry.getType();
    element.oncontextmenu = function(event) {
        event.preventDefault();
        event.stopPropagation();
        
        var contextMenu = new visicomp.visiui.MenuBody();
        contextMenu.addCallbackMenuItem("Value",function() {alert(instance.getCurrentValue());});
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
  
}

KeyEntry.prototype.convertToKeyType = function(key) {
    if(this.type == "key") return;
    
    this.type = "key";
    this.key = String(key);
    
    //create the key
    this.keyEditObject = util.createKeyElement(this.key,this.type,this.isVirtual,this.parentValue);
    
    //remove and reset all from element
    this.body.innerHTML = "";
    this.formatBody();
}

KeyEntry.prototype.convertToIndexType = function(index) {
    if(this.type == "index") return;
    
    this.type = "index";
    this.key = index;
    
    //create the key
    this.keyEditObject = util.createKeyElement(this.key,this.type,this.isVirtual,this.parentValue);
    
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


