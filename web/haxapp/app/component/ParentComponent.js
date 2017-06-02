/** This is the base class for a parent component (an object that has children),
 * It extends the component class. */
haxapp.app.ParentComponent = function(workspaceUI,object,generator,options) {
    //base constructor
	haxapp.app.Component.call(this,workspaceUI,object,generator,options);
    
    this.tabDisplay = null;
}

haxapp.app.ParentComponent.prototype = Object.create(haxapp.app.Component.prototype);
haxapp.app.ParentComponent.prototype.constructor = haxapp.app.ParentComponent;

haxapp.app.ParentComponent.prototype.createWindowDisplay = function() {
    if(this.windowDisplay == null) {
        this.windowDisplay = new haxapp.app.ParentWindowComponentDisplay(this,this.windowDisplayStateJson);
    }
    return this.windowDisplay;
}

//----------------------
// ParentContainer Methods
//----------------------

/** This method must be implemented in inheriting objects. */
haxapp.app.ParentComponent.prototype.getContentIsShowing = function() {
    return this.getWindow().getContentIsShowing();
}


//Implement in extending classes
///** This returned the parent member object associated with this component. */
//haxapp.app.ParentComponent.prototype.getParentMember = function();
    
haxapp.app.ParentComponent.prototype.hasTabDisplay = function() {    
    return true;
}

haxapp.app.ParentComponent.prototype.openTabDisplay = function() {
    if(!this.tabDisplay) {
        this.tabDisplay = new haxapp.app.TabComponentDisplay(this);
    }
    this.workspaceUI.setActiveTab(this.getObject().getId());
}

haxapp.app.ParentComponent.prototype.closeTabDisplay = function() {
    if(this.tabDisplay) {
        this.tabDisplay.closeTab();
        this.tabDisplay = null;
    }
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
haxapp.app.ParentComponent.prototype.isParentComponent = true;

///** This shoudl be implemented by the inheritieing class to give the member
// * object associated with this component. */
//haxapp.app.ParentComponent.getParentMember = function();

/** This function adds a fhile componeent to the displays for this parent component. */
haxapp.app.ParentComponent.prototype.removeChildComponent = function(childComponent) {
    //remove from tree entry
    var treeEntry = this.getTreeEntry();
    var childId = childComponent.getObject().getId();
    treeEntry.removeChild(childId);
    
    //remove child windows - just hide them. They will be deleted in the component
    var childWindowDisplay = childComponent.getWindowDisplay();
    if(childWindowDisplay) {
        childWindowDisplay.getWindowEntry().close();
    }
}

/** This function adds a fhile componeent to the displays for this parent component. */
haxapp.app.ParentComponent.prototype.addChildComponent = function(childComponent) {
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


