import ConfigurableElement from "/apogeeui/configurablepanel/ConfigurableElement.js";
import ConfigurablePanel from "/apogeeui/configurablepanel/ConfigurablePanel.js";
import ConfigurablePanelConstants from "/apogeeui/configurablepanel/ConfigurablePanelConstants.js";

/** This is a list element.
 * 
 * @class 
 */
export default class ListElement extends ConfigurableElement {
    constructor(form,elementInitData) {
        super(form,elementInitData,ConfigurableElement.CONTAINER_CLASS_NO_MARGIN);

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
        
        //initialize the list
        this.entryTypes = elementInitData.entryTypes;
        this.listEntries = [];
        this.elementContainer = null;
        this.listElement = this._createListContainer(); 
        containerElement.appendChild(this.listElement); 
        
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
                    let valueEntry = {};
                    valueEntry.key = elementObject.getKey();
                    valueEntry.value = elementValue;
                    listValue.push(valueEntry);
                }
            }
        });
        return listValue;
    }   

    /** This method updates the value for a given element. See the specific element
     * to see if this method is applicable. */
    setValue(listValue) {
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
                    if((valueEntry.key !== undefined)&&(valueEntry.value != undefined)) {
                        let entryTypeJson = this._lookupEntryTypeJson(valueEntry.key);
                        if(entryTypeJson) {
                            this._insertElement(entryTypeJson,valueEntry.value);
                        }
                        else {
                            console.log("List Entry key not found: " + valueEntry.key)
                        }
                    }
                    else {
                        console.log("Improperly formatted list value!");
                    }
                });
            }

            this._listValueChanged();
        }
        else {
            console.log("Value being set for list is not an array!");
        }
    }
    
    /** This will call the handler is this panel changes value. */
    addOnChange(onChange) {
        this.changeListener = onChange;
    }
    
    //===================================
    // internal Methods
    //==================================

    /** This looks up the entry type for a given key, based on the layout key. */
    _lookupEntryTypeJson(key) {
        return this.entryTypes.find( entryTypeJson => entryTypeJson.layout.key == key);
    }

    _listValueChanged() {
        if(this.changeListener) {
            this.changeListener(this.getValue(),this.getForm());
        }
    }
    
    //---------------------
    // List Management Functions
    //---------------------

    _createListContainer() {
        var listContainer = document.createElement("div");
        listContainer.className = "listElement_listContainer";

        //control bar = has "add" buttons
        let controlBar = document.createElement("div");
        controlBar.className = "listElement_listControlBar";
        this.entryTypes.forEach(entryTypeJson => {
            let addButton= document.createElement("button");
            addButton.className = "listElement_addButton";
            addButton.innerHTML = entryTypeJson.label;
            addButton.onclick = () => this._insertElement(entryTypeJson);
            controlBar.appendChild(addButton);
            controlBar.appendChild(document.createElement("br"));
        });
        listContainer.appendChild(controlBar);

        //element container - houses elements
        this.elementContainer = document.createElement("div");
        this.elementContainer.className = "listElement_elementContainer";
        listContainer.appendChild(this.elementContainer);

        return listContainer;
    }

    _insertElement(entryTypeJson,optionalValue) {
        let listEntryData = this._createListEntryData(entryTypeJson);
        this.listEntries.push(listEntryData);
        this.elementContainer.appendChild(listEntryData.element);

        //set value if applicable
        if(optionalValue !== undefined) {
            listEntryData.elementObject.setValue(optionalValue);
        }

        //add the change listener for this element
        if(listEntryData.elementObject.addOnChange) {
            listEntryData.elementObject.addOnChange( () => this._listValueChanged())
        }

        //nofity change
        this._listValueChanged();
    }

    _createListEntryData(entryTypeJson) {

        let listEntry = {};

        //create element object
        let layout = entryTypeJson.layout;
        if(!layout) {
            throw new Error("Layout not found for list entry!");
        }

        var type = layout.type;
        if(!type) {
            throw new Error("Type not found for list entry!");
        }
        
        var constructor = ConfigurablePanel.getTypeConstructor(type);
        if(!constructor) {
            throw new Error("Type not found for list element: " + type);
        }

        var elementObject = new constructor(this.getForm(),layout);

        listEntry.elementObject = elementObject;
        listEntry.element = this._createListDomElement(listEntry);

        return listEntry;
    }

    _createListDomElement(listEntry) {
        let contentElement = listEntry.elementObject.getElement();
        //list element
        let listElement = document.createElement("div");
        listElement.className = "listElement_itemElement";
        //control bar
        let controlBar = document.createElement("div");
        controlBar.className = "listElement_itemControlBar";
        let upButton = document.createElement("button");
        upButton.className = "listElement_itemButton";
        upButton.style.position = "absolute";
        upButton.style.top = "5px";
        upButton.style.left = "5px";
        upButton.innerHTML = "^";
        upButton.onclick = () => this._moveListEntryUp(listEntry);
        controlBar.appendChild(upButton);
   
        let downButton = document.createElement("button");
        downButton.className = "listElement_itemButton";
        downButton.style.position = "absolute";
        downButton.style.top = "30px";
        downButton.style.left = "5px";
        downButton.innerHTML = "v";
        downButton.onclick = () => this._moveListEntryDown(listEntry);
        controlBar.appendChild(downButton);
   
        let deleteButton = document.createElement("button");
        deleteButton.className = "listElement_itemButton";
        deleteButton.style.position = "absolute";
        deleteButton.style.top = "5px";
        deleteButton.style.left = "30px";
        deleteButton.innerHTML = "x";
        deleteButton.onclick = () => this._removeListEntry(listEntry);
        controlBar.appendChild(deleteButton);
   
        listElement.appendChild(controlBar);
        
        //content
        this.contentContainer = document.createElement("div");
        this.contentContainer.className = "listElement_itemContent";
        listElement.appendChild(this.contentContainer);
   
        this.contentContainer.appendChild(contentElement);
   
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
            this._listValueChanged();
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
            this._listValueChanged();
        }
    }

    _removeListEntry(entry) {
        let index = this.listEntries.indexOf(entry);
        //remove from listEntries
        this.listEntries.splice(index,1);
        //remove from DOM
        this.elementContainer.removeChild(entry.element);

        //nofity change
        this._listValueChanged();
    }
}

ListElement.TYPE_NAME = "list";



