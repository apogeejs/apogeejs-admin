import apogeeui from "/apogeeui/apogeeui.js";
import TreeEntry from "/apogeeui/treecontrol/TreeEntry.js";
import {updateLink, removeLink} from "/apogeeview/commandseq/updatelinkseq.js";

export default class ReferenceEntryView {

    constructor(app, referenceEntry,displayInfo) {
        this.app = app;
        this.referenceEntry = referenceEntry;
        this.displayInfo = displayInfo;
        this.treeEntry = this._createTreeEntry();

        referenceEntry.addListener("updated",eventInfo => this._onUpdated(eventInfo));
    }


/** This method loads the link onto the page. It returns a promise that
     * resolves when the link is loaded. */
    getTreeEntry() {
        return this.treeEntry;
    }

    //===========================================
    // Private Methods
    //===========================================

    _onUpdated(eventInfo) {
        let target = eventInfo.target;
        if(target.getTargetType() == "link") {
            //make sure this is the right entry 
            if(target.getId() != this.referenceEntry.getId()) return;
            
            this.referenceEntry = target;
            if(target.isFieldUpdated("nickname")) {
                this.treeEntry.setLabel(this.referenceEntry.getLabel());
            }
    
            if(target.isFieldUpdated("state")) {
                this.treeEntry.setBannerState(this.referenceEntry.getState());
            }
        }
    }

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
        itemInfo.callback = () => updateLink(this.app,this.referenceEntry,this.displayInfo);
        menuItemList.push(itemInfo);

        //add the standard entries
        var itemInfo = {};
        itemInfo.title = this.displayInfo.REMOVE_ENTRY_TEXT;
        itemInfo.callback = () => removeLink(this.app,this.referenceEntry,this.displayInfo);
        menuItemList.push(itemInfo);

        return menuItemList;
    }



}