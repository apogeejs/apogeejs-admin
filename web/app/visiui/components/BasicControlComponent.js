/** This is a mixin that encapsulates the base functionality of an abstract resource component
 * 
 * This is not a class, but it is used for the prototype of the objects that inherit from it.
 */
visicomp.app.visiui.BasicControlComponent = {};

/** This is the initializer for the component. The object passed is the core object
 * associated with this component. */
visicomp.app.visiui.BasicControlComponent.init = function() {}

//==============================
// Protected and Private Instance Methods
//==============================

///** This method should be implemented to create the UI at initialization time. 
//* It is called when the UI is ready to be constructed. */
//visicomp.app.visiui.BasicControlComponent.prototype.addToFrame = function();

/** This method populates the frame for this component. */
visicomp.app.visiui.BasicControlComponent.populateFrame = function() {
	
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
 * the resource. 
 * @private */    
visicomp.app.visiui.BasicControlComponent.memberUpdated = function() {
    //execute the resource on an update
    var control = this.getObject();
    var resource = control.getResource();
    if((resource)&&(resource.run)) {
        resource.run();
    }    
}

//======================================
// Static methods
//======================================


