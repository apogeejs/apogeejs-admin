/** This is a custom resource component. 
 * To implement it, the resource script must have the methods "run()" which will
 * be called when the component is updated. It also must have any methods that are
 * confugred with initialization data from the model. */
hax.app.visiui.BasicControlComponent = function(workspaceUI,control,generator,componentJson) {
    //base init
    hax.app.visiui.Component.init.call(this,workspaceUI,control,generator,componentJson);
	hax.app.visiui.TableEditComponent.init.call(this,
		hax.app.visiui.BasicControlComponent.VIEW_MODES,
		hax.app.visiui.BasicControlComponent.DEFAULT_VIEW
	);
	
	var resource = control.getResource();
	resource.setComponent(this);
    //redo calculate in contrl now the UI is set up
    control.calculate();
    
    //add a cleanup action to call resource when delete is happening
    var cleanupAction = function() {
        if(resource.delete) {
            resource.delete();
        }
    }
    this.addCleanupAction(cleanupAction);
};

//add components to this class
hax.core.util.mixin(hax.app.visiui.BasicControlComponent,hax.app.visiui.Component);
hax.core.util.mixin(hax.app.visiui.BasicControlComponent,hax.app.visiui.TableEditComponent);

//==============================
// Protected and Private Instance Methods
//==============================

hax.app.visiui.BasicControlComponent.prototype.initEmptyResource = function() {
	this.update("","","","");
}

hax.app.visiui.BasicControlComponent.prototype.getOutputElement = function() {
	return this.outputMode.getElement();
}

hax.app.visiui.BasicControlComponent.VIEW_OUTPUT = "Output";
hax.app.visiui.BasicControlComponent.VIEW_CODE = "Code";
hax.app.visiui.BasicControlComponent.VIEW_SUPPLEMENTAL_CODE = "Private";

hax.app.visiui.BasicControlComponent.VIEW_MODES = [
	hax.app.visiui.BasicControlComponent.VIEW_OUTPUT,
	hax.app.visiui.BasicControlComponent.VIEW_CODE,
    hax.app.visiui.BasicControlComponent.VIEW_SUPPLEMENTAL_CODE
];

hax.app.visiui.BasicControlComponent.DEFAULT_VIEW = hax.app.visiui.BasicControlComponent.VIEW_OUTPUT;

/** This method should be implemented to retrieve a view mode of the give type. 
 * @protected. */
hax.app.visiui.BasicControlComponent.prototype.getViewModeElement = function(viewType) {
	
	//create the new view element;
	switch(viewType) {
		
		case hax.app.visiui.BasicControlComponent.VIEW_OUTPUT:
			if(!this.outputMode) {
				this.outputMode = new hax.app.visiui.ResourceOutputMode(this);
			}
			return this.outputMode;
			
		case hax.app.visiui.BasicControlComponent.VIEW_CODE:
			return new hax.app.visiui.AceCodeMode(this,false);
			
		case hax.app.visiui.BasicControlComponent.VIEW_SUPPLEMENTAL_CODE:
			return new hax.app.visiui.AceSupplementalMode(this);
			
		default:
//temporary error handling...
			alert("unrecognized view element!");
			return null;
	}
}

//======================================
// Static methods
//======================================

hax.app.visiui.BasicControlComponent.createBaseComponent = function(workspaceUI,data,resource,generator,componentOptions) {
    
    var parent = workspaceUI.getObjectByKey(data.parentKey);
    //should throw an exception if parent is invalid!
    
    var json = {};
    json.name = data.name;
    json.type = hax.core.Control.generator.type;
    var actionResponse = hax.core.createmember.createMember(parent,json);
    
    var control = actionResponse.member;
    if(control) {
		//set the resource
		control.updateResource(resource);
		
        //create the component
        var basicControlComponent = new hax.app.visiui.BasicControlComponent(workspaceUI,control,generator,componentOptions);
        actionResponse.component = basicControlComponent;
    }
    return actionResponse;
}


hax.app.visiui.BasicControlComponent.createBaseComponentFromJson = function(workspaceUI,member,generator,componentJson) {
    var customControlComponent = new hax.app.visiui.BasicControlComponent(workspaceUI,member,generator,componentJson);
    return customControlComponent;
}

