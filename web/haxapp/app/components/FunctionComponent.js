/** This component represents a table object. */
haxapp.app.FunctionComponent = function(workspaceUI, functionObject, componentJson) {
    //base init
    haxapp.app.Component.init.call(this,workspaceUI,functionObject,haxapp.app.FunctionComponent.generator,componentJson);
    
    this.memberUpdated();
};

//add components to this class
hax.base.mixin(haxapp.app.FunctionComponent,haxapp.app.Component);

//==============================
// Protected and Private Instance Methods
//==============================

haxapp.app.FunctionComponent.VIEW_CODE = "Code";
haxapp.app.FunctionComponent.VIEW_SUPPLEMENTAL_CODE = "Private";
haxapp.app.FunctionComponent.VIEW_DESCRIPTION = "Notes";

haxapp.app.FunctionComponent.VIEW_MODES = [
    haxapp.app.FunctionComponent.VIEW_CODE,
    haxapp.app.FunctionComponent.VIEW_SUPPLEMENTAL_CODE,
    haxapp.app.FunctionComponent.VIEW_DESCRIPTION
];

haxapp.app.FunctionComponent.TABLE_EDIT_SETTINGS = {
    "viewModes": haxapp.app.FunctionComponent.VIEW_MODES,
    "defaultView": haxapp.app.FunctionComponent.VIEW_CODE
}

haxapp.app.FunctionComponent.prototype.createDisplayContent = function(container) {
    return new haxapp.app.EditDisplayContent(this,haxapp.app.FunctionComponent.TABLE_EDIT_SETTINGS);
}

/** This method should be implemented to retrieve a view mode of the give type. 
 * @protected. */
haxapp.app.FunctionComponent.prototype.getViewModeElement = function(editComponentDisplay,viewType) {
	
	//create the new view element;
	switch(viewType) {
			
		case haxapp.app.FunctionComponent.VIEW_CODE:
			return new haxapp.app.AceCodeMode(editComponentDisplay,false);
			
		case haxapp.app.FunctionComponent.VIEW_SUPPLEMENTAL_CODE:
			return new haxapp.app.AceSupplementalMode(editComponentDisplay);
            
        case haxapp.app.FunctionComponent.VIEW_DESCRIPTION:
			return new haxapp.app.AceDescriptionMode(editComponentDisplay);
			
		default:
//temporary error handling...
			alert("unrecognized view element!");
			return null;
	}
}

//======================================
// Static methods
//======================================

//create component call. data includes name and potentially other info
haxapp.app.FunctionComponent.createComponent = function(workspaceUI,data,componentOptions) {
    
    var json = {};
    json.action = "createMember";
    json.owner = data.parent;
    json.name = data.name;
    if(data.argListString) {
        var argList = hax.FunctionTable.parseStringArray(data.argListString);
        json.updateData = {};
        json.updateData.argList = argList;
    }
    json.type = hax.FunctionTable.generator.type;
    var actionResponse = hax.action.doAction(workspaceUI.getWorkspace(),json);
    
    var functionObject = json.member;
    if(functionObject) {
        var functionComponent = new haxapp.app.FunctionComponent(workspaceUI,functionObject,componentOptions);
        actionResponse.component = functionComponent;
    }
    return actionResponse;
}

haxapp.app.FunctionComponent.createComponentFromJson = function(workspaceUI,member,componentJson) {
    var functionComponent = new haxapp.app.FunctionComponent(workspaceUI,member,componentJson);
    return functionComponent;
}

//======================================
// This is the component generator, to register the component
//======================================

haxapp.app.FunctionComponent.generator = {};
haxapp.app.FunctionComponent.generator.displayName = "Function";
haxapp.app.FunctionComponent.generator.uniqueName = "haxapp.app.FunctionComponent";
haxapp.app.FunctionComponent.generator.createComponent = haxapp.app.FunctionComponent.createComponent;
haxapp.app.FunctionComponent.generator.createComponentFromJson = haxapp.app.FunctionComponent.createComponentFromJson;
haxapp.app.FunctionComponent.generator.DEFAULT_WIDTH = 200;
haxapp.app.FunctionComponent.generator.DEFAULT_HEIGHT = 200;

haxapp.app.FunctionComponent.generator.propertyDialogLines = [
    {
        "type":"inputElement",
        "heading":"Arg List: ",
        "resultKey":"argListString"
    }
];

 