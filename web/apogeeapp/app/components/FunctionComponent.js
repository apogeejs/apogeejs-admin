/** This component represents a table object. */
apogeeapp.app.FunctionComponent = function(workspaceUI, functionObject, componentJson) {
    //extend edit component
    apogeeapp.app.EditComponent.call(this,workspaceUI,functionObject,apogeeapp.app.FunctionComponent.generator,componentJson);
    
    this.memberUpdated();
};

apogeeapp.app.FunctionComponent.prototype = Object.create(apogeeapp.app.EditComponent.prototype);
apogeeapp.app.FunctionComponent.prototype.constructor = apogeeapp.app.FunctionComponent;

//==============================
// Protected and Private Instance Methods
//==============================

apogeeapp.app.FunctionComponent.VIEW_CODE = "Code";
apogeeapp.app.FunctionComponent.VIEW_SUPPLEMENTAL_CODE = "Private";
apogeeapp.app.FunctionComponent.VIEW_DESCRIPTION = "Notes";

apogeeapp.app.FunctionComponent.VIEW_MODES = [
    apogeeapp.app.FunctionComponent.VIEW_CODE,
    apogeeapp.app.FunctionComponent.VIEW_SUPPLEMENTAL_CODE,
    apogeeapp.app.FunctionComponent.VIEW_DESCRIPTION
];

apogeeapp.app.FunctionComponent.TABLE_EDIT_SETTINGS = {
    "viewModes": apogeeapp.app.FunctionComponent.VIEW_MODES,
    "defaultView": apogeeapp.app.FunctionComponent.VIEW_CODE
}

/**  This method retrieves the table edit settings for this component instance
 * @protected */
apogeeapp.app.FunctionComponent.prototype.getTableEditSettings = function() {
    return apogeeapp.app.FunctionComponent.TABLE_EDIT_SETTINGS;
}

/** This method should be implemented to retrieve a view mode of the give type. 
 * @protected. */
apogeeapp.app.FunctionComponent.prototype.getViewModeElement = function(editComponentDisplay,viewType) {
	
	//create the new view element;
	switch(viewType) {
			
		case apogeeapp.app.FunctionComponent.VIEW_CODE:
			return new apogeeapp.app.AceCodeMode(editComponentDisplay);
			
		case apogeeapp.app.FunctionComponent.VIEW_SUPPLEMENTAL_CODE:
			return new apogeeapp.app.AceSupplementalMode(editComponentDisplay);
            
        case apogeeapp.app.FunctionComponent.VIEW_DESCRIPTION:
			return new apogeeapp.app.AceDescriptionMode(editComponentDisplay);
			
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
apogeeapp.app.FunctionComponent.createComponent = function(workspaceUI,data,componentOptions) {
    
    var json = {};
    json.action = "createMember";
    json.owner = data.parent;
    json.workspace = data.parent.getWorkspace();
    json.name = data.name;
    
    var argList;
    if(data.argListString) {
        argList = apogee.FunctionTable.parseStringArray(data.argListString);  
    }
    else {
        argList = [];
    }
    json.updateData = {};
    json.updateData.argList = argList;
    
    json.type = apogee.FunctionTable.generator.type;
    var actionResponse = apogee.action.doAction(json);
    
    var functionObject = json.member;
    if(functionObject) {
        var functionComponent = new apogeeapp.app.FunctionComponent(workspaceUI,functionObject,componentOptions);
        actionResponse.component = functionComponent;
    }
    return actionResponse;
}

apogeeapp.app.FunctionComponent.createComponentFromJson = function(workspaceUI,member,componentJson) {
    var functionComponent = new apogeeapp.app.FunctionComponent(workspaceUI,member,componentJson);
    return functionComponent;
}

//======================================
// This is the component generator, to register the component
//======================================

apogeeapp.app.FunctionComponent.generator = {};
apogeeapp.app.FunctionComponent.generator.displayName = "Function";
apogeeapp.app.FunctionComponent.generator.uniqueName = "apogeeapp.app.FunctionComponent";
apogeeapp.app.FunctionComponent.generator.createComponent = apogeeapp.app.FunctionComponent.createComponent;
apogeeapp.app.FunctionComponent.generator.createComponentFromJson = apogeeapp.app.FunctionComponent.createComponentFromJson;
apogeeapp.app.FunctionComponent.generator.DEFAULT_WIDTH = 400;
apogeeapp.app.FunctionComponent.generator.DEFAULT_HEIGHT = 400;
apogeeapp.app.FunctionComponent.generator.ICON_RES_PATH = "/functionIcon.png";

apogeeapp.app.FunctionComponent.generator.propertyDialogLines = [
    {
        "type":"inputElement",
        "heading":"Arg List: ",
        "resultKey":"argListString"
    }
];

 