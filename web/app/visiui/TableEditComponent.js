/** This is a mixin that encapsulates the base functionality of a Component
 *that edits a table. This mixin requires the object be a component.
 * 
 * This is not a class, but it is used for the prototype of the objects that inherit from it.
 */
visicomp.app.visiui.TableEditComponent = {};

/** This is the initializer for the component. The object passed is the core object
 * associated with this component. */
visicomp.app.visiui.TableEditComponent.init = function(viewTypes,defaultView,optionalClearFunctionOnBlankInfo) {
	
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
}

/** This value is used as the background color when an editor is read only. */
visicomp.app.visiui.TableEditComponent.NO_EDIT_BACKGROUND_COLOR = "#f4f4f4";

/** This method populates the frame for this component. 
 * @protected */
visicomp.app.visiui.TableEditComponent.setViewType = function(viewType) {
	//return if there is no change
	if(this.viewType === viewType) return;
	
	//if there is an old view, remove it
	if(this.viewModeElement) {
		this.showModeElement(null);
	}
    
    this.viewModeElement = this.getViewModeElement(viewType);
    this.viewType = viewType;
}

/** This method should be implemented to retrieve a view mode of the give type. 
 * @protected. */
//visicomp.app.visiui.TableEditComponent.getViewModeElement = function(viewType);

//this function will update the view shown in the dropdown
visicomp.app.visiui.TableEditComponent.updateViewDropdown = function(viewType) {
    if(!viewType) {
        viewType = this.defaultView;
    }
    this.select.value = viewType;
}

/** This method updates the table data 
 * @private */    
visicomp.app.visiui.TableEditComponent.memberUpdated = function() {
    var object = this.getObject();
    if(object.hasError()) {
        var errorMsg = "Error: \n";
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

visicomp.app.visiui.TableEditComponent.getClearFunctionCallback = function() {
	var table = this.getObject();
	var blankDataValue = this.clearFunctionOnBlankInfo.dataValue;
    return function() {
        var actionResponse = visicomp.core.updatemember.updateData(table,blankDataValue); 
        if(!actionResponse.getSuccess()) {
            alert(actionResponse.getErrorMsg());
        }
    }
}

/** This method populates the frame for this component. 
 * @protected */
visicomp.app.visiui.TableEditComponent.initUI = function() {
	
	this.setFixedContentElement();
	
	//create the view selection ui
	this.select = visicomp.visiui.createElement("select",null,{
        "marginRight":"3px",
        "backgroundColor":"transparent"
    });
    
    for(var i = 0; i < this.viewTypes.length; i++) {
        var entry = this.viewTypes[i];
        this.select.add(visicomp.visiui.createElement("option",{"text":entry}));
    }
    
    //create on functions
    var instance = this;
    var onViewSet = function(event) {
        instance.setViewType(instance.select.value);
        instance.memberUpdated();
        return true;
    }
    
    this.select.onchange = onViewSet;
   
    //add the view select to the title bar
    this.window.addRightTitleBarElement(this.select);
    
    this.setViewType(this.defaultView);
    this.updateViewDropdown();
}

/** @private */
visicomp.app.visiui.TableEditComponent.showModeElement = function(viewModeElement) {
    
	var contentDiv = this.getContentElement();
	visicomp.core.util.removeAllChildren(contentDiv);
	
    if(viewModeElement) {
		var viewDiv = viewModeElement.getElement();
		contentDiv.appendChild(viewDiv);
	}
	
	if(this.viewModeElementShowing) {
		this.viewModeElementShowing.destroy();
	}
	this.viewElementShowing = viewModeElement;
}
