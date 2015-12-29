/** This control represents a table object. */
visicomp.app.visiui.CustomResourceControl = function(workspaceUI,resource) {
    //base init
    visicomp.app.visiui.Control.init.call(this,workspaceUI,resource,visicomp.app.visiui.CustomResourceControl.generator);
    visicomp.app.visiui.BasicResourceControl.init.call(this);
};

//add components to this class
visicomp.core.util.mixin(visicomp.app.visiui.CustomResourceControl,visicomp.app.visiui.Control);
visicomp.core.util.mixin(visicomp.app.visiui.CustomResourceControl,visicomp.app.visiui.BasicResourceControl);

//==============================
// Protected and Private Instance Methods
//==============================

visicomp.app.visiui.CustomResourceControl.prototype.getResourceProcessor = function() {
	return this.getObject().getResourceProcessor();
}

visicomp.app.visiui.CustomResourceControl.prototype.update = function(html,processorGeneratorBody,supplementalCode,css) {
	
	//create a new resource processor
	var newProcessor = new visicomp.app.visiui.CustomResourceProcessor();
	newProcessor.setFrame(this.frame);
	
	//update it
	newProcessor.update(html,processorGeneratorBody,supplementalCode,css);
	
	//update the resource
	var resource = this.getObject();
	resource.updateResourceProcessor(newProcessor);
}

/** This method populates the frame for this control. */
visicomp.app.visiui.CustomResourceControl.prototype.addToFrame = function(controlFrame) {
	
    //create the menu
    var menuItemInfoList = this.getMenuItemInfoList();

    var itemInfo = {};
    itemInfo.title = "Edit&nbsp;Resource&nbsp;Code";
    itemInfo.callback = this.createEditResourceDialogCallback();
    
    //add these at the start of the menu
    menuItemInfoList.splice(1,0,itemInfo);

}

visicomp.app.visiui.CustomResourceControl.prototype.createEditResourceDialogCallback = function() {
    
    var instance = this;
    
    //create save handler
    var onSave = function(controlHtml,controlOnLoad,supplementalCode,css) {
		instance.update(controlHtml,controlOnLoad,supplementalCode,css);
//figure out what to do with return here
		return {"success":true};
    };
    
    return function() {
        visicomp.app.visiui.dialog.showUpdateCustomControlDialog(instance,onSave);
    }
}

//======================================
// Static methods
//======================================

//add table listener
visicomp.app.visiui.CustomResourceControl.createControl = function(workspaceUI,parent,name) {
	//create a resource with a base custom processor
	var resourceProcessor = new visicomp.app.visiui.CustomResourceProcessor();
    var returnValue = visicomp.core.createresource.createResource(parent,name,resourceProcessor);
    if(returnValue.success) {
        var resource = returnValue.resource;
        var customResourceControl = new visicomp.app.visiui.CustomResourceControl(workspaceUI,resource);
        workspaceUI.addControl(customResourceControl);
        returnValue.control = customResourceControl;
    }
    else {
        //no action for now
    }
    return returnValue;
}

//======================================
// This is the control generator, to register the control
//======================================

visicomp.app.visiui.CustomResourceControl.generator = {};
visicomp.app.visiui.CustomResourceControl.generator.displayName = "Custom Control";
visicomp.app.visiui.CustomResourceControl.generator.uniqueName = "visicomp.app.visiui.CustomResourceControl";
visicomp.app.visiui.CustomResourceControl.generator.createControl = visicomp.app.visiui.CustomResourceControl.createControl;


