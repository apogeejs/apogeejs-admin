/**
 * 
 * Code from: DANIEL BUCHNER 
 * http://www.backalleycoder.com/2013/03/18/cross-browser-event-based-element-resize-detection/
 * 
 */


(function(){
  
  

  
  window.addResizeListener = function(element, resizeCallback){
	  var styleJson = {
		"position":"absolute",
        "top":"0px",
        "left":"0px",
		"bottom":"0px",
        "right":"0px",
		"overflow":"hidden",
		"zIndex":-1
	};
	var dummyFrameElement = visicomp.visiui.createElement("iframe",null,styleJson);
	

	var onLoadCallback = function() {
		
		var dummyFrameBody = dummyFrameElement.contentDocument.body;
		dummyFrameBody.onresize = resizeCallback;
		
		//onloadCallback();
		resizeCallback();
	}
	
	//do a resize on load too
	dummyFrameElement.onload = onLoadCallback;
	
	element.appendChild(dummyFrameElement);
  };
  
  window.removeResizeListener = function(element, fn){
	  alert("remove resize listener not implemented");
  }
})();