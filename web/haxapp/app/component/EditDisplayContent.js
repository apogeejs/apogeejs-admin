/** This is a mixin that encapsulates the base functionality of a Component
 *that edits a table. This mixin requires the object be a component.
 * 
 * This is not a class, but it is used for the prototype of the objects that inherit from it.
 * 
 * NOW IT IS A CLASS, FOR NOW AT LEAST
 */


/** This is the initializer for the component. The object passed is the core object
 * associated with this component. */
haxapp.app.EditDisplayContent = function(editComponent,options) {
    
    this.component = editComponent;
    var settings = editComponent.getTableEditSettings();
	
	this.viewTypes = settings.viewModes;
    this.defaultViewType = settings.defaultView;
	
    this.viewType = null;
    this.select = null;
    this.viewModeElements = {};
    this.viewModeElement = null;
	
    this.doClearFunction = (settings.clearFunctionMenyText !== undefined);
	this.clearFunctionMenuText = settings.clearFunctionMenuText;
    this.clearFunctionDataValue = settings.emptyDataValue;
	this.clearFunctionActive = false;
	this.clearFunctionCallback = null;
    
    //add a cleanup action to the base component - component must already be initialized
//    this.addSaveAction(haxapp.app.EditDisplayContent.writeToJson);
//    this.addCleanupAction(haxapp.app.EditDisplayContent.destroy);

    this.initUI();

}

haxapp.app.EditDisplayContent.prototype.getObject = function() {
    return this.component.getObject();
}

haxapp.app.EditDisplayContent.prototype.getComponent = function() {
    return this.component;
}

haxapp.app.EditDisplayContent.prototype.getOuterElement = function(viewType) {
    return this.windowHeaderManager.getOuterElement();
}


/** This value is used as the background color when an editor is read only. */
haxapp.app.EditDisplayContent.NO_EDIT_BACKGROUND_COLOR = "#f4f4f4";


/** @protected */
haxapp.app.EditDisplayContent.prototype.destroy = function() {
    for(var viewType in viewModeElements) {
        var viewModeElement = this.viewModeElemens[viewType];
        viewModeElement.destroy();
    }
}

/** This serializes the table component. */
haxapp.app.EditDisplayContent.prototype.writeToJson = function(json) {
    json.viewType = this.viewType;
}


/** This method populates the frame for this component. 
 * @protected */
haxapp.app.EditDisplayContent.prototype.initUI = function() {
    
    this.windowHeaderManager = new haxapp.app.WindowHeaderManager();
    
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
        instance.setViewType(instance.select.value);
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
    this.windowHeaderManager.showToolbar(this.normalToolbarDiv);
    
    this.setViewType(initialViewType);
}



//--------------------------
//management of view
//--------------------------

/** This method populates the frame for this component. 
 * @protected */
haxapp.app.EditDisplayContent.prototype.setViewType = function(viewType) {
	//return if there is no change
	if(this.viewType === viewType) return;
    
    //check if we can change views
    if(this.viewModeElement) {
        var hideRequestResponse = this.viewModeElement.requestHide();
        
        if(hideRequestResponse !== haxapp.app.ViewMode.CLOSE_OK) {
            if(hideRequestResponse === haxapp.app.ViewMode.UNSAVED_DATA) {
                alert("You must save or cancel the edit session to change the view mode.");
            }
            else {
                //we shouldn't get here
                alert("close request rejected...");
            }
            
            //update the displayed view type, if it does not match the actual
            if(this.select.value != this.viewType) {
                this.select.value = this.viewType;
            }

            return;
        }
        
        this.viewModeElement.hide();
    }
    
    this.viewModeElement = this.viewModeElements[viewType];
    if(!this.viewModeElement) {
        this.viewModeElement = this.component.getViewModeElement(this,viewType);
        this.viewModeElements[viewType] = this.viewModeElement;
    }
    this.viewType = viewType;
    
    var displayBody = this.windowHeaderManager.getBody();  
    haxapp.ui.removeAllChildren(displayBody);
    if(this.viewModeElement) {       
        this.viewModeElement.showData();
        var viewDiv = this.viewModeElement.getElement();
        displayBody.appendChild(viewDiv);

    }
    else {
            alert("Error: View mode element not found!");
    }
    
    //make sure view type display is correct
    if(this.select.value != this.viewType) {
        this.select.value = this.viewType;
    }
}

///** This method should be implemented by the EDIT COMPONENT to retrieve a view mode of the give type.  */
//haxapp.app.EditComponent.prototype.getViewModeElement = function(editComponentDisplay,viewType);

//-------------------------------
// member updated and menu management
//-------------------------------

/** This method updates the table data  */    
haxapp.app.EditDisplayContent.prototype.memberUpdated = function() {
    
    this.viewModeElement.memberUpdated();
	
	//add the clear function menu item if needed
    var object = this.component.getObject();
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

haxapp.app.EditDisplayContent.prototype.getClearFunctionCallback = function() {
	var table = this.getObject();
	var blankDataValue = this.clearFunctionDataValue;
    return function() {
        var actionResponse = hax.updatemember.updateData(table,blankDataValue); 
        if(!actionResponse.getSuccess()) {
            alert(actionResponse.getErrorMsg());
        }
    }
}

//----------------------------
// Edit UI
//----------------------------

/** This method should be called to set up the component ui for edit mode. 
 * @protected */
haxapp.app.EditDisplayContent.prototype.startEditUI = function(onSave,onCancel) {
    this.select.disabled = true;
    this.showSaveBar(onSave,onCancel);
}

/** This method populates the frame for this component. 
 * @protected */
haxapp.app.EditDisplayContent.prototype.endEditUI = function() {
    this.hideSaveBar();
    this.select.disabled = false;
}

/** This method returns the base member for this component. */
haxapp.app.EditDisplayContent.prototype.showSaveBar = function(onSave,onCancel) {
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
    this.windowHeaderManager.showToolbar(this.saveDiv);
}

/** This method returns the base member for this component. */
haxapp.app.EditDisplayContent.prototype.hideSaveBar = function() {
    this.saveBarActive = false;	
	this.windowHeaderManager.showToolbar(this.normalToolbarDiv);
}
