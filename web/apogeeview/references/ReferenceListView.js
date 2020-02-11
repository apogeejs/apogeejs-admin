import {addLink} from "/apogeeview/commandseq/updatelinkseq.js";
import apogeeui from "/apogeeui/apogeeui.js";
import TreeEntry from "/apogeeui/treecontrol/TreeEntry.js";

import ReferenceEntryView from "/apogeeview/references/ReferenceEntryView.js";

export default class ReferenceListView {

    constructor(app, referenceList,displayInfo) {
        this.app = app;
        this.referenceList = referenceList;
        this.displayInfo = displayInfo;

        this.childViews = {};

        this._setTreeEntry();

        referenceList.addListener("created",eventInfo => this._onCreated(eventInfo));
        referenceList.addListener("deleted",eventInfo => this._onDeleted(eventInfo));

        this.referenceList.setViewStateCallback(() => this._getViewState());
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

    _getViewState() {
        if(this.treeEntry) {
            return {treeState: this.treeEntry.getState()};
        }
    }

    _setTreeEntry() {
        var iconUrl = apogeeui.getResourcePath(this.displayInfo.LIST_ICON_PATH);
        var menuItemCallback = () => this._getListMenuItems();
        this.treeEntry = new TreeEntry(this.displayInfo.LIST_NAME, iconUrl, null, menuItemCallback, false);

        let viewState = this.referenceList.getCachedViewState();
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