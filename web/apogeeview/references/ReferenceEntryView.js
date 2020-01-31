import apogeeui from "/apogeeui/apogeeui.js";
import TreeEntry from "/apogeeui/treecontrol/TreeEntry.js";
import {updateLink, removeLink} from "/apogeeview/commandseq/updatelinkseq.js";

export default class ReferenceEntryView {

    constructor(referenceEntry,displayInfo) {
        this.referenceEntry = referenceEntry;
        this.displayInfo = displayInfo;
        this.treeEntry = this._createTreeEntry();

        referenceEntry.addListener("updated",referenceEntry => this.onUpdated(referenceEntry));
    }


/** This method loads the link onto the page. It returns a promise that
     * resolves when the link is loaded. */
    getTreeEntry() {
        return this.treeEntry;
    }

    onUpdated(referenceEntry) {
        this.referenceEntry = referenceEntry;
        let fieldsUpdated = referenceEntry.fieldsUpdated;

        if(fieldsUpdated.nickname) {
            this.treeEntry.setLabel(this.referenceEntry.getNickname());
        }

        if(fieldsUpdated.state) {
            this.treeEntry.setBannerState(this.referenceEntry.getState());
        }
    }

    //===========================================
    // Private Methods
    //===========================================

    _createTreeEntry() {
        var iconUrl = apogeeui.getResourcePath(this.displayInfo.ENTRY_ICON_PATH);
        var nickname = this.referenceEntry.getNickname();
        var menuItemsCallback = () => this._getMenuItems();

        var treeEntry = new TreeEntry(nickname, iconUrl, null, menuItemsCallback, false);
        treeEntry.setBannerState(this.referenceEntry.getState());
        return treeEntry;
    }

    _getMenuItems() {
        //menu items
        var menuItemList = [];

        //add the standard entries
        var itemInfo = {};
        itemInfo.title = this.displayInfo.UPDATE_ENTRY_TEXT;
        itemInfo.callback = () => updateLink(this);
        menuItemList.push(itemInfo);

        //add the standard entries
        var itemInfo = {};
        itemInfo.title = this.displayInfo.REMOVE_ENTRY_TEXT;
        itemInfo.callback = () => removeLink(this);
        menuItemList.push(itemInfo);

        return menuItemList;
    }



}