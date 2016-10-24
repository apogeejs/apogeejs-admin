/** This is a mixin that encapsulates the base functionality of a Component
 *that edits a table. This mixin requires the object be a component.
 * 
 * This is not a class, but it is used for the prototype of the objects that inherit from it.
 */
hax.app.visiui.TableEditComponent = {};

/** This is the initializer for the component. The object passed is the core object
 * associated with this component. */
hax.app.visiui.TableEditComponent.init = function(viewTypes,defaultView,optionalClearFunctionOnBlankInfo) {
	
	this.viewTypes = viewTypes;
	this.defaultView = defaultView;
	
	this.initUI();
	
	//this.viewModeElement
    //this.viewType
    //this.viewModeElementShowing
    //this.select
	
	this.clearFunctionOnBlankInfo = optionalClearFunctionOnBlankInfo;
	this.clearFunctionActive = false;
	this.clearFunctionCallback = null;
    
    //add a cleanup action to the base component - component must already be initialized
    var instance = this;
    var cleanupAction = function() {
        instance.destroy();
    }
    this.addCleanupAction(cleanupAction);

}

/** This value is used as the background color when an editor is read only. */
hax.app.visiui.TableEditComponent.NO_EDIT_BACKGROUND_COLOR = "#f4f4f4";

/** This method populates the frame for this component. 
 * @protected */
hax.app.visiui.TableEditComponent.setViewType = function(viewType) {
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
//hax.app.visiui.TableEditComponent.getViewModeElement = function(viewType);

//this function will update the view shown in the dropdown
hax.app.visiui.TableEditComponent.updateViewDropdown = function(viewType) {
    if(!viewType) {
        viewType = this.defaultView;
    }
    this.select.value = viewType;
}

/** This method updates the table data 
 * @private */    
hax.app.visiui.TableEditComponent.memberUpdated = function() {
    //call the base function
    hax.app.visiui.Component.memberUpdated.call(this);
    
    var object = this.getObject();
    if(object.hasError()) {
        var errorMsg = "";
        var actionErrors = object.getErrors();
        for(var i = 0; i < actionErrors.length; i++) {
            errorMsg += actionErrors[i].msg + "\n";
        }
        
        this.showErrorBar(errorMsg);
    }
    else {   
        this.hideErrorBar();
    }
        
    if(this.viewModeElementShowing !== this.viewModeElement) {
        this.showModeElement(this.viewModeElement);
    }

    var editable = ((this.viewModeElement.isData === false)||(!object.hasCode()));

    this.viewModeElement.showData(editable);
	
	//add the clear function menu item if needed
	if(this.clearFunctionOnBlankInfo) {
	
		if(object.hasCode()) {
			if(!this.clearFunctionActive) {
				var menu = this.getWindow().getMenu();
				
				if(!this.clearFunctionCallback) {
					this.clearFunctionCallback = this.getClearFunctionCallback();
				}
				
				menu.addCallbackMenuItem(this.clearFunctionOnBlankInfo.menuLabel,this.clearFunctionCallback);
				this.clearFunctionActive = true;
			}
		}
		else {
			if(this.clearFunctionActive) {
				var menu = this.getWindow().getMenu();
				menu.removeMenuItem(this.clearFunctionOnBlankInfo.menuLabel);
				this.clearFunctionActive = false;
			}
		}
	}
}

hax.app.visiui.TableEditComponent.getClearFunctionCallback = function() {
	var table = this.getObject();
	var blankDataValue = this.clearFunctionOnBlankInfo.dataValue;
    return function() {
        var actionResponse = hax.core.updatemember.updateData(table,blankDataValue); 
        if(!actionResponse.getSuccess()) {
            alert(actionResponse.getErrorMsg());
        }
    }
}

/** This method should be called to set up the component ui for edit mode. 
 * @protected */
hax.app.visiui.TableEditComponent.startEditUI = function(onSave,onCancel) {
    this.select.disabled = true;
    this.showSaveBar(onSave,onCancel);
}

/** This method populates the frame for this component. 
 * @protected */
hax.app.visiui.TableEditComponent.endEditUI = function() {
    this.hideSaveBar();
    this.select.disabled = false;
}
/** This method populates the frame for this component. 
 * @protected */
hax.app.visiui.TableEditComponent.initUI = function() {
	
	this.setFixedContentElement();
	
	//create the view selection ui
	this.select = hax.visiui.createElement("select",null,{
        "marginRight":"3px",
        "backgroundColor":"transparent"
    });
    
    for(var i = 0; i < this.viewTypes.length; i++) {
        var entry = this.viewTypes[i];
        this.select.add(hax.visiui.createElement("option",{"text":entry}));
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
    
    this.setViewType(this.defaultView);
    this.updateViewDropdown();
}

/** @private */
hax.app.visiui.TableEditComponent.showModeElement = function(viewModeElement) {
    
	var contentDiv = this.getContentElement();
	hax.core.util.removeAllChildren(contentDiv);
	
    if(viewModeElement) {
		var viewDiv = viewModeElement.getElement();
		contentDiv.appendChild(viewDiv);
	}
	
	if(this.viewModeElementShowing) {
		this.viewModeElementShowing.destroy();
	}
	this.viewModeElementShowing = viewModeElement;
}

/** @protected */
hax.app.visiui.TableEditComponent.destroy = function() {
    if(this.viewModeElement) {
        this.viewModeElement.destroy();
    }
}
