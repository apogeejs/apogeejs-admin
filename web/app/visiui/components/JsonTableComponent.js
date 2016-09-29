/** This component represents a json table object. */
visicomp.app.visiui.JsonTableComponent = function(workspaceUI,table,componentJson) {
    //base init
    visicomp.app.visiui.Component.init.call(this,workspaceUI,table,visicomp.app.visiui.JsonTableComponent.generator,componentJson);
    visicomp.app.visiui.TableEditComponent.init.call(this,
		visicomp.app.visiui.JsonTableComponent.VIEW_MODES,
        visicomp.app.visiui.JsonTableComponent.DEFAULT_VIEW,
		visicomp.app.visiui.JsonTableComponent.BLANK_DATA_VALUE_INFO);
	
    this.memberUpdated();
};

//add components to this class
visicomp.core.util.mixin(visicomp.app.visiui.JsonTableComponent,visicomp.app.visiui.Component);
visicomp.core.util.mixin(visicomp.app.visiui.JsonTableComponent,visicomp.app.visiui.TableEditComponent);

//==============================
// Protected and Private Instance Methods
//==============================

visicomp.app.visiui.JsonTableComponent.VIEW_PLAIN_TEXT = "Plain Text";
visicomp.app.visiui.JsonTableComponent.VIEW_TEXT = "Text";
visicomp.app.visiui.JsonTableComponent.VIEW_FORM = "Form";
visicomp.app.visiui.JsonTableComponent.VIEW_CODE = "Formula";
visicomp.app.visiui.JsonTableComponent.VIEW_SUPPLEMENTAL_CODE = "Private";

visicomp.app.visiui.JsonTableComponent.VIEW_MODES = [
    visicomp.app.visiui.JsonTableComponent.VIEW_PLAIN_TEXT,
    visicomp.app.visiui.JsonTableComponent.VIEW_FORM,
    visicomp.app.visiui.JsonTableComponent.VIEW_TEXT,
    visicomp.app.visiui.JsonTableComponent.VIEW_CODE,
    visicomp.app.visiui.JsonTableComponent.VIEW_SUPPLEMENTAL_CODE
];

//visicomp.app.visiui.JsonTableComponent.DEFAULT_VIEW = visicomp.app.visiui.JsonTableComponent.VIEW_FORM;
visicomp.app.visiui.JsonTableComponent.DEFAULT_VIEW = visicomp.app.visiui.JsonTableComponent.VIEW_PLAIN_TEXT;

visicomp.app.visiui.JsonTableComponent.BLANK_DATA_VALUE_INFO = {
	"dataValue":"",
	"menuLabel":"Clear Formula"
};

/** This method should be implemented to retrieve a view mode of the give type. 
 * @protected. */
visicomp.app.visiui.JsonTableComponent.prototype.getViewModeElement = function(viewType) {
	
	//create the new view element;
	switch(viewType) {
//--------------------------------------------------------------
        case visicomp.app.visiui.JsonTableComponent.VIEW_PLAIN_TEXT:
			return new visicomp.app.visiui.TextAreaMode(this);
//--------------------------------------------------------------
            
		case visicomp.app.visiui.JsonTableComponent.VIEW_TEXT:
			return new visicomp.app.visiui.AceDataMode(this);
			
		case visicomp.app.visiui.JsonTableComponent.VIEW_FORM:
			return new visicomp.app.visiui.FormDataMode(this);
			
		case visicomp.app.visiui.JsonTableComponent.VIEW_CODE:
			return new visicomp.app.visiui.AceCodeMode(this,visicomp.app.visiui.JsonTableComponent.BLANK_DATA_VALUE_INFO,visicomp.app.visiui.JsonTableComponent.editorCodeWrapper);
			
		case visicomp.app.visiui.JsonTableComponent.VIEW_SUPPLEMENTAL_CODE:
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


visicomp.app.visiui.JsonTableComponent.createComponent = function(workspaceUI,data,componentOptions) {
    
    var parent = workspaceUI.getObjectByKey(data.parentKey);
    //should throw an exception if parent is invalid!
    
    var json = {};
    json.name = data.name;
    json.type = visicomp.core.JsonTable.generator.type;
    var actionResponse = visicomp.core.createmember.createMember(parent,json);
    
    var table = actionResponse.member;
    if(table) {
        var tableComponent = new visicomp.app.visiui.JsonTableComponent(workspaceUI,table,componentOptions);
        actionResponse.component = tableComponent;
    }
    return actionResponse;
}


visicomp.app.visiui.JsonTableComponent.createComponentFromJson = function(workspaceUI,member,componentJson) {
    var tableComponent = new visicomp.app.visiui.JsonTableComponent(workspaceUI,member,componentJson);
    return tableComponent;
}

//======================================
// This is the component generator, to register the component
//======================================

visicomp.app.visiui.JsonTableComponent.generator = {};
visicomp.app.visiui.JsonTableComponent.generator.displayName = "Data Table";
visicomp.app.visiui.JsonTableComponent.generator.uniqueName = "visicomp.app.visiui.JsonTableComponent";
visicomp.app.visiui.JsonTableComponent.generator.createComponent = visicomp.app.visiui.JsonTableComponent.createComponent;
visicomp.app.visiui.JsonTableComponent.generator.createComponentFromJson = visicomp.app.visiui.JsonTableComponent.createComponentFromJson;
visicomp.app.visiui.JsonTableComponent.generator.DEFAULT_WIDTH = 200;
visicomp.app.visiui.JsonTableComponent.generator.DEFAULT_HEIGHT = 200;

//======================================
// This is a code wrapper so the user works with the formula rather than the function body
//======================================

visicomp.app.visiui.JsonTableComponent.editorCodeWrapper = {};

visicomp.app.visiui.JsonTableComponent.editorCodeWrapper.FUNCTION_PREFIX = "var value;\n";
visicomp.app.visiui.JsonTableComponent.editorCodeWrapper.FUNCTION_SUFFIX = "\nreturn value;\n\n";

visicomp.app.visiui.JsonTableComponent.editorCodeWrapper.displayName = "Formula";

visicomp.app.visiui.JsonTableComponent.editorCodeWrapper.wrapCode = function(formula) { 
    return visicomp.app.visiui.JsonTableComponent.editorCodeWrapper.FUNCTION_PREFIX + formula + 
        visicomp.app.visiui.JsonTableComponent.editorCodeWrapper.FUNCTION_SUFFIX;
}

visicomp.app.visiui.JsonTableComponent.editorCodeWrapper.unwrapCode = function(functionBody) {
	if((functionBody == null)||(functionBody.length = 0)) return "";
	
    var formula = functionBody.replace("var value;","");
    formula = formula.replace("return value;","");
    return formula.trim();
}

