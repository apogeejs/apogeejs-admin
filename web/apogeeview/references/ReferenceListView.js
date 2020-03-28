import {addLink} from "/apogeeview/commandseq/updatelinkseq.js";
import apogeeui from "/apogeeui/apogeeui.js";
import TreeEntry from "/apogeeui/treecontrol/TreeEntry.js";

import ReferenceEntryView from "/apogeeview/references/ReferenceEntryView.js";

export default class ReferenceListView {

    constructor(app,referenceType,displayInfo,viewState) {
        this.app = app;
        this.referenceType = referenceType;
        this.displayInfo = displayInfo;

        this.childViews = {};

        this._setTreeEntry(viewState);
    }

    getDisplayInfo() {
        return this.displayInfo;
    }

    getTreeEntry() {
        return this.treeEntry;
    }

    onLinkCreated(eventInfo) {
        let referenceEntry = eventInfo.target;
        let referenceEntryView = new ReferenceEntryView(this.app,referenceEntry,this.displayInfo);
        this.childViews[referenceEntry.getId()] = referenceEntryView;
        this.treeEntry.addChild(referenceEntryView.getTreeEntry());
    }

    onLinkUpdated(eventInfo) {
        let referenceEntry = eventInfo.target;
        let referenceEntryView = this.childViews[referenceEntry.getId()];
        if(referenceEntryView) {
            referenceEntryView.onLinkUpdated(eventInfo);
        }
    }

    onLinkDeleted(eventInfo) {
        let referenceEntryView = this.childViews[eventInfo.targetId];
        if(referenceEntryView) {
            this.treeEntry.removeChild(referenceEntryView.getTreeEntry());
        }
    }

    getViewState() {
        if(this.treeEntry) {
            return {treeState: this.treeEntry.getState()};
        }
    }

    //===============================================
    // Private Methods
    //===============================================

    _setTreeEntry(viewState) {
        var iconUrl = apogeeui.getResourcePath(this.displayInfo.LIST_ICON_PATH);
        var menuItemCallback = () => this._getListMenuItems();
        this.treeEntry = new TreeEntry(this.displayInfo.LIST_NAME, iconUrl, null, menuItemCallback, false);

        if((viewState)&&(viewState.treeState !== undefined)) {
            this.treeEntry.setState(viewState.treeState)
        }
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