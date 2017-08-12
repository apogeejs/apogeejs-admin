/** This component represents a json table object. */
apogeeapp.app.EditWindowComponentDisplay = function(component, options) {
    this.component = component;
    this.object = component.getObject();
    
    this.options = options;
    
    //content management
    this.viewType = null;
    this.select = null;
    this.viewModeElements = {};
    this.viewModeElement = null;
   
    this.loadWindowFrameEntry();
    
    //add a cleanup action to the base component - component must already be initialized
//    this.addCleanupAction(apogeeapp.app.EditWindowComponentDisplay.destroy);
};

/** This value is used as the background color when an editor is read only. */
apogeeapp.app.EditWindowComponentDisplay.NO_EDIT_BACKGROUND_COLOR = "#f4f4f4";

apogeeapp.app.EditWindowComponentDisplay.prototype.getWindowFrame = function() {
    return this.windowFrame;
}

/** This returns the preferred size, to be used by the parent to set the window position.
 * The result may be undefined.
 * 
 * return {"x":x,"y":y}
 */
apogeeapp.app.EditWindowComponentDisplay.prototype.getPreferredPosition = function() {
    if(this.options) {
        return this.options.posInfo;
    }
    else {
        return undefined;
    }
}

/** This returns the preferred state - minimized, maximized, normal */
apogeeapp.app.EditWindowComponentDisplay.prototype.getPreferredState = function() {
    if((this.options)&&(this.options.state !== undefined)) {
        return this.options.state;
    }
    else {
        return apogeeapp.ui.WINDOW_STATE_NORMAL;
    }
}



apogeeapp.app.EditWindowComponentDisplay.prototype.getComponent = function() {
    return this.component;
}

apogeeapp.app.EditWindowComponentDisplay.prototype.getMember = function() {
    return this.object;
}

apogeeapp.app.EditWindowComponentDisplay.prototype.deleteDisplay = function() {
    //dispose any view elements
    for(var viewType in this.viewModeElements) {
        var viewModeElement = this.viewModeElements[viewType];
        if(viewModeElement) {
            viewModeElement.destroy();
        }
    }
    
    if(this.windowFrame) {
        this.windowFrame.close();
    }
}

apogeeapp.app.EditWindowComponentDisplay.prototype.setBannerState = function(bannerState,bannerMessage) {
    if(this.windowHeaderManager) {
        if(bannerState == apogeeapp.app.WindowHeaderManager.BANNER_TYPE_NONE) {
            this.windowHeaderManager.hideBannerBar();
        }
        else {
            this.windowHeaderManager.showBannerBar(bannerMessage,bannerState);
        }
    }
    if(this.windowFrame) {
        var iconOverlay = apogeeapp.app.WindowHeaderManager.getIconOverlay(bannerState);
        if(iconOverlay) {
            this.windowFrame.setIconOverlay(iconOverlay);
        }
        else {
            this.windowFrame.clearIconOverlay();
        }
    }
}

apogeeapp.app.EditWindowComponentDisplay.prototype.updateData = function() {
    if(this.windowFrame) {
        //update the title
        this.windowFrame.setTitle(this.object.getDisplayName());
        
        //update the content
        this.viewModeElement.memberUpdated();
    }
}

