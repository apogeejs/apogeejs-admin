/** This component represents a json table object. */
apogeeapp.webapp.EmbeddedContainerComponentDisplay = function(component, viewType, parentElement) {
    this.component = component;
    this.object = component.getObject();
    this.viewType = viewType;
    this.parentElement = parentElement;
    
    this.windowHeaderManager = new apogeeapp.app.WindowHeaderManager();
    parentElement.appendChild(this.windowHeaderManager.getOuterElement());

    this.viewModeElement = component.getViewModeElement(this,viewType);
    this.viewModeElement.showData();
    this.windowHeaderManager.setContent(this.viewModeElement.getElement());
    
    //add a cleanup action to the base component - component must already be initialized
//    this.addCleanupAction(apogeeapp.webapp.EmbeddedContainerComponentDisplay.destroy);
};

apogeeapp.webapp.EmbeddedContainerComponentDisplay.prototype.getComponent = function() {
    return this.component;
}

apogeeapp.webapp.EmbeddedContainerComponentDisplay.prototype.getMember = function() {
    return this.object;
}

apogeeapp.webapp.EmbeddedContainerComponentDisplay.prototype.getViewMode = function() {
    return this.viewModeElement;
}

apogeeapp.webapp.EmbeddedContainerComponentDisplay.prototype.deleteDisplay = function() {
    //window will get deleted! New parent will get new windows, as is appropriate
    if(this.windowFrame) {
        this.windowFrame.close();
    }
}

apogeeapp.webapp.EmbeddedContainerComponentDisplay.prototype.setBannerState = function(bannerState,bannerMessage) {
    if(this.windowHeaderManager) {
        if(bannerState == apogeeapp.app.WindowHeaderManager.BANNER_TYPE_NONE) {
            this.windowHeaderManager.hideBannerBar();
        }
        else {
            this.windowHeaderManager.showBannerBar(bannerMessage,bannerState);
        }
    }
}

apogeeapp.webapp.EmbeddedContainerComponentDisplay.prototype.updateData = function() {       
    //update the content
    this.viewModeElement.memberUpdated();
}

/** This gets the current window state, to reconstruct the view. */
apogeeapp.webapp.EmbeddedContainerComponentDisplay.prototype.getStateJson = function() {
    return undefined;
}

/** This gets the current window state, to reconstruct the view. */
apogeeapp.webapp.EmbeddedContainerComponentDisplay.prototype.setStateJson = function(json) {
}


//----------------------------
// Edit UI - save and cancel buttons for edit mode
//----------------------------

/** This method should be called to set up the component ui for edit mode. 
 * @protected */
apogeeapp.webapp.EmbeddedContainerComponentDisplay.prototype.startEditUI = function(onSave,onCancel) {
    this.showSaveBar(onSave,onCancel);
}

/** This method populates the frame for this component. 
 * @protected */
apogeeapp.webapp.EmbeddedContainerComponentDisplay.prototype.endEditUI = function() {
    this.hideSaveBar();
}

/** This method returns the base member for this component. */
apogeeapp.webapp.EmbeddedContainerComponentDisplay.prototype.showSaveBar = function(onSave,onCancel) {
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
apogeeapp.webapp.EmbeddedContainerComponentDisplay.prototype.hideSaveBar = function() {
    this.saveBarActive = false;	
	this.windowHeaderManager.showToolbar(this.normalToolbarDiv);
}

//-----------------------------------
// Callbacks for management
//-----------------------------------

/** @protected */
apogeeapp.webapp.EmbeddedContainerComponentDisplay.prototype.destroy = function() {
    this.viewModeElement.destroy();
    this.viewModeElement = null;
}



