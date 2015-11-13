
function ValueEntry(parentKey,data,indentLevel,isVirtual,parentValue) {
	this.parentKey = parentKey;
    this.data = data;
	this.type = util.getObjectType(data); //"value", "object", "array"
	this.indentLevel = indentLevel;
    
    //thse are for virtual key entries
    this.isVirtual = isVirtual;
    this.parentValue = parentValue;
    
    //for value types ---
    
    //these are the edit elements
    this.valueEditObject = null;
    
    //---------------------
    
    //for list types ----
    //
    //this is the singel element for the list entries (if applicable)
	this.listDiv = null;
    
    //these are all the display elements
    this.elementList = [];
    
    //these are the child keys
    this.childKeyEntries = [];
    
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
    if(this.type == "value") {
        //create the value element
        this.createValueElement(elementsData,this.isVirtual,this.parentValue);
    }
    else {
        //create a list element
        this.listDiv = document.createElement("div");
        var childKeyEntry;
        if(this.type == "object") { 
            
            for(var key in elementsData) {
                childKeyEntry = new KeyEntry(key,"key",elementsData[key],this.indentLevel + 1);
                this.childKeyEntries.push(childKeyEntry);
                this.listDiv.appendChild(childKeyEntry.getElement());
            }
            
            //add a dummy entry
            childKeyEntry = new KeyEntry("","key","",this.indentLevel + 1,true,this);
            this.virtualChildKey = childKeyEntry;
            this.listDiv.appendChild(childKeyEntry.getElement());
        }
        else if(this.type == "array") {
            
            for(var i = 0; i < elementsData.length; i++) {
                childKeyEntry = new KeyEntry(i,"index",elementsData[i],this.indentLevel + 1);
                this.childKeyEntries.push(childKeyEntry);
                this.listDiv.appendChild(childKeyEntry.getElement());
            }
            
            //add a dummy entry
            childKeyEntry = new KeyEntry(i,"index","",this.indentLevel + 1,true,this);
            this.virtualChildKey = childKeyEntry;
            this.listDiv.appendChild(childKeyEntry.getElement());
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

/** This wraps the list elements into the proper format. 
* @private */
ValueEntry.prototype.formatList = function() {
    
    this.contractedList = [];
    this.elementList = [];
    this.expandedList = [];
    
    var startDelimiter;
    var endDelimiter1;
    var endDelimiter2;
    var endIndent = util.createIndentElement(this.indentLevel);

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

ValueEntry.prototype.loadValueElementContextMenu = function(element) {

    var instance = this;    
    element.oncontextmenu = function(event) {
        var contextMenu = new visicomp.visiui.MenuBody();
        contextMenu.addCallbackMenuItem("Convert To Object",function() {instance.valueToObject()});
        contextMenu.addCallbackMenuItem("Convert To Array",function() {instance.valueToArray()}); 
        visicomp.visiui.Menu.showContextMenu(contextMenu,event);
    }
}

ValueEntry.prototype.doExpandContract = function() {
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
    
    //these are the edit elements
    this.valueEditObject = null;
    
    //for list types ----
	this.listDiv = null;
    this.elementList = [];
    this.childKeyEntries = [];
    this.virtualChildKey = null;
    this.isExpanded = false;
	this.expandedList = [];
	this.contractedList = [];
    
    //-------------------
	
	this.createElements(newValue);
    
    //refresh the parent key
    if(this.parentKey) {
        this.parentKey.updateValueElements();
    }
}

ValueEntry.prototype.valueToObject = function() {
    if(!this.type == "value") {
        throw "Type value expected. Found " + this.type;
    }
    this.type = "object";
    
    //these are the edit elements
    var newValue = {"a":this.valueEditObject.getValue()};
    
    //these are the edit elements
    this.valueEditObject = null;
    
    //for list types ----
	this.listDiv = null;
    this.elementList = [];
    this.childKeyEntries = [];
    this.virtualChildKey = null;
    this.isExpanded = false;
	this.expandedList = [];
	this.contractedList = [];
    
    //-------------------
	
	this.createElements(newValue);
    
    //refresh the parent key
    if(this.parentKey) {
        this.parentKey.updateValueElements();
    }
}

ValueEntry.prototype.objectToArray = function() {
    if(!this.type == "object") {
        throw "Type object expected. Found " + this.type;
    }
    this.type = "array";
    
    //clear and update the list
    this.listDiv.innerHTML = "";
    if(this.childKeyEntries) {
        for(var i = 0; i < this.childKeyEntries.length; i++) {
            var childKeyEntry = this.childKeyEntries[i];
            childKeyEntry.convertToIndexType(i);
            this.listDiv.appendChild(childKeyEntry.getElement());
        }
    }
    
    //these are the edit elements
    this.valueEditObject = null;
    
    this.formatList();
    
    //refresh the parent key
    if(this.parentKey) {
        this.parentKey.updateValueElements();
    }
}

ValueEntry.prototype.arrayToObject = function() {
    if(!this.type == "array") {
        throw "Type array expected. Found " + this.type;
    }
    this.type = "object";
    
    //clear and update the list
    this.listDiv.innerHTML = "";
    if(this.childKeyEntries) {
        for(var i = 0; i < this.childKeyEntries.length; i++) {
            var childKeyEntry = this.childKeyEntries[i];
            childKeyEntry.convertToKeyType(String(i));
            this.listDiv.appendChild(childKeyEntry.getElement());
        }
    }
    
    //these are the edit elements
    this.valueEditObject = null;
    
    this.formatList();
    
    //refresh the parent key
    if(this.parentKey) {
        this.parentKey.updateValueElements();
    }
}

ValueEntry.prototype.convertToValue = function() {
    if(this.type == "value") {
        return;
    }
    
    //update type
    this.type = "value";
    
    //clear virtual - make this real if it is virtual
    this.isVirtual = false;
//    this.parentValue = this.parentValue; ???
    
    //clear some list values
	this.listDiv = null;
    this.elementList = [];
    this.childKeyEntries = [];
    this.virtualChildKey = null;
    
    var value;
    if((this.childKeyEntries)&&(this.childKeyEntries.length > 0)) {
        var firstChildKey = this.childKeyEntries[0];
        value = firstChildKey.getCurrentValue();
    }
    else {
        value = "";
    }
    
    //set the element value
    this.createValueElement(value,this.isVirtual,this.parentValue);
    
    //refresh the parent key
    if(this.parentKey) {
        this.parentKey.updateValueElements();
    }
}


