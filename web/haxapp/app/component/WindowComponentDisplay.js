/** This component represents a json table object. */
haxapp.app.WindowComponentDisplay = function(component, options) {
    this.component = component;
    this.object = component.getObject();
    
    this.options = options;
    
    //content management
    this.viewType = null;
    this.select = null;
    this.viewModeElements = {};
    this.viewModeElement = null;
   
    this._loadWindowFrameEntry();
    
    //add a cleanup action to the base component - component must already be initialized
//    this.addSaveAction(haxapp.app.WindowComponentDisplay.writeToJson);
//    this.addCleanupAction(haxapp.app.WindowComponentDisplay.destroy);
};

/** This value is used as the background color when an editor is read only. */
haxapp.app.WindowComponentDisplay.NO_EDIT_BACKGROUND_COLOR = "#f4f4f4";

haxapp.app.WindowComponentDisplay.prototype.getWindowEntry = function() {
    return this.windowFrame;
}

haxapp.app.WindowComponentDisplay.prototype.getComponent = function() {
    return this.component;
}

haxapp.app.WindowComponentDisplay.prototype.deleteDisplay = function() {
    //window will get deleted! New parent will get new windows, as is appropriate
    if(this.windowFrame) {
        this.windowFrame.deleteWindow();
    }
}

haxapp.app.WindowComponentDisplay.prototype.setBannerState = function(bannerState,bannerMessage) {
    if(this.windowHeaderManager) {
        if(bannerState == haxapp.app.WindowHeaderManager.BANNER_TYPE_NONE) {
            this.windowHeaderManager.hideBannerBar();
        }
        else {
            this.windowHeaderManager.showBannerBar(bannerMessage,bannerState);
        }
    }
}

haxapp.app.WindowComponentDisplay.prototype.updateData = function() {
    if(this.windowFrame) {
        //update the title
        this.windowFrame.setTitle(this.object.getDisplayName());
        
        //update the menu
        this._updateClearFunctionMenuItem();
        
        //update the content
        this.viewModeElement.memberUpdated();
    }
}

//===============================
// Private Functions
//===============================

/** @private */
haxapp.app.WindowComponentDisplay.prototype._loadWindowFrameEntry = function() {
    
    //window options
    var memberWindowOptions = {};
    memberWindowOptions.closeable = false;
    memberWindowOptions.movable = true;
    memberWindowOptions.resizable = true;
    memberWindowOptions.frameColorClass = "visicomp_windowColor";
    memberWindowOptions.titleBarClass = "visicomp_titleBarClass";

    this.windowFrame = new haxapp.ui.WindowFrame(memberWindowOptions);
    this.windowFrame.setSize(this.component.generator.DEFAULT_WIDTH,this.component.generator.DEFAULT_HEIGHT);

    //header manager - for banner and toolbars
    this.windowHeaderManager = new haxapp.app.WindowHeaderManager();
    this.windowFrame.setContent(this.windowHeaderManager.getOuterElement());
    
    // set menu
    this._populateMenu();
    
    //create the view selection ui
    this._createSelectTool();
    
    //set the content
    this._initContentUI();
    
}

//------------------------------------
// Window Content Management - switch between edit modes
//------------------------------------

haxapp.app.WindowComponentDisplay.prototype._createSelectTool = function() {
    
	this.select = haxapp.ui.createElement("select",null,{
        "marginRight":"3px",
        "backgroundColor":"transparent"
    });
    var instance = this;
    var onViewSet = function(event) {
        instance.setViewType(instance.select.value);
    }
    this.select.onchange = onViewSet;
    
    this.windowFrame.addTitleToolElement(this.select);
}

/** This method populates the frame for this component. 
 * @protected */
haxapp.app.WindowComponentDisplay.prototype._initContentUI = function() {
    
    var settings = this.component.getTableEditSettings();
    var viewTypes = settings.viewModes;
    
    for(var i = 0; i < viewTypes.length; i++) {
        var viewType = viewTypes[i];
        this.select.add(haxapp.ui.createElement("option",{"text":viewType}));
    }
    
    var initialViewType = this._getInitialViewType(viewTypes,settings.defaultView);
    this.setViewType(initialViewType);
}

haxapp.app.WindowComponentDisplay.prototype._getInitialViewType = function(viewTypes,defaultViewType) {
    if( (this.options) &&
        (this.options.viewType) &&
        (viewTypes.indexOf(this.options.viewType) >= 0) ) {

       return this.options.viewType;
    }
    else if(defaultViewType) {
        return defaultViewType;
    }    
    else {
        //just return the first one
        return viewTypes[0];
    }
    
}


