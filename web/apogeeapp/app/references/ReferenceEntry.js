
/** This class manages references for the web page.*/
apogeeapp.app.ReferenceEntry = class {
    
    constructor(referenceManager,referenceData,referenceTypeInfo) {
        this.id = apogeeapp.app.ReferenceManager._createId();
        this.referenceManager = referenceManager;

        this.url = referenceData.url;
        this.referenceTypeInfo = referenceTypeInfo;

        this.state = apogeeapp.app.banner.BANNER_TYPE_NONE;

        var nickname = referenceData.nickname;
        if((!nickname)||(nickname.length === 0)) nickname = this.createEntryNameFromUrl(this.url);
        this.nickname = nickname;

        this.treeEntry = null;
    }

    //---------------------------
    // references entry interface
    //---------------------------
    
    getReferenceManager() {
        return this.referenceManager;
    }

    getId() {
        return this.id;
    }
    
    getEntryType() {
        return this.referenceTypeInfo.REFERENCE_TYPE;
    }
    
    getTypeInfo() {
        return this.referenceTypeInfo;
    }

    getState() {
        return this.state;
    }

    /** This method loads the link onto the page. It returns a promise that
     * resolves when the link is loaded. */
    getTreeEntry(createIfMissing) {
        if((createIfMissing)&&(!this.treeEntry)) {
            this.treeEntry = this.instantiateTreeEntry();
        }
        return this.treeEntry;
    }

    getUrl() {
        return this.url;
    }

    getNickname() {
        return this.nickname;
    }

    ///////////////////////////////////////////////////////////////////////////

    /** This method loads the link onto the page. It returns a promise that
     * resolves when the reference is loaded. */
    //loadEntry()
    
    /** This method removes the reference. */
    //remove()
    
    
    ///////////////////////////////////////////////////////////////////////////
    
    /** This method returns the icon url for the component. */
    getIconUrl() {
        return apogeeapp.ui.getResourcePath(this.referenceTypeInfo.ENTRY_ICON_PATH);
    }

    /** This method loads the link onto the page. It returns a promise that
     * resolves when the link is loaded. */
    saveEntry() {
        var entryJson = {};
        entryJson.url = this.url;
        if(this.nickname != this.url) entryJson.nickname = this.nickname;
        entryJson.entryType = this.referenceTypeInfo.REFERENCE_TYPE;
        return entryJson;
    }

    //-------------------------
    // Entry specific management methods
    //-------------------------

    /** This method removes and reloads the link, returning a promise. */
    updateData(url,nickname) {

        //update nickname
        if(this.treeEntry) {
            if((!nickname)||(nickname.length === 0)) nickname = this.createEntryNameFromUrl(url);
            if(this.nickname != nickname) {
                this.nickname = nickname;
                this.treeEntry.setLabel(this.nickname);
            }
        }

        //update url
        if(this.url != url) {
            this.url = url;
            this.remove();
            var promise = this.loadEntry();
        }

        //if we didn't update, create a dummy promise
        if(!promise) promise = Promise.resolve("No url update");

        return promise;
    }



    //===================================
    // private methods
    //===================================

    createEntryNameFromUrl(url) {
        return url;
    }

    getElementId() {
        return apogeeapp.app.ReferenceEntry.ELEMENT_ID_BASE + this.id;
    }

    setClearState() {
        this.setState(apogeeapp.app.banner.BANNER_TYPE_NONE);
    }

    setError(errorMsg) {
        this.setState(apogeeapp.app.banner.BANNER_TYPE_ERROR,errorMsg);
    }

    setPendingState() {
        this.setState(apogeeapp.app.banner.BANNER_TYPE_PENDING,"loading");
    }

    setState(state,msg) {
        this.state = state;
        if(this.treeEntry) {
            apogeeapp.app.ReferenceManager.applyBannerState(this.treeEntry,this.state);
        }
        this.referenceManager.entryStatusChange(this);
    }

    instantiateTreeEntry() {
        var iconUrl = this.getIconUrl();
        var menuItemsCallback = () => this.getMenuItems();
        var treeEntry = new apogeeapp.ui.treecontrol.TreeEntry(this.nickname, iconUrl, null, menuItemsCallback, false);
        apogeeapp.app.ReferenceManager.applyBannerState(treeEntry,this.state);
        return treeEntry;
    }

    getMenuItems() {
        //menu items
        var menuItemList = [];

        //add the standard entries
        var itemInfo = {};
        itemInfo.title = "Update Reference";
        itemInfo.callback = () => apogeeapp.app.updatelinkseq.updateLink(this);
        menuItemList.push(itemInfo);

        //add the standard entries
        var itemInfo = {};
        itemInfo.title = "Remove Reference";
        itemInfo.callback = () => apogeeapp.app.updatelinkseq.removeLink(this);
        menuItemList.push(itemInfo);

        return menuItemList;
    }
}

//====================================
// Static Fields
//====================================


apogeeapp.app.ReferenceEntry.ELEMENT_ID_BASE = "__apogee_link_element_";

