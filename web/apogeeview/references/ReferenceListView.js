import {addLink} from "/apogeeview/commandseq/updatelinkseq.js";
import apogeeui from "/apogeeui/apogeeui.js";
import TreeEntry from "/apogeeui/treecontrol/TreeEntry.js";

import ReferenceEntryView from "/apogeeView/references/ReferenceEntryView.js";

export default class ReferenceListView {

    constructor(app, referenceList,displayInfo) {
        this.app = app;
        this.referenceList = referenceList;
        this.displayInfo = displayInfo;

        this.childViews = {};

        this.treeEntry = this._createTreeEntry();

        referenceList.addListener("created",eventInfo => this._onCreated(eventInfo));
        referenceList.addListener("deleted",eventInfo => this._onDeleted(eventInfo));
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

    _onCreated(eventInfo) {
        let target = eventInfo.target;
        if(target.getTargetType() == "link") {
            let referenceEntryView = new ReferenceEntryView(this.app,target,this.displayInfo);
            this.childViews[target.getId()] = referenceEntryView;
            this.treeEntry.addChild(referenceEntryView.getTreeEntry());
        }
    }

    _onDeleted(eventInfo) {
        let target = eventInfo.target;
        if(target.getTargetType() == "link") {
            let referenceEntryView = this.childViews[target.getId()];
            this.treeEntry.removeChild(referenceEntryView.getTreeEntry());
        }
    }

    _createTreeEntry() {
        var iconUrl = apogeeui.getResourcePath(this.displayInfo.LIST_ICON_PATH);
        var menuItemCallback = () => this._getListMenuItems();
        let treeEntry = new TreeEntry(this.displayInfo.LIST_NAME, iconUrl, null, menuItemCallback, false);
        //treeEntry.setBannerState(this.referenceList.getState());
        return treeEntry;
    }

    /** @private */
    _getListMenuItems() {
        //menu items
        var menuItemList = [];

        //add the standard entries
        var itemInfo = {};
        itemInfo.title = this.displayInfo.ADD_ENTRY_TEXT;
        itemInfo.callback = () => addLink(this.app,this.displayInfo);
        menuItemList.push(itemInfo);
        
        return menuItemList;
    }
}