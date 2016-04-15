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
			return new visicomp.app.visiui.AceCodeMode(this);
			
		case visicomp.app.visiui.FunctionComponent.VIEW_SUPPLEMENTAL_CODE:
			return new visicomp.app.visiui.AceSupplementalMode(this);
			
		default:
//temporary error handling...
			alert("unrecognized view element!");
			return null;
	}
}

/** This method populates the frame for this component. 
 * @protected */
visicomp.app.visiui.FunctionComponent.prototype.populateFrame = function() {
    
    //create the menu
    var menuItemInfoList = this.getMenuItemInfoList();
    
    var itemInfo1 = {};
    itemInfo1.title = "Edit Arg List";
    itemInfo1.callback = this.createEditArgListDialogCallback();
    
    //add these at the start of the menu
    menuItemInfoList.splice(0,0,itemInfo1);
}

/** This method should include an needed functionality to clean up after a delete. */
visicomp.app.visiui.FunctionComponent.prototype.onDelete = function() {
    if(this.editor) {
        this.editor.destroy();
        this.editor = null;
    }
}

//=============================
// Action UI Entry Points
//=============================

/** This method creates a callback for editing a standard codeable object
 *  @private */
visicomp.app.visiui.FunctionComponent.prototype.createEditArgListDialogCallback = function() {
	var instance = this;
    var member = instance.getObject();
    
    //create save handler
    var onSave = function(argList) {
        var functionBody = member.getFunctionBody();
        var supplementalCode = member.getSupplementalCode();
        var actionResponse = visicomp.core.updatemember.updateCode(member,argList,functionBody,supplementalCode);
        if(!actionResponse.getSuccess()) {
            //show an error message
            var msg = actionResponse.getErrorMsg();
            alert(msg);
        }
        
        //return true to close the dialog
        return true;  
    };
    
    return function() {
        visicomp.app.visiui.dialog.showUpdateArgListDialog(instance.object,onSave);
    }
}

//======================================
// Static methods
//======================================

//add table listener
visicomp.app.visiui.FunctionComponent.createComponent = function(workspaceUI,parent,name) {
    
    var json = {};
    json.name = name;
    json.type = visicomp.core.FunctionTable.generator.type;
    var actionResponse = visicomp.core.createmember.createMember(parent,json);
    
    var functionObject = actionResponse.member;
    if(functionObject) {
        var functionComponent = new visicomp.app.visiui.FunctionComponent(workspaceUI,functionObject);
        actionResponse.component = functionComponent;
    }
    return actionResponse;
}

visicomp.app.visiui.FunctionComponent.createComponentFromJson = function(workspaceUI,member,componentJson) {
    var functionComponent = new visicomp.app.visiui.FunctionComponent(workspaceUI,member,componentJson);
    return functionComponent;
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
 