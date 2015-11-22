/** This namespace contains functions to process an update to an member
 * which inherits from the FunctionBase component. */
visicomp.core.updatemember = {};

/** UPDATE MEMBER HANDLER
 * This handler should be called to request an update to a member, including the
 * value, the formula or the initilializer.
 * 
 * Event member format:
 * { 
 *	member: [member], 
 *	value: [data], //if data is set directly, otherwise use code 
 *	functionBody: [formula text],
 *	supplementalCode: [supplementalCode],
 * }
 */
visicomp.core.updatemember.UPDATE_MEMBER_HANDLER = "updateMember";

/** UPDATE MEMBERS HANDLER
 * This handler should be called to request an update to a member, including the
 * value, the formula or the initilializer.
 * 
 * Event member format:
 * An array of member update members
 */
visicomp.core.updatemember.UPDATE_MEMEBERS_HANDLER = "updateMemebers";

/** member UPDATED EVENT
 * This listener event is fired when after a member is updated, to be used to respond
 * to the member update such as to update the UI.
 * 
 * Event member Format:
 * [member]
 */
visicomp.core.updatemember.OBJECT_UPDATED_EVENT = "memberUpdated";

visicomp.core.updatemember.fireUpdatedEvent = function(member) {
    var workspace = member.getWorkspace();
    var eventManager = workspace.getEventManager();
    eventManager.dispatchEvent(visicomp.core.updatemember.MEMBER_UPDATED_EVENT,member);
}

/** This is the listener for the update member event. */
visicomp.core.updatemember.onUpdateObject = function(updateData) {
    
    //update member content
    visicomp.core.updatemember.setContent(updateData);
    
    //recalculate
    var recalculateList = [];
    visicomp.core.updatemember.addToRecalculateList(recalculateList,updateData.member);
    visicomp.core.updatemember.recalculateObjects(recalculateList);
        
    //return success
    return {
        "success":true
    };
}


/** This is the listener for the update members event. */
visicomp.core.updatemember.onUpdateObjects = function(updateDataList) {

    var recalculateList = [];
    
    //update members and add to recalculate list
    for(var i = 0; i < updateDataList.length; i++) {
        var data = updateDataList[i];
		visicomp.core.updatemember.setContent(data);
        visicomp.core.updatemember.addToRecalculateList(recalculateList,data.member);
    }
    
    //recalculate members
    visicomp.core.updatemember.recalculateObjects(recalculateList);
    
    //return success
    return {
        "success":true
    };
}
    
/** This method subscribes to the update member handler event */
visicomp.core.updatemember.initHandler = function(eventManager) {
    eventManager.addHandler(visicomp.core.updatemember.UPDATE_MEMBER_HANDLER, 
            visicomp.core.updatemember.onUpdateObject);
    eventManager.addHandler(visicomp.core.updatemember.UPDATE_MEMBERS_HANDLER, 
            visicomp.core.updatemember.onUpdateObjects);
}


/** This method updates the data for the member. It should be implemented by
 * the member.
 * @protected */
visicomp.core.updatemember.setContent = function(contentData) {
    var member = contentData.member;
	if(!member) {
		alert("Error: missing member");
		return;
	}

    //read handler data
    var functionText = contentData.functionText;
    var supplementalCode = contentData.supplementalCode;
    var editorInfo = contentData.editorInfo;
    var data = contentData.data;
	
    //set forumula or value, not both
    if(functionText) {
        
        //create code for formula
        var codeInfo = visicomp.core.updatemember.createCodeInfo(member,functionText,supplementalCode);
        //we might have error info here!
		
        //set code
        member.setCodeInfo(codeInfo);
        member.setEditorInfo(editorInfo);
    }
    else {
        //clear the formula
        member.clearCodeInfo();

        //set data
        member.setData(data);
		
		//fire this for the change in value
		visicomp.core.updatemember.fireUpdatedEvent(member);
    }
}	

