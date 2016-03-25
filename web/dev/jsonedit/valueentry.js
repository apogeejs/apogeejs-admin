/**  This a value entry
 * 
 * notes:
 * - parent is the object that holds the dom elements for this value. it will be
 * either the key for this value or the top level entry. It should have a method
 * "updateValueElements" that will refresh the elements if they have been updated.
 */
function ValueEntry(parent,data,isVirtual) {
	this.parent = parent;
    this.data = data;
	this.type = util.getObjectType(data); //"value", "object", "array"

	this.indentLevel = parent.getIndentLevel() + 1;
    
    //these are all the display elements
    this.elementList = [];
    
    //thse are for virtual key entries
    this.isVirtual = isVirtual;
    
    //for value types ---
    
    //these are the edit elements
    this.valueEditObject = null;
    
    //---------------------
    
    //for list types ----
	
	//these are the child keys
    this.childKeyEntries = [];
    
    //this is the virtual child key
    this.virtualChildKey = null;
	
    //this is the singel element for the list entries (if applicable)
	this.listDiv = null;
    
    //this is used to control expanding and collapsing
    this.isExpanded = false;
	this.expandedList = [];
	this.contractedList = [];
    
    //-------------------
    
    if(this.type == "value") {
        //-----------------------------
        //update the data for a simple value entry
        //-----------------------------
        this.createValueEntry(this.data);
    }
    else {
        //-----------------------------
        //update the child key entries
        //-----------------------------
        this.createChildKeyEntries(this.data);

        //------------------------
        //update keys as needed
        //------------------------
        this.updateChildKeys();

        //----------------------------
        //update the dom element list
        //----------------------------
        this.createElementList();
    }
}

//============================
// Accessors
//============================

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

ValueEntry.prototype.getValueEditObject = function() {
	return this.valueEditObject;
}

ValueEntry.prototype.getIndentLevel = function() {
	return this.indentLevel;
}

ValueEntry.prototype.setIsVirtual = function(isVirtual) {
	this.isVirtual = isVirtual;
    if(this.valueEditObject) {
        if(isVirtual) {
            this.valueEditObject.setClassName("valueCell");
        }
        else {
            this.valueEditObject.setClassName("virtualValueCell");
        }
    }
}



//----------------------------
// Navigation between cells
//----------------------------

/** This navigates to a next cell on completion of editing. 
 * @private */
ValueEntry.prototype.navigateCells = function(direction) {
    var parentValue = this.parent.getParentValueObject();
    if(parentValue) {
        parentValue.navigateChildren(this.parent,false,direction);
    }
}

/** This method determines the place to navigation to, and starts editing there
 * if the re is a valid location. 
 * @private */
