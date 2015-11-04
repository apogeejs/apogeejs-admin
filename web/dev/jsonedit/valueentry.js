
function ValueEntry(data,indentLevel,isVirtual,parentValue) {
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
	
	this.createElements();
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

ValueEntry.prototype.createElements = function() {
    if(this.type == "value") {
        //create a simple element
        this.valueEditObject = util.createValueElement(this.data,this.isVirtual,this.parentValue);
		this.elementList.push(this.valueEditObject.getElement());
    }
    else {
        var startDelimiter;
        var endDelimiter1;
        var endDelimiter2;
        var endIndent = util.createIndentElement(this.indentLevel);
        
        //buttons
        var expandButton = util.createExpandButton(this);
		var contractButton = util.createContractButton(this);
        
        //create a list element
        this.listDiv = document.createElement("div");
        var childKeyEntry;
        if(this.type == "object") { 
            startDelimiter = util.createObjectDelimiter("{");
            endDelimiter1 = util.createObjectDelimiter("}");
            endDelimiter2 = util.createObjectDelimiter("}");
            
            for(var key in this.data) {
                childKeyEntry = new KeyEntry(key,"key",this.data[key],this.indentLevel + 1);
                this.childKeyEntries.push(childKeyEntry);
                this.listDiv.appendChild(childKeyEntry.getElement());
            }
            
            //add a dummy entry
            childKeyEntry = new KeyEntry("","key","",this.indentLevel + 1,true,this);
            this.virtualChildKey = childKeyEntry;
            this.listDiv.appendChild(childKeyEntry.getElement());
        }
        else if(this.type == "array") {
            startDelimiter = util.createObjectDelimiter("[");
            endDelimiter1 = util.createObjectDelimiter("]");
            endDelimiter2 = util.createObjectDelimiter("]");
            
            for(var i = 0; i < this.data.length; i++) {
                childKeyEntry = new KeyEntry(i,"index",this.data[i],this.indentLevel + 1);
                this.childKeyEntries.push(childKeyEntry);
                this.listDiv.appendChild(childKeyEntry.getElement());
            }
            
            //add a dummy entry
            childKeyEntry = new KeyEntry(i,"index","",this.indentLevel + 1,true,this);
            this.virtualChildKey = childKeyEntry;
            this.listDiv.appendChild(childKeyEntry.getElement());
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
        
        if(this.childKeyEntries.length > 0) {
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


