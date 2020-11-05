import ConfigurableElement from "/apogeeui/configurablepanel/ConfigurableElement.js";
import ConfigurablePanel from "/apogeeui/configurablepanel/ConfigurablePanel.js";
import ConfigurablePanelConstants from "/apogeeui/configurablepanel/ConfigurablePanelConstants.js";
import uiutil from "/apogeeui/uiutil.js";

/** This is a list element.
 * 
 * @class 
 */
export default class ListElement extends ConfigurableElement {
    constructor(form,elementInitData) {
        super(form,elementInitData);

        var containerElement = this.getElement();

        this.upUrl = uiutil.getResourcePath("/up_black.png");
        this.downUrl = uiutil.getResourcePath("/down_black.png");
        this.closeUrl = uiutil.getResourcePath("/close_black.png");
        
        //label
        let labelElement = this.getLabelElement(elementInitData);
        if(labelElement) {
            containerElement.appendChild(labelElement);
        }
        
        //initialize the list
        if(elementInitData.entryType) {
            this.entryTypes = [elementInitData.entryType];
            this.isMultitypeList = false;
        }
        else if(elementInitData.entryTypes) {
            this.entryTypes = elementInitData.entryTypes;
            this.isMultitypeList = true;
        }
        
        this.listEntries = [];
        this.elementContainer = null;
        this.listElement = this._createListContainer(); 
        containerElement.appendChild(this.listElement); 

        this.inheritValueMap = {};
        
        this._postInstantiateInit(elementInitData);
    }
    
    /** This method returns value for this given element, if applicable. If not applicable
     * this method returns undefined. */
    getValue() {
        var listValue = [];
        this.listEntries.forEach(listEntry => {
            let elementObject = listEntry.elementObject;
            if(elementObject.getState() != ConfigurablePanelConstants.STATE_INACTIVE) {
                var elementValue = elementObject.getValue();
                if(elementValue !== undefined) {
                    //we return the values differently for multilists and non-multitype lists
                    if(this.isMultitypeList) {
                        let valueEntry = {};
                        valueEntry.key = elementObject.getKey();
                        valueEntry.value = elementValue;
                        listValue.push(valueEntry);
                    }
                    else {
                        listValue.push(elementValue);
                    }
                }
            }
        });
        return listValue;
    }   

    /** This overrides the get meta element to calculate it on the fly. Because of list elements,
     * the meta value depends on the content. */
    getMeta() {
        if(this.meta) {
            //handle an empty list
            if(this.listEntries.length === 0) return null;

            let fullMeta = apogeeutil.jsonCopy(this.meta);
            if(this.isMultiTypeList) {
                let childMeta = {};
                this.listEntries.forEach( listEntryInfo => {
                    let childEntryMeta = listEntryInfo.elementObject.getMeta();
                    let childKey = listEntryInfo.elementObject.getKey();
                    if((childEntryMeta)&&(childKey)) {
                        childMeta[childKey] = childEntryMeta;
                    }
                })
                fullMeta.childMeta = childMeta;
            }
            else {
                let listEntryInfo = this.listEntries[0];
                let childEntryMeta = listEntryInfo.elementObject.getMeta();
                if(childEntryMeta) {
                    fullMeta.entryMeta = childEntryMeta;
                }
            }

            return fullMeta;
        }
        else {
            return null;
        }
    }

    /** We override the standard giveFocus method to pass it on to a child element. */
    giveFocus() {
        for(let i = 0; i < this.listEntries.length; i++) {
            let listEntry = this.listEntries[i];
            if((listEntry.elementObject)&&(listEntry.elementObject.giveFocus())) return true;
        }
        return false;
    }
    
    //===================================
    // protected Methods
    //==================================

