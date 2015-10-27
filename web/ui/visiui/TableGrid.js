/** This is a grid element for holding an arbitrary JSON object.
 *
 * @class 
 */
visicomp.visiui.TableGrid = function() {
    this.tableData = null;
    this.cellData = null;
    this.rowType = null;
    this.colType = null;
    this.rowKeyList= null;
    this.colKeyList = null;
	
    this.domElement = null;
	
    this.showTranspose = false; //not implemented
}

//=====================
// Public Methods
//=====================

/** This creates the DOM element.  */
visicomp.visiui.TableGrid.prototype.getDomElement = function() {
    if(!this.domElement) {
        this.updateDomElement();
    }
    return this.domElement;
}

/** This method should be called any time the data changes. */
visicomp.visiui.TableGrid.prototype.setData = function(tableData) {
	
    //initialization
    this.tableData = tableData;
    this.domElement = null;
	
    this.rowKeyList = [];
    this.colKeyList = [];
    this.cellData = [[]];
    var cellObject;

    this.columnType = null;
	
    //process the row values
    var rowFormat = visicomp.core.util.getObjectType(tableData);
    this.rowType = this.getTypeForFormat(rowFormat);
	
    if(this.rowType == "SimpleCell") {
        //singel cell output (0D output)
        this.columnType = "SimpleCell";
		
        cellObject = {};
        cellObject.rowKey = null
        cellObject.colKey = null;
        cellObject.displayValue = String(tableData);
        cellObject.format = rowFormat;
        this.cellData[0] = [];
        this.cellData[0].push(cellObject);
    }
    else {
        //array or map
        var rowData;
		
        //ge the key list for the rows
        this.updateKeyList(this.rowKeyList,tableData,this.rowType);
		
        //get the row data
        for(var ir = 0; ir < this.rowKeyList.length; ir++) {
            var rowKey = this.rowKeyList[ir];
            rowData = tableData[rowKey];
				
            //process columns for each row
            //make sure the types match
            var colFormat = visicomp.core.util.getObjectType(rowData);
            var colType = this.getTypeForFormat(colFormat);
			
            //set the col type, or make sure it is a match
            if(!this.columnType) {
                this.columnType = colType;
            }
            else {
                if(this.columnType != colType) {
                    throw "Format error: mismatch of types in row or colmun!";
                }
            }
			
            if(colType == "SimpleCell") {
                //1D output
                cellObject = {};
                cellObject.rowKey = rowKey
                cellObject.colKey = null;
                cellObject.displayValue = String(rowData);
                cellObject.format = colFormat;
                this.cellData[ir] = [];
                this.cellData[ir].push(cellObject);
            }
            else {
                //initialize loop
                this.updateKeyList(this.colKeyList,rowData,this.columnType);

                for(var ic = 0; ic < this.colKeyList.length; ic++) {
                    var colKey = this.colKeyList[ic];
                    var colData = rowData[colKey];
					
                    var cellFormat = visicomp.core.util.getObjectType(colData);
                    //make sure this is a vlid format
                    if((cellFormat == "Object")||(cellFormat == "Array")) {
                        throw "Format error: invalid cell format: " + rowKey + " ," + colKey;
                    }

                    //2D output
                    cellObject = {};
                    cellObject.rowKey = rowKey;
                    cellObject.colKey = colKey;
                    cellObject.displayValue = String(colData);
                    cellObject.format = cellFormat;
                    if(ic == 0) {
                        this.cellData[ir] = [];
                    }
                    this.cellData[ir].push(cellObject);
                }
            }
        }
    }
}

/** This method should be called to refresh the dom element if the settings changed. */
visicomp.visiui.TableGrid.prototype.updateDomElement = function() {
    var table = document.createElement("table");
    table.className = "visiui_json_table";

    var row = null;
    if(this.colKeyList.length > 0) {
		
        row = this.addRow(table,"visiui_json_label_row")
		
        //top corner
        this.addCell(row,"","visiui_json_label_cell");

        //column headings
        //I should do a colheading only for the columns of cell data, it hsould be the same as this.
        for(var icl = 0; icl < this.colKeyList.length; icl++) {
            var colLabel = this.colKeyList[icl];
            this.addCell(row,colLabel,"visiui_json_label_cell");
        }
    }
		
    //rest of rows
    for(var ir = 0; ir < this.cellData.length; ir++) {
        row = this.addRow(table,"visiui_json_row")

        //row headings
        if(this.rowKeyList.length > 0) {
            var rowLabel;
            if(this.rowKeyList.length > ir) {
                rowLabel = this.rowKeyList[ir];
            }
            else {
                rowLabel = "";
            }
            this.addCell(row,rowLabel,"visiui_json_label_cell");
        }
		
        //table entries
        var rowData = this.cellData[ir]
        for(var ic = 0; ic < rowData.length; ic++) {
            var cellData = rowData[ic];
            this.addCell(row,cellData.displayValue,"visiui_json_cell");
        }
    }

    this.domElement = table;
}

//=====================
// Private Methods
//=====================

/** @private */
visicomp.visiui.TableGrid.prototype.addRow = function(table,className) {
    var row = document.createElement("tr");
    row.className = className;
    table.appendChild(row);
    return row;
}

/** @private */
visicomp.visiui.TableGrid.prototype.addCell = function(row,value,className) {
    var cell = document.createElement("td");
    cell.className = className;
    cell.innerHTML = value;
    row.appendChild(cell);
    return cell;
}

/** This updates the give key list of the given data
 * @private */
visicomp.visiui.TableGrid.prototype.updateKeyList = function(keyList,data,dataType) {
    if(dataType == "Object") {
        //make a set of the keys in the list
        var temp = {};
        for(var ia = 0; ia < keyList.length; ia++) {
            temp[keyList[ia]] = true;
        }
        //add keys not in the list
        for(var key in data) {
            if(!temp[key]) {
                keyList.push(key);
                temp[key] = true;
            }
        }
    }
    else if(dataType == "Array") {
        if(data.length > keyList.length) {
            for(var ib = keyList.length; ib < data.length; ib++) {
                keyList.push(ib);
            }
        }
    }
    else {
    //no modification
    }
}

/** This gets the display type for a given object format
 * @private */
visicomp.visiui.TableGrid.prototype.getTypeForFormat  = function(format) {
    if((format == "Array")||(format == "Object")) {
        return format;
    }
    else {
        return "SimpleCell";
    }
}
