/* 
 * Constructor
 */
visicomp.app.visiui.WorkbookUI = function(name,eventManager,tabFrame) {
    //properties
    this.name = name;
    this.tabFrame = tabFrame;
    this.worksheets = {};
    this.activeWorksheetName = null;
    this.workbook = new visicomp.core.Workbook(name,eventManager);
    this.eventManager = eventManager;
    
    //listeners
    var instance = this;
    
    //add menu listeners
    var addWorksheetListener = function() {
        var onCreate = function(name) {
            return instance.addWorksheet(name);
        }
        visicomp.app.visiui.dialog.createWorksheetDialog(onCreate);
    }
    this.eventManager.addListener("workbookAddWorksheet",addWorksheetListener);

    var addTableListener = function() {
        var onCreate = function(worksheet,tableName) {
            return instance.addTable(worksheet,tableName);
        }
        visicomp.app.visiui.dialog.createTableDialog(instance.worksheets,instance.activeWorksheetName,onCreate);
    }
    this.eventManager.addListener("worksheetAddTable",addTableListener);
    
    //add worksheet created listener
    var worksheetAddedListener = function(worksheet) {
        instance.worksheetAdded(worksheet);
    }
    this.eventManager.addListener(visicomp.core.createworksheet.WORKSHEET_CREATED_EVENT, worksheetAddedListener);
    
    //add table created listener
    var tableAddedListener = function(table) {
        instance.tableAdded(table);
    }
    this.eventManager.addListener(visicomp.core.createtable.TABLE_CREATED_EVENT, tableAddedListener);
}

visicomp.app.visiui.WorkbookUI.newTableX = 100;
visicomp.app.visiui.WorkbookUI.newTableY = 50;

visicomp.app.visiui.WorkbookUI.newTableDeltaX = 50;
visicomp.app.visiui.WorkbookUI.newTableDeltaY = 50;

/** This method responds to a "new" menu event. */
visicomp.app.visiui.WorkbookUI.prototype.getWorkbook = function() {
    return this.workbook;
}

/** This method responds to a "new" menu event. */
visicomp.app.visiui.WorkbookUI.prototype.addWorksheet = function(name) {
    //create worksheet
    var handlerData = {};
    handlerData.name = name;
    handlerData.workbook = this.workbook;
    var result = this.eventManager.callHandler(
        visicomp.core.createworksheet.CREATE_WORKSHEET_HANDLER,
        handlerData);
    return result;
}

/** This method responds to a "new" menu event. */
visicomp.app.visiui.WorkbookUI.prototype.worksheetAdded = function(worksheet) {
    //make sure this is for us
    if(worksheet.getWorkbook() != this.workbook) return;

    var worksheetInfo = {"worksheet":worksheet,tables:{}};
    this.worksheets[worksheet.getName()] = worksheetInfo;
    
    this.tabFrame.addTab(worksheet.getName());
}

/** This method responds to a "new" menu event. */
visicomp.app.visiui.WorkbookUI.prototype.addTable = function(worksheet, name) {
    //create table
    var handlerData = {};
    handlerData.name = name;
    handlerData.worksheet = worksheet;
    var result = this.eventManager.callHandler(
        visicomp.core.createtable.CREATE_TABLE_HANDLER,
        handlerData);
    return result;
}

/** This method responds to a "new" menu event. */
visicomp.app.visiui.WorkbookUI.prototype.tableAdded = function(table) {

    var worksheet = table.getWorksheet();

    //make sure this is for us
    if(worksheet.getWorkbook() != this.workbook) return;
    
    //create the table
    var tab = this.tabFrame.getTabElement(worksheet.getName());
    if(!tab) {
        alert("Unknown error: worksheet tab not found.");
        return;
    }
    
    var tableUI = new visicomp.visiui.TableUI(table,tab);
    
    //store the table info
    var worksheetInfo = this.worksheets[worksheet.getName()];
    var tableInfo = {"table":table,"tableUI":tableUI};
    worksheetInfo[table.getName()] = tableInfo;
    
    //show the table
    var window = tableUI.getWindow();
    window.setPosition(visicomp.app.visiui.WorkbookUI.newTableX,visicomp.app.visiui.WorkbookUI.newTableY);
    visicomp.app.visiui.WorkbookUI.newTableX += visicomp.app.visiui.WorkbookUI.newTableDeltaX;
    visicomp.app.visiui.WorkbookUI.newTableY += visicomp.app.visiui.WorkbookUI.newTableDeltaY;
    window.show();
}

