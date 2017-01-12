/** This is a custom resource component. 
 * To implement it, the resource script must have the methods "run()" which will
 * be called when the component is updated. It also must have any methods that are
 * confugred with initialization data from the model. */
haxapp.app.BasicControlComponent = function(workspaceUI,control,generator,componentJson) {
    //base init
    haxapp.app.Component.init.call(this,workspaceUI,control,generator,componentJson);
	
	var resource = control.getResource();
	resource.setComponent(this);
    //redo calculate in contrl now the UI is set up
    control.prepareForCalculate();
    control.calculate();
};

//add components to this class
hax.base.mixin(haxapp.app.BasicControlComponent,haxapp.app.Component);

//==============================
// Protected and Private Instance Methods
//==============================

haxapp.app.BasicControlComponent.prototype.getOutputElement = function() {
	return this.outputMode.getElement();
}

haxapp.app.BasicControlComponent.VIEW_OUTPUT = "Output";
haxapp.app.BasicControlComponent.VIEW_CODE = "Code";
haxapp.app.BasicControlComponent.VIEW_SUPPLEMENTAL_CODE = "Private";
haxapp.app.BasicControlComponent.VIEW_DESCRIPTION = "Notes";

haxapp.app.BasicControlComponent.VIEW_MODES = [
	haxapp.app.BasicControlComponent.VIEW_OUTPUT,
	haxapp.app.BasicControlComponent.VIEW_CODE,
    haxapp.app.BasicControlComponent.VIEW_SUPPLEMENTAL_CODE,
    haxapp.app.BasicControlComponent.VIEW_DESCRIPTION
];

haxapp.app.BasicControlComponent.TABLE_EDIT_SETTINGS = {
    "viewModes": haxapp.app.BasicControlComponent.VIEW_MODES,
    "defaultView": haxapp.app.BasicControlComponent.VIEW_OUTPUT
}

/** This method should be implemented to retrieve a view mode of the give type. 
 * @protected. */
haxapp.app.BasicControlComponent.prototype.getViewModeElement = function(viewType) {
	
	//create the new view element;
	switch(viewType) {
		
		case haxapp.app.BasicControlComponent.VIEW_OUTPUT:
			if(!this.outputMode) {
				this.outputMode = new haxapp.app.ResourceOutputMode(this);
			}
			return this.outputMode;
			
		case haxapp.app.BasicControlComponent.VIEW_CODE:
			return new haxapp.app.AceCodeMode(this,false);
			
		case haxapp.app.BasicControlComponent.VIEW_SUPPLEMENTAL_CODE:
			return new haxapp.app.AceSupplementalMode(this);
            
        case haxapp.app.BasicControlComponent.VIEW_DESCRIPTION:
			return new haxapp.app.AceDescriptionMode(this);
			
		default:
//temporary error handling...
			alert("unrecognized view element!");
			return null;
	}
}

//======================================
// Callbacks
// These are defined as static but are called in the objects context
//======================================


//======================================
// Static methods
//======================================

haxapp.app.BasicControlComponent.createBaseComponent = function(workspaceUI,data,resource,generator,componentOptions) {
    
    var workspace = workspaceUI.getWorkspace();
    //should throw an exception if parent is invalid!
    
    var json = {};
    json.action = "createMember";
    json.owner = data.parent;
    json.name = data.name;
    json.type = hax.Control.generator.type;
    var actionResponse = hax.action.doAction(workspace,json);
    
    var control = json.member;
    
    if(control) {
		//set the resource
		control.updateResource(resource);
		
        //create the component
        var basicControlComponent = new haxapp.app.BasicControlComponent(workspaceUI,control,generator,componentOptions);
        actionResponse.component = basicControlComponent;
    }
    return actionResponse;
}


haxapp.app.BasicControlComponent.createBaseComponentFromJson = function(workspaceUI,member,generator,componentJson) {
    var customControlComponent = new haxapp.app.BasicControlComponent(workspaceUI,member,generator,componentJson);
    return customControlComponent;
}

