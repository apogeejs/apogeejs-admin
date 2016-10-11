/** This component represents a table object. */
hax.app.visiui.FunctionComponent = function(workspaceUI, functionObject, componentJson) {
    //base init
    hax.app.visiui.Component.init.call(this,workspaceUI,functionObject,hax.app.visiui.FunctionComponent.generator,componentJson);
    hax.app.visiui.TableEditComponent.init.call(this,
		hax.app.visiui.FunctionComponent.VIEW_MODES,
        hax.app.visiui.FunctionComponent.DEFAULT_VIEW);
    
    this.memberUpdated();
};

//add components to this class
hax.core.util.mixin(hax.app.visiui.FunctionComponent,hax.app.visiui.Component);
hax.core.util.mixin(hax.app.visiui.FunctionComponent,hax.app.visiui.TableEditComponent);

//==============================
// Protected and Private Instance Methods
//==============================

hax.app.visiui.FunctionComponent.VIEW_CODE = "Code";
hax.app.visiui.FunctionComponent.VIEW_SUPPLEMENTAL_CODE = "Private";

hax.app.visiui.FunctionComponent.VIEW_MODES = [
    hax.app.visiui.FunctionComponent.VIEW_CODE,
    hax.app.visiui.FunctionComponent.VIEW_SUPPLEMENTAL_CODE
];

hax.app.visiui.FunctionComponent.DEFAULT_VIEW = hax.app.visiui.FunctionComponent.VIEW_CODE;

/** This method should be implemented to retrieve a view mode of the give type. 
 * @protected. */
hax.app.visiui.FunctionComponent.prototype.getViewModeElement = function(viewType) {
	
	//create the new view element;
	switch(viewType) {
			
		case hax.app.visiui.FunctionComponent.VIEW_CODE:
			return new hax.app.visiui.AceCodeMode(this,false);
			
		case hax.app.visiui.FunctionComponent.VIEW_SUPPLEMENTAL_CODE:
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

//create component call. data includes name and potentially other info
hax.app.visiui.FunctionComponent.createComponent = function(workspaceUI,data,componentOptions) {
    
    var parent = workspaceUI.getObjectByKey(data.parentKey);
    //should throw an exception if parent is invalid!
    
    var json = {};
    json.name = data.name;
    if(data.argListString) {
        var argList = hax.app.visiui.FunctionComponent.parseStringArray(data.argListString);
        json.argList = argList;
    }
    json.type = hax.core.FunctionTable.generator.type;
    var actionResponse = hax.core.createmember.createMember(parent,json);
    
    var functionObject = actionResponse.member;
    if(functionObject) {
        var functionComponent = new hax.app.visiui.FunctionComponent(workspaceUI,functionObject,componentOptions);
        actionResponse.component = functionComponent;
    }
    return actionResponse;
}

hax.app.visiui.FunctionComponent.createComponentFromJson = function(workspaceUI,member,componentJson) {
    var functionComponent = new hax.app.visiui.FunctionComponent(workspaceUI,member,componentJson);
    return functionComponent;
}

/** This method extends the base method to get the property values
 * for the property edit dialog. */
hax.app.visiui.FunctionComponent.addPropValues = function(member,values) {
    var argList = member.getArgList();
    var argListString = argList.toString();
    values.argListString = argListString;
    return values;
}

hax.app.visiui.FunctionComponent.propUpdateHandler = function(member,oldValues,newValues,recalculateList) {
    if(oldValues.argListString !== newValues.argListString) {
        var newArgList = hax.app.visiui.FunctionComponent.parseStringArray(newValues.argListString);
        var functionBody = member.getFunctionBody();
        var supplementalCode = member.getSupplementalCode();

        hax.core.updatemember.updateCode(member,
            newArgList,
            functionBody,
            supplementalCode,
            recalculateList);
    }
}

hax.app.visiui.FunctionComponent.parseStringArray = function(argListString) {
    var argList = argListString.split(",");
    for(var i = 0; i < argList.length; i++) {
        argList[i] = argList[i].trim();
    }
    return argList;
}

//======================================
// This is the component generator, to register the component
//======================================

hax.app.visiui.FunctionComponent.generator = {};
hax.app.visiui.FunctionComponent.generator.displayName = "Function";
hax.app.visiui.FunctionComponent.generator.uniqueName = "hax.app.visiui.FunctionComponent";
hax.app.visiui.FunctionComponent.generator.createComponent = hax.app.visiui.FunctionComponent.createComponent;
hax.app.visiui.FunctionComponent.generator.createComponentFromJson = hax.app.visiui.FunctionComponent.createComponentFromJson;
hax.app.visiui.FunctionComponent.generator.DEFAULT_WIDTH = 200;
hax.app.visiui.FunctionComponent.generator.DEFAULT_HEIGHT = 200;

hax.app.visiui.FunctionComponent.generator.propertyDialogLines = [
    {
        "type":"inputElement",
        "heading":"Arg List: ",
        "resultKey":"argListString"
    }
];
hax.app.visiui.FunctionComponent.generator.addPropFunction = hax.app.visiui.FunctionComponent.addPropValues;
hax.app.visiui.FunctionComponent.generator.updatePropHandler = hax.app.visiui.FunctionComponent.propUpdateHandler;
 