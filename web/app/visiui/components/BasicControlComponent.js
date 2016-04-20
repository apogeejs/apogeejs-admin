/** This is a custom resource component. 
 * To implement it, the resource script must have the methods "run()" which will
 * be called when the component is updated. It also must have any methods that are
 * confugred with initialization data from the model. */
visicomp.app.visiui.BasicControlComponent = function(workspaceUI,control,generator,componentJson) {
    //base init
    visicomp.app.visiui.Component.init.call(this,workspaceUI,control,generator,componentJson);
	visicomp.app.visiui.TableEditComponent.init.call(this,
		visicomp.app.visiui.BasicControlComponent.VIEW_MODES,
		visicomp.app.visiui.BasicControlComponent.DEFAULT_VIEW
	);
	
	var resource = control.getResource();
	resource.setComponent(this);
};

//add components to this class
visicomp.core.util.mixin(visicomp.app.visiui.BasicControlComponent,visicomp.app.visiui.Component);
visicomp.core.util.mixin(visicomp.app.visiui.BasicControlComponent,visicomp.app.visiui.TableEditComponent);

//==============================
// Protected and Private Instance Methods
//==============================

visicomp.app.visiui.BasicControlComponent.prototype.initEmptyResource = function() {
	this.update("","","","");
}

visicomp.app.visiui.BasicControlComponent.prototype.getOutputElement = function() {
	return this.outputMode.getElement();
}

visicomp.app.visiui.BasicControlComponent.VIEW_OUTPUT = "Output";
visicomp.app.visiui.BasicControlComponent.VIEW_CODE = "Code";
visicomp.app.visiui.BasicControlComponent.VIEW_SUPPLEMENTAL_CODE = "Private";

visicomp.app.visiui.BasicControlComponent.VIEW_MODES = [
	visicomp.app.visiui.BasicControlComponent.VIEW_OUTPUT,
	visicomp.app.visiui.BasicControlComponent.VIEW_CODE,
    visicomp.app.visiui.BasicControlComponent.VIEW_SUPPLEMENTAL_CODE
];

visicomp.app.visiui.BasicControlComponent.DEFAULT_VIEW = visicomp.app.visiui.BasicControlComponent.VIEW_OUTPUT;

/** This method should be implemented to retrieve a view mode of the give type. 
 * @protected. */
visicomp.app.visiui.BasicControlComponent.prototype.getViewModeElement = function(viewType) {
	
	//create the new view element;
	switch(viewType) {
		
		case visicomp.app.visiui.BasicControlComponent.VIEW_OUTPUT:
			if(!this.outputMode) {
				this.outputMode = new visicomp.app.visiui.ResourceOutputMode(this);
			}
			return this.outputMode;
			
		case visicomp.app.visiui.BasicControlComponent.VIEW_CODE:
			return new visicomp.app.visiui.AceCodeMode(this,false);
			
		case visicomp.app.visiui.BasicControlComponent.VIEW_SUPPLEMENTAL_CODE:
			return new visicomp.app.visiui.AceSupplementalMode(this);
			
		default:
//temporary error handling...
			alert("unrecognized view element!");
			return null;
	}
}

//======================================
// Static methods
//======================================

visicomp.app.visiui.BasicControlComponent.createBaseComponent = function(workspaceUI,parent,name,resource,generator) {
    var json = {};
    json.name = name;
    json.type = visicomp.core.Control.generator.type;
    var actionResponse = visicomp.core.createmember.createMember(parent,json);
    
    var control = actionResponse.member;
    if(control) {
		//set the resource
		control.updateResource(resource);
		
        //create the component
        var basicControlComponent = new visicomp.app.visiui.BasicControlComponent(workspaceUI,control,generator);
        actionResponse.component = basicControlComponent;
    }
    return actionResponse;
}


visicomp.app.visiui.BasicControlComponent.createBaseComponentFromJson = function(workspaceUI,member,generator,componentJson) {
    var customControlComponent = new visicomp.app.visiui.BasicControlComponent(workspaceUI,member,generator,componentJson);
    return customControlComponent;
}

