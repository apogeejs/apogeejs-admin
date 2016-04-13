/**
 * 
 * Code from: DANIEL BUCHNER 
 * http://www.backalleycoder.com/2013/03/18/cross-browser-event-based-element-resize-detection/
 * 
 */


(function(){
  
  function resizeListener(e){
    var win = e.target || e.srcElement;
    if (win.__resizeRAF__) window.cancelAnimationFrame(win.__resizeRAF__);
    win.__resizeRAF__ = window.requestAnimationFrame(function(){
      var trigger = win.__resizeTrigger__;
      trigger.__resizeListeners__.forEach(function(fn){
        fn.call(trigger, e);
      });
    });
  }
  
  function objectLoad(e){
    this.contentDocument.defaultView.__resizeTrigger__ = this.__resizeElement__;
    this.contentDocument.defaultView.addEventListener('resize', resizeListener);
  }
  
  window.addResizeListener = function(element, fn){
    if (!element.__resizeListeners__) {
      element.__resizeListeners__ = [];

		if (getComputedStyle(element).position == 'static') element.style.position = 'relative';
		var obj = element.__resizeTrigger__ = document.createElement('object'); 
		obj.setAttribute('style', 'display: block; position: absolute; top: 0; left: 0; height: 100%; width: 100%; overflow: hidden; pointer-events: none; z-index: -1;');
		obj.__resizeElement__ = element;
		obj.onload = objectLoad;
		obj.type = 'text/html';
		obj.data = 'about:blank';
		element.appendChild(obj);

    }
    element.__resizeListeners__.push(fn);
  };
  
  window.removeResizeListener = function(element, fn){
    element.__resizeListeners__.splice(element.__resizeListeners__.indexOf(fn), 1);
    if (!element.__resizeListeners__.length) {
        element.__resizeTrigger__.contentDocument.defaultView.removeEventListener('resize', resizeListener);
        element.__resizeTrigger__ = !element.removeChild(element.__resizeTrigger__);
    }
  }
})();