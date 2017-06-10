/** This component represents a json table object. */
haxapp.app.EditWindowComponentDisplay = function(component, options) {
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
//    this.addCleanupAction(haxapp.app.EditWindowComponentDisplay.destroy);
};

/** This value is used as the background color when an editor is read only. */
haxapp.app.EditWindowComponentDisplay.NO_EDIT_BACKGROUND_COLOR = "#f4f4f4";

haxapp.app.EditWindowComponentDisplay.prototype.getWindowEntry = function() {
    return this.windowFrame;
}

/** This returns the preferred size, to be used by the parent to set the window position.
 * The result may be undefined.
 * 
 * return {"x":x,"y":y}
 */
haxapp.app.EditWindowComponentDisplay.prototype.getPreferredPosition = function() {
    if(this.options) {
        return this.options.posInfo;
    }
    else {
        return undefined;
    }
}

/** This returns the preferred state - minimized, maximized, normal */
haxapp.app.EditWindowComponentDisplay.prototype.getPreferredState = function() {
    if((this.options)&&(this.options.state !== undefined)) {
        return this.options.state;
    }
    else {
        return haxapp.ui.WINDOW_STATE_NORMAL;
    }
}



haxapp.app.EditWindowComponentDisplay.prototype.getComponent = function() {
    return this.component;
}

haxapp.app.EditWindowComponentDisplay.prototype.deleteDisplay = function() {
    //window will get deleted! New parent will get new windows, as is appropriate
    if(this.windowFrame) {
        this.windowFrame.close();
    }
}

haxapp.app.EditWindowComponentDisplay.prototype.setBannerState = function(bannerState,bannerMessage) {
    if(this.windowHeaderManager) {
        if(bannerState == haxapp.app.WindowHeaderManager.BANNER_TYPE_NONE) {
            this.windowHeaderManager.hideBannerBar();
        }
        else {
            this.windowHeaderManager.showBannerBar(bannerMessage,bannerState);
        }
    }
}

haxapp.app.EditWindowComponentDisplay.prototype.updateData = function() {
    if(this.windowFrame) {
        //update the title
        this.windowFrame.setTitle(this.object.getDisplayName());
        
        //update the menu
        this._updateClearFunctionMenuItem();
        
        //update the content
        this.viewModeElement.memberUpdated();
    }
}

/** This gets the current window state, to reconstruct the view. */
haxapp.app.EditWindowComponentDisplay.prototype.getStateJson = function() {
    var json = {};
    var dataPresent = false;
    
    if(this.windowFrame) {
        json.sizeInfo = this.windowFrame.getSizeInfo();
        json.posInfo = this.windowFrame.getPosInfo();
        json.state = this.windowFrame.getWindowState();
        dataPresent = true;
        
    }
    
    if(this.viewType) {
        json.viewType = this.viewType;
        dataPresent = true;
    }
    
    if(dataPresent) return json;
    else return undefined;
}

/** This gets the current window state, to reconstruct the view. */
haxapp.app.EditWindowComponentDisplay.prototype.setStateJson = function(json) {
    
    if(this.windowFrame) {
        if(json.sizeInfo) {
            this.windowFrame.setSizeInfo(json.sizeInfo);
        }
        if(json.posInfo) {
            this.windowFrame.setPosInfo(json.posInfo);
        }
        if(json.state) {
            this.windowFrame.setWindowState(json.state);
        }
    }
    
    if(json.viewType) {
        this.viewType = json.viewType;
    }
}

//===============================
// Private Functions
//===============================

