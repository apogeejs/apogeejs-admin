/** This component represents a json table object. */
hax.app.visiui.JsonTableComponent = function(workspaceUI,table,componentJson) {
    //base init
    hax.app.visiui.Component.init.call(this,workspaceUI,table,hax.app.visiui.JsonTableComponent.generator,componentJson);
    hax.app.visiui.TableEditComponent.init.call(this,
		hax.app.visiui.JsonTableComponent.VIEW_MODES,
        hax.app.visiui.JsonTableComponent.DEFAULT_VIEW,
		hax.app.visiui.JsonTableComponent.BLANK_DATA_VALUE_INFO);
	
    this.memberUpdated();
};

//add components to this class
hax.core.util.mixin(hax.app.visiui.JsonTableComponent,hax.app.visiui.Component);
hax.core.util.mixin(hax.app.visiui.JsonTableComponent,hax.app.visiui.TableEditComponent);

//==============================
// Protected and Private Instance Methods
//==============================

hax.app.visiui.JsonTableComponent.VIEW_PLAIN_TEXT = "Text";
hax.app.visiui.JsonTableComponent.VIEW_JSON_TEXT = "JSON";
hax.app.visiui.JsonTableComponent.VIEW_FORM = "Form";
hax.app.visiui.JsonTableComponent.VIEW_CODE = "Formula";
hax.app.visiui.JsonTableComponent.VIEW_SUPPLEMENTAL_CODE = "Private";

hax.app.visiui.JsonTableComponent.VIEW_MODES = [
    hax.app.visiui.JsonTableComponent.VIEW_PLAIN_TEXT,
    hax.app.visiui.JsonTableComponent.VIEW_JSON_TEXT,
    hax.app.visiui.JsonTableComponent.VIEW_FORM,
    hax.app.visiui.JsonTableComponent.VIEW_CODE,
    hax.app.visiui.JsonTableComponent.VIEW_SUPPLEMENTAL_CODE
];

//hax.app.visiui.JsonTableComponent.DEFAULT_VIEW = hax.app.visiui.JsonTableComponent.VIEW_FORM;
hax.app.visiui.JsonTableComponent.DEFAULT_VIEW = hax.app.visiui.JsonTableComponent.VIEW_PLAIN_TEXT;

hax.app.visiui.JsonTableComponent.BLANK_DATA_VALUE_INFO = {
	"dataValue":"",
	"menuLabel":"Clear Formula"
};

/** This method should be implemented to retrieve a view mode of the give type. 
 * @protected. */
hax.app.visiui.JsonTableComponent.prototype.getViewModeElement = function(viewType) {
	
	//create the new view element;
	switch(viewType) {
        case hax.app.visiui.JsonTableComponent.VIEW_PLAIN_TEXT:
            return new hax.app.visiui.AceDataMode(this,false);
            
		case hax.app.visiui.JsonTableComponent.VIEW_JSON_TEXT:
			return new hax.app.visiui.AceDataMode(this,true);
			
		case hax.app.visiui.JsonTableComponent.VIEW_FORM:
			return new hax.app.visiui.FormDataMode(this);
			
		case hax.app.visiui.JsonTableComponent.VIEW_CODE:
			return new hax.app.visiui.AceCodeMode(this,hax.app.visiui.JsonTableComponent.BLANK_DATA_VALUE_INFO,hax.app.visiui.JsonTableComponent.editorCodeWrapper);
			
		case hax.app.visiui.JsonTableComponent.VIEW_SUPPLEMENTAL_CODE:
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


hax.app.visiui.JsonTableComponent.createComponent = function(workspaceUI,data,componentOptions) {
    
    var parent = workspaceUI.getObjectByKey(data.parentKey);
    //should throw an exception if parent is invalid!
    
    var json = {};
    json.name = data.name;
    json.type = hax.core.JsonTable.generator.type;
    var actionResponse = hax.core.createmember.createMember(parent,json);
    
    var table = actionResponse.member;
    if(table) {
        var tableComponent = new hax.app.visiui.JsonTableComponent(workspaceUI,table,componentOptions);
        actionResponse.component = tableComponent;
    }
    return actionResponse;
}


hax.app.visiui.JsonTableComponent.createComponentFromJson = function(workspaceUI,member,componentJson) {
    var tableComponent = new hax.app.visiui.JsonTableComponent(workspaceUI,member,componentJson);
    return tableComponent;
}

//======================================
// This is the component generator, to register the component
//======================================

hax.app.visiui.JsonTableComponent.generator = {};
hax.app.visiui.JsonTableComponent.generator.displayName = "Data Table";
hax.app.visiui.JsonTableComponent.generator.uniqueName = "hax.app.visiui.JsonTableComponent";
hax.app.visiui.JsonTableComponent.generator.createComponent = hax.app.visiui.JsonTableComponent.createComponent;
hax.app.visiui.JsonTableComponent.generator.createComponentFromJson = hax.app.visiui.JsonTableComponent.createComponentFromJson;
hax.app.visiui.JsonTableComponent.generator.DEFAULT_WIDTH = 200;
hax.app.visiui.JsonTableComponent.generator.DEFAULT_HEIGHT = 200;

//======================================
// This is a code wrapper so the user works with the formula rather than the function body
//======================================

hax.app.visiui.JsonTableComponent.editorCodeWrapper = {};

hax.app.visiui.JsonTableComponent.editorCodeWrapper.FUNCTION_PREFIX = "var value;\n";
hax.app.visiui.JsonTableComponent.editorCodeWrapper.FUNCTION_SUFFIX = "\nreturn value;\n\n";

hax.app.visiui.JsonTableComponent.editorCodeWrapper.displayName = "Formula";

hax.app.visiui.JsonTableComponent.editorCodeWrapper.wrapCode = function(formula) { 
    return hax.app.visiui.JsonTableComponent.editorCodeWrapper.FUNCTION_PREFIX + formula + 
        hax.app.visiui.JsonTableComponent.editorCodeWrapper.FUNCTION_SUFFIX;
}

hax.app.visiui.JsonTableComponent.editorCodeWrapper.unwrapCode = function(functionBody) {
	if((functionBody == null)||(functionBody.length = 0)) return "";
	
    var formula = functionBody.replace("var value;","");
    formula = formula.replace("return value;","");
    return formula.trim();
}

