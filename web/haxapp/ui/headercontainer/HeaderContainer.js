/** This is is a layout element to till a parent element with a header element and
 * a display element which takes all the remaning vertical space.
 * 
 * The header and display types may be the following:
 * haxapp.ui.DisplayAndHeader.SCROLLING_PANE
 * haxapp.ui.DisplayAndHeader.FIXED_PANE
 * 
 * Additionally a CSS class may be specified for each fo give information such as
 * coloring and, for the sake of the header, height.
 */ 
haxapp.ui.HeaderContainer = function(bodyType) {
    this.displayAndHeader = new haxapp.ui.DisplayAndHeader(haxapp.ui.DisplayAndHeader.FIXED_PANE,bodyType);
    
    this.header = haxapp.ui.createElementWithClass("div","visiui-hc-header",this.displayAndHeader.getHeader());
}

/** this method returns the DOM element for ths combined layout. */
haxapp.ui.HeaderContainer.prototype.getOuterElement = function() {
	return this.displayAndHeader.getOuterElement();
}

/** this method returns the content element for the header. */
haxapp.ui.HeaderContainer.prototype.loadHeaders = function(headerElements) {
	haxapp.ui.removeAllChildren(this.header);
    if(headerElements.length > 0) {
        for(var i = 0; i < headerElements.length; i++) {
			this.header.appendChild(headerElements[i]);
		}
    }
}

/** this method sets the body type. */
haxapp.ui.HeaderContainer.prototype.setBodyType = function(bodyType) {
	this.displayAndHeader.setBodyType(bodyType);
}

/** this method returns the content element for the display pane. */
haxapp.ui.HeaderContainer.prototype.getBodyElement = function() {
	return this.displayAndHeader.getBody();
}


