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
haxapp.ui.DisplayAndHeader = function(headerType,headerStyleClass,bodyType,bodyStyleClass) {
    this.container = haxapp.ui.createElementWithClass("div","visiui-dnh-container");
    
    var header = haxapp.ui.createElementWithClass("div","visiui-dnh-header",this.container);
    var body = haxapp.ui.createElementWithClass("div","visiui-dnh-body",this.container);
    
    var headerClass = headerType;
    if(headerStyleClass) headerClass += " " + headerStyleClass;
    this.headerContent = haxapp.ui.createElementWithClass("div",headerClass,header);
    
    var bodyClass = bodyType;
    if(bodyStyleClass) bodyClass += " " + bodyStyleClass;
    this.bodyContent = haxapp.ui.createElementWithClass("div",bodyClass,body);
}

/** This is the pane type for a pane that scrolls in both X and Y, iv needed. */
haxapp.ui.DisplayAndHeader.FIXED_PANE = "visiui-dnh-fixed";

/** This is the pane type for a pane that does not scrolling, hiding any overflow. */
haxapp.ui.DisplayAndHeader.SCROLLING_PANE = "visiui-dnh-scrolling";

/** this method returns the DOM element for ths combined layout. */
haxapp.ui.DisplayAndHeader.prototype.getOuterElement = function() {
	return this.container;
}

/** this method returns the content element for the header. */
haxapp.ui.DisplayAndHeader.prototype.getHeader = function() {
	return this.headerContent;
}

/** this method returns the content element for the display pane. */
haxapp.ui.DisplayAndHeader.prototype.getBody = function() {
	return this.bodyContent;
}