ValueEntry.prototype.navigateChildren = function(keyEntry,originIsKey,direction) {
    
    //gerate the nav fruls
    var destIsKey = false;
    var deltaIndex = 0;
    var doMove;
    
    if(this.type == "array") {
        if((direction == EditField.DIRECTION_NEXT)||(direction == EditField.DIRECTION_DOWN)) {
            doMove = !originIsKey;
            if(doMove) {
                destIsKey = false;
                deltaIndex = 1;
            }
        }
        else if((direction == EditField.DIRECTION_PREV)||(direction == EditField.DIRECTION_UP)) {
            doMove = !originIsKey;
            if(doMove) {
                destIsKey = false;
                deltaIndex = -1;
            }
        }
        else if((direction == EditField.DIRECTION_RIGHT)||(direction == EditField.DIRECTION_LEFT)) {
            doMove = false;
        }
    }
    else if(this.type == "object") {
        if(direction == EditField.DIRECTION_NEXT) {
            doMove = true;
            destIsKey = !originIsKey;
            deltaIndex = originIsKey ? 0 : 1;  
        }
        else if(direction == EditField.DIRECTION_PREV) {
            doMove = true;
            destIsKey = !originIsKey;
            deltaIndex = originIsKey ? -1 : 0; 
        }
        else if(direction == EditField.DIRECTION_RIGHT) {
            doMove = originIsKey;
            if(doMove) {
                destIsKey = false;
                deltaIndex = 0; 
            }
        }
        else if(direction == EditField.DIRECTION_LEFT) {
            doMove = !originIsKey;
            if(doMove) {
                destIsKey = true;
                deltaIndex = 0; 
            }
        }
        else if(direction == EditField.DIRECTION_UP) {
            doMove = true;
            destIsKey = originIsKey;
            deltaIndex = -1; 
        }
        else if(direction == EditField.DIRECTION_DOWN) {
            doMove = true;
            destIsKey = originIsKey;
            deltaIndex = 1; 
        }
    }
    
    if(doMove) {
    	var oldIndex;
        var newIndex = -1;
        var newKeyEntry = null;
        var editObject;

		//get the old index
		if(keyEntry == this.virtualChildKey) {
        	oldIndex = this.childKeyEntries.length;
        }
        else {
        	oldIndex = this.childKeyEntries.indexOf(keyEntry);
        }

        //get the new key
        if(oldIndex >= 0) {
            newIndex = oldIndex + deltaIndex;
            if((newIndex >= 0)&&(newIndex < this.childKeyEntries.length)) {
                //get key entry - the normal ones
                newKeyEntry = this.childKeyEntries[newIndex];
            }
            else if(newIndex == this.childKeyEntries.length) {
                //this is the index of the virtual key
                newKeyEntry = this.virtualChildKey;
            }
        }
            
        //get the edit field
		if(newKeyEntry) {
			
			if(destIsKey) {
				//get key entry - presumably this is not an array
				editObject = newKeyEntry.keyEditObject;
			}
			else {
				var valueEntry = newKeyEntry.valueEntry;
				//only navigation if the dest cell is a value. 
				//if it is an array or object do not navigate
				if(valueEntry.getType() == "value") {
					editObject = valueEntry.valueEditObject;
				}
			}
		}

		//if we found a valid edit object, start editing
		if(editObject) {
			editObject.startEdit();
		}
    }
}

//--------------------------
// Edit Operations
//--------------------------

/** This method inserts an element at the given index. If the index is left blank
 * the entry is inserted at the end of the list. The value of key is ignored if
 * the entry is an array. */
ValueEntry.prototype.insertElement = function(key,value,index) {

    var childKeyEntry;
    
    //get the insert index
    if(index === undefined) {
        index = this.childKeyEntries.length;
    }
    
    //-----------------------------
    //update the child key entries
    //-----------------------------
    var insertBefore;
    if(index >= this.childKeyEntries.length) {
        insertBefore = this.virtualChildKey.getElement();
    }
    else {
        insertBefore = this.childKeyEntries[index].getElement();
    }
    
    if(this.type == "object") {
        childKeyEntry = new KeyEntry(this,key,"key",value,false);     
    }
    else if(this.type == "array") {
        childKeyEntry = new KeyEntry(this,index,"index",value,false);
        
        //we also need to update all the keys larger than this one
        for(var newIndex = index+1; newIndex < this.childKeyEntries.length; newIndex++) {
            this.childKeyEntries[newIndex].setKey(newIndex);
        }
        this.virtualChildKey.setKey(this.childKeyEntries.length + 1);
    }
    
    this.childKeyEntries.splice(index,0,childKeyEntry);
    
    //------------------------
    //update keys as needed
    //------------------------
    this.updateChildKeys();
    
    //----------------------------
    //update the dom element list
    //----------------------------
    this.listDiv.insertBefore(childKeyEntry.getElement(),insertBefore);
}

/** this method swaps the given key with the next key in the list. */
ValueEntry.prototype.moveChildKeyToNextIndex = function(index) {
    if((index < 0)||(index >= this.childKeyEntries.length -1)) {
        //illegal index
        alert("Can not make the specified key move");
        return;
    }
    
    //-----------------------------
    //update the child key entries
    //-----------------------------
    var oldFirstKey = this.childKeyEntries[index];
    var oldSecondKey = this.childKeyEntries[index+1];
    
    this.childKeyEntries[index] = oldSecondKey;
    this.childKeyEntries[index+1] = oldFirstKey;
    
    //------------------------
    //update keys as needed
    //------------------------
    this.updateChildKeys();
    
    //----------------------------
    //update the dom element list
    //----------------------------
    this.listDiv.insertBefore(oldSecondKey.getElement(),oldFirstKey.getElement());
    
}

/** This method inserts an element at the given index. If the index is left blank
 * the entry is inserted at the end of the list. The value of key is ignored if
 * the entry is an array. */