    /** This method updates the value for a given element. See the specific element
     * to see if this method is applicable. */
    setValueImpl(listValue) {
        if(Array.isArray(listValue)) {
            let currentValue = this.getValue();
            //update values if the list changes
            //first change event either way (we may later change the general policy on this)
            if(!apogeeutil.jsonEquals(currentValue,listValue)) {

                //remove the old list entries
                while(this.listEntries.length > 0 ) {
                    this._removeListEntry(this.listEntries[0]);
                }

                //create a new entry for each value
                listValue.forEach( (valueEntry,index) => {
                    if(this.isMultitypeList) {
                        if((valueEntry.key !== undefined)&&(valueEntry.value != undefined)) {
                            let entryTypeJson = this._lookupEntryTypeJson(valueEntry.key);
                            if(entryTypeJson) {
                                this._insertElement(entryTypeJson,valueEntry.value);
                            }
                            else {
                                console.log("List Entry key not found: " + valueEntry.key);
                            }
                        }
                        else {
                            console.log("Improperly formatted list value for multitypelist!");
                        }
                    }
                    else {
                        let entryTypeJson = this.entryTypes[0];
                        if(entryTypeJson) {
                            this._insertElement(entryTypeJson,valueEntry);
                        }
                        else {
                            console.log("NO entry type set!");
                        }
                    }
                });
            }
        }
        else {
            console.log("Value being set for list is not an array!");
        }
    }

    /** This function is used to inherit a child value from a parent value.
     * It passes all values to any contained list element that has an inherit method. */
    inherit(childKey,parentValue) {
        //pass to any child entries applicable
        this.listEntries.forEach( listEntry => {
            let childElement = listEntry.elementObject;
            if(childElement.inherit) {
                childElement.inherit(childKey,parentValue);
            }
        }); 

        //store the inherit value for when other entries created
        this.inheritValueMap[childKey] = parentValue;
    }

    destroy() {
        super.destroy();

        this.entryTypes = [];
        this.listEntries.forEach( listEntry => {
            listEntry.elementObject.destroy();
        })
        this.listEntries = [];
    }

    //===================================
    // internal Methods
    //==================================

    /** This looks up the entry type for a given key, based on the layout key. */
    _lookupEntryTypeJson(key) {
        return this.entryTypes.find( entryTypeJson => entryTypeJson.layout.key == key);
    }
    
    //---------------------
    // List Management Functions
    //---------------------

    _createListContainer() {
        var listContainer = document.createElement("div");
        listContainer.className = "listElement_listContainer";

        //element container - houses elements
        let elementContainerWrapper = document.createElement("div");
        elementContainerWrapper.className = "listElement_elementContainerWrapper";
        listContainer.appendChild(elementContainerWrapper);

        this.elementContainer = document.createElement("div");
        this.elementContainer.className = "listElement_elementContainer";
        elementContainerWrapper.appendChild(this.elementContainer);

        //control bar = has "add" buttons
        let controlBar = document.createElement("div");
        controlBar.className = "listElement_listControlBar";
        this.entryTypes.forEach(entryTypeJson => {
            let addButton= document.createElement("button");
            addButton.className = "listElement_addButton apogee_configurableElement_hideSelection";
            let labelText = entryTypeJson.label ? "+ "+ entryTypeJson.label : "+";
            addButton.innerHTML = labelText;
            addButton.onclick = () => {
                this._insertElement(entryTypeJson);
                this.inputDone();
            }
            controlBar.appendChild(addButton);
            let lineBreak = document.createElement("br");
            lineBreak.className = "apogee_configurableElement_hideSelection";
            controlBar.appendChild(lineBreak);
        });
        listContainer.appendChild(controlBar);

        return listContainer;
    }

    _insertElement(entryTypeJson,optionalValue) {
        let listEntryData = this._createListEntryData(entryTypeJson);
        this.listEntries.push(listEntryData);
        this.elementContainer.appendChild(listEntryData.element);

        //set value if set in config
        if(optionalValue !== undefined) {
            listEntryData.elementObject.setValue(optionalValue);
        }

        //set value if set from inherit
        for(let key in this.inheritValueMap) {
            let childElement = listEntryData.elementObject;
            if(childElement.inherit) {
                childElement.inherit(key,this.inheritValueMap[key]);
            }
        }

        //add the change listener for this element
        listEntryData.elementObject.addOnChange( () => this.valueChanged());
        listEntryData.elementObject.addOnInput( () => this.inputDone());
        
        //nofityof value change
        this.valueChanged();
        
    }

