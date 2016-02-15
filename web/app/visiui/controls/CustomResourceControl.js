/** This is a custom resource component. 
 * To implement it, the resource script must have the methods "run()" which will
 * be called when the component is updated. It also must have any methods that are
 * confugred with initialization data from the model. */
visicomp.app.visiui.CustomResourceComponent = function(workspaceUI,resource,componentJson) {
    //base init
    visicomp.app.visiui.Component.init.call(this,workspaceUI,resource,visicomp.app.visiui.CustomResourceComponent.generator,componentJson);
    visicomp.app.visiui.BasicResourceComponent.init.call(this);
};

//add components to this class
visicomp.core.util.mixin(visicomp.app.visiui.CustomResourceComponent,visicomp.app.visiui.Component);
visicomp.core.util.mixin(visicomp.app.visiui.CustomResourceComponent,visicomp.app.visiui.BasicResourceComponent);

//==============================
// Protected and Private Instance Methods
//==============================

visicomp.app.visiui.CustomResourceComponent.prototype.initEmptyProcessor = function() {
	this.update("","","","");
}

/** This method populates the frame for this component. */
visicomp.app.visiui.CustomResourceComponent.prototype.addToFrame = function() {
	
    //create the menu
    var menuItemInfoList = this.getMenuItemInfoList();

    var itemInfo = {};
    itemInfo.title = "Edit&nbsp;Resource&nbsp;Code";
    itemInfo.callback = this.createEditResourceDialogCallback();
    
    //add these at the start of the menu
    menuItemInfoList.splice(1,0,itemInfo);

}

/** This serializes the table component. */
visicomp.app.visiui.CustomResourceComponent.prototype.writeToJson = function(json) {
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

/** This method deseriliazes data for the custom resource component. */
visicomp.app.visiui.CustomResourceComponent.prototype.updateFromJson = function(json) {   
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

visicomp.app.visiui.CustomResourceComponent.prototype.createEditResourceDialogCallback = function() {
    
    var instance = this;
    
    //create save handler
    var onSave = function(componentHtml,componentOnLoad,supplementalCode,css) {
		var actionResponse = instance.update(componentHtml,componentOnLoad,supplementalCode,css);
        if(!actionResponse.getSuccess()) {
            alert(actionResponse.getErrorMsg());
        }
		return true
    };
    
    return function() {
        visicomp.app.visiui.dialog.showUpdateCustomComponentDialog(instance,onSave);
    }
}

//=============================
// Action
//=============================

visicomp.app.visiui.CustomResourceComponent.prototype.update = function(html,processorGeneratorBody,supplementalCode,css) {
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
visicomp.app.visiui.CustomResourceComponent.createComponent = function(workspaceUI,parent,name) {
    var json = {};
    json.name = name;
    json.type = visicomp.core.Component.generator.type;
    var actionResponse = visicomp.core.createmember.createMember(parent,json);
    
    var resource = actionResponse.member;
    if(resource) {
        //create the component
        var customResourceComponent = new visicomp.app.visiui.CustomResourceComponent(workspaceUI,resource);
        actionResponse.component = customResourceComponent;
        
        //if we do not load from a json, we must manually set the resource processor
        //this is because here we store processor data in the JSON. If we try creating
        //an empty one it might not be compatible with the existing initializer code int
        //the resource. 
        //In cases where the resourceProcessor does not save data in the json, which
        //is the typical scenario, then this is not an issue.
        customResourceComponent.initEmptyProcessor(); 
    }
    return actionResponse;
}


visicomp.app.visiui.CustomResourceComponent.createComponentFromJson = function(workspaceUI,member,componentJson) {
    
    var customResourceComponent = new visicomp.app.visiui.CustomResourceComponent(workspaceUI,member,componentJson);
    if(componentJson) {
        customResourceComponent.updateFromJson(componentJson);
    }
    else {
        customResourceComponent.initEmptyProcessor();
    }
    
    return customResourceComponent;
}

//======================================
// This is the component generator, to register the component
//======================================

visicomp.app.visiui.CustomResourceComponent.generator = {};
visicomp.app.visiui.CustomResourceComponent.generator.displayName = "Custom Control";
visicomp.app.visiui.CustomResourceComponent.generator.uniqueName = "visicomp.app.visiui.CustomResourceComponent";
visicomp.app.visiui.CustomResourceComponent.generator.createComponent = visicomp.app.visiui.CustomResourceComponent.createComponent;
visicomp.app.visiui.CustomResourceComponent.generator.createComponentFromJson = visicomp.app.visiui.CustomResourceComponent.createComponentFromJson;
visicomp.app.visiui.CustomResourceComponent.generator.DEFAULT_WIDTH = 500;
visicomp.app.visiui.CustomResourceComponent.generator.DEFAULT_HEIGHT = 300;

