/** This is a minimal parent container. The resize, show and hide events must be 
 * externally managed.
 * 
 * @class 
 */
hax.visiui.SimpleParentContainer = function(div,initialIsShowing) {
    
    //base init
    hax.core.EventManager.init.call(this);
    hax.visiui.ParentContainer.init.call(this,div,this);
    
    this.isShowing = initialIsShowing;
}

//add components to this class
hax.core.util.mixin(hax.visiui.SimpleParentContainer,hax.core.EventManager);
hax.core.util.mixin(hax.visiui.SimpleParentContainer,hax.visiui.ParentContainer);

/** This method must be implemented in inheriting objects. */
hax.visiui.SimpleParentContainer.prototype.getContentIsShowing = function() {
    return this.isShowing;
}

/** This should be called when the element is shown. */
hax.visiui.SimpleParentContainer.prototype.isShown = function() {
    this.isShowing = true;
    this.dispatchEvent(hax.visiui.ParentContainer.CONTENT_SHOWN,this);
}

/** This should be called when the element is hidden. */
hax.visiui.SimpleParentContainer.prototype.isHidden = function() {
    this.isShowing = false;
    this.dispatchEvent(hax.visiui.ParentContainer.CONTENT_HIDDEN,this);
}