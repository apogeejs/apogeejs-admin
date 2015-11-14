/**  This a value entry
 * 
 * notes:
 * - parent is the obgject that holds the dom elements for this value. it will be
 * either the key for this value or the top level entry. It should have a method
 * "updateValueElements" that will refresh the elements if they have been updated.
 */
function ValueEntry(parent,data,indentLevel,isVirtual,parentValue) {
	this.parent = parent;
    this.data = data;
	this.type = util.getObjectType(data); //"value", "object", "array"
	this.indentLevel = indentLevel;
    
    //thse are for virtual key entries. Parent value is the value that holds the parent key
    this.isVirtual = isVirtual;
    this.parentValue = parentValue;
    
    //for value types ---
    
    //these are the edit elements
    this.valueEditObject = null;
    
    //---------------------
    
    //for list types ----
	
	//these are the child keys
    this.childKeyEntries = [];
	
    //this is the singel element for the list entries (if applicable)
	this.listDiv = null;
    
    //these are all the display elements
    this.elementList = [];
    
    //this is the virtual child key
    this.virtualChildKey = null;
    
    //this is used to control expanding and collapsing
    this.isExpanded = false;
	this.expandedList = [];
	this.contractedList = [];
    
    //-------------------
	
	this.createElements(this.data);
}

ValueEntry.prototype.getInitialValue = function() {
    return this.data;
}

ValueEntry.prototype.getCurrentValue = function() {
	var value;
    var i;
    var keyEntry;
    if(this.type == "value") {
        //create a simple element
        value = this.valueEditObject.getValue();
    }
    else if(this.type == "object") {
        value = {};
        for(i = 0; i < this.childKeyEntries.length; i++) {
            keyEntry = this.childKeyEntries[i];
            value[keyEntry.getCurrentKey()] = keyEntry.getCurrentValue();
        }
    }
    else if(this.type == "array") {
        value = [];
        for(i = 0; i < this.childKeyEntries.length; i++) {
            keyEntry = this.childKeyEntries[i];
            value[i] = keyEntry.getCurrentValue();
        }
    }
    return value;
}

ValueEntry.prototype.getType = function() {
	return this.type;
}

ValueEntry.prototype.setExpanded = function(isExpanded) {
	this.isExpanded = isExpanded;
    this.doExpandContract();
}

ValueEntry.prototype.getElementList = function() {
	return this.elementList;
}

ValueEntry.prototype.createElements = function(elementsData) {
	//initialize data elements
    this.valueEditObject = null;
    this.childKeyEntries = [];
	this.virtualChildKey = null;
	this.elementList = [];
	
	//populate data
    if(this.type == "value") {
        //create the value element
        this.createValueElement(elementsData,this.isVirtual,this.parentValue);
		
		//clear the list elements
		this.listDiv = null;
		this.contractedList = null;
		this.expandedList = null;
    }
    else {
        //create the child keys for the object or array
        var childKeyEntry;
        if(this.type == "object") { 
            
            for(var key in elementsData) {
                childKeyEntry = new KeyEntry(key,"key",elementsData[key],this.indentLevel + 1);
                this.childKeyEntries.push(childKeyEntry);
            }
            
            //add a dummy entry
            childKeyEntry = new KeyEntry("","key","",this.indentLevel + 1,true,this);
            this.virtualChildKey = childKeyEntry;
        }
        else if(this.type == "array") {
            
            for(var i = 0; i < elementsData.length; i++) {
                childKeyEntry = new KeyEntry(i,"index",elementsData[i],this.indentLevel + 1);
                this.childKeyEntries.push(childKeyEntry);
            }
            
            //add a dummy entry
            childKeyEntry = new KeyEntry(i,"index","",this.indentLevel + 1,true,this);
            this.virtualChildKey = childKeyEntry;
        }
        
        this.formatList();
    }
}

/** This wraps the list elements into the proper format. 
* @private */
ValueEntry.prototype.createValueElement = function(data,isVirtual,parentValue) {

    //create a simple element
    this.valueEditObject = util.createValueElement(data,isVirtual,parentValue);
    var element = this.valueEditObject.getElement();
    this.elementList.push(element);
    
    this.loadValueElementContextMenu(element); 
}

ValueEntry.prototype.loadValueElementContextMenu = function(element) {

    var instance = this;    
    element.oncontextmenu = function(event) {
        var contextMenu = new visicomp.visiui.MenuBody();
        contextMenu.addCallbackMenuItem("Convert To Object",function() {instance.valueToObject()});
        contextMenu.addCallbackMenuItem("Convert To Array",function() {instance.valueToArray()}); 
        visicomp.visiui.Menu.showContextMenu(contextMenu,event);
    }
}

