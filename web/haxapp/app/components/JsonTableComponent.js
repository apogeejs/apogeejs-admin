/** This component represents a json table object. */
haxapp.app.JsonTableComponent = function(workspaceUI,table,componentJson) {
    //base init
    haxapp.app.Component.init.call(this,workspaceUI,table,haxapp.app.JsonTableComponent.generator,componentJson);
    haxapp.app.TableEditComponent.init.call(this,
		haxapp.app.JsonTableComponent.VIEW_MODES,
        haxapp.app.JsonTableComponent.DEFAULT_VIEW,
		haxapp.app.JsonTableComponent.BLANK_DATA_VALUE_INFO);
	
    this.memberUpdated();
};

//add components to this class
hax.base.mixin(haxapp.app.JsonTableComponent,haxapp.app.Component);
hax.base.mixin(haxapp.app.JsonTableComponent,haxapp.app.TableEditComponent);

//==============================
// Protected and Private Instance Methods
//==============================

haxapp.app.JsonTableComponent.VIEW_PLAIN_TEXT = "Text";
haxapp.app.JsonTableComponent.VIEW_JSON_TEXT = "JSON";
haxapp.app.JsonTableComponent.VIEW_FORM = "Form";
haxapp.app.JsonTableComponent.VIEW_CODE = "Formula";
haxapp.app.JsonTableComponent.VIEW_SUPPLEMENTAL_CODE = "Private";

haxapp.app.JsonTableComponent.VIEW_MODES = [
    haxapp.app.JsonTableComponent.VIEW_PLAIN_TEXT,
    haxapp.app.JsonTableComponent.VIEW_JSON_TEXT,
    haxapp.app.JsonTableComponent.VIEW_FORM,
    haxapp.app.JsonTableComponent.VIEW_CODE,
    haxapp.app.JsonTableComponent.VIEW_SUPPLEMENTAL_CODE
];

//haxapp.app.JsonTableComponent.DEFAULT_VIEW = haxapp.app.JsonTableComponent.VIEW_FORM;
haxapp.app.JsonTableComponent.DEFAULT_VIEW = haxapp.app.JsonTableComponent.VIEW_PLAIN_TEXT;

haxapp.app.JsonTableComponent.BLANK_DATA_VALUE_INFO = {
	"dataValue":"",
	"menuLabel":"Clear Formula"
};

/** This method should be implemented to retrieve a view mode of the give type. 
 * @protected. */
haxapp.app.JsonTableComponent.prototype.getViewModeElement = function(viewType) {
	
	//create the new view element;
	switch(viewType) {
        case haxapp.app.JsonTableComponent.VIEW_PLAIN_TEXT:
            return new haxapp.app.AceDataMode(this,false);
            
		case haxapp.app.JsonTableComponent.VIEW_JSON_TEXT:
			return new haxapp.app.AceDataMode(this,true);
			
		case haxapp.app.JsonTableComponent.VIEW_FORM:
			return new haxapp.app.FormDataMode(this);
			
		case haxapp.app.JsonTableComponent.VIEW_CODE:
			return new haxapp.app.AceCodeMode(this,haxapp.app.JsonTableComponent.BLANK_DATA_VALUE_INFO,haxapp.app.JsonTableComponent.editorCodeWrapper);
			
		case haxapp.app.JsonTableComponent.VIEW_SUPPLEMENTAL_CODE:
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


haxapp.app.JsonTableComponent.createComponent = function(workspaceUI,data,componentOptions) {
   
    var workspace = workspaceUI.getWorkspace();
    var parent = workspace.getMemberByFullName(data.parentKey);
    //should throw an exception if parent is invalid!
    
    var json = {};
    json.action = "createMember";
    json.owner = parent;
    json.name = data.name;
    json.type = hax.JsonTable.generator.type;
    var actionResponse = hax.action.doAction(workspace,json);
    
    var table = json.member;
    if(table) {
        var tableComponent = new haxapp.app.JsonTableComponent(workspaceUI,table,componentOptions);
        actionResponse.component = tableComponent;
    }
    return actionResponse;
}


haxapp.app.JsonTableComponent.createComponentFromJson = function(workspaceUI,member,componentJson) {
    var tableComponent = new haxapp.app.JsonTableComponent(workspaceUI,member,componentJson);
    return tableComponent;
}

//======================================
// This is the component generator, to register the component
//======================================

haxapp.app.JsonTableComponent.generator = {};
haxapp.app.JsonTableComponent.generator.displayName = "Data Table";
haxapp.app.JsonTableComponent.generator.uniqueName = "haxapp.app.JsonTableComponent";
haxapp.app.JsonTableComponent.generator.createComponent = haxapp.app.JsonTableComponent.createComponent;
haxapp.app.JsonTableComponent.generator.createComponentFromJson = haxapp.app.JsonTableComponent.createComponentFromJson;
haxapp.app.JsonTableComponent.generator.DEFAULT_WIDTH = 200;
haxapp.app.JsonTableComponent.generator.DEFAULT_HEIGHT = 200;

//======================================
// This is a code wrapper so the user works with the formula rather than the function body
//======================================

haxapp.app.JsonTableComponent.editorCodeWrapper = {};

haxapp.app.JsonTableComponent.editorCodeWrapper.FUNCTION_PREFIX = "var value;\n";
haxapp.app.JsonTableComponent.editorCodeWrapper.FUNCTION_SUFFIX = "\nreturn value;\n\n";

haxapp.app.JsonTableComponent.editorCodeWrapper.displayName = "Formula";

haxapp.app.JsonTableComponent.editorCodeWrapper.wrapCode = function(formula) { 
    return haxapp.app.JsonTableComponent.editorCodeWrapper.FUNCTION_PREFIX + formula + 
        haxapp.app.JsonTableComponent.editorCodeWrapper.FUNCTION_SUFFIX;
}

haxapp.app.JsonTableComponent.editorCodeWrapper.unwrapCode = function(functionBody) {
	if((functionBody == null)||(functionBody.length = 0)) return "";
	
    var formula = functionBody.replace("var value;","");
    formula = formula.replace("return value;","");
    return formula.trim();
}

