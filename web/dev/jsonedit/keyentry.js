
function KeyEntry(key,keyType,data,indentLevel) {
	this.key = key;
	this.type = keyType; //"key" or "index"
	this.data = data;
	this.indentLevel = indentLevel;
	
	this.body = null;
    //this is the edit control for the key
    this.keyElement = null;
	
	this.createBody();
}

KeyEntry.prototype.getElement = function() {
	return this.body;
}

KeyEntry.prototype.createBody = function() {
	//create value entry
	this.valueEntry = new ValueEntry(this.data,this.indentLevel + 1);
	
	//create main row
	//create row div
	this.body = document.createElement("div");
	this.body.className = "jsonBody";
	
	//add indent
	this.body.appendChild(util.createIndentElement(this.indentLevel));
	
	//add key
    this.keyEditObject = util.createKeyElement(this.key,this.type)
	this.body.appendChild(this.keyEditObject.getElement());
	
	var valueElementList = this.valueEntry.getElementList();
    for(var i = 0; i < valueElementList.length; i++) {
        this.body.appendChild(valueElementList[i]);
    }
    
}


