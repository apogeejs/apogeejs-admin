/** This namespace contains functions to process an update to a table. */
visicomp.core.updatetable = {};

/** UPDATE TABLE HANDLER
 * This handler should be called to request an update to a table, including the
 * value, the formula or the initilializer.
 * 
 * Event object format:
 * { 
 *	table: [table], 
 *	value: [object], 
 *	formula: [formula text],
 *	supplementalCode: [supplementalCode],
 * }
 */
visicomp.core.updatetable.UPDATE_TABLE_HANDLER = "updateTable";

/** UPDATE TABLES HANDLER
 * This handler should be called to request an update to a table, including the
 * value, the formula or the initilializer.
 * 
 * Event object format:
 * An array of table update objects
 */
visicomp.core.updatetable.UPDATE_TABLES_HANDLER = "updateTables";

/** TABLE UPDATED EVENT
 * This listener event is fired when after a table is updated, to be used to respond
 * to the table update such as to update the UI.
 * 
 * Event object Format:
 * [table]
 */
visicomp.core.updatetable.TABLE_UPDATED_EVENT = "tableUpdated";

visicomp.core.updatetable.fireUpdatedEvent = function(table) {
    var workspace = table.getWorkspace();
    var eventManager = workspace.getEventManager();
    eventManager.dispatchEvent(visicomp.core.updatetable.TABLE_UPDATED_EVENT,table);
}

/** This is the listener for the update table event. */
visicomp.core.updatetable.onUpdateTable = function(updateData) {
    
    //update table content
    visicomp.core.updatetable.updateTableContent(updateData);
    
    //recalculate
    var recalculateList = [];
    visicomp.core.updatetable.addToRecalculateList(recalculateList,updateData.table);
    visicomp.core.updatetable.recalculateTables(recalculateList);
        
    //return success
    return {
        "success":true
    };
}


/** This is the listener for the update table event. */
visicomp.core.updatetable.onUpdateTables = function(updateDataList) {

    var recalculateList = [];
    
    //update tables and add to recalculate list
    for(var i = 0; i < updateDataList.length; i++) {
        var data = updateDataList[i];
        visicomp.core.updatetable.updateTableContent(data);
        visicomp.core.updatetable.addToRecalculateList(recalculateList,data.table);
    }
    
    //recalculate tables
    visicomp.core.updatetable.recalculateTables(recalculateList);
    
    //return success
    return {
        "success":true
    };
}

visicomp.core.updatetable.updateTableContent = function(updateData) {
    //read handler data
    var table = updateData.table;
    var formulaText = updateData.formula;
    var supplementalCodeText = updateData.supplementalCode;
    var data = updateData.data;
	
    //set forumula or value, not both
    if(formulaText) {
        //create code for formula
        var codeInfo = visicomp.core.updatetable.createCodeInfo(table,formulaText,supplementalCodeText);
        //we might have error info here!
		
        //set code
        table.setCodeInfo(codeInfo);
    }
    else {
        //clear the formula
        table.setCodeInfo(null,null);

        //set data
        table.setData(data);
		
		//fire this for the change in value
		visicomp.core.updatetable.fireUpdatedEvent(table);
    }
}	
    
/** This method subscribes to the update table handler event */
visicomp.core.updatetable.initHandler = function(eventManager) {
    eventManager.addHandler(visicomp.core.updatetable.UPDATE_TABLE_HANDLER, 
            visicomp.core.updatetable.onUpdateTable);
    eventManager.addHandler(visicomp.core.updatetable.UPDATE_TABLES_HANDLER, 
            visicomp.core.updatetable.onUpdateTables);
}

/** This method creates the code info from the formula text. */
visicomp.core.updatetable.createCodeInfo = function(table,formula,supplementalCode) {
    
    //instantiate the code analyzer
    var codeAnalyzer = new visicomp.core.CodeAnalyzer(table);
    //check code
    var success = codeAnalyzer.analyzeCode(formula);
    
//we should check the supplementao code! (it should not depend on any tables!)

    //set code
    var codeInfo = {};
    codeInfo.formula = formula;
    codeInfo.supplementalCode = supplementalCode;
    if(success) {
        codeInfo.dependsOn = codeAnalyzer.getDependancies();
    }
    else {
        codeInfo.errors = codeAnalyzer.getErrors();
    }
    return codeInfo;
}

