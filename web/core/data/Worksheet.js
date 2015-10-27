/** This is a worksheet. */
visicomp.core.Worksheet = function(name) {
    this.workbook = null;
    this.name = name;

    //this holds the base objects, mapped by name
    this.tableMap = {};
    this.dataMap = {};
}

/** This is used for saving the workbook. */
visicomp.core.Worksheet.prototype.toJson = function() {
    var json = {};
    json.name = this.name;
    json.tables = {};
    for(var key in this.tableMap) {
        var table = this.tableMap[key];
        json.tables[key] = table.toJson();
    }
    return json;
}

/** this method gets the workbook. */
visicomp.core.Worksheet.prototype.getWorkbook = function() {
    return this.workbook;
}

/** this method gets the workbook. */
visicomp.core.Worksheet.prototype.setWorkbook = function(workbook) {
    this.workbook = workbook;
}

/** this method gets the name. */
visicomp.core.Worksheet.prototype.getName = function() {
    return this.name;
}

/** this method gets the table map. */
visicomp.core.Worksheet.prototype.getTableMap = function() {
    return this.tableMap;
}

/** this method gets the data map. */
visicomp.core.Worksheet.prototype.getDataMap = function() {
    return this.dataMap;
}

/** This method looks up a table from this worksheet.  */
visicomp.core.Worksheet.prototype.lookupTable = function(name) {
    //check the worksheet scope
    return this.tableMap[name];
}

/** This method adds a table to the worksheet. It also sets the worksheet for the
 *table object to this worksheet. It will fail if the name already exists.  */
visicomp.core.Worksheet.prototype.addTable = function(table) {
	
    //check if it exists first
    var name = table.getName();
    if(this.tableMap[name]) {
        //already exists!
        alert('Error - name already exists!');
        return;
    }
    //add object
    this.tableMap[name] = table;
    this.dataMap[name] = table.getData();
	
    table.setWorksheet(this);
}

/** This method removes a table from the worksheet. It also sets the worksheet
 * on the table object to null.  */
visicomp.core.Worksheet.prototype.removeTable = function(table) {
    //only objects placed in the worksheet go here, so they should have no parents
    if(table.getParent()) return;
	
    //remove from worksheet
    var name = table.getName();
    delete(this.tableMap[name]);
    delete(this.dataMap[name]);
	
    table.setWorkbook(null);
}

/** This method updates the table data object in the worksheet data map. */
visicomp.core.Worksheet.prototype.updateData = function(table) {
    var name = table.getName();
    var data = table.getData();
    if(!this.tableMap[name]) {
        alert("Error - this table " + name + " has not yet been added to the worksheet.");
        return;
    }
    this.dataMap[name] = data;
}

