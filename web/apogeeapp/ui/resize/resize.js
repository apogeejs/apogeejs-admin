/** This file provides a resize listener. The element must be a positioned element
 * (position must be set to something besides static. It can only be done once per element(!)
 * 
 * It places an iframe inside the element to be tested and uses the onresize of the 
 * iframe document body. It calls load (and resize) on initial loading of the iframe.
 */

apogeeapp.ui.setResizeListener = function(element, resizeCallback, loadCallback){

    var styleJson = {
        "position":"absolute",
        "top":"0px",
        "left":"0px",
        "width":"100%",
        "height":"100%",
        "overflow":"hidden",
        "zIndex":-1
    };

    //create and attach element
    var dummyFrameElement = apogeeapp.ui.createElement("iframe",null,styleJson);
    dummyFrameElement.onload = function() {
        var dummyFrameBody = dummyFrameElement.contentDocument.body; 
        
        if(loadCallback) {
            loadCallback();
        }

        //do an initial callback for each
        if(resizeCallback) {
            resizeCallback();
            dummyFrameBody.onresize = resizeCallback;
        }
    }
    element.appendChild(dummyFrameElement);
}

/** @private */
apogeeapp.ui.createOnLoadCallback = function(frameElement, resizeCallback, loadCallback) {
    
}

apogeeapp.ui.removeResizeListener = function(element, resizeCallback){
    alert("implement this!");
}