//============================================
// Recalculate Tables
//============================================

/** This addes the table to the recalculate list, if it has a formula and hence
 * needs to be recalculated. It then adds all talbes that depend on this one.
 * @private */
visicomp.core.updatetable.addToRecalculateList = function(recalculateList,table) {
     
    //add this table if it has a formula - only needed for initial table really
    if(table.hasFormula()) {
        visicomp.core.updatetable.placeInRecalculateList(recalculateList,table);
    }
    //add any table that is depends on this one
    var impactsList = table.getImpactsList();
    for(var i = 0; i < impactsList.length; i++) {
        visicomp.core.updatetable.placeInRecalculateList(recalculateList,impactsList[i]);
    }
}

/** This method places the table in the recalculate list, but only if the table is 
 * not already there. 
 *  @private */
visicomp.core.updatetable.placeInRecalculateList = function(recalculateList,table) {
    //make sure it is not already in there
    var inList = false;
    for(var j = 0; j < recalculateList.length; j++) {
        var testTable = recalculateList[j];
        if(testTable == table) {
            inList = true;
            break;
        }
    }
    //add to the list, if it is not already there
    if(!inList) {
        recalculateList.push(table);
    }
}
    

/** This method sorts the recalcultae list into the proper order and then
 * recalculates all the tables in it. */
visicomp.core.updatetable.recalculateTables = function(recalculateList) {
	
    //sort the list so we can update once each
    var success = visicomp.core.updatetable.sortRecalculateList(recalculateList);
    if(!success) return;
	
    //update each of the items in this list
    visicomp.core.updatetable.callRecalculateList(recalculateList);
}

/** This method updates the recalculate list order so no table appears in the list
 *before a table it depends on. This will return false if it fails. 
 * @private */
visicomp.core.updatetable.sortRecalculateList = function(recalculateList) {
	
	//working variables
	var sortedRecalculateList = [];
	var table;
	var i;
	
	//keep track of which tables have been copied to the sorted list
	var tableIsSortedMap = {};
	for(i = 0; i < recalculateList.length; i++) {
		table = recalculateList[i];
		tableIsSortedMap[table.getFullName()] = false;
	}
	
	//sort the list
	while(recalculateList.length > 0) {
		//this is to check if we did anything this iteration
		var tablesAddedToSorted = false;
		
		//cycle through the table list. A table can be copied to the sorted
		//list once it has no dependencies that have not yet been copied, or in 
		//other words, it has no depedencies that have not been updated yet.
		for(i = 0; i < recalculateList.length; i++) {
			//cyucle through tables
			table = recalculateList[i];
			
			//check if there are any unsorted dependencies
			var unsortedImpactedDependencies = false;
			var dependsOn = table.getDependsOn();
			for(var j = 0; j < dependsOn.length; j++) {
				var remoteTable = dependsOn[j].table;
				if(tableIsSortedMap[remoteTable.getFullName()] === false) {
					//this depends on an unsorted table
					unsortedImpactedDependencies = true;
					break;
				}
			}
			
			//save table to sorted if there are no unsorted impacted dependencies
			if(!unsortedImpactedDependencies) {
				//add to the end of the sorted list
				sortedRecalculateList.push(table);
				//record that is has been sorted
				tableIsSortedMap[table.getFullName()] = true;
				//remove it from unsorted list
				recalculateList.splice(i,1);
				//flag that we moved a table this iteration of while loop
				tablesAddedToSorted = true;
			}
		}
		
		//if we added no tables to sorted this iteration, there must be a circular reference
		if(!tablesAddedToSorted) {
			alert("failure in update cascade - Is there a curcular reference?");
            return false;
		}
		
	}
	
	//copy working sorted list back to input list object
	for(i = 0; i < sortedRecalculateList.length; i++) {
		recalculateList.push(sortedRecalculateList[i]);
	}
	
	return true;
	
}

/** This calls the update method for each object in the impacted list.
 * @private */
visicomp.core.updatetable.callRecalculateList = function(recalculateList) {
    var table;
    for(var i = 0; i < recalculateList.length; i++) {
        table = recalculateList[i];
		
        //update the table
        visicomp.core.runTableFormula(table);
        
		//fire this for the change in value
		visicomp.core.updatetable.fireUpdatedEvent(table);
    }
}