/** @private */
haxapp.app.EditWindowComponentDisplay.prototype._loadWindowFrameEntry = function() {
   
    //window options
    var memberWindowOptions = {};
    memberWindowOptions.minimizable = true;
    memberWindowOptions.maximizable = true;
    memberWindowOptions.resizable = true;
    memberWindowOptions.movable = true;
    memberWindowOptions.frameColorClass = "visicomp_windowColor";
    memberWindowOptions.titleBarClass = "visicomp_titleBarClass";

    this.windowFrame = new haxapp.ui.WindowFrame(memberWindowOptions);
    
    if((this.options)&&(this.options.sizeInfo)) {
        this.windowFrame.setSize(this.options.sizeInfo.width,this.options.sizeInfo.height);
    }
    else {
        this.windowFrame.setSize(this.component.generator.DEFAULT_WIDTH,this.component.generator.DEFAULT_HEIGHT);
    }

    //header manager - for banner and toolbars
    this.windowHeaderManager = new haxapp.app.WindowHeaderManager();
    this.windowFrame.setContent(this.windowHeaderManager.getOuterElement());
    
    //set title
    this.windowFrame.setTitle(this.object.getDisplayName());
    
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

haxapp.app.EditWindowComponentDisplay.prototype._createSelectTool = function() {
    
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
haxapp.app.EditWindowComponentDisplay.prototype._initContentUI = function() {
    
    var settings = this.component.getTableEditSettings();
    var viewTypes = settings.viewModes;
    
    for(var i = 0; i < viewTypes.length; i++) {
        var viewType = viewTypes[i];
        this.select.add(haxapp.ui.createElement("option",{"text":viewType}));
    }
    
    var initialViewType = this._getInitialViewType(viewTypes,settings.defaultView);
    this.setViewType(initialViewType);
}

haxapp.app.EditWindowComponentDisplay.prototype._getInitialViewType = function(viewTypes,defaultViewType) {
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
haxapp.app.EditWindowComponentDisplay.prototype.setViewType = function(viewType) {
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

haxapp.app.EditWindowComponentDisplay.prototype._updateViewTypeSelect = function() {
    if(this.select.value != this.viewType) {
        this.select.value = this.viewType;
    }
}

haxapp.app.EditWindowComponentDisplay.prototype._updateViewContent = function() {
    if(this.viewModeElement) {
        this.viewModeElement.showData();
        this.windowHeaderManager.setContent(this.viewModeElement.getElement());
        if(this.viewModeElement.dataShown) {
            this.viewModeElement.dataShown();
        }
    }
    else {
        alert("Error: View mode element not found!");
    }
}

//------------------------------------
// Menu Functions
//------------------------------------

haxapp.app.EditWindowComponentDisplay.prototype._populateMenu = function() {
    var menu = this.windowFrame.createMenu(this.component.getIconUrl());

    //menu items
    var menuItemInfoList = [];

    //add the standard entries
    var itemInfo = {};
    itemInfo.title = "Edit Properties";
    itemInfo.callback = haxapp.app.updatecomponent.getUpdateComponentCallback(this.component);
    menuItemInfoList.push(itemInfo);

    var itemInfo = {};
    itemInfo.title = "Delete";
    itemInfo.callback = this.component.createDeleteCallback(itemInfo.title);
    menuItemInfoList.push(itemInfo);

    //set the menu items
    menu.setMenuItems(menuItemInfoList);
    
    //initialize the "clear function" menu entry, used only when there is code
    var settings = this.component.getTableEditSettings();
    this.doClearFunction = (settings.clearFunctionMenuText !== undefined);
	this.clearFunctionMenuText = settings.clearFunctionMenuText;
    this.clearFunctionDataValue = settings.emptyDataValue;
	this.clearFunctionActive = false;
	this.clearFunctionCallback = null;
    
    this._updateClearFunctionMenuItem();
    
}

haxapp.app.EditWindowComponentDisplay.prototype._updateClearFunctionMenuItem = function() {
    //add the clear function menu item if needed
	if(this.doClearFunction) {
		if(this.object.hasCode()) {
			if(!this.clearFunctionActive) {
				var menu = this.windowFrame.getMenu();
				
				if(!this.clearFunctionCallback) {
					this.clearFunctionCallback = this._getClearFunctionCallback();
				}
				
				menu.addCallbackMenuItem(this.clearFunctionMenuText,this.clearFunctionCallback);
				this.clearFunctionActive = true;
			}
		}
		else {
			if(this.clearFunctionActive) {
				var menu = this.windowFrame.getMenu();
				menu.removeMenuItem(this.clearFunctionMenuText);
				this.clearFunctionActive = false;
			}
		}
	}
}

haxapp.app.EditWindowComponentDisplay.prototype._getClearFunctionCallback = function() {
    var actionData = {};
    actionData.member = this.object;
    actionData.data = this.clearFunctionDataValue;
    actionData.action = hax.updatemember.UPDATE_DATA_ACTION_NAME
    var workspace = this.object.getWorkspace();
    return function() {
        var actionResponse = hax.action.doAction(workspace,actionData); 
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
haxapp.app.EditWindowComponentDisplay.prototype.startEditUI = function(onSave,onCancel) {
    this.select.disabled = true;
    this.showSaveBar(onSave,onCancel);
}

/** This method populates the frame for this component. 
 * @protected */
haxapp.app.EditWindowComponentDisplay.prototype.endEditUI = function() {
    this.hideSaveBar();
    this.select.disabled = false;
}

/** This method returns the base member for this component. */
haxapp.app.EditWindowComponentDisplay.prototype.showSaveBar = function(onSave,onCancel) {
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
haxapp.app.EditWindowComponentDisplay.prototype.hideSaveBar = function() {
    this.saveBarActive = false;	
	this.windowHeaderManager.showToolbar(this.normalToolbarDiv);
}

//-----------------------------------
// Callbacks for management
//-----------------------------------

/** @protected */
haxapp.app.EditWindowComponentDisplay.prototype.destroy = function() {
    for(var viewType in viewModeElements) {
        var viewModeElement = this.viewModeElemens[viewType];
        viewModeElement.destroy();
    }
}
