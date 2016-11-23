/** This is a minimal parent container. The resize, show and hide events must be 
 * externally managed.
 * 
 * @class 
 */
haxapp.ui.SimpleParentContainer = function(div,initialIsShowing) {
    
    //base init
    hax.EventManager.init.call(this);
    haxapp.ui.ParentContainer.init.call(this,div,this);
    
    this.isShowing = initialIsShowing;
}

//add components to this class
hax.util.mixin(haxapp.ui.SimpleParentContainer,hax.EventManager);
hax.util.mixin(haxapp.ui.SimpleParentContainer,haxapp.ui.ParentContainer);

/** This method must be implemented in inheriting objects. */
haxapp.ui.SimpleParentContainer.prototype.getContentIsShowing = function() {
    return this.isShowing;
}

/** This should be called when the element is shown. */
haxapp.ui.SimpleParentContainer.prototype.isShown = function() {
    this.isShowing = true;
    this.dispatchEvent(haxapp.ui.ParentContainer.CONTENT_SHOWN,this);
}

/** This should be called when the element is hidden. */
haxapp.ui.SimpleParentContainer.prototype.isHidden = function() {
    this.isShowing = false;
    this.dispatchEvent(haxapp.ui.ParentContainer.CONTENT_HIDDEN,this);
}