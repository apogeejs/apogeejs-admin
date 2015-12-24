/** This is a mixin that encapsulates the base functionality of a control
 * 
 * This is not a class, but it is used for the prototype of the objects that inherit from it.
 */
visicomp.app.visiui.Control = {};
    
/** This is the initializer for the component. The object passed is the core object
 * associated with this control. */
visicomp.app.visiui.Control.init = function(object,generator) {
    this.object = object;
    this.generator = generator;
    this.frame = null;
    
    this.menuItemInfoList = [];
    
    //add the standard entries
    var itemInfo = {};
    itemInfo.title = visicomp.app.visiui.VisiComp.convertSpacesForHtml("Delete " + this.generator.displayName);
    itemInfo.callback = this.createDeleteCallback(itemInfo.title);
    this.menuItemInfoList.push(itemInfo);
}

//==============================
// Public Instance Methods
//==============================

/** This method returns the table for this table control. */
visicomp.app.visiui.Control.getObject = function() {
    return this.object;
}

/** This method returns the table for this table control. */
visicomp.app.visiui.Control.getWorkspace = function() {
    return this.object.getWorkspace();
}

/** This method populates the frame for this control. */
visicomp.app.visiui.Control.getFrame = function() {
     return this.frame;
}

/** This method populates the frame for this control. */
visicomp.app.visiui.Control.setFrame = function(controlFrame) {
    
    this.frame = controlFrame;
    
    //let the extending object populate the frame
    this.populateFrame(controlFrame);
    
    //add the window title bar elements
    var window = controlFrame.getWindow();
    
    //set the menu
    var menu = window.getMenu();
    menu.setMenuItems(this.menuItemInfoList);
    
    //set the title
    window.setTitle(this.getObject().getName());
    
}

/** This serializes the table control. */
visicomp.app.visiui.Control.toJson = function(workspaceUI) {
    var json = {};
    json.name = this.getObject().getName();
    json.type = this.generator.uniqueName;
    
    var window = this.frame.getWindow();
    json.windowCoords = window.getCoordinateInfo();
    json.windowState = window.getWindowState();
    
    this.writeToJson(workspaceUI,json);
    
    return json;
}

//==============================
// Protected Instance Methods
//==============================

/** This method returns the table for this table control. */
visicomp.app.visiui.Control.getMenuItemInfoList = function() {
    return this.menuItemInfoList;
}

/** This method deseriliazes any data needed after the control is instantiated.
 * objects that extend Control should override this for any data that is
 * needed, however they should call this base function first. */
visicomp.app.visiui.Control.updateFromJson = function(workspaceUI,json,updateDataList) {
    var window = this.frame.getWindow();
    if(json.windowCoords) {
        window.setCoordinateInfo(json.windowCoords);
    }
    if(json.windowState) {
        window.setWindowState(json.windowState);
    }
}

//This method should be populated by an extending object. It should return a json object.
//** This serializes the table control. */
//visicomp.app.visiui.TableControl.prototype.writeToJson = function(workspaceUI, json);

//This method should be populated by an extending object.
//** This method populates the frame for this control. */
//visicomp.app.visiui.Control.populateFrame = function(controlFrame);

//==============================
// Private Instance Methods
//==============================

/** This method creates a callback for editing a standard codeable object
 *  @private */
visicomp.app.visiui.Control.createEditCodeableDialogCallback = function(title, optionalEditorWrapper) {
	var instance = this;
    
    //create save handler
    var onSave = function(functionBody,supplementalCode) {
        return visicomp.core.updatemember.updateCode(instance.object,functionBody,supplementalCode);
    };
    
    return function() {
        visicomp.app.visiui.dialog.showUpdateCodeableDialog(instance.object,onSave,title,optionalEditorWrapper);
    }
}

/** This method creates a callback for deleting the control. 
 *  @private */
visicomp.app.visiui.Control.createDeleteCallback = function(title) {
    return function() {
        alert("Not implemented!");
    }
}

/** This deserializez the control from a json. It is a static function, but because
 * this is a mixin it will also appear as a member function on extending objects. */
visicomp.app.visiui.Control.createfromJson = function(workspaceUI,parent,generator,json,updateDataList) {
    var name = json.name;
    var resultValue = generator.createControl(workspaceUI,parent,name);
    
    if(resultValue.success) {
        //load the general control data
        var control = resultValue.control;
        control.updateFromJson(workspaceUI,json,updateDataList);
    }
}


//======================================
// Each control should have a generator in the following format
//======================================

//visicomp.app.visiui.TableControl.generator = {};
//visicomp.app.visiui.TableControl.generator.name = "visicomp.app.visiui.TableControl";
////visicomp.app.visiui.TableControl.generator.displayName = "Table";
//visicomp.app.visiui.TableControl.generator.showCreateDialog = visicomp.app.visiui.TableControl.showCreateDialog;
//visicomp.app.visiui.TableControl.generator.createFromJson = visicomp.app.visiui.TableControl.createfromJson;

