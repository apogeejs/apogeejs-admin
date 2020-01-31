import {addLink} from "/apogeeview/commandseq/updatelinkseq.js";

export default class ReferenceListView {

    constructor(referenceList,displayInfo) {
        this.referenceList = referenceList;
        this.displayInfo = displayInfo;

        this.treeEntry = this._createTreeEntry();
    }

    getDisplayInfo() {
        return this.displayInfo;
    }

    getTreeEntry() {
        return this.treeEntry;
    }

    //===============================================
    // Private Methods
    //===============================================

    _createTreeEntry() {
        var iconUrl = apogeeui.getResourcePath(this.displayInfo.LIST_ICON_PATH);
        var menuItemCallback = () => this._getListMenuItems();
        let treeEntry = new TreeEntry(this.displayInfo.LIST_NAME, iconUrl, null, menuItemCallback, false);
        treeEntry.setBannerState(this.referenceList.getState());
        return treeEntry;
    }

    /** @private */
    _getListMenuItems() {
        //menu items
        var menuItemList = [];

        //add the standard entries
        var itemInfo = {};
        itemInfo.title = this.displayInfo.ADD_ENTRY_TEXT;
        itemInfo.callback = () => addLink(this,this.displayInfo);
        menuItemList.push(itemInfo);
        
        return menuItemList;
    }
}