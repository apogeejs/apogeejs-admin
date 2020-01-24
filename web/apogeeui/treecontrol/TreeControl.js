import apogeeui from "/apogeeui/apogeeui.js";

export default class TreeControl {

    constructor() {
        this.list = apogeeui.createElementWithClass("ul","visiui-tc-child-list",this.element); 
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
        apogeeui.removeAllChildren(this.list);
    }

}




