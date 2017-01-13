/** This is a mixin that encapsulates the base functionality of a Component
 *that edits a table. This mixin requires the object be a component.
 * 
 * This is not a class, but it is used for the prototype of the objects that inherit from it.
 * 
 * NOW IT IS A CLASS, FOR NOW AT LEAST
 */


/** This is the initializer for the component. The object passed is the core object
 * associated with this component. */
haxapp.app.EditComponentDisplay = function(editComponent,container,settings,options) {
    
    //base init
    haxapp.app.ComponentDisplay.init.call(this,editComponent,container,options);
	
	this.viewTypes = settings.viewModes;
    this.defaultViewType = settings.defaultView;
	
    this.viewType = null;
	this.viewModeElement = null;
    this.viewModeElementShowing = null;
    this.select = null;
	
    this.doClearFunction = (settings.clearFunctionMenyText !== undefined);
	this.clearFunctionMenuText = settings.clearFunctionMenuText;
    this.clearFunctionDataValue = settings.emptyDataValue;
	this.clearFunctionActive = false;
	this.clearFunctionCallback = null;
    
    //add a cleanup action to the base component - component must already be initialized
//    this.addSaveAction(haxapp.app.EditComponentDisplay.writeToJson);
//    this.addCleanupAction(haxapp.app.EditComponentDisplay.destroy);

    this.initUI();
    
    this.memberUpdated();

}

//add components to this class
hax.base.mixin(haxapp.app.EditComponentDisplay,haxapp.app.ComponentDisplay);

/** This value is used as the background color when an editor is read only. */
haxapp.app.EditComponentDisplay.NO_EDIT_BACKGROUND_COLOR = "#f4f4f4";

/** This method populates the frame for this component. 
 * @protected */
haxapp.app.EditComponentDisplay.prototype.setViewType = function(viewType) {
	//return if there is no change
	if(this.viewType === viewType) return false;
    
    //check if we are editing
    if(this.saveBarActive) {
        alert("You must save or cancel the edit session to change the view mode.");
        return false;
    }
	
	//if there is an old view, remove it
	if(this.viewModeElement) {
		this.showModeElement(null);
	}
    
    this.viewModeElement = this.component.getViewModeElement(this,viewType);
    this.viewType = viewType;
    
    return true;
}

///** This method should be implemented by the EDIT COMPONENT to retrieve a view mode of the give type.  */
//haxapp.app.EditComponent.prototype.getViewModeElement = function(editComponentDisplay,viewType);

//this function will update the view shown in the dropdown
haxapp.app.EditComponentDisplay.prototype.updateViewDropdown = function(viewType) {
    if(!viewType) {
        viewType = this.defaultViewType;
    }
    this.select.value = viewType;
}

/** This method updates the table data 
 * @private */    
haxapp.app.EditComponentDisplay.prototype.memberUpdated = function() {
    
    var object = this.component.getObject();
        
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

haxapp.app.EditComponentDisplay.prototype.getClearFunctionCallback = function() {
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
haxapp.app.EditComponentDisplay.prototype.startEditUI = function(onSave,onCancel) {
    this.select.disabled = true;
    this.showSaveBar(onSave,onCancel);
}

/** This method populates the frame for this component. 
 * @protected */
haxapp.app.EditComponentDisplay.prototype.endEditUI = function() {
    this.hideSaveBar();
    this.select.disabled = false;
}
/** This method populates the frame for this component. 
 * @protected */
haxapp.app.EditComponentDisplay.prototype.initUI = function() {
    
    //set initial view type
    var initialViewType;
    if( (this.options) &&
        (this.options.viewType) &&
        (this.viewTypes.indexOf(initialViewType) < 0) ) {

        initialViewType = this.options.viewType;
    }
    else {
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
    
    //add the toolbar
    this.normalToolbarDiv = haxapp.ui.createElement("div",null,
        {
            "display":"block",
            "position":"relative",
            "top":"0px",
            "backgroundColor":"white",
            "border":"solid 1px gray",
            "padding":"3px"
        });

    this.normalToolbarDiv.appendChild(document.createTextNode("View: "));
    this.normalToolbarDiv.appendChild(this.select);
    this.showToolbar(this.normalToolbarDiv);
    
    this.setViewType(initialViewType);
    this.updateViewDropdown(this.viewType);
}


/** This method returns the base member for this component. */
haxapp.app.EditComponentDisplay.prototype.showSaveBar = function(onSave,onCancel) {
    if(!this.saveDiv) {
        this.saveDiv = haxapp.ui.createElement("div",null,
            {
                "display":"block",
                "position":"relative",
                "top":"0px",
                "backgroundColor":"white",
				"border":"solid 1px gray",
				"padding":"3px"
            });
			
		this.saveDiv.appendChild(document.createTextNode("Edit: "));
		
		this.saveBarSaveButton = document.createElement("button");
		this.saveBarSaveButton.innerHTML = "Save";
		this.saveDiv.appendChild(this.saveBarSaveButton);
		
		this.saveDiv.appendChild(document.createTextNode(" "));

		this.saveBarCancelButton = document.createElement("button");
		this.saveBarCancelButton.innerHTML = "Cancel";
		this.saveDiv.appendChild(this.saveBarCancelButton);
    }
	
	this.saveBarSaveButton.onclick = onSave;
	this.saveBarCancelButton.onclick = onCancel;
	this.saveBarActive = true;
    
    //show the save toolbar
    this.showToolbar(this.saveDiv);
}

/** This method returns the base member for this component. */
haxapp.app.EditComponentDisplay.prototype.hideSaveBar = function() {
    this.saveBarActive = false;	
	this.showToolbar(this.normalToolbarDiv);
}

/** @private */
haxapp.app.EditComponentDisplay.prototype.showModeElement = function(viewModeElement) {
    
    var displayBody = this.getDisplayBodyElement();
    
	haxapp.ui.removeAllChildren(displayBody);
	
    if(viewModeElement) {
		var viewDiv = viewModeElement.getElement();
		displayBody.appendChild(viewDiv);
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
haxapp.app.EditComponentDisplay.prototype.destroy = function() {
    if(this.viewModeElement) {
        this.viewModeElement.destroy();
    }
}

/** This serializes the table component. */
haxapp.app.EditComponentDisplay.prototype.writeToJson = function(json) {
    json.viewType = this.viewType;
}
