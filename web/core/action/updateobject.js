/** This namespace contains functions to process an update to an object
 * which inherits from the FunctionBase component. */
visicomp.core.updateobject = {};

/** UPDATE OBJECT HANDLER
 * This handler should be called to request an update to a object, including the
 * value, the formula or the initilializer.
 * 
 * Event object format:
 * { 
 *	object: [object], 
 *	value: [object], 
 *	formula: [formula text],
 *	supplementalCode: [supplementalCode],
 * }
 */
visicomp.core.updateobject.UPDATE_OBJECT_HANDLER = "updateObject";

/** UPDATE OBJECTS HANDLER
 * This handler should be called to request an update to a object, including the
 * value, the formula or the initilializer.
 * 
 * Event object format:
 * An array of object update objects
 */
visicomp.core.updateobject.UPDATE_OBJECTS_HANDLER = "updateObjects";

/** object UPDATED EVENT
 * This listener event is fired when after a object is updated, to be used to respond
 * to the object update such as to update the UI.
 * 
 * Event object Format:
 * [object]
 */
visicomp.core.updateobject.OBJECT_UPDATED_EVENT = "objectUpdated";

visicomp.core.updateobject.fireUpdatedEvent = function(object) {
    var workspace = object.getWorkspace();
    var eventManager = workspace.getEventManager();
    eventManager.dispatchEvent(visicomp.core.updateobject.OBJECT_UPDATED_EVENT,object);
}

/** This is the listener for the update object event. */
visicomp.core.updateobject.onUpdateObject = function(updateData) {
    
    //update object content
	if(!updateData.object) {
		alert("Error: missing object");
		return;
	}
    updateData.object.setContent(updateData);
    
    //recalculate
    var recalculateList = [];
    visicomp.core.updateobject.addToRecalculateList(recalculateList,updateData.object);
    visicomp.core.updateobject.recalculateObjects(recalculateList);
        
    //return success
    return {
        "success":true
    };
}


/** This is the listener for the update objects event. */
visicomp.core.updateobject.onUpdateObjects = function(updateDataList) {

    var recalculateList = [];
    
    //update objects and add to recalculate list
    for(var i = 0; i < updateDataList.length; i++) {
        var data = updateDataList[i];
        if(!data.object) {
			Alert("Error: missing object");
			return;
		}
		data.object.setContent(data);
        visicomp.core.updateobject.addToRecalculateList(recalculateList,data.object);
    }
    
    //recalculate objects
    visicomp.core.updateobject.recalculateObjects(recalculateList);
    
    //return success
    return {
        "success":true
    };
}
    
/** This method subscribes to the update object handler event */
visicomp.core.updateobject.initHandler = function(eventManager) {
    eventManager.addHandler(visicomp.core.updateobject.UPDATE_OBJECT_HANDLER, 
            visicomp.core.updateobject.onUpdateObject);
    eventManager.addHandler(visicomp.core.updateobject.UPDATE_OBJECTS_HANDLER, 
            visicomp.core.updateobject.onUpdateObjects);
}

/** This method creates the code info from the formula text. */
visicomp.core.updateobject.createCodeInfo = function(object,formula,supplementalCode) {
    
    //instantiate the code analyzer
    var codeAnalyzer = new visicomp.core.CodeAnalyzer(object);
    //check code
    var success = codeAnalyzer.analyzeCode(formula);
    
//we should check the supplementao code! (it should not depend on any objects!)

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
// Recalculate objects
//============================================

/** This addes the object to the recalculate list, if it has a formula and hence
 * needs to be recalculated. It then adds all talbes that depend on this one.
 * @private */
visicomp.core.updateobject.addToRecalculateList = function(recalculateList,object) {
     
    //add this object to recalculate list if it needs to be executed
    if(object.needsExecuting()) {
        visicomp.core.updateobject.placeInRecalculateList(recalculateList,object);
    }
    //add any object that is depends on this one
    var impactsList = object.getImpactsList();
    for(var i = 0; i < impactsList.length; i++) {
        visicomp.core.updateobject.placeInRecalculateList(recalculateList,impactsList[i]);
    }
}

/** This method places the object in the recalculate list, but only if the object is 
 * not already there. 
 *  @private */
visicomp.core.updateobject.placeInRecalculateList = function(recalculateList,object) {
    //make sure it is not already in there
    var inList = false;
    for(var j = 0; j < recalculateList.length; j++) {
        var testObject = recalculateList[j];
        if(testObject == object) {
            inList = true;
            break;
        }
    }
    //add to the list, if it is not already there
    if(!inList) {
        recalculateList.push(object);
    }
}
    

/** This method sorts the recalcultae list into the proper order and then
 * recalculates all the objects in it. */
visicomp.core.updateobject.recalculateObjects = function(recalculateList) {
	
    //sort the list so we can update once each
    var success = visicomp.core.updateobject.sortRecalculateList(recalculateList);
    if(!success) return;
	
    //update each of the items in this list
    visicomp.core.updateobject.callRecalculateList(recalculateList);
}

/** This method updates the recalculate list order so no object appears in the list
 *before a object it depends on. This will return false if it fails. 
 * @private */
visicomp.core.updateobject.sortRecalculateList = function(recalculateList) {
	
	//working variables
	var sortedRecalculateList = [];
	var object;
	var i;
	
	//keep track of which objects have been copied to the sorted list
	var objectIsSortedMap = {};
	for(i = 0; i < recalculateList.length; i++) {
		object = recalculateList[i];
		objectIsSortedMap[object.getFullName()] = false;
	}
	
	//sort the list
	while(recalculateList.length > 0) {
		//this is to check if we did anything this iteration
		var objectsAddedToSorted = false;
		
		//cycle through the object list. A object can be copied to the sorted
		//list once it has no dependencies that have not yet been copied, or in 
		//other words, it has no depedencies that have not been updated yet.
		for(i = 0; i < recalculateList.length; i++) {
			//cyucle through objects
			object = recalculateList[i];
			
			//check if there are any unsorted dependencies
			var unsortedImpactedDependencies = false;
			var dependsOn = object.getDependsOn();
			for(var j = 0; j < dependsOn.length; j++) {
				var remoteObject = dependsOn[j].table;
				if(objectIsSortedMap[remoteObject.getFullName()] === false) {
					//this depends on an unsorted object
					unsortedImpactedDependencies = true;
					break;
				}
			}
			
			//save object to sorted if there are no unsorted impacted dependencies
			if(!unsortedImpactedDependencies) {
				//add to the end of the sorted list
				sortedRecalculateList.push(object);
				//record that is has been sorted
				objectIsSortedMap[object.getFullName()] = true;
				//remove it from unsorted list
				recalculateList.splice(i,1);
				//flag that we moved a object this iteration of while loop
				objectsAddedToSorted = true;
			}
		}
		
		//if we added no objects to sorted this iteration, there must be a circular reference
		if(!objectsAddedToSorted) {
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
visicomp.core.updateobject.callRecalculateList = function(recalculateList) {
    var object;
    for(var i = 0; i < recalculateList.length; i++) {
        object = recalculateList[i];
		
        //update the object
        object.execute();
        
		//fire this for the change in value
		visicomp.core.updateobject.fireUpdatedEvent(object);
    }
}









