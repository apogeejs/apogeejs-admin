/** This is the base class for a parent component (an object that has children),
 * It extends the component class. */
apogeeapp.app.ParentComponent = function(workspaceUI,member,componentGenerator) {
    //base constructor
	apogeeapp.app.Component.call(this,workspaceUI,member,componentGenerator);
}

apogeeapp.app.ParentComponent.prototype = Object.create(apogeeapp.app.Component.prototype);
apogeeapp.app.ParentComponent.prototype.constructor = apogeeapp.app.ParentComponent;

/** This is used to flag this as an edit component. */
apogeeapp.app.ParentComponent.prototype.isParentComponent = true;

apogeeapp.app.ParentComponent.prototype.instantiateTreeEntry = function() {
    var treeDisplay = apogeeapp.app.Component.prototype.instantiateTreeEntry.call(this);
    
    //add any existing children to the tree entry
    var treeEntry = treeDisplay.getTreeEntry();
    var member = this.getMember();
    var childMap = member.getChildMap();
    for(var childKey in childMap) {
        var childMember = childMap[childKey];
        var childComponent = this.getWorkspaceUI().getComponent(childMember);
        var childTreeEntry = childComponent.getTreeEntry(true);
        treeEntry.addChild(childTreeEntry);
    }
    
    return treeDisplay;
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
    if(childComponent.getMember().getParent() != this.getMember()) return;
    
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
    initialValues.parentName = this.member.getFullName();
    
    itemInfo.title = "Add Component...";
    itemInfo.childMenuItems = app.getAddChildMenuItems(initialValues);
    menuItemList.push(itemInfo);

    //call base class
    var menuItemList = apogeeapp.app.Component.prototype.getMenuItems.call(this,menuItemList);
			
    return menuItemList;
}

/** This flags indicates the component is a parent component. */
apogeeapp.app.ParentComponent.prototype.isParentComponent = true;

/** This function adds a fhile componeent to the displays for this parent component. */
apogeeapp.app.ParentComponent.prototype.removeChildComponent = function(childComponent) {
    //remove from tree entry
    var treeEntry = this.getTreeEntry();
    if(treeEntry) {
        var childTreeEntry = childComponent.getTreeEntry();
        if(childTreeEntry) {
            treeEntry.removeChild(childTreeEntry);
        }
    }
    
    //remove child windows - just hide them. They will be deleted in the component
    childComponent.closeComponentDisplay();
}

/** This function adds a fhile componeent to the displays for this parent component. */
apogeeapp.app.ParentComponent.prototype.addChildComponent = function(childComponent) {
    //add the child to the tree entry
    var treeEntry = this.getTreeEntry();
    if(treeEntry) {
        var childTreeEntry = childComponent.getTreeEntry(true);
        treeEntry.addChild(childTreeEntry);
    }

    //add child entry for tab
    if(this.tabDisplay) {
        this.tabDisplay.addChildComponent(childComponent); 
    }
}


