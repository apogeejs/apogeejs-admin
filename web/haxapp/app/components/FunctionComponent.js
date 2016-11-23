/** This component represents a table object. */
haxapp.app.FunctionComponent = function(workspaceUI, functionObject, componentJson) {
    //base init
    haxapp.app.Component.init.call(this,workspaceUI,functionObject,haxapp.app.FunctionComponent.generator,componentJson);
    haxapp.app.TableEditComponent.init.call(this,
		haxapp.app.FunctionComponent.VIEW_MODES,
        haxapp.app.FunctionComponent.DEFAULT_VIEW);
    
    this.memberUpdated();
};

//add components to this class
hax.util.mixin(haxapp.app.FunctionComponent,haxapp.app.Component);
hax.util.mixin(haxapp.app.FunctionComponent,haxapp.app.TableEditComponent);

//==============================
// Protected and Private Instance Methods
//==============================

haxapp.app.FunctionComponent.VIEW_CODE = "Code";
haxapp.app.FunctionComponent.VIEW_SUPPLEMENTAL_CODE = "Private";

haxapp.app.FunctionComponent.VIEW_MODES = [
    haxapp.app.FunctionComponent.VIEW_CODE,
    haxapp.app.FunctionComponent.VIEW_SUPPLEMENTAL_CODE
];

haxapp.app.FunctionComponent.DEFAULT_VIEW = haxapp.app.FunctionComponent.VIEW_CODE;

/** This method should be implemented to retrieve a view mode of the give type. 
 * @protected. */
haxapp.app.FunctionComponent.prototype.getViewModeElement = function(viewType) {
	
	//create the new view element;
	switch(viewType) {
			
		case haxapp.app.FunctionComponent.VIEW_CODE:
			return new haxapp.app.AceCodeMode(this,false);
			
		case haxapp.app.FunctionComponent.VIEW_SUPPLEMENTAL_CODE:
			return new haxapp.app.AceSupplementalMode(this);
			
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
    
    var parent = workspaceUI.getObjectByKey(data.parentKey);
    //should throw an exception if parent is invalid!
    
    var json = {};
    json.name = data.name;
    if(data.argListString) {
        var argList = haxapp.app.FunctionComponent.parseStringArray(data.argListString);
        json.updateData = {};
        json.updateData.argList = argList;
    }
    json.type = hax.FunctionTable.generator.type;
    var actionResponse = hax.createmember.createMember(parent,json);
    
    var functionObject = actionResponse.member;
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

/** This method extends the base method to get the property values
 * for the property edit dialog. */
haxapp.app.FunctionComponent.addPropValues = function(member,values) {
    var argList = member.getArgList();
    var argListString = argList.toString();
    values.argListString = argListString;
    return values;
}

haxapp.app.FunctionComponent.propUpdateHandler = function(member,oldValues,newValues,recalculateList) {
    if(oldValues.argListString !== newValues.argListString) {
        var newArgList = haxapp.app.FunctionComponent.parseStringArray(newValues.argListString);
        var functionBody = member.getFunctionBody();
        var supplementalCode = member.getSupplementalCode();

        hax.updatemember.updateCode(member,
            newArgList,
            functionBody,
            supplementalCode,
            recalculateList);
    }
}

haxapp.app.FunctionComponent.parseStringArray = function(argListString) {
    var argList = argListString.split(",");
    for(var i = 0; i < argList.length; i++) {
        argList[i] = argList[i].trim();
    }
    return argList;
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
haxapp.app.FunctionComponent.generator.addPropFunction = haxapp.app.FunctionComponent.addPropValues;
haxapp.app.FunctionComponent.generator.updatePropHandler = haxapp.app.FunctionComponent.propUpdateHandler;
 