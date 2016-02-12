/** This is a custom resource control. 
 * To implement it, the resource script must have the methods "run()" which will
 * be called when the control is updated. It also must have any methods that are
 * confugred with initialization data from the model. */
visicomp.app.visiui.CustomResourceControl = function(workspaceUI,resource,controlJson) {
    //base init
    visicomp.app.visiui.Control.init.call(this,workspaceUI,resource,visicomp.app.visiui.CustomResourceControl.generator,controlJson);
    visicomp.app.visiui.BasicResourceControl.init.call(this);
};

//add components to this class
visicomp.core.util.mixin(visicomp.app.visiui.CustomResourceControl,visicomp.app.visiui.Control);
visicomp.core.util.mixin(visicomp.app.visiui.CustomResourceControl,visicomp.app.visiui.BasicResourceControl);

//==============================
// Protected and Private Instance Methods
//==============================

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

/** This method deseriliazes data for the custom resource control. */
visicomp.app.visiui.CustomResourceControl.prototype.updateFromJson = function(json) {   
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

//=============================
// Action UI Entry Points
//=============================

visicomp.app.visiui.CustomResourceControl.prototype.createEditResourceDialogCallback = function() {
    
    var instance = this;
    
    //create save handler
    var onSave = function(controlHtml,controlOnLoad,supplementalCode,css) {
		var actionResponse = instance.update(controlHtml,controlOnLoad,supplementalCode,css);
        if(!actionResponse.getSuccess()) {
            alert(actionResponse.getErrorMsg());
        }
		return true
    };
    
    return function() {
        visicomp.app.visiui.dialog.showUpdateCustomControlDialog(instance,onSave);
    }
}

//=============================
// Action
//=============================

visicomp.app.visiui.CustomResourceControl.prototype.update = function(html,processorGeneratorBody,supplementalCode,css) {
	var actionResponse = new visicomp.core.ActionResponse();
    var resource = this.getObject();
    
    try { 
        //create a new resource processor
        var newProcessor = new visicomp.app.visiui.CustomResourceProcessor();
        newProcessor.setWindow(this.getWindow());

        //update it
        newProcessor.update(html,processorGeneratorBody,supplementalCode,css);

        //update the resource
        resource.updateResourceProcessor(newProcessor);

        this.memberUpdated();
    }
    catch(error) {
        //user application error
        if(error.stack) {
            console.error(error.stack);
        }
        var errorMsg = error.message ? error.message : visicomp.core.ActionError.UNKNOWN_ERROR_MESSAGE;
        var actionError = new visicomp.core.ActionError(errorMsg,resource,visicomp.core.util.ACTION_ERROR_USER_APP);
        actionError.setParentException(error);
        
        actionResponse.addError(actionError);
    }
    
    return actionResponse; 
}


//======================================
// Static methods
//======================================

//add table listener
visicomp.app.visiui.CustomResourceControl.createControl = function(workspaceUI,parent,name) {
    var json = {};
    json.name = name;
    json.type = visicomp.core.Resource.generator.type;
    var actionResponse = visicomp.core.createmember.createMember(parent,json);
    
    var resource = actionResponse.member;
    if(resource) {
        //create the control
        var customResourceControl = new visicomp.app.visiui.CustomResourceControl(workspaceUI,resource);
        actionResponse.control = customResourceControl;
        
        //if we do not load from a json, we must manually set the resource processor
        //this is because here we store processor data in the JSON. If we try creating
        //an empty one it might not be compatible with the existing initializer code int
        //the resource. 
        //In cases where the resourceProcessor does not save data in the json, which
        //is the typical scenario, then this is not an issue.
        customResourceControl.initEmptyProcessor(); 
    }
    return actionResponse;
}


visicomp.app.visiui.CustomResourceControl.createControlFromJson = function(workspaceUI,member,controlJson) {
    
    var customResourceControl = new visicomp.app.visiui.CustomResourceControl(workspaceUI,member,controlJson);
    if(controlJson) {
        customResourceControl.updateFromJson(controlJson);
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
visicomp.app.visiui.CustomResourceControl.generator.DEFAULT_WIDTH = 500;
visicomp.app.visiui.CustomResourceControl.generator.DEFAULT_HEIGHT = 300;