/** This wraps the list elements into the proper format. 
* @private */
ValueEntry.prototype.formatList = function() {

    //initialize elements
	this.listDiv = document.createElement("div");
    this.elementList = [];
    this.contractedList = [];
    this.expandedList = [];
    
    var startDelimiter;
    var endDelimiter1;
    var endDelimiter2;
    var endIndent = util.createIndentElement(this.indentLevel);

	//list element
	var childKeyEntry;
	for(var i = 0; i < this.childKeyEntries.length; i++) {
		childKeyEntry = this.childKeyEntries[i];
		this.listDiv.appendChild(childKeyEntry.getElement());
	}
	if(this.virtualChildKey) {
		this.listDiv.appendChild(this.virtualChildKey.getElement());
	}

    //buttons
    var expandButton = util.createExpandButton(this);
    var contractButton = util.createContractButton(this);

    if(this.type == "object") { 
        startDelimiter = util.createObjectDelimiter("{");
        endDelimiter1 = util.createObjectDelimiter("}");
        endDelimiter2 = util.createObjectDelimiter("}");
    }
    else if(this.type == "array") {
        startDelimiter = util.createObjectDelimiter("[");
        endDelimiter1 = util.createObjectDelimiter("]");
        endDelimiter2 = util.createObjectDelimiter("]");
    }

    //save the elements
    //shared
    this.elementList.push(startDelimiter);

    //contracted elements
    this.elementList.push(expandButton);
    this.contractedList.push(expandButton);

    this.elementList.push(endDelimiter1);
    this.contractedList.push(endDelimiter1);

    //expanded elements
    this.elementList.push(contractButton);
    this.expandedList.push(contractButton);

    if((this.childKeyEntries.length > 0)||(this.virtualChildKey)) {
        this.elementList.push(this.listDiv);
        this.expandedList.push(this.listDiv);

        //indent before the closing brace
        this.elementList.push(endIndent);
        this.expandedList.push(endIndent);
    }
    this.elementList.push(endDelimiter2);
    this.expandedList.push(endDelimiter2);

    //set the expand.contract visibility
    this.doExpandContract();
}

ValueEntry.prototype.doExpandContract = function() {
	if((!this.expandedList)||(!this.contractedList)) return;
	
	var onList = this.isExpanded ? this.expandedList : this.contractedList;
	var offList = !this.isExpanded ? this.expandedList : this.contractedList;
	
	var i;
	var element;
	for(i = 0; i < onList.length; i++) {
		element = onList[i];
		element.style.display = "";
	}
	for(i = 0; i < offList.length; i++) {
		element = offList[i];
		element.style.display = "none";
	}
}

/** This method inserts an element at the given index. If the index is left blank
 * the entry is inserted at the end of the list. The value of key is ignored if
 * the entry is an array. */
ValueEntry.prototype.insertElement = function(key,value,index) {

    var childKeyEntry;
    
    //get the insert index
    if(index === undefined) {
        index = this.childKeyEntries.length;
    }
    
    //get the element to insert before
    var insertBefore;
    if(index >= this.childKeyEntries.length) {
        insertBefore = this.virtualChildKey.getElement();
    }
    else {
        insertBefore = this.childKeyEntries[index].getElement();
    }
    
    if(this.type == "object") {
        childKeyEntry = new KeyEntry(key,"key",value,this.indentLevel + 1);     
    }
    else if(this.type == "array") {
        childKeyEntry = new KeyEntry(index,"index",value,this.indentLevel + 1);
        
        //we also need to update all the keys larger than this one
        for(var newIndex = index+1; newIndex < this.childKeyEntries.length; newIndex++) {
            this.childKeyEntries[newIndex].setKey(newIndex);
        }
        this.virtualChildKey.setKey(this.childKeyEntries.length + 1);
    }
    
    this.childKeyEntries.splice(index,0,childKeyEntry);
    
    this.listDiv.insertBefore(childKeyEntry.getElement(),insertBefore);

}


///////////////////////////////////////////////////////////////////////////////

ValueEntry.prototype.valueToArray = function() {
    if(!this.type == "value") {
        throw "Type value expected. Found " + this.type;
    }
    this.type = "array";
    
    //these are the edit elements
    var newValue = [this.valueEditObject.getValue()];
	this.createElements(newValue);
    
    //refresh the parent key
    if(this.parent) {
        this.parent.updateValueElements();
    }
}

ValueEntry.prototype.valueToObject = function() {
    if(!this.type == "value") {
        throw "Type value expected. Found " + this.type;
    }
    this.type = "object";
    
    //these are the edit elements
    var newValue = {"a":this.valueEditObject.getValue()};
	this.createElements(newValue);
    
    //refresh the parent key
    if(this.parent) {
        this.parent.updateValueElements();
    }
}

ValueEntry.prototype.objectToArray = function() {
    if(!this.type == "object") {
        throw "Type object expected. Found " + this.type;
    }
    this.type = "array";
    
    //reconfigure the existing list (rather than remaking all the objects)
    var i = 0;
    if(this.childKeyEntries) {
        for(i = 0; i < this.childKeyEntries.length; i++) {
            var childKeyEntry = this.childKeyEntries[i];
            childKeyEntry.convertToIndexType(i);
        }
    }
	if(this.virtualChildKey) {
		this.virtualChildKey.convertToIndexType(i);
	}
    
    //these are the edit elements
    this.valueEditObject = null;
    
    this.formatList();
    
    //refresh the parent key
    if(this.parent) {
        this.parent.updateValueElements();
    }
}

ValueEntry.prototype.arrayToObject = function() {
    if(!this.type == "array") {
        throw "Type array expected. Found " + this.type;
    }
    this.type = "object";
    
    //reconfigure the existing list (rather than remaking all the objects)
	var i = 0;
    if(this.childKeyEntries) {
        for(i = 0; i < this.childKeyEntries.length; i++) {
            var childKeyEntry = this.childKeyEntries[i];
            childKeyEntry.convertToKeyType(String(i));
        }
    }
	if(this.virtualChildKey) {
		this.virtualChildKey.convertToKeyType("");
	}

    this.formatList();
    
    //refresh the parent key
    if(this.parent) {
        this.parent.updateValueElements();
    }
}

ValueEntry.prototype.convertToValue = function() {
    if(this.type == "value") {
        return;
    }
   
    //update type
    this.type = "value";
    
    var value;
    if((this.childKeyEntries)&&(this.childKeyEntries.length > 0)) {
        var firstChildKey = this.childKeyEntries[0];
        value = firstChildKey.getCurrentValue();
    }
    else {
        value = "";
    }
    
    //set the element value
	this.createElements(value);
    
    //refresh the parent key
    if(this.parent) {
        this.parent.updateValueElements();
    }
}


