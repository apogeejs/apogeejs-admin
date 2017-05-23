/** This is is a layout element to fill a parent element with a header element and
 * a display element which takes all the remaning vertical space.
 * 
 * The header and display types may be the following:
 * haxapp.ui.DisplayAndHeader.SCROLLING_PANE
 * haxapp.ui.DisplayAndHeader.FIXED_PANE
 * 
 * Additionally a CSS class may be specified for each fo give information such as
 * coloring and, for the sake of the header, height.
 */ 
haxapp.ui.DisplayAndHeader = function(headerType,headerStyleClass,bodyType,bodyStyleClass) {
    this.container = haxapp.ui.createElementWithClass("div","visiui-dnh-container");
    
    this.header = haxapp.ui.createElementWithClass("div","visiui-dnh-header",this.container);
    this.body = haxapp.ui.createElementWithClass("div","visiui-dnh-body",this.container);
    
    this.headerStyleClass = headerStyleClass;
    this.bodyStyleClass = bodyStyleClass;
    
    this.headerContent = document.createElement("div");
    this.header.appendChild(this.headerContent);
    this.bodyContent = document.createElement("div");
    this.body.appendChild(this.bodyContent);
    
    this.setHeaderType(headerType);
    this.setBodyType(bodyType);
}

/** This is the pane type for a pane that scrolls in both X and Y, iv needed. */
haxapp.ui.DisplayAndHeader.FIXED_PANE = "visiui-dnh-fixed";

/** This is the pane type for a pane that does not scrolling, hiding any overflow. */
haxapp.ui.DisplayAndHeader.SCROLLING_PANE = "visiui-dnh-scrolling";

/** this method sets the header type. */
haxapp.ui.DisplayAndHeader.prototype.setHeaderType = function(headerType) {
	var headerClass = headerType;
    if(this.headerStyleClass) headerClass += " " + this.headerStyleClass;
    this.headerContent.className = headerClass;
}

/** this method sets the body type. */
haxapp.ui.DisplayAndHeader.prototype.setBodyType = function(bodyType) {
	var bodyClass = bodyType;
    if(this.bodyStyleClass) bodyClass += " " + this.bodyStyleClass;
    this.bodyContent.className = bodyClass;
}

/** this method returns the DOM element for ths combined layout. */
haxapp.ui.DisplayAndHeader.prototype.getOuterElement = function() {
	return this.container;
}

/** this method returns the content element for the header. */
haxapp.ui.DisplayAndHeader.prototype.getHeaderContainer = function() {
	return this.header;
}

/** this method returns the content element for the display pane. */
haxapp.ui.DisplayAndHeader.prototype.getBodyContainer = function() {
	return this.body;
}

/** this method returns the content element for the header. */
haxapp.ui.DisplayAndHeader.prototype.getHeader = function() {
	return this.headerContent;
}

/** this method returns the content element for the display pane. */
haxapp.ui.DisplayAndHeader.prototype.getBody = function() {
	return this.bodyContent;
}