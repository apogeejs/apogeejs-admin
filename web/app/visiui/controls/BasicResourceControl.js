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

///** This method should be implemented to add any data to the control at initialization time. */
//visicomp.app.visiui.CustomResourceControl.prototype.addToFrame = function();

/** This method populates the frame for this control. */
visicomp.app.visiui.BasicResourceControl.populateFrame = function() {
	
    //create the menu
    var menuItemInfoList = this.getMenuItemInfoList();
  
    var itemInfo = {};
    itemInfo.title = "Edit&nbsp;Initializer&nbsp;Code";
    itemInfo.callback = this.createEditCodeableDialogCallback(itemInfo.title);
    
    //add these at the start of the menu
    menuItemInfoList.splice(0,0,itemInfo);

    //check if the implementation wants to do anything
    if(this.addToFrame) {
        this.addToFrame();
    }

}

/** This is called when the data is updated. This calls the "run" method of
 * the resource processor. 
 * @private */    
visicomp.app.visiui.BasicResourceControl.memberUpdated = function() {
    //execute the resource processor on an update
    var resource = this.getObject();
    var resourceProcessor = resource.getResourceProcessor();
    if((resourceProcessor)&&(resourceProcessor.run)) {
        resourceProcessor.run();
    }    
}

//======================================
// Static methods
//======================================