    _createListEntryData(entryTypeJson) {

        let listEntry = {};

        //create element object

        let elementInitData = entryTypeJson.layout;
        if(!elementInitData) {
            throw new Error("Layout not found for list entry!");
        }

        var elementObject = ConfigurablePanel.instantiateConfigurableType(this.getForm(),elementInitData);

        if(elementObject instanceof ConfigurableElement) {
            elementObject.populateSelectors();
            
            listEntry.elementObject = elementObject;
            listEntry.element = this._createListDomElement(listEntry);
        }
        else {
            throw new Error("Only configurable elements cah be set as entry types for a list.");
        }

        return listEntry;
    }

    _createListDomElement(listEntry) {
        let contentElement = listEntry.elementObject.getElement();

        //list element
        let listElement = document.createElement("div");
        listElement.className = "listElement_itemElement";

        //content
        this.contentContainer = document.createElement("div");
        this.contentContainer.className = "listElement_itemContent";
        listElement.appendChild(this.contentContainer);

        //control bar
        let controlBar = document.createElement("div");
        controlBar.className = "listElement_itemControlBar";
        let upButton = document.createElement("img");
        upButton.src = this.upUrl;
        upButton.className = "listElement_itemButton apogee_configurableElement_hideSelection";
        upButton.style.position = "absolute";
        upButton.style.top = "2px";
        upButton.style.left = "2px";
        upButton.onclick = () => {
            this._moveListEntryUp(listEntry);
            this.inputDone();
        }
        controlBar.appendChild(upButton);
   
        let downButton = document.createElement("img");
        downButton.src = this.downUrl;
        downButton.className = "listElement_itemButton apogee_configurableElement_hideSelection";
        downButton.style.position = "absolute";
        downButton.style.top = "15px";
        downButton.style.left = "2px";
        downButton.onclick = () => {
            this._moveListEntryDown(listEntry);
            this.inputDone();
        }
        controlBar.appendChild(downButton);
   
        let deleteButton = document.createElement("img");
        deleteButton.src = this.closeUrl;
        deleteButton.className = "listElement_itemButton apogee_configurableElement_hideSelection";
        deleteButton.style.position = "absolute";
        deleteButton.style.top = "2px";
        deleteButton.style.left = "20px";
        deleteButton.onclick = () => {
            this._removeListEntry(listEntry);
            this.inputDone();
        }
        controlBar.appendChild(deleteButton);
        
        this.contentContainer.appendChild(contentElement);
        listElement.appendChild(controlBar);
   
        return listElement;
    }

    //---------------------
    // List Element Action Functions
    //---------------------
    
    _moveListEntryUp(entry) {
        let index = this.listEntries.indexOf(entry);
        if(index > 0) {
            //update list position
            let previousEntry = this.listEntries[index-1];
            this.listEntries.splice(index-1,2,entry,previousEntry);
            //update dom positions 1 - using dom functions
            this.elementContainer.insertBefore(entry.element,entry.element.previousSibling);
            
            //update dom positions 2 - reinsert all (maybe this is safer?)
            //while(this.elementContainer.hasChildNodes()) this.elementContainer.removeChild(this.elementContainer.firstChild);
            //listEntries.forEach( childEntry => this.elementContainer.appendChild(childEntry.element));

            //nofity change
            this.valueChanged();
        }
    }

    _moveListEntryDown(entry) {
        let index = this.listEntries.indexOf(entry);
        if(index < this.listEntries.length - 1) {
            //update list position
            let nextEntry = this.listEntries[index+1];
            this.listEntries.splice(index,2,nextEntry,entry);
            //update dom positions
            this.elementContainer.insertBefore(entry.element.nextSibling,entry.element);

            //nofity change
            this.valueChanged();
        }
    }

    _removeListEntry(entry) {
        let index = this.listEntries.indexOf(entry);
        //remove from listEntries
        this.listEntries.splice(index,1);
        //remove from DOM
        this.elementContainer.removeChild(entry.element);

        //nofity change
        this.valueChanged();
    }
}

ListElement.TYPE_NAME = "list";



