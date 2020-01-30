import apogeeui from "/apogeeui/apogeeui.js";
import TreeEntry from "/apogeeui/treecontrol/TreeEntry.js";
import {updateLink, removeLink} from "/apogeeview/commandseq/updatelinkseq.js";

export default class ReferenceEntryView {

    constructor(referenceEntry,typeUiInfo) {
        this.referenceEntry = referenceEntry;
        this.typeUiInfo = typeUiInfo;
        this.treeEntry = this.instantiateTreeEntry();

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

    instantiateTreeEntry() {
        var iconUrl = this.getIconUrl();
        var nickname = this.referenceEntry.getNickname();
        var menuItemsCallback = () => this.getMenuItems();

        var treeEntry = new TreeEntry(nickname, iconUrl, null, menuItemsCallback, false);
        treeEntry.setBannerState(this.referenceEntry.getState());
        return treeEntry;
    }

    getMenuItems() {
        //menu items
        var menuItemList = [];

        //add the standard entries
        var itemInfo = {};
        itemInfo.title = "Update Reference";
        itemInfo.callback = () => updateLink(this);
        menuItemList.push(itemInfo);

        //add the standard entries
        var itemInfo = {};
        itemInfo.title = "Remove Reference";
        itemInfo.callback = () => removeLink(this);
        menuItemList.push(itemInfo);

        return menuItemList;
    }

    /** This method returns the icon url for the component. */
    getIconUrl() {
        return apogeeui.getResourcePath(this.typeUiInfo.ENTRY_ICON_PATH);
    }

}