/** This is the base class for a parent component (an object that has children),
 * It extends the component class. */
apogeeapp.app.ParentComponent = function(workspaceUI,object,generator,options) {
    //base constructor
	apogeeapp.app.Component.call(this,workspaceUI,object,generator,options);
    
    this.tabDisplay = null;
}

apogeeapp.app.ParentComponent.prototype = Object.create(apogeeapp.app.Component.prototype);
apogeeapp.app.ParentComponent.prototype.constructor = apogeeapp.app.ParentComponent;

apogeeapp.app.ParentComponent.prototype.instantiateWindowDisplay = function() {
    return new apogeeapp.app.ParentWindowComponentDisplay(this,this.windowDisplayStateJson);
}

//----------------------
// WindowParent Methods
//----------------------
    
apogeeapp.app.ParentComponent.prototype.usesTabDisplay = function() {    
    return true;
}

/** This brings the child component to the front and takes any other actions
 * to show the child in the open parent. */
apogeeapp.app.ParentComponent.prototype.showChildComponent = function(childComponent) {
    if(childComponent.getObject().getParent() != this.getObject()) return;
    
    if(this.tabDisplay) {
        this.tabDisplay.showChildComponent(childComponent);
    }
}

apogeeapp.app.ParentComponent.prototype.getMenuItems = function(optionalMenuItemList) {
    var menuItemList = optionalMenuItemList ? optionalMenuItemList : [];
    
    //initialize the "add components" menu
    var itemInfo = {};
    
    var app = this.getWorkspaceUI().getApp();
    var initialValues = {};
    initialValues.parentName = this.object.getFullName();
    
    itemInfo.title = "Add Component...";
    itemInfo.childMenuItems = app.getAddChildMenuItems(initialValues);
    menuItemList.push(itemInfo);

    //call base class
    var menuItemList = apogeeapp.app.Component.prototype.getMenuItems.call(this,menuItemList);
			
    return menuItemList;
}

////in memberUPdated
//    if(this.tabDisplay) {
//        this.tabDisplay.updateData();
//        this.tabDisplay.setBannerState(bannerState,bannerMessage);
//    }
//
////in member deleted
//    if(this.tabDisplay) {
//        this.tabDisplay.updateData();
//        this.tabDisplay.setBannerState(bannerState,bannerMessage);
//    }

//////////////////////////////////////////



/** This flags indicates the component is a parent component. */
apogeeapp.app.ParentComponent.prototype.isParentComponent = true;

/** This function adds a fhile componeent to the displays for this parent component. */
apogeeapp.app.ParentComponent.prototype.removeChildComponent = function(childComponent) {
    //remove from tree entry
    var treeEntry = this.getTreeEntry();
    var childId = childComponent.getObject().getId();
    treeEntry.removeChild(childId);
    
    //remove child windows - just hide them. They will be deleted in the component
    var childWindowDisplay = childComponent.getWindowDisplay();
    if(childWindowDisplay) {
        childWindowDisplay.deleteDisplay();
    }
}

/** This function adds a fhile componeent to the displays for this parent component. */
apogeeapp.app.ParentComponent.prototype.addChildComponent = function(childComponent) {
    //add the child to the tree entry
    var treeEntry = this.getTreeEntry();
    var childTreeEntry = childComponent.getTreeEntry();
    var childId = childComponent.getObject().getId();
    treeEntry.addChild(childId,childTreeEntry);
    
    //add child entry for tab
    if(this.tabDisplay) {
        this.tabDisplay.addChildComponent(childComponent); 
    }
}