/** This method populates the frame for this component. 
 * @protected */
haxapp.app.WindowComponentDisplay.prototype.setViewType = function(viewType) {
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
            
            //make sure view type display is correct
            this._updateViewTypeSelect();

            return;
        }
        
        this.viewModeElement.hide();
    }
    
    //set the view type
    this.viewType = viewType;
    this._updateViewTypeSelect();
    
    this.viewModeElement = this.viewModeElements[viewType];
    if(!this.viewModeElement) {
        this.viewModeElement = this.component.getViewModeElement(this,viewType);
        this.viewModeElements[viewType] = this.viewModeElement;
    }
    this._updateViewContent();
}

haxapp.app.WindowComponentDisplay.prototype._updateViewTypeSelect = function() {
    if(this.select.value != this.viewType) {
        this.select.value = this.viewType;
    }
}

haxapp.app.WindowComponentDisplay.prototype._updateViewContent = function() {
    if(this.viewModeElement) {
        this.viewModeElement.showData();
        this.windowHeaderManager.setContent(this.viewModeElement.getElement());
    }
    else {
        alert("Error: View mode element not found!");
    }
}

//------------------------------------
// Menu Functions
//------------------------------------

haxapp.app.WindowComponentDisplay.prototype._populateMenu = function() {
    var menu = this.windowFrame.getMenu();

    //menu items
    var menuItemInfoList = [];

    //add the standard entries
    var itemInfo = {};
    itemInfo.title = "Edit Properties";
    itemInfo.callback = haxapp.app.updatecomponent.getUpdateComponentCallback(this.component,this.generator);
    menuItemInfoList.push(itemInfo);

    var itemInfo = {};
    itemInfo.title = "Delete";
    itemInfo.callback = this.component.createDeleteCallback(itemInfo.title);
    menuItemInfoList.push(itemInfo);

    //set the menu items
    menu.setMenuItems(menuItemInfoList);
    
    //initialize the "clear function" menu entry, used only when there is code
    var settings = this.component.getTableEditSettings();
    this.doClearFunction = (settings.clearFunctionMenyText !== undefined);
	this.clearFunctionMenuText = settings.clearFunctionMenuText;
    this.clearFunctionDataValue = settings.emptyDataValue;
	this.clearFunctionActive = false;
	this.clearFunctionCallback = null;
    
    this._updateClearFunctionMenuItem();
    
}

haxapp.app.WindowComponentDisplay.prototype._updateClearFunctionMenuItem = function() {
    //add the clear function menu item if needed
	if(this.doClearFunction) {
		if(this.object.hasCode()) {
			if(!this.clearFunctionActive) {
				var menu = this.getWindow().getMenu();
				
				if(!this.clearFunctionCallback) {
					this.clearFunctionCallback = this._getClearFunctionCallback();
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

haxapp.app.WindowComponentDisplay.prototype._getClearFunctionCallback = function() {
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
// Edit UI - save and cancel buttons for edit mode
//----------------------------

/** This method should be called to set up the component ui for edit mode. 
 * @protected */
haxapp.app.WindowComponentDisplay.prototype.startEditUI = function(onSave,onCancel) {
    this.select.disabled = true;
    this.showSaveBar(onSave,onCancel);
}

/** This method populates the frame for this component. 
 * @protected */
haxapp.app.WindowComponentDisplay.prototype.endEditUI = function() {
    this.hideSaveBar();
    this.select.disabled = false;
}

/** This method returns the base member for this component. */
haxapp.app.WindowComponentDisplay.prototype.showSaveBar = function(onSave,onCancel) {
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
haxapp.app.WindowComponentDisplay.prototype.hideSaveBar = function() {
    this.saveBarActive = false;	
	this.windowHeaderManager.showToolbar(this.normalToolbarDiv);
}

//-----------------------------------
// Callbacks for management
//-----------------------------------

/** @protected */
haxapp.app.WindowComponentDisplay.prototype.destroy = function() {
    for(var viewType in viewModeElements) {
        var viewModeElement = this.viewModeElemens[viewType];
        viewModeElement.destroy();
    }
}

/** This serializes the table component. */
haxapp.app.WindowComponentDisplay.prototype.writeToJson = function(json) {
    json.viewType = this.viewType;
}
