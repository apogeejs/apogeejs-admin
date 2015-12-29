/** This is a mixin that encapsulates the base functionality of a control
 * 
 * This is not a class, but it is used for the prototype of the objects that inherit from it.
 */
visicomp.app.visiui.Control = {};
    
/** This is the initializer for the component. The object passed is the core object
 * associated with this control. */
visicomp.app.visiui.Control.init = function(workspaceUI,object,generator) {
    this.workspaceUI = workspaceUI;
    this.object = object;
    this.generator = generator;
    this.frame = null;
    
    this.menuItemInfoList = [];
    
    //add the standard entries
    var itemInfo = {};
    itemInfo.title = visicomp.app.visiui.VisiComp.convertSpacesForHtml("Delete " + this.generator.displayName);
    itemInfo.callback = this.createDeleteCallback(itemInfo.title);
    this.menuItemInfoList.push(itemInfo);
    
    //create window
    var options = {"minimizable":true,"maximizable":true,"resizable":true,"movable":true};
    this.window = new visicomp.visiui.StackWindow(options);
    
    //load the content div
    var contentDiv = visicomp.visiui.createElement("div",null,
            {
                "position":"absolute",
                "top":"0px",
                "bottom":"0px",
                "right":"0px",
                "left":"0px"
            });
    this.window.setContent(contentDiv);
    
     //let the extending object populate the frame
    this.populateFrame();
    
    //set the menu
    var menu = this.window.getMenu();
    menu.setMenuItems(this.menuItemInfoList);
    
    //set the title
    this.window.setTitle(this.getObject().getName());
}

//==============================
// Public Instance Methods
//==============================

/** This method returns the table for this table control. */
visicomp.app.visiui.Control.getObject = function() {
    return this.object;
}

/** This method returns the workspace for this table control. */
visicomp.app.visiui.Control.getWorkspace = function() {
    return this.object.getWorkspace();
}

/** This method returns the workspaceUI for this table control. */
visicomp.app.visiui.Control.getWorkspaceUI = function() {
    return this.workspaceUI;
}

/** This method populates the frame for this control. */
visicomp.app.visiui.Control.getFrame = function() {
     return this.frame;
}

/** This method populates the frame for this control. */
visicomp.app.visiui.Control.setParentContainerObject = function(parentContainerObject) {
    var parentContainer = parentContainerObject.getContainerObject();
    this.window.setParentContainer(parentContainer);
}

/** This serializes the table control. */
visicomp.app.visiui.Control.toJson = function() {
    var json = {};
    json.name = this.getObject().getName();
    json.type = this.generator.uniqueName;
    
    var window = this.frame.getWindow();
    json.windowCoords = window.getCoordinateInfo();
    json.windowState = window.getWindowState();
    
    this.writeToJson(json);
    
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
visicomp.app.visiui.Control.updateFromJson = function(json,updateDataList) {
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
    var object = this.getObject();
    return function() {
        //we should do a warning!!!
        
        //delete the object - the control we be deleted after the delete event received
        visicomp.core.deletechild.deleteChild(object);
    }
}

/** This method should include an needed functionality to clean up after a delete. */
visicomp.app.visiui.Control.onDelete = function() {
}

/** This deserializez the control from a json. It is a static function, but because
 * this is a mixin it will also appear as a member function on extending objects. */
visicomp.app.visiui.Control.createfromJson = function(workspaceUI,parent,generator,json,updateDataList) {
    var name = json.name;
    var resultValue = generator.createControl(workspaceUI,parent,name);
    
    if(resultValue.success) {
        //load the general control data
        var control = resultValue.control;
        control.updateFromJson(json,updateDataList);
    }
}

//======================================
// All controls should have a control generator to register the control, as below
//======================================
//
//visicomp.app.visiui.TableControl.generator = {};
//visicomp.app.visiui.TableControl.generator.displayName = "Table";
//visicomp.app.visiui.TableControl.generator.uniqueName = "visicomp.app.visiui.TableControl";
//visicomp.app.visiui.TableControl.generator.createControl = visicomp.app.visiui.TableControl.createControl;