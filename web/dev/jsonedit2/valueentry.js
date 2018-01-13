/**  This a value entry
 * 
 * notes:
 * - parent is the object that holds the dom elements for this value. it will be
 * either the key for this value or the top level entry. It should have a method
 * "updateValueElements" that will refresh the elements if they have been updated.
 */
apogeeapp.jsonedit.ValueEntry = function(editArea,parent,data,isEditable,isVirtual) {
    this.editArea = editArea;
	this.parent = parent;
    this.data = data;
	this.isEditable = isEditable;
	this.type = apogeeapp.jsonedit.getObjectType(data); //"value", "object", "array"

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
    this.isExpanded = true;
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

apogeeapp.jsonedit.ValueEntry.prototype.getInitialValue = function() {
    return this.data;
}

apogeeapp.jsonedit.ValueEntry.prototype.getCurrentValue = function() {
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

apogeeapp.jsonedit.ValueEntry.prototype.getType = function() {
	return this.type;
}

apogeeapp.jsonedit.ValueEntry.prototype.setExpanded = function(isExpanded) {
	this.isExpanded = isExpanded;
    this.doExpandContract();
}

apogeeapp.jsonedit.ValueEntry.prototype.getElementList = function() {
	return this.elementList;
}

apogeeapp.jsonedit.ValueEntry.prototype.getValueEditObject = function() {
	return this.valueEditObject;
}

apogeeapp.jsonedit.ValueEntry.prototype.getIndentLevel = function() {
	return this.indentLevel;
}

apogeeapp.jsonedit.ValueEntry.prototype.setIsVirtual = function(isVirtual) {
	this.isVirtual = isVirtual;  
    
	this.valueEditObject.setIsVirtual(isVirtual);
}



//----------------------------
// Navigation between cells
//----------------------------

/** This navigates to a next cell on completion of editing. 
 * @private */
apogeeapp.jsonedit.ValueEntry.prototype.navigateCells = function(direction) {
    var parentValue = this.parent.getParentValueObject();
    if(parentValue) {
        parentValue.navigateChildren(this.parent,false,direction);
    }
}

/** This method determines the place to navigation to, and starts editing there
 * if the re is a valid location. 
 * @private */
apogeeapp.jsonedit.ValueEntry.prototype.navigateChildren = function(keyEntry,originIsKey,direction) {
    
    //gerate the nav fruls
    var destIsKey = false;
    var deltaIndex = 0;
    var doMove;
    
    if(this.type == "array") {
        if((direction == apogeeapp.jsonedit.EditField.DIRECTION_NEXT)||(direction == apogeeapp.jsonedit.EditField.DIRECTION_DOWN)) {
            doMove = !originIsKey;
            if(doMove) {
                destIsKey = false;
                deltaIndex = 1;
            }
        }
        else if((direction == apogeeapp.jsonedit.EditField.DIRECTION_PREV)||(direction == apogeeapp.jsonedit.EditField.DIRECTION_UP)) {
            doMove = !originIsKey;
            if(doMove) {
                destIsKey = false;
                deltaIndex = -1;
            }
        }
        else if((direction == apogeeapp.jsonedit.EditField.DIRECTION_RIGHT)||(direction == apogeeapp.jsonedit.EditField.DIRECTION_LEFT)) {
            doMove = false;
        }
    }
    else if(this.type == "object") {
        if(direction == apogeeapp.jsonedit.EditField.DIRECTION_NEXT) {
            doMove = true;
            destIsKey = !originIsKey;
            deltaIndex = originIsKey ? 0 : 1;  
        }
        else if(direction == apogeeapp.jsonedit.EditField.DIRECTION_PREV) {
            doMove = true;
            destIsKey = !originIsKey;
            deltaIndex = originIsKey ? -1 : 0; 
        }
        else if(direction == apogeeapp.jsonedit.EditField.DIRECTION_RIGHT) {
            doMove = originIsKey;
            if(doMove) {
                destIsKey = false;
                deltaIndex = 0; 
            }
        }
        else if(direction == apogeeapp.jsonedit.EditField.DIRECTION_LEFT) {
            doMove = !originIsKey;
            if(doMove) {
                destIsKey = true;
                deltaIndex = 0; 
            }
        }
        else if(direction == apogeeapp.jsonedit.EditField.DIRECTION_UP) {
            doMove = true;
            destIsKey = originIsKey;
            deltaIndex = -1; 
        }
        else if(direction == apogeeapp.jsonedit.EditField.DIRECTION_DOWN) {
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
apogeeapp.jsonedit.ValueEntry.prototype.insertElement = function(key,value,index) {

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
        childKeyEntry = new apogeeapp.jsonedit.KeyEntry(this.editArea,this,key,"key",value,this.isEditable,false);     
    }
    else if(this.type == "array") {
        childKeyEntry = new apogeeapp.jsonedit.KeyEntry(this.editArea,this,index,"index",value,this.isEditable,false);
        
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
apogeeapp.jsonedit.ValueEntry.prototype.moveChildKeyToNextIndex = function(index) {
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
apogeeapp.jsonedit.ValueEntry.prototype.deleteChildElement = function(keyEntry) {
    
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


apogeeapp.jsonedit.ValueEntry.prototype.convertibleToNumber = function() {
    if(this.type === "value") {
        var currentValue = this.getCurrentValue();
        var valueType = apogeeapp.jsonedit.getValueType(currentValue);
        if(valueType === "string") {
            return isFinite(currentValue);
        }
    }
    return false;
}

apogeeapp.jsonedit.ValueEntry.prototype.convertibleToBool = function() {
    if(this.type === "value") {
        var currentValue = this.getCurrentValue();
        var valueType = apogeeapp.jsonedit.getValueType(currentValue);
        if(valueType === "string") {
            return apogeeapp.jsonedit.isBoolString(currentValue);
        }
    }
    return false;
}

apogeeapp.jsonedit.ValueEntry.prototype.convertibleToNull = function() {
    if(this.type === "value") {
        var currentValue = this.getCurrentValue();
        var valueType = apogeeapp.jsonedit.getValueType(currentValue);
        if(valueType === "string") {
            return apogeeapp.jsonedit.isNullString(currentValue);
        }
    }
    return false;
}

//this converts a string to a number or boolean
apogeeapp.jsonedit.ValueEntry.prototype.valueToNonString = function() {
    var currentValue = this.getCurrentValue();
    //change the data in this object
    var newData = apogeeapp.jsonedit.stringToNonString(currentValue);
    this.valueEditObject.setValue(newData);
    
    //notify of edit
    this.editArea.valueEdited();
}

apogeeapp.jsonedit.ValueEntry.prototype.convertibleToString = function() {
    if(this.type === "value") {
        var currentValue = this.getCurrentValue();
        var valueType = apogeeapp.jsonedit.getValueType(currentValue);
        return (valueType !== "string");
    }
    return false;
}

apogeeapp.jsonedit.ValueEntry.prototype.valueToString = function() {
    var currentValue = this.getCurrentValue();
    //change the data in this object
    var newData = String(currentValue);
    this.valueEditObject.setValue(newData);
    
    //notify of edit
    this.editArea.valueEdited();
}


apogeeapp.jsonedit.ValueEntry.prototype.valueToArray = function() {
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
    
    //notify of edit
    this.editArea.valueEdited();
}

apogeeapp.jsonedit.ValueEntry.prototype.valueToObject = function() {
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
    
    //notify of edit
    this.editArea.valueEdited();
}

apogeeapp.jsonedit.ValueEntry.prototype.objectToArray = function() {
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
    
    //notify of edit
    this.editArea.valueEdited();
}

apogeeapp.jsonedit.ValueEntry.prototype.arrayToObject = function() {
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
    
    //notify of edit
    this.editArea.valueEdited();
}

apogeeapp.jsonedit.ValueEntry.prototype.convertToValue = function() {
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
    
    //notify of edit
    this.editArea.valueEdited();
}

//==============================
// Construction Methods
//==============================

/** This method constructs the contents for a value entry
 * @private */
apogeeapp.jsonedit.ValueEntry.prototype.createValueEntry = function(elementsData) {
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
apogeeapp.jsonedit.ValueEntry.prototype.createChildKeyEntries = function(elementsData) {
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
            childKeyEntry = new apogeeapp.jsonedit.KeyEntry(this.editArea,this,key,"key",elementsData[key],this.isEditable,false);
            this.childKeyEntries.push(childKeyEntry);
        }

        //add a dummy entry if this is editable
		if(this.isEditable) {
			childKeyEntry = new apogeeapp.jsonedit.KeyEntry(this.editArea,this,"","key","",this.isEditable,true);
			this.virtualChildKey = childKeyEntry;
		}
    }
    else if(this.type == "array") {
        for(var keyIndex = 0; keyIndex < elementsData.length; keyIndex++) {
            childKeyEntry = new apogeeapp.jsonedit.KeyEntry(this.editArea,this,keyIndex,"index",elementsData[keyIndex],this.isEditable,false);
            this.childKeyEntries.push(childKeyEntry);
        }

		//add a dummy entry if this is editable
		if(this.isEditable) {
			childKeyEntry = new apogeeapp.jsonedit.KeyEntry(this.editArea,this,keyIndex,"index","",this.isEditable,true);
			this.virtualChildKey = childKeyEntry;
		}
    }

}

/** This create the dom element list for the child key entries 
* @private */
apogeeapp.jsonedit.ValueEntry.prototype.createElementList = function() {

    //initialize elements
	this.listDiv = document.createElement("div");
    this.elementList = [];
    this.contractedList = [];
    this.expandedList = [];
    
    var startDelimiter;
    var endDelimiter1;
    var endDelimiter2;
    var endIndent = apogeeapp.jsonedit.createIndentElement(this.indentLevel);

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
    var expandButton = apogeeapp.jsonedit.createExpandButton(this);
    var contractButton = apogeeapp.jsonedit.createContractButton(this);

    if(this.type == "object") { 
        startDelimiter = apogeeapp.jsonedit.createObjectDelimiter("{");
        endDelimiter1 = apogeeapp.jsonedit.createObjectDelimiter("}");
        endDelimiter2 = apogeeapp.jsonedit.createObjectDelimiter("}");
    }
    else if(this.type == "array") {
        startDelimiter = apogeeapp.jsonedit.createObjectDelimiter("[");
        endDelimiter1 = apogeeapp.jsonedit.createObjectDelimiter("]");
        endDelimiter2 = apogeeapp.jsonedit.createObjectDelimiter("]");
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
apogeeapp.jsonedit.ValueEntry.prototype.updateChildKeys = function() {
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
            childKeyEntry.setPosition(numberKeys,keyIndex);
            
            //set the context menu
            childKeyEntry.loadContextMenu();
            keyIndex++;
        }
        
        //context menu
		if(this.virtualChildKey) {
			this.virtualChildKey.loadContextMenu();
		}
    }
    else if(this.type == "array") {
        numberKeys = this.childKeyEntries.length;
        
        //set context menu and make sure index is correct
        for(keyIndex = 0; keyIndex < numberKeys; keyIndex++) {
            childKeyEntry = this.childKeyEntries[keyIndex];
            childKeyEntry.setPosition(numberKeys,keyIndex);
            
            //set the context menu
            childKeyEntry.loadContextMenu();
        }
        
        if(this.virtualChildKey) {
            this.virtualChildKey.setPosition(numberKeys,numberKeys);
            
            //context menu
            this.virtualChildKey.loadContextMenu();
        }
    }
}


apogeeapp.jsonedit.ValueEntry.prototype.doExpandContract = function() {
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
apogeeapp.jsonedit.ValueEntry.prototype.createValueElement = function(data) {

    //create a simple element
    this.valueEditObject = new apogeeapp.jsonedit.EditField(data,apogeeapp.jsonedit.EditField.FIELD_TYPE_VALUE,this.isEditable,this.isVirtual);
    var instance = this;
    
    //make the edit field editable if it is a key
    var onEdit = function(editValue) {
        if(instance.isVirtual) {
            var parentValueObject = instance.parent.getParentValueObject();
            if(parentValueObject) {
                parentValueObject.makeVirtualEntryReal();
            }
        }
        
        //notify of edit
        instance.editArea.valueEdited();
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
apogeeapp.jsonedit.ValueEntry.prototype.makeVirtualEntryReal = function(data) {
    var newRealEntry = this.virtualChildKey
    newRealEntry.setIsVirtual(false);
    this.childKeyEntries.push(newRealEntry);
    
    var childKeyEntry;
    if(this.type == "object") { 
        //add a dummy entry
        childKeyEntry = new apogeeapp.jsonedit.KeyEntry(this.editArea,this,"","key","",this.isEditable,true);
        this.virtualChildKey = childKeyEntry;
    }
    else if(this.type == "array") {
        //add a dummy entry
        childKeyEntry = new apogeeapp.jsonedit.KeyEntry(this.editArea,this,this.childKeyEntries.length,"index","",this.isEditable,true);
        this.virtualChildKey = childKeyEntry;
    }
    
    this.updateChildKeys();
    
    this.createElementList();
    
    this.parent.updateValueElements();
    
}



