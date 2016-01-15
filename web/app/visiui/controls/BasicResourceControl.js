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

/** This method populates the frame for this control. */
visicomp.app.visiui.BasicResourceControl.populateFrame = function() {
    
    var window = this.getWindow();
	
	//set the child UI object onto the control engine
    var resource = this.getObject();
	var resourceProcessor = resource.getResourceProcessor();
	if(resourceProcessor) {
		resourceProcessor.setWindow(window);
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
        this.addToFrame();
    }

}

/** This is called when the data is updated. There is no action here since it is
 * done by the resource processor. 
 * @private */    
visicomp.app.visiui.BasicResourceControl.memberUpdated = function() {    
}

//======================================
// Static methods
//======================================


