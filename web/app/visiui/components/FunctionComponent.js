/** This component represents a table object. */
visicomp.app.visiui.FunctionComponent = function(workspaceUI, functionObject, componentJson) {
    //base init
    visicomp.app.visiui.Component.init.call(this,workspaceUI,functionObject,visicomp.app.visiui.FunctionComponent.generator,componentJson);
    visicomp.app.visiui.TableEditComponent.init.call(this,
		visicomp.app.visiui.FunctionComponent.VIEW_MODES,
        visicomp.app.visiui.FunctionComponent.DEFAULT_VIEW);
    
    this.memberUpdated();
};

//add components to this class
visicomp.core.util.mixin(visicomp.app.visiui.FunctionComponent,visicomp.app.visiui.Component);
visicomp.core.util.mixin(visicomp.app.visiui.FunctionComponent,visicomp.app.visiui.TableEditComponent);

//==============================
// Protected and Private Instance Methods
//==============================

visicomp.app.visiui.FunctionComponent.VIEW_CODE = "Code";
visicomp.app.visiui.FunctionComponent.VIEW_SUPPLEMENTAL_CODE = "Private";

visicomp.app.visiui.FunctionComponent.VIEW_MODES = [
    visicomp.app.visiui.FunctionComponent.VIEW_CODE,
    visicomp.app.visiui.FunctionComponent.VIEW_SUPPLEMENTAL_CODE
];

visicomp.app.visiui.FunctionComponent.DEFAULT_VIEW = visicomp.app.visiui.FunctionComponent.VIEW_CODE;

/** This method should be implemented to retrieve a view mode of the give type. 
 * @protected. */
visicomp.app.visiui.FunctionComponent.prototype.getViewModeElement = function(viewType) {
	
	//create the new view element;
	switch(viewType) {
			
		case visicomp.app.visiui.FunctionComponent.VIEW_CODE:
			return new visicomp.app.visiui.AceCodeMode(this,false);
			
		case visicomp.app.visiui.FunctionComponent.VIEW_SUPPLEMENTAL_CODE:
			return new visicomp.app.visiui.AceSupplementalMode(this);
			
		default:
//temporary error handling...
			alert("unrecognized view element!");
			return null;
	}
}

/** This method should include an needed functionality to clean up after a delete. */
visicomp.app.visiui.FunctionComponent.prototype.onDelete = function() {
    if(this.editor) {
        this.editor.destroy();
        this.editor = null;
    }
}

/** This method extends the base method to get the property values
 * for the property edit dialog. */
visicomp.app.visiui.FunctionComponent.prototype.getPropertyValues = function() {
    var values = visicomp.app.visiui.Component.getPropertyValues.call(this);

    var argList = this.object.getArgList();
    var argListString = argList.toString();
    values.argListString = argListString;
    return values;
}

/** This method extends the base method to update property values. */
visicomp.app.visiui.FunctionComponent.prototype.updatePropertyValues = function(newValues) {
    var argListString = newValues.argListString;
    var argList = visicomp.app.visiui.FunctionComponent.parseStringArray(argListString);
    
    var functionBody = this.object.getFunctionBody();
    var supplementalCode = this.object.getSupplementalCode();
    
    return visicomp.core.updatemember.updateCode(this.object,argList,functionBody,supplementalCode);
}

/** This method extends the member udpated function from the base.
 * @private */    
visicomp.app.visiui.FunctionComponent.prototype.memberUpdated = function() {
    //call the base function
    visicomp.app.visiui.TableEditComponent.memberUpdated.call(this);
    
    //make sure the title is up to data
    var window = this.getWindow();
    if(window) {
        var functionObject = this.getObject();
        var displayName = functionObject.getDisplayName();
        var windowTitle = window.getTitle();
        if(windowTitle != displayName) {
            window.setTitle(displayName);
        }
    }
}

//======================================
// Static methods
//======================================

//create component call. data includes name and potentially other info
visicomp.app.visiui.FunctionComponent.createComponent = function(workspaceUI,data,componentOptions) {
    
    var parent = workspaceUI.getObjectByKey(data.parentKey);
    //should throw an exception if parent is invalid!
    
    var json = {};
    json.name = data.name;
    if(data.argListString) {
        var argList = visicomp.app.visiui.FunctionComponent.parseStringArray(data.argListString);
        json.argList = argList;
    }
    json.type = visicomp.core.FunctionTable.generator.type;
    var actionResponse = visicomp.core.createmember.createMember(parent,json);
    
    var functionObject = actionResponse.member;
    if(functionObject) {
        var functionComponent = new visicomp.app.visiui.FunctionComponent(workspaceUI,functionObject,componentOptions);
        actionResponse.component = functionComponent;
    }
    return actionResponse;
}

visicomp.app.visiui.FunctionComponent.createComponentFromJson = function(workspaceUI,member,componentJson) {
    var functionComponent = new visicomp.app.visiui.FunctionComponent(workspaceUI,member,componentJson);
    return functionComponent;
}

visicomp.app.visiui.FunctionComponent.parseStringArray = function(argListString) {
    var argList = argListString.split(",");
    for(var i = 0; i < argList.length; i++) {
        argList[i] = argList[i].trim();
    }
    return argList;
}

//======================================
// This is the component generator, to register the component
//======================================

visicomp.app.visiui.FunctionComponent.generator = {};
visicomp.app.visiui.FunctionComponent.generator.displayName = "Function";
visicomp.app.visiui.FunctionComponent.generator.uniqueName = "visicomp.app.visiui.FunctionComponent";
visicomp.app.visiui.FunctionComponent.generator.createComponent = visicomp.app.visiui.FunctionComponent.createComponent;
visicomp.app.visiui.FunctionComponent.generator.createComponentFromJson = visicomp.app.visiui.FunctionComponent.createComponentFromJson;
visicomp.app.visiui.FunctionComponent.generator.DEFAULT_WIDTH = 200;
visicomp.app.visiui.FunctionComponent.generator.DEFAULT_HEIGHT = 200;

visicomp.app.visiui.FunctionComponent.generator.propertyDialogLines = [
    {
        "type":"inputElement",
        "heading":"Arg List: ",
        "resultKey":"argListString"
    }
];
 