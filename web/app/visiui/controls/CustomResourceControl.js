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

visicomp.app.visiui.CustomResourceControl.prototype.initEmptyProcessor = function() {
	this.update("","","","");
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
    //store the processor info
    var resource = this.getObject();
	var resourceProcessor = resource.getResourceProcessor();
    if(resourceProcessor) {
        json.processor = {};
        json.processor.html = resourceProcessor.getHtml();
        json.processor.customizeScript = resourceProcessor.getCustomizeScript();
        json.processor.supplementalCode = resourceProcessor.getSupplementalCode();
        json.processor.css = resourceProcessor.getCss();
    }
}

/** This method deseriliazes any data needed after the control is instantiated.
 * objects that extend Control should override this for any data that is
 * needed, however they should call this base function first. */
visicomp.app.visiui.CustomResourceControl.prototype.updateFromJson = function(json,updateDataList) {
    visicomp.app.visiui.Control.updateFromJson.call(this,json,updateDataList);
    
    //internal data
    if(json.processor) {
        this.update(json.processor.html,
            json.processor.customizeScript,
            json.processor.supplementalCode,
            json.processor.css);
    }
    else {
        this.initEmptyProcessor();
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
        
        //if we do not load from a json, we must manually set the resource processor
        //this is because here we store processor data in the JSON. If we try creating
        //an empty one it might not be compatible with the existing initializer code int
        //the resource. 
        //In cases where the resourceProcessor does not save data in the json, which
        //is the typical scenario, then this is not an issue.
        customResourceControl.initEmptyProcessor();
        
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
    else {
        customResourceControl.initEmptyProcessor();
    }
    
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


