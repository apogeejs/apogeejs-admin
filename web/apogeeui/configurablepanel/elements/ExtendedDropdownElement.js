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

        if(!ExtendedDropdownElement.initialized) ExtendedDropdownElement._initialize();
        
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

        headLink.onmousedown = e => ExtendedDropdownElement._onHeadMouseDown(e,this);
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
        elementEntry.bodyElement = this._createBodyElement(elementEntry.html,elementEntry.index);

        this.elementData.push(elementEntry);

        this.bodyContainer.appendChild(elementEntry.bodyElement);
        this.bodyContainer.appendChild(document.createElement("br"));
    }

    /** This generates a body link */
    _createBodyElement(content,index) {
        let bodyElement = document.createElement("div");
        bodyElement.className = "apogee_configurableExtendedBodyElement";
        bodyElement.innerHTML = content;

        bodyElement.onclick = event => {
            this._onBodyClick(index);
        }

        return bodyElement;
    }

    //---------------
    //event handlers
    //----------------

    //char handling on head
    _onHeadKeyDown(e) {

    }
    
    //select current element as close body
    _onBodyClick(index) {
        this._setSelection(index);

        this.inputDone();
        this.valueChanged();

        ExtendedDropdownElement._closeActiveDropdown();
    }
    
    //char handling on body link
    _onBodyKeyDown(e) {

    }

    //==========================================
    // Static
    //==========================================



    static _initialize() {
        window.addEventListener("mousedown",ExtendedDropdownElement._globalMouseDownListener);
        ExtendedDropdownElement._initialized = true;
    }

    static _uninitialize() {
        window.removeEventListener("mousedown",ExtendedDropdownElement._globalMouseDownListener);
        ExtendedDropdownElement._initialized = false;
    }

    static _globalMouseDownListener(event) {
        if(ExtendedDropdownElement.activeDropdown) {
            if( (!event.target.classList.contains("apogee_configurableExtendedHeadLink")) &&
                (!event.target.classList.contains("apogee_configurableExtendedBodyElement")) ) {
                    ExtendedDropdownElement._closeActiveDropdown();
            }
        }
    }

    static _onHeadMouseDown(event,dropdown) {
        if(dropdown != ExtendedDropdownElement.activeDropdown) {
            //open the element
            ExtendedDropdownElement._openDropdownElement(dropdown);
        }
        else {
            //if we are activea and click the head, close the element
            ExtendedDropdownElement._closeActiveDropdown();
        }
    }

    static _openDropdownElement(dropdown) {
        if(ExtendedDropdownElement.activeDropdown) ExtendedDropdownElement._closeActiveDropdown();

        ExtendedDropdownElement._open(dropdown);
        ExtendedDropdownElement.activeDropdown = dropdown;
    } 

    static _closeActiveDropdown() {
        if(ExtendedDropdownElement.activeDropdown) {
            ExtendedDropdownElement._close(ExtendedDropdownElement.activeDropdown);
            ExtendedDropdownElement.activeDropdown = null;
        }
    }

    static _open(dropdown) {
        dropdown.bodyContainer.classList.add("apogee_configurableExtendedOpened");
    }

    static _close(dropdown) {
        dropdown.bodyContainer.classList.remove("apogee_configurableExtendedOpened");
    }

}

ExtendedDropdownElement.TYPE_NAME = "extendedDropdown";

ExtendedDropdownElement.initialized = false;
ExtendedDropdownElement.activeDropdown = null;