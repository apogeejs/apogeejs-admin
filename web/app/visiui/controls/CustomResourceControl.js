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

visicomp.app.visiui.CustomResourceControl.prototype.update = function(html,processorGeneratorBody,supplementalCode,css) {
	
	//create a new resource processor
	var newProcessor = new visicomp.app.visiui.CustomResourceProcessor();
	newProcessor.setWindow(this.getWindow());
	
	//update it
	newProcessor.update(html,processorGeneratorBody,supplementalCode,css);
	
	//update the resource
	var resource = this.getObject();
	resource.updateResourceProcessor(newProcessor);
}

/** This method populates the frame for this control. */
visicomp.app.visiui.CustomResourceControl.prototype.addToFrame = function() {
	
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


/** This serializes the table control. */
visicomp.app.visiui.CustomResourceControl.prototype.writeToJson = function(json) {
    var resource = this.getObject();
    
    //store the processor info
	var resourceProcessor = resource.getResourceProcessor();
    if(resourceProcessor) {
        json.processor = resourceProcessor.toJson();
    }
}

//======================================
// Static methods
//======================================

//add table listener
visicomp.app.visiui.CustomResourceControl.createControl = function(workspaceUI,parent,name) {
    var json = {};
    json.name = name;
    json.type = visicomp.core.Resource.generator.type;
    var returnValue = visicomp.core.createmember.createMember(parent,json);
    
    if(returnValue.success) {
        var resource = returnValue.member;
        
        //create the control
        var customResourceControl = new visicomp.app.visiui.CustomResourceControl(workspaceUI,resource);
        returnValue.control = customResourceControl;
        
        //set the resource processor
        var resourceProcessor = new visicomp.app.visiui.CustomResourceProcessor();
        resourceProcessor.setWindow(customResourceControl.getWindow());
        resource.updateResourceProcessor(resourceProcessor);
    }
    else {
        //no action for now
    }
    return returnValue;
}


visicomp.app.visiui.CustomResourceControl.createControlFromJson = function(workspaceUI,member,controlData) {
    
    var customResourceControl = new visicomp.app.visiui.CustomResourceControl(workspaceUI,member);
    if(controlData) {
        customResourceControl.updateFromJson(controlData);
        customResourceControl.memberUpdated();
    }
    
    var resourceProcessor = new visicomp.app.visiui.CustomResourceProcessor();
    resourceProcessor.setWindow(customResourceControl.getWindow());    
    if((controlData)&&(controlData.processor)) {
        resourceProcessor.updateFromJson(controlData.processor);
    }
    member.updateResourceProcessor(resourceProcessor);
    
    return customResourceControl;
}

//======================================
// This is the control generator, to register the control
//======================================

visicomp.app.visiui.CustomResourceControl.generator = {};
visicomp.app.visiui.CustomResourceControl.generator.displayName = "Custom Control";
visicomp.app.visiui.CustomResourceControl.generator.uniqueName = "visicomp.app.visiui.CustomResourceControl";
visicomp.app.visiui.CustomResourceControl.generator.createControl = visicomp.app.visiui.CustomResourceControl.createControl;
visicomp.app.visiui.CustomResourceControl.generator.createControlFromJson = visicomp.app.visiui.CustomResourceControl.createControlFromJson;


