/** This is a mixin to form the base for a component display, which is used
 * for different types of components and for both window and tab containers. */
haxapp.app.DisplayContent = {};
 
 
/** This is the initializer for the component. The object passed is the core object
 * associated with this component. */
haxapp.app.DisplayContent.init = function(component,container,options) {
    
    if(!options) {
        options = {};
    }
    
    this.component = component;
    this.options = options;
    
    this.windowHeaderManager = new WindowHeaderManager();

    //------------------
    // Add menu (we will add the items later. This populates it.)
    //------------------

    var menu = container.getMenu();
    
    //------------------
    //set the title
    //------------------
    container.setTitle(component.getObject().getDisplayName());
    
    //headers
    this.toolbarDiv = null;
    this.toolbarActive = false;
    this.bannerDiv = null;
    this.bannerBarActive = false;
    
    //------------------
    // set menu
    //------------------
    
    //menu items
    var menuItemInfoList = [];
    
    //add the standard entries
    var itemInfo = {};
    itemInfo.title = "Edit Properties";
    itemInfo.callback = haxapp.app.updatecomponent.getUpdateComponentCallback(component,this.generator);
    menuItemInfoList.push(itemInfo);
    
    var itemInfo = {};
    itemInfo.title = "Delete";
    itemInfo.callback = component.createDeleteCallback(itemInfo.title);
    menuItemInfoList.push(itemInfo);
    
    //set the menu items
    menu.setMenuItems(menuItemInfoList);
      
}

/** This method returns the component object. */
haxapp.app.DisplayContent.getComponent = function() {
	return this.component;
}

/** This method returns the member object. */
haxapp.app.DisplayContent.getObject = function() {
	return this.component.getObject();
}

//==============================
// Protected Instance Methods
//==============================

///** This method extends the member udpated function from the base.
// * @protected */    
//haxapp.app.DisplayContent.memberUpdated = function() {
//    //check for change of parent
//    if(this.object.getParent() !== this.activeParent) {
//        this.activeParent = this.object.getParent();
//        this.parenContainer = this.getWorkspaceUI().getParentContainerObject(this.object);
//        this.window.setParent(this.parenContainer);
//    }
//    
//    //update title
//    this.updateTitle();
//    
//    //update data
//    var object = this.getObject();
//    if(object.hasError()) {
//        var errorMsg = "";
//        var actionErrors = object.getErrors();
//        for(var i = 0; i < actionErrors.length; i++) {
//            errorMsg += actionErrors[i].msg + "\n";
//        }
//        
//        this.container.showBannerBar(errorMsg,haxapp.app.DisplayContent.BANNER_TYPE_ERROR);
//    }
//    else if(object.getResultPending()) {
//        this.container.showBannerBar(haxapp.app.DisplayContent.PENDING_MESSAGE,haxapp.app.DisplayContent.BANNER_TYPE_PENDING);
//    }
//    else {   
//        this.container.hideBannerBar();
//    }
//}
//
///** This method makes sure the window title is up to date.
// * @private */    
//haxapp.app.DisplayContent.updateTitle = function() {
//    //make sure the title is up to date
//    var member = this.getObject();
//    
//    var window = this.getWindow();
//    if(window) {
//        
//        var displayName = member.getDisplayName();
//        var windowTitle = window.getTitle();
//        if(windowTitle !== displayName) {
//            window.setTitle(displayName);
//        }
//    }
//}