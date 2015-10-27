/** Namespace for the core logic for manipulating tables. */
visicomp.core = {}

/** Namespace for table update code, so the user can run it in the debugger. */
visicomp.core.updateCode = {};

/** This is a simple entry point to debug user code */
visicomp.core.runTableFormula = function(table) {
    var tableName = table.getName();
    var worksheetName = table.worksheet.getName();
    var workbookName = table.worksheet.getWorkbook().getName();
    
    var updateCommand = visicomp.core.updateCode[workbookName][worksheetName][tableName];
    if(updateCommand) {
        //step in here to debug user code for a given table
        updateCommand(table);
    }
    else {
        throw "Table update command not found";
    }
}


