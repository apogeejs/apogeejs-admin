/** This is a mixin that encapsulates the base functionality of a Component
 * 
 * This is not a class, but it is used for the prototype of the objects that inherit from it.
 */
haxapp.app.ParentComponent = {};

/** This is the initializer for the component. The object passed is the core object
 * associated with this component. */
haxapp.app.ParentComponent.init = function(options) {
    this.tabDisplay = null;
}

//////////////////////////////////////////
    
haxapp.app.Component.openTabDisplay = function() {
    if(!this.tabDisplay) {
        this.tabDisplay = new haxapp.app.TabComponentDisplay(this);
    }
    this.workspaceUI.setActiveTab(this.getObject().getId());
}

haxapp.app.Component.getTabDisplay = function() {
    return this.tabDisplay;
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
haxapp.app.ParentComponent.isParentComponent = true;

///** This shoudl be implemented by the inheritieing class to give the member
// * object associated with this component. */
//haxapp.app.ParentComponent.getParentMember = function();

/** This function adds a fhile componeent to the displays for this parent component. */
haxapp.app.ParentComponent.removeChildComponent = function(childComponent) {
    //remove from tree entry
    var treeEntry = this.getTreeEntry();
    var childId = childComponent.getObject().getId();
    treeEntry.removeChild(childId);
    
    //remove child windows - just hide them. They will be deleted in the component
    var childWindowDisplays = childComponent.getWindowDisplays();
    for(var i = 0; i < childWindowDisplays.length; i++) {
        childWindowDisplays[i].hide();
    }
}

/** This function adds a fhile componeent to the displays for this parent component. */
haxapp.app.ParentComponent.addChildComponent = function(childComponent) {
    //add the child to the tree entry
    var treeEntry = this.getTreeEntry();
    var childTreeEntry = childComponent.getTreeEntry();
    var childId = childComponent.getObject().getId();
    treeEntry.addChild(childId,childTreeEntry);
    
    //add to tab and windows
    var parentContainer;
    
    //add child entry for tab
    if(this.tabDisplay) {
        parentContainer = this.tabDisplay.getDisplayContent();
        parentContainer.addChildComponent(childComponent); 
    }
    
    for(var i = 0; i < this.windowDisplays; i++) {
        var windowDisplay = this.windowDisplays[i];
        parentContainer = windowDisplay.getDisplayContent();
        if(parentContainer) {
            parentContainer.addChildComponent(childComponent);
        }
    }
}


