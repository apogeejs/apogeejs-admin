/** This class manages the stack order of the WindowFrame. When a window is 
 * clicked, it moves to the top of the stack of windows.
 *
 * @class 
 */
visicomp.visiui.WindowGroupManager = function() {
    this.windowFrameStack = [];
}

visicomp.visiui.WindowGroupManager.BASE_ZINDEX = 0;


visicomp.visiui.WindowGroupManager.prototype.addWindow = function(windowFrame) {
    this.windowFrameStack.push(windowFrame);
    this.updateOrder();
}

visicomp.visiui.WindowGroupManager.prototype.removeWindow = function(windowFrame) {
    var index = this.windowFrameStack.indexOf(windowFrame);
    this.windowFrameStack.splice(index,1);
    this.updateOrder();
}

visicomp.visiui.WindowGroupManager.prototype.bringToFront = function(windowFrame) {
    //remove from array
    var index = this.windowFrameStack.indexOf(windowFrame);
    this.windowFrameStack.splice(index,1);
    //readd at the end
    this.windowFrameStack.push(windowFrame);
    this.updateOrder();
}

visicomp.visiui.WindowGroupManager.prototype.updateOrder = function() {
    var zIndex = visicomp.visiui.WindowGroupManager.BASE_ZINDEX;
    for(var i = 0; i < this.windowFrameStack.length; i++) {
        var windowFrame = this.windowFrameStack[i];
        windowFrame.setZIndex(zIndex++);
    }
}

//=========================================
// static methods
//=========================================


visicomp.visiui.WindowGroupManager.windowManagerMap = {};

/** This methods looks up the proper window manager for the given parent container.
 * This requires that the parent container has an id. If it does not, a generated
 * one will be added. 
 */
visicomp.visiui.WindowGroupManager.getWindowManager = function(parentContainer) {
    var parentId = parentContainer.id;
    if(parentId == undefined) {
        //create an id for the parent container
        parentContainer.id = visicomp.visiui.createId();
    }
    
    var windowManager = visicomp.visiui.WindowGroupManager.windowManagerMap[parentId];
    if(!windowManager) {
        windowManager = new visicomp.visiui.WindowGroupManager();
        visicomp.visiui.WindowGroupManager.windowManagerMap[parentId] = windowManager;
    }
    return windowManager;
}
