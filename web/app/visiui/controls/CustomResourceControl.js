/** This control represents a table object. */
visicomp.app.visiui.CustomResourceControl = function(resource) {
    //base init
    visicomp.app.visiui.Control.init.call(this,resource,"Custom Control");
    visicomp.app.visiui.BasicResourceControl.init.call(this);
};

//add components to this class
visicomp.core.util.mixin(visicomp.app.visiui.CustomResourceControl,visicomp.app.visiui.Control);
visicomp.core.util.mixin(visicomp.app.visiui.CustomResourceControl,visicomp.app.visiui.BasicResourceControl);


//==============================
// Public Instance Methods
//==============================


//==============================
// Protected and Private Instance Methods
//==============================


/** This method populates the frame for this control. */
visicomp.app.visiui.CustomResourceControl.prototype.addToFrame = function(controlFrame) {
	
    //create the menu
    var menuItemInfoList = this.getMenuItemInfoList();

    var itemInfo = {};
    itemInfo.title = "Edit&nbsp;Resource$nbsp;Code";
    itemInfo.callback = this.createEditResourceDialogCallback();
    
    //add these at the start of the menu
    menuItemInfoList.splice(1,0,itemInfo);

}

visicomp.app.visiui.CustomResourceControl.prototype.createEditResourceDialogCallback = function() {
    
    var resource = this.getObject();
    
    //create save handler
    var onSave = function(controlHtml,controlOnLoad,supplementalCode,css) {
		var customResourceProcessor = resource.getResourceProcessor();
		customResourceProcessor.update(controlHtml,controlOnLoad,supplementalCode,css);
//figure out what to do with return here
		return {"success":true};
    };
    
    return function() {
        visicomp.app.visiui.dialog.showUpdateCustomControlDialog(resource,onSave);
    }
}

//======================================
// Static methods
//======================================

//add table listener
visicomp.app.visiui.CustomResourceControl.getShowCreateDialogCallback = function(app) {
    return function() {
        visicomp.app.visiui.dialog.showCreateChildDialog("Custom Control",
            app,
            visicomp.app.visiui.CustomResourceControl.createControl
        );
    }
}

//add table listener
visicomp.app.visiui.CustomResourceControl.createControl = function(workspaceUI,parent,name) {
	var processor = new visicomp.app.visiui.control.CustomControl();
    var returnValue = visicomp.core.createresource.createResource(parent,name,processor);
    if(returnValue.success) {
        var resource = returnValue.resource;
        var customResourceControl = new visicomp.app.visiui.CustomResourceControl(resource);
        workspaceUI.addControl(customResourceControl);
    }
    else {
        //no action for now
    }
    return returnValue;
}

/** This serializes the table control. */
visicomp.app.visiui.CustomResourceControl.createfromJson = function(workspaceUI,parent,json,updateDataList) {

    var name = json.name;
    var resultValue = visicomp.app.visiui.CustomResourceControl.createControl(workspaceUI,parent,name);
    
    if(resultValue.success) {
		var resource = resultValue.resource;
        resource.updateFromJson(json,updateDataList);
    }
}

//======================================
// This is the control generator, to register the control
//======================================

visicomp.app.visiui.CustomResourceControl.generator = {};
visicomp.app.visiui.CustomResourceControl.generator.displayName = "Custom Control";
visicomp.app.visiui.CustomResourceControl.generator.uniqueName = "visicomp.app.visiui.CustomResourceControl";
visicomp.app.visiui.CustomResourceControl.generator.getShowCreateDialogCallback = visicomp.app.visiui.CustomResourceControl.getShowCreateDialogCallback;
visicomp.app.visiui.CustomResourceControl.generator.createFromJson = visicomp.app.visiui.CustomResourceControl.createfromJson;


