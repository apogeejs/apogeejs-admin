import apogeeutil from "/apogeeutil/apogeeUtilLib.js";
import ConfigurableElement from "/apogeeui/configurablepanel/ConfigurableElement.js";
import uiutil from "/apogeeui/uiutil.js";

/** This is an text field element configurable element.
 * 
 * @class 
 */
export default class ExtendedDropdownElement extends ConfigurableElement {
    constructor(form,elementInitData) {
        super(form,elementInitData);
        
        this.elementData = [];
        this.value = null;

        var containerElement = this.getElement();
        
        //label
        if(elementInitData.label) {
            this.labelElement = document.createElement("span");
            this.labelElement.className = "apogee_configurablePanelLabel";
            this.labelElement.innerHTML = elementInitData.label;
            containerElement.appendChild(this.labelElement);
        }
        else {
            this.labelElement = null;
        }
        
        //add the head link
        this.dropdownElement = document.createElement("div");
        this.dropdownElement.className = "apogee_configurableExtendedDropdown";
        containerElement.appendChild(this.dropdownElement);

        this.headLink = this._createHeadLink();
        this.dropdownElement.appendChild(this.headLink);
        //add arrow!
        //this.arrowGraphic = ???

        this.dropdownElement.appendChild(document.createElement("br"));

        //add the body container
        this.bodyContainer = document.createElement("div");
        this.bodyContainer.className = "apogee_configurableExtendedBodyContainer";
        this.dropdownElement.appendChild(this.bodyContainer);

        //add the content links
        if(elementInitData.content) {
            elementInitData.content.forEach( (contentEntry,index) =>  this._insertContentEntry(contentEntry,index))
        }

        //for now we don't properly handle no content or no selection
        //fix this!!!
        if(this.elementData.length == 0) throw new Error("Extended Dropdown needs some content, for now at least (fix this)");

        let initialIndex;
        if(elementInitData.value !== null) {
            let entry = this.elementData.find( entry => (entry.value === elementInitData.value) );
            if(entry) {
                initialIndex = entry.index;
            }
            else {
                initialIndex = 0;
            }
        }
        
        this._setSelection(initialIndex);
 

        //-------------------------------------------------------------
        //define content here//////////////////////////////////////////
        //-------------------------------------------------------------

        this._postInstantiateInit(elementInitData);
    }
    
    /** This method returns value for this given element, if applicable. If not applicable
     * this method returns undefined. */
    getValue() {
        return this.value;
    }  
    
    //===================================
    // protectd Methods
    //==================================

    /** This method updates the list of checked entries. */
    setValueImpl(value) {
        let elementEntry = this.elementData.find( elementEntry => elementEntry.value === value);
        if(elementEntry) {
            this._setSelection(elementEntry.index);
        }
        this.valueChanged();
    }

    //===================================
    // internal Methods
    //==================================
    
    _setDisabled(isDisabled) { 
        console.error("Implement disabled in Extended Dropdown!");
        //IMPLEMENT!!!

        //if disabled:
        //-close element
        //-update class so it is grayed out a littel
        //-disallow event handlers
        //if enabled:
        //normal operation
    }

    /** Sets the selection for the control. The index can be an integer or string. */
    _setSelection(index) {
        let elementEntry = this.elementData[index];
        if(elementEntry) {
            this.value = elementEntry.value;
            this._setHeadLinkContent(elementEntry.html);
        }
    }

    /** This generates the head link. */
    _createHeadLink() {
        let headLink = document.createElement("a");
        headLink.className = "apogee_configurableExtendedHeadLink";
        headLink.href = "javascript:void(0);";

        headLink.onmousedown = e => this._onHeadClick(e);
        headLink.onfocus = e => this._onLinkFocus(e);
        headLink.onblur = e => this._onLinkBlur(e);
        headLink.onkeydown = e => this._onHeadKeyDown(e);

        return headLink;
    }

    /** This updates the head link content. */
    _setHeadLinkContent(contentHTML) {
        this.headLink.innerHTML = contentHTML;
    }

    /** This adds an new content entry to the body */
    _insertContentEntry(contentEntry,index) {
        let elementEntry = {};
        elementEntry.index = index;
        elementEntry.html = contentEntry[0];
        elementEntry.value = contentEntry[1];
        elementEntry.bodyLink = this._createBodyLink(elementEntry.html,elementEntry.index);

        this.elementData.push(elementEntry);

        this.bodyContainer.appendChild(elementEntry.bodyLink);
        this.bodyContainer.appendChild(document.createElement("br"));
    }

    /** This generates a body link */
    _createBodyLink(content,index) {
        let bodyLink = document.createElement("div");
        bodyLink.className = "apogee_configurableExtendedBodyLink";
        bodyLink.innerHTML = content;

        bodyLink.onclick = event => {
            this._onBodyClick(index);
            event.stopPropagation();
        }
        bodyLink.onmousedown = event => {
            event.stopPropagation();
        }

        return bodyLink;
    }

    _closeBody() {
        this.bodyContainer.classList.remove("apogee_configurableExtendedOpened");
        console.log("closed: " + this.bodyContainer.classList);
    }

    _openBody() {
        this.bodyContainer.classList.add("apogee_configurableExtendedOpened");
        console.log("opened: " + this.bodyContainer.classList);
    }

    //---------------
    //event handlers
    //----------------
    
    //toggle the open state of the body
    _onHeadClick(e) {
        this.bodyContainer.classList.toggle("apogee_configurableExtendedOpened");
        console.log("clicked:" + this.bodyContainer.classList);
    }

    //char handling on head
    _onHeadKeyDown(e) {

    }
    
    //select current element as close body
    _onBodyClick(index) {
        this._setSelection(index);

        this.inputDone();
        this.valueChanged();

        this._closeBody();
    }
    
    //char handling on body link
    _onBodyKeyDown(e) {

    }

    //body should be open if any link has focus
    _onLinkFocus(e) {
        this._openBody();
    }
    
    //body should be open if any link has focus and closed is not
    _onLinkBlur(e) {
        if(this.elementData.some( elementEntry => elementEntry.bodyLink == e.target)) {
            //no action if focus goes to internal entry
        }
        else {
            this._closeBody();
        }
    }   

    // _aLinkHasFocus() {
    //     let activeElement = document.activeElement;

    //     //check if head has focus
    //     if(this.headLink === activeElement) return true;
    //     else return false;
    // }
    

}

ExtendedDropdownElement.TYPE_NAME = "extendedDropdown";
