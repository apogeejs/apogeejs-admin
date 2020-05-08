import uiutil from "/apogeeui/uiutil.js";

export default class TreeControl {

    constructor() {
        this.list = uiutil.createElementWithClass("ul","visiui-tc-child-list",this.element); 
    }

    /** The outer DOM element */
    getElement() {
        return this.list;
    }

    setRootEntry(treeEntry) {
        this.clearRootEntry();
        this.list.appendChild(treeEntry.getElement());
    }

    clearRootEntry() {
        uiutil.removeAllChildren(this.list);
    }

}




