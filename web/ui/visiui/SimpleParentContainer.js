/** This is a minimal parent container. The resize, show and hide events must be 
 * externally managed.
 * 
 * @class 
 */
visicomp.visiui.SimpleParentContainer = function(div,initialIsShowing) {
    
    //base init
    visicomp.core.EventManager.init.call(this);
    visicomp.visiui.ParentContainer.init.call(this,div,this);
    
    this.isShowing = initialIsShowing;
}

//add components to this class
visicomp.core.util.mixin(visicomp.visiui.SimpleParentContainer,visicomp.core.EventManager);
visicomp.core.util.mixin(visicomp.visiui.SimpleParentContainer,visicomp.visiui.ParentContainer);

/** This method must be implemented in inheriting objects. */
visicomp.visiui.SimpleParentContainer.prototype.getContentIsShowing = function() {
    return this.isShowing;
}

/** This should be called when the element is shown. */
visicomp.visiui.SimpleParentContainer.prototype.isShown = function() {
    this.isShowing = true;
    this.dispatchEvent(visicomp.visiui.ParentContainer.CONTENT_SHOWN,this);
}

/** This should be called when the element is hidden. */
visicomp.visiui.SimpleParentContainer.prototype.isHidden = function() {
    this.isShowing = false;
    this.dispatchEvent(visicomp.visiui.ParentContainer.CONTENT_HIDDEN,this);
}