/** This is a mixin that encapsulates the base functionality of an abstract resource control
 * 
 * This is not a class, but it is used for the prototype of the objects that inherit from it.
 */
visicomp.app.visiui.BasicResourceControl = {};

/** This is the initializer for the component. The object passed is the core object
 * associated with this control. */
visicomp.app.visiui.BasicResourceControl.init = function() {}

//==============================
// Protected and Private Instance Methods
//==============================

/** This serializes the table control. */
visicomp.app.visiui.BasicResourceControl.writeToJson = function(workspaceUI, json) {
    var resource = this.getObject();
    
    //store the processor info
	var resourceProcessor = resource.getResourceProcessor();
    if(resourceProcessor.toJson) {
        json.processor = resourceProcessor.toJson();
    }
    
    //store the codeable info
	json.functionBody = resource.getFunctionBody();
	json.supplementalCode = resource.getSupplementalCode();
}

/** This method deseriliazes any data needed after the control is instantiated.
 * objects that extend Control should override this for any data that is
 * needed, however they should call this base function first. */
visicomp.app.visiui.BasicResourceControl.updateFromJson = function(json,updateDataList) {
    //call the base update function
    visicomp.app.visiui.Control.updateFromJson.call(this,json,updateDataList);
    
    //load the type specific data
    var updateData = {};
    updateData.member = resource;
    updateData.functionBody = json.functionBody;
    updateData.supplementalCode = json.supplementalCode;
    updateDataList.push(updateData);
}

/** This method populates the frame for this control. */
visicomp.app.visiui.BasicResourceControl.populateFrame = function(controlFrame) {
    
    var window = controlFrame.getWindow();
	
	//set the child UI object onto the control engine
    var resource = this.getObject();
	var resourceProcessor = resource.getResourceProcessor();
	if(resourceProcessor) {
		resourceProcessor.setFrame(controlFrame);
	}
	
    //create the menu
    var menuItemInfoList = this.getMenuItemInfoList();
  
    var itemInfo = {};
    itemInfo.title = "Edit&nbsp;Initializer&nbsp;Code";
    itemInfo.callback = this.createEditCodeableDialogCallback(itemInfo.title);
    
    //add these at the start of the menu
    menuItemInfoList.splice(0,0,itemInfo);

    //dummy size
window.setSize(200,200);

    //check if the implementation wants to do anything
    if(this.addToFrame) {
        this.addToFrame(controlFrame);
    }

}

//======================================
// Static methods
//======================================

/** This method can be called to complete serialization of a basic control. */
visicomp.app.visiui.BasicResourceControl.updateFromJson = function(workspaceUI,json,updateDataList) {
    //call the base update function
    visicomp.app.visiui.Control.updateFromJson.call(this,workspaceUI,json,updateDataList);
		
    var resource = this.getObject();
    if(json.processor) {
        var resourceProcessor = resource.getResourceProcessor();
        resourceProcessor.updateFromJson(json.processor);
    }

    var updateData = {};
    updateData.member = resource;
    updateData.functionBody = json.functionBody;
    updateData.supplementalCode = json.supplementalCode;
    updateDataList.push(updateData);
}

