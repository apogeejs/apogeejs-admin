/** This file provides a resize listener. The element must be a positioned element
 * (position must be set to something besides static. It can only be called once (!)
 * 
 * It places an iframe inside the element to be tested and uses the onresize of the 
 * iframe document body.
 */

visicomp.visiui.setResizeListener = function(element, resizeCallback){

    var styleJson = {
        "position":"absolute",
        "top":"0px",
        "left":"0px",
        "width":"100%",
        "height":"100%",
        "overflow":"hidden",
        "zIndex":-1
    };

    var onLoadCallback = function() {
        var dummyFrameBody = dummyFrameElement.contentDocument.body;
        dummyFrameBody.onresize = resizeCallback; 

        //do an initial callback for each
        resizeCallback();

        //we can do an on load too
        //onloadCallback();
    }

    //create and attach element
    var dummyFrameElement = visicomp.visiui.createElement("iframe",null,styleJson);
    dummyFrameElement.onload = onLoadCallback;
    element.appendChild(dummyFrameElement);
}

visicomp.visiui.removeResizeListener = function(element, resizeCallback){
    alert("implement this!");
}


