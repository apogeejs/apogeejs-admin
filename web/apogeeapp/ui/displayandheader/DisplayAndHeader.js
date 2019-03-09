/** This is is a layout element to fill a parent element with a header element and
 * a display element which takes all the remaning vertical space.
 * 
 * The header and display types may be the following:
 * apogeeapp.ui.DisplayAndHeader.SCROLLING_PANE
 * apogeeapp.ui.DisplayAndHeader.FIXED_PANE
 * 
 * Additionally a CSS class may be specified for each fo give information such as
 * coloring and, for the sake of the header, height.
 */ 
apogeeapp.ui.DisplayAndHeader = function(headerType,headerStyleClass,bodyType,bodyStyleClass) {
//    this.container = apogeeapp.ui.createElementWithClass("div","visiui-dnh-container");
//    
//    this.headerOuter = apogeeapp.ui.createElementWithClass("div","visiui-dnh-header",this.container);
//    this.header = apogeeapp.ui.createElementWithClass("div","visiui-dnh-header-inner",this.headerOuter);
//    this.bodyOuter = apogeeapp.ui.createElementWithClass("div","visiui-dnh-body",this.container);
//    this.body = apogeeapp.ui.createElementWithClass("div","visiui-dnh-body-inner",this.bodyOuter);
//    
//    this.headerStyleClass = headerStyleClass;
//    this.bodyStyleClass = bodyStyleClass;
//    
//    this.headerContent = document.createElement("div");
//    this.header.appendChild(this.headerContent);
//    this.bodyContent = document.createElement("div");
//    this.body.appendChild(this.bodyContent);
    
    this.container = apogeeapp.ui.createElementWithClass("table","visiui-dnh-container");
    
    this.headerOuter = apogeeapp.ui.createElementWithClass("tr","visiui-dnh-header",this.container);
    this.header = apogeeapp.ui.createElementWithClass("td","visiui-dnh-header-inner",this.headerOuter);
    this.bodyOuter = apogeeapp.ui.createElementWithClass("tr","visiui-dnh-body",this.container);
    this.body = apogeeapp.ui.createElementWithClass("td","visiui-dnh-body-inner",this.bodyOuter);
    
    this.headerStyleClass = headerStyleClass;
    this.bodyStyleClass = bodyStyleClass;
    
    this.headerContent = document.createElement("div");
    this.header.appendChild(this.headerContent);
    this.bodyContent = document.createElement("div");
    this.body.appendChild(this.bodyContent);
    
    //this.setHeaderType(headerType);
    this.setHeaderType("visiui-dnh-shrink-to-fit");
    this.setBodyType(bodyType);
}

/** This is the pane type for a pane that scrolls in both X and Y, iv needed. */
apogeeapp.ui.DisplayAndHeader.FIXED_PANE = "visiui-dnh-fixed";

/** This is the pane type for a pane that does not scrolling, hiding any overflow. */
apogeeapp.ui.DisplayAndHeader.SCROLLING_PANE = "visiui-dnh-scrolling";

/** this method sets the header type. */
apogeeapp.ui.DisplayAndHeader.prototype.setHeaderType = function(headerType) {
	var headerClass = headerType;
    if(this.headerStyleClass) headerClass += " " + this.headerStyleClass;
    this.headerContent.className = headerClass;
}

/** this method sets the body type. */
apogeeapp.ui.DisplayAndHeader.prototype.setBodyType = function(bodyType) {
	var bodyClass = bodyType;
    if(this.bodyStyleClass) bodyClass += " " + this.bodyStyleClass;
    this.bodyContent.className = bodyClass;
}

/** this method returns the DOM element for ths combined layout. */
apogeeapp.ui.DisplayAndHeader.prototype.getOuterElement = function() {
	return this.container;
}

/** this method returns the content element for the header. */
apogeeapp.ui.DisplayAndHeader.prototype.getHeaderContainer = function() {
	return this.header;
}

/** this method returns the content element for the display pane. */
apogeeapp.ui.DisplayAndHeader.prototype.getBodyContainer = function() {
	return this.body;
}

/** this method returns the content element for the header. */
apogeeapp.ui.DisplayAndHeader.prototype.getHeader = function() {
	return this.headerContent;
}

/** this method returns the content element for the display pane. */
apogeeapp.ui.DisplayAndHeader.prototype.getBody = function() {
	return this.bodyContent;
}