/** This gets the current window state, to reconstruct the view. */
apogeeapp.app.EditWindowComponentDisplay.prototype.getStateJson = function() {
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
apogeeapp.app.EditWindowComponentDisplay.prototype.setStateJson = function(json) {
    
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
apogeeapp.app.EditWindowComponentDisplay.prototype.loadWindowFrameEntry = function() {
   
    //window options
    var memberWindowOptions = {};
    memberWindowOptions.minimizable = true;
    memberWindowOptions.maximizable = true;
    memberWindowOptions.resizable = true;
    memberWindowOptions.movable = true;
    memberWindowOptions.frameColorClass = "visicomp_windowColor";
    memberWindowOptions.titleBarClass = "visicomp_titleBarClass";

    this.windowFrame = new apogeeapp.ui.WindowFrame(memberWindowOptions);
    
    if((this.options)&&(this.options.sizeInfo)) {
        this.windowFrame.setSize(this.options.sizeInfo.width,this.options.sizeInfo.height);
    }
    else {
        this.windowFrame.setSize(this.component.generator.DEFAULT_WIDTH,this.component.generator.DEFAULT_HEIGHT);
    }

    //header manager - for banner and toolbars
    this.windowHeaderManager = new apogeeapp.app.WindowHeaderManager();
    this.windowFrame.setHeaderContent(this.windowHeaderManager.getHeaderElement());
    
    //set title
    this.windowFrame.setTitle(this.object.getDisplayName());
    
    // set menu
    var menu = this.windowFrame.createMenu(this.component.getIconUrl());
    var component = this.component;
    var menuItemCallback = function() {
        return component.getMenuItems();
    }
    menu.setAsOnTheFlyMenu(menuItemCallback);
    
    //create the view selection ui
    this.createSelectTool();
    
    //set the content
    this.initContentUI();
}

//------------------------------------
// Window Content Management - switch between edit modes
//------------------------------------

apogeeapp.app.EditWindowComponentDisplay.prototype.createSelectTool = function() {
    
	this.select = apogeeapp.ui.createElement("select",null,{
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
apogeeapp.app.EditWindowComponentDisplay.prototype.initContentUI = function() {
    
    var settings = this.component.getTableEditSettings();
    var viewTypes = settings.viewModes;
    
    for(var i = 0; i < viewTypes.length; i++) {
        var viewType = viewTypes[i];
        this.select.add(apogeeapp.ui.createElement("option",{"text":viewType}));
    }
    
    var initialViewType = this.getInitialViewType(viewTypes,settings.defaultView);
    this.setViewType(initialViewType);
}

apogeeapp.app.EditWindowComponentDisplay.prototype.getInitialViewType = function(viewTypes,defaultViewType) {
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
apogeeapp.app.EditWindowComponentDisplay.prototype.setViewType = function(viewType) {
	//return if there is no change
	if(this.viewType === viewType) return;
    
    //check if we can change views
    if(this.viewModeElement) {
        var hideRequestResponse = this.viewModeElement.requestHide();
        
        if(hideRequestResponse !== apogeeapp.app.ViewMode.CLOSE_OK) {
            if(hideRequestResponse === apogeeapp.app.ViewMode.UNSAVED_DATA) {
                alert("You must save or cancel the edit session to change the view mode.");
            }
            else {
                //we shouldn't get here
                alert("close request rejected...");
            }
            
            //make sure view type display is correct
            this.updateViewTypeSelect();

            return;
        }
        
        this.viewModeElement.hide();
    }
    
    //set the view type
    this.viewType = viewType;
    this.updateViewTypeSelect();
    
    this.viewModeElement = this.viewModeElements[viewType];
    if(!this.viewModeElement) {
        this.viewModeElement = this.component.getViewModeElement(this,viewType);
        this.viewModeElements[viewType] = this.viewModeElement;
    }
    this.updateViewContent();
}

apogeeapp.app.EditWindowComponentDisplay.prototype.updateViewTypeSelect = function() {
    if(this.select.value != this.viewType) {
        this.select.value = this.viewType;
    }
}

apogeeapp.app.EditWindowComponentDisplay.prototype.updateViewContent = function() {
    if(this.viewModeElement) {
        this.viewModeElement.showData();
        this.windowFrame.setContent(this.viewModeElement.getElement());
    }
    else {
        alert("Error: View mode element not found!");
    }
}

//----------------------------
// Edit UI - save and cancel buttons for edit mode
//----------------------------

/** This method should be called to set up the component ui for edit mode. 
 * @protected */
apogeeapp.app.EditWindowComponentDisplay.prototype.startEditUI = function(onSave,onCancel) {
    this.select.disabled = true;
    this.showSaveBar(onSave,onCancel);
}

/** This method populates the frame for this component. 
 * @protected */
apogeeapp.app.EditWindowComponentDisplay.prototype.endEditUI = function() {
    this.hideSaveBar();
    this.select.disabled = false;
}

/** This method returns the base member for this component. */
apogeeapp.app.EditWindowComponentDisplay.prototype.showSaveBar = function(onSave,onCancel) {
    if(!this.saveDiv) {
        this.saveDiv = apogeeapp.ui.createElement("div",null,
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
apogeeapp.app.EditWindowComponentDisplay.prototype.hideSaveBar = function() {
    this.saveBarActive = false;	
	this.windowHeaderManager.showToolbar(this.normalToolbarDiv);
}

