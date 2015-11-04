
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
	
	this.createBody();
}

KeyEntry.prototype.setKey = function(key) {
	this.key = key;
    this.keyEditObject.setValue(key);
}

KeyEntry.prototype.getkey = function() {
	return this.key;
}

KeyEntry.prototype.getElement = function() {
	return this.body;
}

KeyEntry.prototype.createBody = function() {
    
	//create value entry
	this.valueEntry = new ValueEntry(this.data,this.indentLevel + 1,this.isVirtual,this.parentValue);
	
	//create main row
	//create row div
	this.body = document.createElement("div");
	this.body.className = "jsonBody";
	
	//add indent
	this.body.appendChild(util.createIndentElement(this.indentLevel));
	
	//add key
    this.keyEditObject = util.createKeyElement(this.key,this.type,this.isVirtual,this.parentValue);
	this.body.appendChild(this.keyEditObject.getElement());
	
	var valueElementList = this.valueEntry.getElementList();
    for(var i = 0; i < valueElementList.length; i++) {
        this.body.appendChild(valueElementList[i]);
    }
    
}


