/** This is a custom resource component. 
 * To implement it, the resource script must have the methods "run()" which will
 * be called when the component is updated. It also must have any methods that are
 * confugred with initialization data from the model. */
visicomp.app.visiui.CustomControlComponent = function(workspaceUI,resource,componentJson) {
    //base init
    visicomp.app.visiui.Component.init.call(this,workspaceUI,resource,visicomp.app.visiui.CustomControlComponent.generator,componentJson);
    visicomp.app.visiui.BasicControlComponent.init.call(this);
};

//add components to this class
visicomp.core.util.mixin(visicomp.app.visiui.CustomControlComponent,visicomp.app.visiui.Component);
visicomp.core.util.mixin(visicomp.app.visiui.CustomControlComponent,visicomp.app.visiui.BasicControlComponent);

//==============================
// Protected and Private Instance Methods
//==============================

visicomp.app.visiui.CustomControlComponent.prototype.initEmptyResource = function() {
	this.update("","","","");
}

/** This method populates the frame for this component. */
visicomp.app.visiui.CustomControlComponent.prototype.addToFrame = function() {
	
this.setFixedContentElement();
	
    //create the menu
    var menuItemInfoList = this.getMenuItemInfoList();

    var itemInfo = {};
    itemInfo.title = "Edit Resource Code";
    itemInfo.callback = this.createEditResourceDialogCallback();
    
    //add these at the start of the menu
    menuItemInfoList.splice(1,0,itemInfo);

}

/** This serializes the table component. */
visicomp.app.visiui.CustomControlComponent.prototype.writeToJson = function(json) {
    //store the resource info
    var control = this.getObject();
	var resource = control.getResource();
    if(resource) {
        json.resource = {};
        json.resource.html = resource.getHtml();
        json.resource.customizeScript = resource.getCustomizeScript();
        json.resource.supplementalCode = resource.getSupplementalCode();
        json.resource.css = resource.getCss();
    }
}

/** This method deseriliazes data for the custom resource component. */
visicomp.app.visiui.CustomControlComponent.prototype.updateFromJson = function(json) {   
    //internal data
    if(json.resource) {
        this.update(json.resource.html,
            json.resource.customizeScript,
            json.resource.supplementalCode,
            json.resource.css);
    }
    else {
        this.initEmptyResource();
    }
    
}

//=============================
// Action UI Entry Points
//=============================

visicomp.app.visiui.CustomControlComponent.prototype.createEditResourceDialogCallback = function() {
    
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

visicomp.app.visiui.CustomControlComponent.prototype.update = function(html,resourceGeneratorBody,supplementalCode,css) {
	var actionResponse = new visicomp.core.ActionResponse();
    var control = this.getObject();
    control.clearErrors("Custom Control - Update");
    
    try { 
        //create a new resource
        var newResource = new visicomp.app.visiui.CustomResource();
        newResource.setComponent(this);

        //update it
        newResource.update(html,resourceGeneratorBody,supplementalCode,css);

        //update the resource
        control.updateResource(newResource);

        this.memberUpdated();
    }
    catch(error) {
        //user application error
        if(error.stack) {
            console.error(error.stack);
        }
        var errorMsg = error.message ? error.message : visicomp.core.ActionError.UNKNOWN_ERROR_MESSAGE;
        var actionError = new visicomp.core.ActionError(errorMsg,"Custom Control - Update",control);
        actionError.setParentException(error);
        
        control.addError(actionError);
        actionResponse.addError(actionError);
    }
    
    return actionResponse; 
}


//======================================
// Static methods
//======================================

//add table listener
visicomp.app.visiui.CustomControlComponent.createComponent = function(workspaceUI,parent,name) {
    var json = {};
    json.name = name;
    json.type = visicomp.core.Control.generator.type;
    var actionResponse = visicomp.core.createmember.createMember(parent,json);
    
    var control = actionResponse.member;
    if(control) {
        //create the component
        var customControlComponent = new visicomp.app.visiui.CustomControlComponent(workspaceUI,control);
        actionResponse.component = customControlComponent;
        
        //if we do not load from a json, we must manually set the resource
        //this is because here we store resource data in the JSON. If we try creating
        //an empty one it might not be compatible with the existing initializer code int
        //the resource. 
        //In cases where the resource does not save data in the json, which
        //is the typical scenario, then this is not an issue.
        customControlComponent.initEmptyResource(); 
    }
    return actionResponse;
}


visicomp.app.visiui.CustomControlComponent.createComponentFromJson = function(workspaceUI,member,componentJson) {
    
    var customControlComponent = new visicomp.app.visiui.CustomControlComponent(workspaceUI,member,componentJson);
    if(componentJson) {
        customControlComponent.updateFromJson(componentJson);
    }
    else {
        customControlComponent.initEmptyResource();
    }
    
    return customControlComponent;
}

//======================================
// This is the component generator, to register the component
//======================================

visicomp.app.visiui.CustomControlComponent.generator = {};
visicomp.app.visiui.CustomControlComponent.generator.displayName = "Custom Control";
visicomp.app.visiui.CustomControlComponent.generator.uniqueName = "visicomp.app.visiui.CustomControlComponent";
visicomp.app.visiui.CustomControlComponent.generator.createComponent = visicomp.app.visiui.CustomControlComponent.createComponent;
visicomp.app.visiui.CustomControlComponent.generator.createComponentFromJson = visicomp.app.visiui.CustomControlComponent.createComponentFromJson;
visicomp.app.visiui.CustomControlComponent.generator.DEFAULT_WIDTH = 500;
visicomp.app.visiui.CustomControlComponent.generator.DEFAULT_HEIGHT = 300;