/** This method creates the code info from the formula text. */
visicomp.core.updatemember.createCodeInfo = function(member,functionText,supplementalCode) {
    
    //instantiate the code analyzer
    var codeAnalyzer = new visicomp.core.CodeAnalyzer(member);
    //check code
    var success = codeAnalyzer.analyzeCode(functionText,supplementalCode);
    
//we should check the supplementao code! (it should not depend on any members!)

    //set code
    var codeInfo = {};
    codeInfo.functionText = functionText;
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
// Recalculate members
//============================================

/** This addes the member to the recalculate list, if it has a formula and hence
 * needs to be recalculated. It then adds all talbes that depend on this one.
 * @private */
visicomp.core.updatemember.addToRecalculateList = function(recalculateList,member) {
     
    //add this member to recalculate list if it needs to be executed
    if(member.needsExecuting()) {
        visicomp.core.updatemember.placeInRecalculateList(recalculateList,member);
    }
    //add any member that is depends on this one
    var impactsList = member.getImpactsList();
    for(var i = 0; i < impactsList.length; i++) {
        visicomp.core.updatemember.placeInRecalculateList(recalculateList,impactsList[i]);
    }
}

/** This method places the member in the recalculate list, but only if the member is 
 * not already there. 
 *  @private */
visicomp.core.updatemember.placeInRecalculateList = function(recalculateList,member) {
    //make sure it is not already in there
    var inList = false;
    for(var j = 0; j < recalculateList.length; j++) {
        var testObject = recalculateList[j];
        if(testObject == member) {
            inList = true;
            break;
        }
    }
    //add to the list, if it is not already there
    if(!inList) {
        recalculateList.push(member);
    }
}
    

/** This method sorts the recalcultae list into the proper order and then
 * recalculates all the members in it. */
visicomp.core.updatemember.recalculateObjects = function(recalculateList) {
	
    //sort the list so we can update once each
    var success = visicomp.core.updatemember.sortRecalculateList(recalculateList);
    if(!success) return;
	
    //update each of the items in this list
    visicomp.core.updatemember.callRecalculateList(recalculateList);
}

/** This method updates the recalculate list order so no member appears in the list
 *before a member it depends on. This will return false if it fails. 
 * @private */
visicomp.core.updatemember.sortRecalculateList = function(recalculateList) {
	
	//working variables
	var sortedRecalculateList = [];
	var member;
	var i;
	
	//keep track of which members have been copied to the sorted list
	var memberIsSortedMap = {};
	for(i = 0; i < recalculateList.length; i++) {
		member = recalculateList[i];
		memberIsSortedMap[member.getFullName()] = false;
	}
	
	//sort the list
	while(recalculateList.length > 0) {
		//this is to check if we did anything this iteration
		var membersAddedToSorted = false;
		
		//cycle through the member list. A member can be copied to the sorted
		//list once it has no dependencies that have not yet been copied, or in 
		//other words, it has no depedencies that have not been updated yet.
		for(i = 0; i < recalculateList.length; i++) {
			//cyucle through members
			member = recalculateList[i];
			
			//check if there are any unsorted dependencies
			var unsortedImpactedDependencies = false;
			var dependsOn = member.getDependsOn();
			for(var j = 0; j < dependsOn.length; j++) {
				var remoteObject = dependsOn[j].member;
				if(memberIsSortedMap[remoteObject.getFullName()] === false) {
					//this depends on an unsorted member
					unsortedImpactedDependencies = true;
					break;
				}
			}
			
			//save member to sorted if there are no unsorted impacted dependencies
			if(!unsortedImpactedDependencies) {
				//add to the end of the sorted list
				sortedRecalculateList.push(member);
				//record that is has been sorted
				memberIsSortedMap[member.getFullName()] = true;
				//remove it from unsorted list
				recalculateList.splice(i,1);
				//flag that we moved a member this iteration of while loop
				membersAddedToSorted = true;
			}
		}
		
		//if we added no members to sorted this iteration, there must be a circular reference
		if(!membersAddedToSorted) {
			alert("failure in update cascade - Is there a curcular reference?");
            return false;
		}
		
	}
	
	//copy working sorted list back to input list member
	for(i = 0; i < sortedRecalculateList.length; i++) {
		recalculateList.push(sortedRecalculateList[i]);
	}
	
	return true;
	
}

/** This calls the update method for each member in the impacted list.
 * @private */
visicomp.core.updatemember.callRecalculateList = function(recalculateList) {
    var member;
    for(var i = 0; i < recalculateList.length; i++) {
        member = recalculateList[i];
		
        //update the member
        member.execute();
        
		//fire this for the change in value
		visicomp.core.updatemember.fireUpdatedEvent(member);
    }
}









