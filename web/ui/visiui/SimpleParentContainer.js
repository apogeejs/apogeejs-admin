/** This is a minimal parent container. Resize must be externally managed.
 * 
 * @class 
 */
visicomp.visiui.SimpleParentContainer = function(div) {
    
    //base init
    visicomp.core.EventManager.init.call(this);
    visicomp.visiui.ParentContainer.init.call(this,div,this);
    
	//prevent default drag action
//	var moveHandler = function(e) {e.preventDefault();};
//    div.addEventListener("mousemove",moveHandler);
}

//add components to this class
visicomp.core.util.mixin(visicomp.visiui.SimpleParentContainer,visicomp.core.EventManager);
visicomp.core.util.mixin(visicomp.visiui.SimpleParentContainer,visicomp.visiui.ParentContainer);

/** This should be called when the element si resized. */
visicomp.visiui.SimpleParentContainer.prototype.resized = function() {
    this.dispatchEvent("resize",this);
}