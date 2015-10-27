if(!visicomp.app) visicomp.app = {};
if(!visicomp.app.visiui) visicomp.app.visiui = {};
if(!visicomp.app.visiui.dialog) visicomp.app.visiui.dialog = {};

/** Constructor */
visicomp.app.visiui.VisiComp = function(containerId) {
    
    this.eventManager = new visicomp.core.EventManager();

    //create a menu
    var menuBar = new visicomp.visiui.MenuBar(containerId,this.eventManager);
    var menu;

    menu = menuBar.addMenu("File");
    menu.addMenuItem("New","menuFileNew");
    menu.addMenuItem("Open","menuFileOpen");
    menu.addMenuItem("Save","menuFileSave");
    menu.addMenuItem("Close","menuFileClose");

    menu = menuBar.addMenu("Workbook");
    menu.addMenuItem("Add&nbsp;Worksheet","workbookAddWorksheet");
    menu.addMenuItem("Add&nbsp;Table","worksheetAddTable");				

    //add some tabs
    this.tabFrame = new visicomp.visiui.TabFrame(containerId);
    this.workbookUI = null;
    
    //add menu listeners
    var instance = this;
    var newListener = function() {
        if(instance.workbookOpen()) {
            alert("You must close the existing workbook before opening another.");
            return;
        }
        
        var onCreate = function(name) {
            return instance.createWorkbook(name);
        }
        visicomp.app.visiui.dialog.createWorkbookDialog(onCreate); 
    }
    this.eventManager.addListener("menuFileNew",newListener);
    
    var openListener = function() {
        if(instance.workbookOpen()) {
            alert("You must close the existing workbook before opening another.");
            return;
        }
        
        var onOpen = function(workbookData) {
            return instance.openWorkbook(workbookData);
        }
        visicomp.app.visiui.dialog.openWorkbookDialog(onOpen); 
    }
    this.eventManager.addListener("menuFileOpen",openListener);
    
    var saveListener = function() {
        visicomp.app.visiui.dialog.saveWorkbookDialog(instance.workbookUI); 
    }
    this.eventManager.addListener("menuFileSave",saveListener);
    
    
    var closeListener = function() {
        //add a "are you sure" dialog!!
        instance.closeWorkbook();
    }
    this.eventManager.addListener("menuFileClose",closeListener);
    
    //initialize business logic handlers

    visicomp.core.createworksheet.initHandler(this.eventManager);
    visicomp.core.createtable.initHandler(this.eventManager);
    visicomp.core.updatetable.initHandler(this.eventManager);
}

/** This method responds to a "new" menu event. */
visicomp.app.visiui.VisiComp.prototype.createWorkbook = function(name) {
    
    this.workbookUI = new visicomp.app.visiui.WorkbookUI(name,this.eventManager,this.tabFrame);
    
    return {"success":true};
}

/** This method responds to a "open" menu event. */
visicomp.app.visiui.VisiComp.prototype.openWorkbook = function(workbookText) {
    
    var workbookData = JSON.parse(workbookText);
    
    //create workbook
    var workbookName = workbookData.name;
    this.createWorkbook(workbookName);
    var workbook = this.workbookUI.getWorkbook();
    
    //this will be used to command the table update
    var tableUpdateList = [];
    
    //create worksheets
    for(var worksheetName in workbookData.worksheets) {
        //create and lookup worksheet
        var worksheetData = workbookData.worksheets[worksheetName];
        this.workbookUI.addWorksheet(worksheetData.name);
        var worksheet = workbook.lookupWorksheet(worksheetData.name);
        
        //create tables for this worksheet
        for(var tableName in worksheetData.tables) {
            var tableData = worksheetData.tables[tableName];
            this.workbookUI.addTable(worksheet,tableData.name);
            var table = worksheet.lookupTable(tableData.name);
            
            //save the data to set the tables' value or formula
            var tableUpdateData = {};
            tableUpdateData.table = table;
            tableUpdateData.formula = tableData.formula;
            tableUpdateData.supplementalCode = tableData.supplementalCode;
            tableUpdateData.data = tableData.data;
            tableUpdateList.push(tableUpdateData);
        }
    }
    
    //update the tables
    var result = this.eventManager.callHandler(
            visicomp.core.updatetable.UPDATE_TABLES_HANDLER,tableUpdateList);
        
    return result;
}

/** This method responds to a "open" menu event. */
visicomp.app.visiui.VisiComp.prototype.closeWorkbook = function() {
    location.reload();
}

/** This method responds to a "open" menu event. */
visicomp.app.visiui.VisiComp.prototype.workbookOpen = function() {
    return (this.workbookUI != null);
}

