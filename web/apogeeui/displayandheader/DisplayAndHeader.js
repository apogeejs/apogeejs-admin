import apogeeui from "/apogeeui/apogeeui.js";

/** This is is a layout element to fill a parent element with a header element and
 * a display element which takes all the remaning vertical space.
 * 
 * The header and display types may be the following:
 * DisplayAndHeader.SCROLLING_PANE
 * DisplayAndHeader.FIXED_PANE
 * 
 * Additionally a CSS class may be specified for each fo give information such as
 * coloring and, for the sake of the header, height.
 */ 
export default class DisplayAndHeader {

    constructor(headerType,headerStyleClass,bodyType,bodyStyleClass) {
    //    this.container = apogeeui.createElementWithClass("div","visiui-dnh-container");
    //    
    //    this.headerOuter = apogeeui.createElementWithClass("div","visiui-dnh-header",this.container);
    //    this.header = apogeeui.createElementWithClass("div","visiui-dnh-header-inner",this.headerOuter);
    //    this.bodyOuter = apogeeui.createElementWithClass("div","visiui-dnh-body",this.container);
    //    this.body = apogeeui.createElementWithClass("div","visiui-dnh-body-inner",this.bodyOuter);
    //    
    //    this.headerStyleClass = headerStyleClass;
    //    this.bodyStyleClass = bodyStyleClass;
    //    
    //    this.headerContent = document.createElement("div");
    //    this.header.appendChild(this.headerContent);
    //    this.bodyContent = document.createElement("div");
    //    this.body.appendChild(this.bodyContent);
        
        this.container = apogeeui.createElementWithClass("table","visiui-dnh-container");
        
        this.headerOuter = apogeeui.createElementWithClass("tr","visiui-dnh-header",this.container);
        this.header = apogeeui.createElementWithClass("td","visiui-dnh-header-inner",this.headerOuter);
        this.bodyOuter = apogeeui.createElementWithClass("tr","visiui-dnh-body",this.container);
        this.body = apogeeui.createElementWithClass("td","visiui-dnh-body-inner",this.bodyOuter);
        
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

    /** this method sets the header type. */
    setHeaderType(headerType) {
        var headerClass = headerType;
        if(this.headerStyleClass) headerClass += " " + this.headerStyleClass;
        this.headerContent.className = headerClass;
    }

    /** this method sets the body type. */
    setBodyType(bodyType) {
        var bodyClass = bodyType;
        if(this.bodyStyleClass) bodyClass += " " + this.bodyStyleClass;
        this.bodyContent.className = bodyClass;
    }

    /** this method returns the DOM element for ths combined layout. */
    getOuterElement() {
        return this.container;
    }

    /** this method returns the content element for the header. */
    getHeaderContainer() {
        return this.header;
    }

    /** this method returns the content element for the display pane. */
    getBodyContainer() {
        return this.body;
    }

    /** this method returns the content element for the header. */
    getHeader() {
        return this.headerContent;
    }

    /** this method returns the content element for the display pane. */
    getBody() {
        return this.bodyContent;
    }

}

/** This is the pane type for a pane that scrolls in both X and Y, iv needed. */
DisplayAndHeader.FIXED_PANE = "visiui-dnh-fixed";

/** This is the pane type for a pane that does not scrolling, hiding any overflow. */
DisplayAndHeader.SCROLLING_PANE = "visiui-dnh-scrolling";