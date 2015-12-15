/** This control represents a table object. */
visicomp.app.visiui.CustomResourceControl = function(resource) {
    this.resource = resource;
    this.frame = null;
	
	this.resourceProcessor = resource.getResourceProcessor();
};

//==============================
// Public Instance Methods
//==============================

/** This method returns the table for this table control. */
visicomp.app.visiui.CustomResourceControl.prototype.getObject = function() {
    return this.resource;
}

/** This method returns the table for this table control. */
visicomp.app.visiui.CustomResourceControl.prototype.getWorkspace = function() {
    return this.resource.getWorkspace();
}

/** This method populates the frame for this control. */
visicomp.app.visiui.CustomResourceControl.prototype.getFrame = function() {
     return this.frame;
}

/** This method populates the frame for this control. */
visicomp.app.visiui.CustomResourceControl.prototype.setFrame = function(controlFrame) {
    
    this.frame = controlFrame;
    
    var window = controlFrame.getWindow();
	
	//set the child UI object onto the control engine
    this.resource.getResourceProcessor().setWindow(window);
	
	//menus
	var instance = this;
	
	//create the edit buttons
    var editUserCodeButton = visicomp.visiui.createElement("button",{"innerHTML":"Edit Formula"});
    editUserCodeButton.onclick = function() {
        instance.createFormulaEditDialog();
    }
    window.addTitleBarElement(editUserCodeButton);
	
	var editControlCodeButton = visicomp.visiui.createElement("button",{"innerHTML":"Edit Resource"});
    editControlCodeButton.onclick = function() {
         instance.createResourceEditDialog();
    }
    window.addTitleBarElement(editControlCodeButton);

    //dummy size
window.setSize(200,200);

}

/** This serializes the table control. */
visicomp.app.visiui.CustomResourceControl.prototype.toJson = function() {
    var json = {};
    json.name = this.reosource.getName();
    json.type = visicomp.app.visiui.TableControl.generator.name;
    
	var resourceProcessor = this.resource.getResourceProcessor();
	resourceProcessor.update(json.html,json.onLoadBody,json.supplementalCode,json.css);
	
	json.html = resourceProcessor.getHtml();
	json.onLoadBody = resourceProcessor.getOnLoadBody();
	json.supplementalCode = resourceProcessor.getSupplementalCode();
	json.css = resourceProcessor.getCsss();
		
	json.functionBody = this.resource.getFunctionBody();
	json.supplementalCode = this.resource.getSupplementalCode();

    return json;
}

//==============================
// Private Instance Methods
//==============================

visicomp.app.visiui.CustomResourceControl.prototype.createFormulaEditDialog = function() {
	var instance = this;
    
    //create save handler
    var onSave = function(functionBody,supplementalCode) {
        return visicomp.core.updatemember.updateCode(instance.resource,functionBody,supplementalCode);
    };
    
    visicomp.app.visiui.dialog.showUpdateCodeableDialog(instance.resource,onSave,"Update Formula");
}

visicomp.app.visiui.CustomResourceControl.prototype.createResourceEditDialog = function() {
	var instance = this;
    
    //create save handler
    var onSave = function(controlHtml,controlOnLoad,supplementalCode,css) {
		var customResourceProcessor = instance.resource.getResourceProcessor();
		customResourceProcessor.update(controlHtml,controlOnLoad,supplementalCode,css);
//figure out what to do with return here
		return {"success":true};
    };
    
    visicomp.app.visiui.dialog.showUpdateCustomControlDialog(control,onSave);
}

//======================================
// Static methods
//======================================

//add table listener
visicomp.app.visiui.CustomResourceControl.showCreateDialog = function(app) {
     visicomp.app.visiui.dialog.showCreateChildDialog("Custom Control",
        app,
        visicomp.app.visiui.CustomResourceControl.createControl
    );
}

//add table listener
visicomp.app.visiui.CustomResourceControl.createControl = function(app,parent,name) {
	var processor = new visicomp.app.visiui.control.CustomControl();
    var returnValue = visicomp.core.createresource.createResource(parent,name,processor);
    if(returnValue.success) {
        var resource = returnValue.resource;
        var customResourceControl = new visicomp.app.visiui.CustomResourceControl(resource);
        app.addControl(customResourceControl);
    }
    else {
        //no action for now
    }
    return returnValue;
}

/** This serializes the table control. */
visicomp.app.visiui.CustomResourceControl.createfromJson = function(app,parent,json,updateDataList) {

    var name = json.name;
    var resultValue = visicomp.app.visiui.CustomResourceControl.createControl(app,parent,name);
    
    if(resultValue.success) {
		var resource = resultValue.resource;
		var resourceProcessor = resource.getResourceProcessor();
		resourceProcessor.update(json.html,json.onLoadBody,json.supplementalCode,json.css);
		
        var updateData = {};
        updateData.member = resultValue.resource;
		updateData.functionBody = json.functionBody;
		updateData.supplementalCode = json.supplementalCode;
        updateDataList.push(updateData);
    }
}

//======================================
// This is the control generator, to register the control
//======================================

visicomp.app.visiui.CustomResourceControl.generator = {};
visicomp.app.visiui.CustomResourceControl.generator.name = "CustomResource";
visicomp.app.visiui.CustomResourceControl.generator.showCreateDialog = visicomp.app.visiui.CustomResourceControl.showCreateDialog;
visicomp.app.visiui.CustomResourceControl.generator.createFromJson = visicomp.app.visiui.CustomResourceControl.createfromJson;


