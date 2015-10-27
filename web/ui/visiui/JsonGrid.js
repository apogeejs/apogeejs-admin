/** This is a grid element for holding an arbitrary JSON object.
 *
 * @class 
 */
visicomp.visiui.JsonGrid = function() {
	this.tableData = null;
	this.domElement = null;
}

//=====================
// Public Methods
//=====================

/** This creates the DOM element.  */
visicomp.visiui.JsonGrid.prototype.getDomElement = function() {
    if(!this.domElement) {
        this.updateDomElement();
    }
    return this.domElement;
}

/** This method should be called any time the data changes. */
visicomp.visiui.JsonGrid.prototype.setData = function(tableData) {
	
    this.tableData = tableData;
	
	//create the dom element
	var tableElement = document.createElement("table");
	tableElement.className = "jsonGridTopTable";
	
	var rowElement = document.createElement("tr");
	rowElement.className = "jsonGridRow";
	tableElement.appendChild(rowElement);
	
    var cellElement = this.createCellElement(tableData);
	rowElement.appendChild(cellElement);
	
	this.domElement = tableElement;
}

//=====================
// Purivate Methods
//=====================

visicomp.visiui.JsonGrid.prototype.createCellElement = function(tableData) {
	
	var cellElement = document.createElement("td");
	
	//get the object type
	var objectType = visicomp.core.util.getObjectType(tableData);
	
	var tableElement;
	switch(objectType) {
		case "Object":
			tableElement = this.createObjectElement(tableData);
			cellElement.className = "jsonGridObjectCell";
			cellElement.appendChild(tableElement);
			break;
			
		case "Array":
			tableElement = this.createArrayElement(tableData);
			cellElement.className = "jsonGridObjectCell";
			cellElement.appendChild(tableElement);
			break;
			
		case "Function":
			throw "Invalid JSON entry!";
			
		default:
			cellElement.className = "jsonGridValueCell";
			//later add format here
			cellElement.innerHTML = tableData;
			break;
	}
	
	return cellElement;
}

visicomp.visiui.JsonGrid.prototype.createObjectElement = function(tableData) {
	var tableElement = document.createElement("table");
	tableElement.className = "jsonGridInternalTable";
	
	for(var key in tableData) {
		var rowElement = document.createElement("tr");
		rowElement.className = "jsonGridRow";
		tableElement.appendChild(rowElement);

		var keyCellElement = document.createElement("td");
		keyCellElement.className = "jsonObjectHeader";
		rowElement.appendChild(keyCellElement);
		
		keyCellElement.innerHTML = key;
		
		var valueCellElement = this.createCellElement(tableData[key]);
		rowElement.appendChild(valueCellElement);
	}
	
	return tableElement;
}

visicomp.visiui.JsonGrid.prototype.createArrayElement = function(tableData) {
	var tableElement = document.createElement("table");
	tableElement.className = "jsonGridInternalTable";
	
	for(var i = 0; i < tableData.length; i++) {
		var rowElement = document.createElement("tr");
		rowElement.className = "jsonGridRow";
		tableElement.appendChild(rowElement);

		var keyCellElement = document.createElement("td");
		keyCellElement.className = "jsonArrayHeader";
		rowElement.appendChild(keyCellElement);
		
		keyCellElement.innerHTML = i;
		
		var valueCellElement = this.createCellElement(tableData[i]);
		rowElement.appendChild(valueCellElement);
	}
	
	return tableElement;
}


