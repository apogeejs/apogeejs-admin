/** This is the workbook. */
visicomp.core.Workbook = function(name,eventManager) {
    this.name = name;
    this.worksheetMap = {};
    this.eventManager = eventManager;
    
    //add an entry in the update code structure
    visicomp.core.updateCode[name] = {};
}

/** this method gets the context command. */
visicomp.core.Workbook.prototype.getName = function() {
    return this.name;
}

/** This is used for saving the workbook. */
visicomp.core.Workbook.prototype.toJson = function() {
    var json = {};
    json.name = this.name;
    json.worksheets = {};
    for(var key in this.worksheetMap) {
        var worksheet = this.worksheetMap[key];
        json.worksheets[key] = worksheet.toJson();
    }
    return json;
}

/** this method gets the context command. */
visicomp.core.Workbook.prototype.getEventManager = function() {
    return this.eventManager;
}

/** This adds a worksheet to the app object map. */
visicomp.core.Workbook.prototype.addWorksheet = function(worksheet) {
    var worksheetName = worksheet.getName();
    if(this.worksheetMap[worksheetName]) {
        alert("Error - there is already a worksheet with this name.");
        return;
    }
    this.worksheetMap[worksheetName] = worksheet;
	
    worksheet.setWorkbook(this);
    
    //add an entry in the update code structure
    visicomp.core.updateCode[this.name][worksheetName] = {};
}

/** This removes a worksheet from the app object map */
visicomp.core.Workbook.prototype.removeWorksheet = function(worksheet) {
    //dont check for repeats here for now
    var worksheetName = worksheet.getName();
    delete this.worksheetMap[worksheetName];
    
    //delete entry in the update code structure
    delete visicomp.core.updateCode[this.name][worksheetName];
}

/** This method returns the worksheet of the given name. */
visicomp.core.Workbook.prototype.lookupWorksheet = function(name) {
    return this.worksheetMap[name];
}

/** This method returns themap of worksheets in the workbook. */
visicomp.core.Workbook.prototype.getWorksheetMap = function() {
    return this.worksheetMap;
}

