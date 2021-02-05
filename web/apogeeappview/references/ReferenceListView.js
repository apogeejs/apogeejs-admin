import {addLink} from "/apogeeview/commandseq/updatelinkseq.js";
import {uiutil,TreeEntry} from "/apogeeui/apogeeUiLib.js";

import ReferenceEntryView from "/apogeeappview/references/ReferenceEntryView.js";

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

    onLinkCreated(referenceEntry) {
        let referenceEntryView = new ReferenceEntryView(this.app,referenceEntry,this.displayInfo);
        this.childViews[referenceEntry.getId()] = referenceEntryView;
        this.treeEntry.addChild(referenceEntryView.getTreeEntry());
    }

    onLinkUpdated(referenceEntry) {
        let referenceEntryView = this.childViews[referenceEntry.getId()];
        if(referenceEntryView) {
            referenceEntryView.onLinkUpdated(referenceEntry);
        }
    }

    onLinkDeleted(referenceEntry) {
        let referenceEntryView = this.childViews[referenceEntry.getId()];
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
        var iconUrl = uiutil.getResourcePath(this.displayInfo.LIST_ICON_PATH);
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