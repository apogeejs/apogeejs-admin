/** This is a mixin that encapsulates the base functionality of a Component
 *that edits a table. This mixin requires the object be a component.
 * 
 * This is not a class, but it is used for the prototype of the objects that inherit from it.
 */
haxapp.app.TableEditComponent = {};

/** This is the initializer for the component. The object passed is the core object
 * associated with this component. */
haxapp.app.TableEditComponent.init = function(settings,options) {
	
	this.viewTypes = settings.viewModes;
    this.defaultViewType = settings.defaultView;
    var initialViewType = ((options)&&(options.viewType)) ? options.viewType : settings.defaultView;
    
	this.initUI(initialViewType);
	
    //this.viewType
	//this.viewModeElement
    //this.viewModeElementShowing
    //this.select
	
    this.doClearFunction = (settings.clearFunctionMenyText !== undefined);
	this.clearFunctionMenuText = settings.clearFunctionMenuText;
    this.clearFunctionDataValue = settings.emptyDataValue;
	this.clearFunctionActive = false;
	this.clearFunctionCallback = null;
    
    //add a cleanup action to the base component - component must already be initialized
    this.addSaveAction(haxapp.app.TableEditComponent.writeToJson);
    this.addCleanupAction(haxapp.app.TableEditComponent.destroy);

}

/** This value is used as the background color when an editor is read only. */
haxapp.app.TableEditComponent.NO_EDIT_BACKGROUND_COLOR = "#f4f4f4";

/** This method populates the frame for this component. 
 * @protected */
haxapp.app.TableEditComponent.setViewType = function(viewType) {
	//return if there is no change
	if(this.viewType === viewType) return false;
    
    //check if we are editing
    if(this.editActive()) {
        alert("You must save or cancel the edit session to change the view mode.");
        return false;
    }
	
	//if there is an old view, remove it
	if(this.viewModeElement) {
		this.showModeElement(null);
	}
    
    this.viewModeElement = this.getViewModeElement(viewType);
    this.viewType = viewType;
    
    return true;
}

/** This method should be implemented to retrieve a view mode of the give type. 
 * @protected. */
//haxapp.app.TableEditComponent.getViewModeElement = function(viewType);

//this function will update the view shown in the dropdown
haxapp.app.TableEditComponent.updateViewDropdown = function(viewType) {
    if(!viewType) {
        viewType = this.defaultViewType;
    }
    this.select.value = viewType;
}

/** This method updates the table data 
 * @private */    
haxapp.app.TableEditComponent.memberUpdated = function() {
    //call the base function
    haxapp.app.Component.memberUpdated.call(this);
    
    var object = this.getObject();
        
    if(this.viewModeElementShowing !== this.viewModeElement) {
        this.showModeElement(this.viewModeElement);
    }

    var editable = ((this.viewModeElement.isData === false)||(!object.hasCode()));

    this.viewModeElement.showData(editable);
	
	//add the clear function menu item if needed
	if(this.doClearFunction) {
    
		if(object.hasCode()) {
			if(!this.clearFunctionActive) {
				var menu = this.getWindow().getMenu();
				
				if(!this.clearFunctionCallback) {
					this.clearFunctionCallback = this.getClearFunctionCallback();
				}
				
				menu.addCallbackMenuItem(this.clearFunctionMenuText,this.clearFunctionCallback);
				this.clearFunctionActive = true;
			}
		}
		else {
			if(this.clearFunctionActive) {
				var menu = this.getWindow().getMenu();
				menu.removeMenuItem(this.clearFunctionMenuText);
				this.clearFunctionActive = false;
			}
		}
	}
}

haxapp.app.TableEditComponent.getClearFunctionCallback = function() {
	var table = this.getObject();
	var blankDataValue = this.clearFunctionDataValue;
    return function() {
        var actionResponse = hax.updatemember.updateData(table,blankDataValue); 
        if(!actionResponse.getSuccess()) {
            alert(actionResponse.getErrorMsg());
        }
    }
}

/** This method should be called to set up the component ui for edit mode. 
 * @protected */
haxapp.app.TableEditComponent.startEditUI = function(onSave,onCancel) {
    this.select.disabled = true;
    this.showSaveBar(onSave,onCancel);
}

/** This method populates the frame for this component. 
 * @protected */
haxapp.app.TableEditComponent.endEditUI = function() {
    this.hideSaveBar();
    this.select.disabled = false;
}
/** This method populates the frame for this component. 
 * @protected */
haxapp.app.TableEditComponent.initUI = function(initialViewType) {
    
    //make sure we have a valid initial view type
    if(this.viewTypes.indexOf(initialViewType) < 0) {
        initialViewType = this.defaultViewType;
    }
        
	
	this.setFixedContentElement();
	
	//create the view selection ui
	this.select = haxapp.ui.createElement("select",null,{
        "marginRight":"3px",
        "backgroundColor":"transparent"
    });
    
    for(var i = 0; i < this.viewTypes.length; i++) {
        var entry = this.viewTypes[i];
        this.select.add(haxapp.ui.createElement("option",{"text":entry}));
    }
    
    //create on functions
    var instance = this;
    var onViewSet = function(event) {
        var success = instance.setViewType(instance.select.value);
        if(success) {
            instance.memberUpdated();
        }
        else {
            //make sure correct view type is displayed
            instance.updateViewDropdown(this.viewType);
        }
        return success;
    }
    
    this.select.onchange = onViewSet;
   
    //add the view select to the title bar
    this.window.addRightTitleBarElement(this.select);
    
    this.setViewType(initialViewType);
    this.updateViewDropdown(this.viewType);
}

/** @private */
haxapp.app.TableEditComponent.showModeElement = function(viewModeElement) {
    
	var contentDiv = this.getContentElement();
	haxapp.ui.removeAllChildren(contentDiv);
	
    if(viewModeElement) {
		var viewDiv = viewModeElement.getElement();
		contentDiv.appendChild(viewDiv);
	}
	
	if(this.viewModeElementShowing) {
		this.viewModeElementShowing.destroy();
	}
	this.viewModeElementShowing = viewModeElement;
}

//======================================
// Callbacks
// These are defined as static but are called in the objects context
//======================================

/** @protected */
haxapp.app.TableEditComponent.destroy = function() {
    if(this.viewModeElement) {
        this.viewModeElement.destroy();
    }
}

/** This serializes the table component. */
haxapp.app.TableEditComponent.writeToJson = function(json) {
    json.viewType = this.viewType;
}