ValueEntry.prototype.deleteChildElement = function(keyEntry) {
    
    var index = this.childKeyEntries.indexOf(keyEntry);
    if(index == -1) {
        alert("Element not found!");
        return;
    }
    
    //-----------------------------
    //update the child key entries
    //-----------------------------
    this.childKeyEntries.splice(index,1);
    
    //------------------------
    //update keys as needed
    //------------------------
    this.updateChildKeys();
    
    //----------------------------
    //update the dom element list
    //----------------------------
    this.listDiv.removeChild(keyEntry.getElement());
}


///////////////////////////////////////////////////////////////////////////////

//------------------------------
// Conversions
//------------------------------

ValueEntry.prototype.valueToArray = function() {
    if(!this.type == "value") {
        throw "Type value expected. Found " + this.type;
    }
    this.type = "array";
    
    //these are the edit elements
    var newValue = [this.valueEditObject.getValue()];
    
    //-----------------------------
    //update the child key entries
    //-----------------------------
	this.createChildKeyEntries(newValue);
    
    //------------------------
    //update keys as needed
    //------------------------
    this.updateChildKeys();

    //----------------------------
    //update the dom element list
    //----------------------------
    this.createElementList();
    
    //refresh the parent key
    if(this.parent) {
        var parentValueObject = this.parent.getParentValueObject();
        if(parentValueObject) {
            parentValueObject.updateChildKeys();
        }
        
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
    
    //-----------------------------
    //update the child key entries
    //-----------------------------
	this.createChildKeyEntries(newValue);
    
    //------------------------
    //update keys as needed
    //------------------------
    this.updateChildKeys();

    //----------------------------
    //update the dom element list
    //----------------------------
    this.createElementList();
   
    //refresh the parent key
    if(this.parent) {
        var parentValueObject = this.parent.getParentValueObject();
        if(parentValueObject) {
            parentValueObject.updateChildKeys();
        }
        
        this.parent.updateValueElements();
    }
}

ValueEntry.prototype.objectToArray = function() {
    if(!this.type == "object") {
        throw "Type object expected. Found " + this.type;
    }
    this.type = "array";
    
    //-----------------------------
    //update the child key entries
    //-----------------------------
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
    
    //------------------------
    //update keys as needed
    //------------------------
    this.updateChildKeys();
    
    //----------------------------
    //update the dom element list
    //----------------------------
    this.createElementList();
    
    //refresh the parent key
    if(this.parent) {
        var parentValueObject = this.parent.getParentValueObject();
        if(parentValueObject) {
            parentValueObject.updateChildKeys();
        }
        
        this.parent.updateValueElements();
    }
}

ValueEntry.prototype.arrayToObject = function() {
    if(!this.type == "array") {
        throw "Type array expected. Found " + this.type;
    }
    this.type = "object";
    
    //-----------------------------
    //update the child key entries
    //-----------------------------
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
    
    //------------------------
    //update keys as needed
    //------------------------
    this.updateChildKeys();

    //----------------------------
    //update the dom element list
    //----------------------------
    this.createElementList();
    
    //refresh the parent key
    if(this.parent) {
        var parentValueObject = this.parent.getParentValueObject();
        if(parentValueObject) {
            parentValueObject.updateChildKeys();
        }
        
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
    
    //-----------------------------
    //update the data for a simple value entry
    //-----------------------------
    this.createValueEntry(value);
    
    //refresh the parent key
    if(this.parent) {
        var parentValueObject = this.parent.getParentValueObject();
        if(parentValueObject) {
            parentValueObject.updateChildKeys();
        }
        
        this.parent.updateValueElements();
    }
}

//==============================
// Construction Methods
//==============================

/** This method constructs the contents for a value entry
 * @private */
ValueEntry.prototype.createValueEntry = function(elementsData) {
    if(this.type != "value") return;
    
    this.valueEditObject = null;
    this.childKeyEntries = [];
	this.virtualChildKey = null;
	this.elementList = [];
	
    //create the value element
    this.createValueElement(elementsData);

    //clear the list elements
    this.listDiv = null;
    this.contractedList = null;
    this.expandedList = null;
}

/** This method constructs the contents for an array or object
 * @private */
ValueEntry.prototype.createChildKeyEntries = function(elementsData) {
    if(this.type == "value") return;
    
	//initialize data elements
    this.valueEditObject = null;
    this.childKeyEntries = [];
	this.virtualChildKey = null;
	this.elementList = [];

    //create the child keys for the object or array
    var childKeyEntry;
    if(this.type == "object") { 
        for(var key in elementsData) {
            childKeyEntry = new KeyEntry(this,key,"key",elementsData[key],false);
            this.childKeyEntries.push(childKeyEntry);
        }

        //add a dummy entry
        childKeyEntry = new KeyEntry(this,"","key","",this,true,false);
        this.virtualChildKey = childKeyEntry;
    }
    else if(this.type == "array") {
        for(var keyIndex = 0; keyIndex < elementsData.length; keyIndex++) {
            childKeyEntry = new KeyEntry(this,keyIndex,"index",elementsData[keyIndex],false);
            this.childKeyEntries.push(childKeyEntry);
        }

        //add a dummy entry
        childKeyEntry = new KeyEntry(this,keyIndex,"index","",true);
        this.virtualChildKey = childKeyEntry;
    }

}

/** This create the dom element list for the child key entries 
* @private */
ValueEntry.prototype.createElementList = function() {

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


/** This method updates the keys with the context menu and makes
 * sure the keys are corect for array entries. 
 * @private */
ValueEntry.prototype.updateChildKeys = function() {
    var numberKeys;
    var keyIndex;
    
    if(this.type == "object") {
        var key;
        
        //count keys
        numberKeys = 0;
        for(key in this.childKeyEntries) {
            numberKeys++;
        }

        keyIndex = 0;
        for(key in this.childKeyEntries) {
            var childKeyEntry = this.childKeyEntries[key];
            
            //set the context menu
            childKeyEntry.loadContextMenu(numberKeys,keyIndex);
            keyIndex++;
        }
        
        //context menu
        this.virtualChildKey.loadContextMenu(numberKeys,numberKeys);
        
    }
    else if(this.type == "array") {
        numberKeys = this.childKeyEntries.length;
        
        //set context menu and make sure index is correct
        for(keyIndex = 0; keyIndex < numberKeys; keyIndex++) {
            childKeyEntry = this.childKeyEntries[keyIndex];
            
            //make sure the index is correct
            if(childKeyEntry.getCurrentKey() != keyIndex) {
                childKeyEntry.setKey(keyIndex);
            }
            
            //set the context menu
            childKeyEntry.loadContextMenu(numberKeys,keyIndex);
        }
        
        if(this.virtualChildKey) {
            if(this.virtualChildKey.getCurrentKey() != numberKeys) {
                this.virtualChildKey.setKey(numberKeys);
            }
            
            //context menu
            this.virtualChildKey.loadContextMenu(numberKeys,numberKeys);
        }
    }
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


/** This creates the edit element for the entry. Only needed on type "value" 
* @private */
ValueEntry.prototype.createValueElement = function(data) {

    //create a simple element
    this.valueEditObject = util.createValueElement(data,this.isVirtual);
    var instance = this;
    
    //make the edit field editable if it is a key
    var onEdit = function(editValue) {
        if(instance.isVirtual) {
            var parentValueObject = instance.parent.getParentValueObject();
            if(parentValueObject) {
                parentValueObject.makeVirtualEntryReal();
            }
        }
    }
    this.valueEditObject.setOnEditCallback(onEdit);

    
    //set the navgation callback
    var navCallback = function(direction) {
        instance.navigateCells(direction);
    }
    this.valueEditObject.setNavCallback(navCallback);
    
    var element = this.valueEditObject.getElement();
    this.elementList.push(element);
}



/** This wraps the list elements into the proper format. */
ValueEntry.prototype.makeVirtualEntryReal = function(data) {
    var newRealEntry = this.virtualChildKey
    newRealEntry.setIsVirtual(false);
    this.childKeyEntries.push(newRealEntry);
    
    var childKeyEntry;
    if(this.type == "object") { 
        //add a dummy entry
        childKeyEntry = new KeyEntry(this,"","key","",this,true);
        this.virtualChildKey = childKeyEntry;
    }
    else if(this.type == "array") {
        //add a dummy entry
        childKeyEntry = new KeyEntry(this,this.childKeyEntries.length,"index","",true);
        this.virtualChildKey = childKeyEntry;
    }
    
    this.updateChildKeys();
    
    this.createElementList();
    
    this.parent.updateValueElements();
    
}



