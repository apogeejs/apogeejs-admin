import apogeeui from "/apogeeui/apogeeui.js";
import TreeEntry from "/apogeeui/treecontrol/TreeEntry.js";
import ReferenceListView from "/apogeeview/references/ReferenceListView.js";

export default class ReferenceView {

    constructor(app, referenceManager) {
        this.app = app;
        this.referenceManager = referenceManager;

        //get the view state
        let viewState = this.referenceManager.getCachedViewState();
        let listViewStates = viewState ? viewState.lists : {};

        //create the tree entry
        this.treeEntry = this._createTreeEntry(viewState);

        //initailize the child list views
        this.referenceListViews = {};
        let referenceClassArray = referenceManager.getReferenceClassArray();
        referenceClassArray.forEach( referenceClass => {
            let entryType = referenceClass.REFERENCE_TYPE;
            let referenceListView = this._createReferenceListView(entryType,listViewStates[entryType]); 
            this.referenceListViews[entryType] = referenceListView;
            let childTreeEntry = referenceListView.getTreeEntry();
            this.treeEntry.addChild(childTreeEntry);
        });

        app.addListener("link_created",referenceEntry => this._onLinkCreated(referenceEntry));
        app.addListener("link_updated",referenceEntry => this._onLinkUpdated(referenceEntry));
        app.addListener("link_deleted",referenceEntry => this._onLinkDeleted(referenceEntry));

        this.referenceManager.setViewStateCallback(() => this.getViewState());
    }

    /** This returns the tree entry to display the reference entry for this reference manager. */
    getTreeEntry() {
        return this.treeEntry;
    }

    closeWorkspace() {
        //no action in ui for references
    }

    //-----------------------------------
    // Save methods
    //-----------------------------------
    
    getViewState() {
        let json = {};
        json.treeState = this.treeEntry.getState();
        json.lists = {};
        for(let entryType in this.referenceListViews) {
            let referenceList = this.referenceListViews[entryType];
            json.lists[entryType] = referenceList.getViewState();
        }
    }

    //==================================
    // Private Methods
    //==================================

    _onLinkCreated(referenceEntry) {
        let referenceList = this.referenceListViews[referenceEntry.getEntryType()];
        if(referenceList) {
            referenceList.onLinkCreated(referenceEntry);
        }
    }

    _onLinkUpdated(referenceEntry) {
        let referenceList = this.referenceListViews[referenceEntry.getEntryType()];
        if(referenceList) {
            referenceList.onLinkUpdated(referenceEntry);
        }
    }

    _onLinkDeleted(referenceEntry) {
        let referenceList = this.referenceListViews[referenceEntry.getEntryType()];
        referenceList.onLinkDeleted(referenceEntry);
    }

    /** @private */
    _createTreeEntry(viewState) {
        var iconUrl = apogeeui.getResourcePath(REFERENCES_ICON_PATH);
        let treeEntry = new TreeEntry("References", iconUrl, null, null, false);

        if((viewState)&&(viewState.treeState !== undefined)) {
            treeEntry.setState(viewState.treeState)
        }

        return treeEntry;
    }

    _createReferenceListView(entryType,viewState) {
        let listDisplayInfo = LIST_DISPLAY_INFO[entryType];
        if(!listDisplayInfo) {
            listDisplayInfo = apogeeutil.jsonCopy(DEFAULT_LIST_DISPLAY_INFO);
            //set the proper entry type, and use that for the list name too
            listDisplayInfo.REFERENCE_TYPE = entryType;
            listDisplayInfo.LIST_NAME = entryType;
        }
        return new ReferenceListView(this.app,entryType,listDisplayInfo,viewState);
    }


    
    // /** This method determines the overall reference state from the state of each list. 
    //  * @private */
    // processReferenceState() {
    //     //just check all entries for find state
    //     var hasError = false;
    //     var hasPending = false;
        
    //     for(var listType in this.referenceLists) {
    //         var referenceList = this.referenceLists[listType];
            
    //         var listState = referenceList.getState();
            
    //         if(listState == bannerConstants.BANNER_TYPE_ERROR) hasError = true;
    //         else if(listState == bannerConstants.BANNER_TYPE_PENDING) hasPending = true;
    //     }
            
    //     var newState;
    //     if(hasError) {
    //         newState = bannerConstants.BANNER_TYPE_ERROR;
    //     }
    //     else if(hasPending) {
    //         newState = bannerConstants.BANNER_TYPE_PENDING;
    //     }
    //     else {
    //         newState = bannerConstants.BANNER_TYPE_NONE;
    //     }
        
    //     if(this.state != newState) {
    //         this.state = newState;
    //         this.fieldUpdated("state");
    //     }
    // }

}



let REFERENCES_ICON_PATH = "/componentIcons/references.png";

/** This function gets the display info for a given list. */
function _getListDisplayInfo(entryType) {
    let listDisplayInfo = LIST_DISPLAY_INFO[entryType];
    if(!listDisplayInfo) {
        listDisplayInfo = apogeeutil.jsonCopy(DEFAULT_LIST_DISPLAY_INFO);
        //set the proper entry type, and use that for the list name too
        listDisplayInfo.REFERENCE_TYPE = entryType;
        listDisplayInfo.LIST_NAME = entryType;
    }
    return listDisplayInfo;
}

/** This is the UI definition data for the added reference lists.
 * This should be placed somewhere else to make it easier for people to 
 * add additional reference types.
 */
let LIST_DISPLAY_INFO = {

    "amd module": {
        "REFERENCE_TYPE": "amd module",
        "LIST_NAME": "Web Modules",
        "ADD_ENTRY_TEXT":"Add Web Module",
        "UPDATE_ENTRY_TEXT":"Update Web Module",
        "REMOVE_ENTRY_TEXT":"Remove Web Module",
        "LIST_ICON_PATH":"/componentIcons/folder.png",
        "ENTRY_ICON_PATH":"/componentIcons/webModule.png"
    },

    "css link": {
        "REFERENCE_TYPE": "css link",
        "LIST_NAME": "CSS Links",
        "ADD_ENTRY_TEXT":"Add CSS Link",
        "UPDATE_ENTRY_TEXT":"Update CSS Link",
        "REMOVE_ENTRY_TEXT":"Remove CSS Link",
        "LIST_ICON_PATH":"/componentIcons/folder.png",
        "ENTRY_ICON_PATH": "/componentIcons/cssLink.png"
    },

    "npm module": {
        "REFERENCE_TYPE": "npm module",
        "LIST_NAME": "NPM Modules",
        "ADD_ENTRY_TEXT":"Add NPM Module",
        "UPDATE_ENTRY_TEXT":"Update NPM Module",
        "REMOVE_ENTRY_TEXT":"Remove NPM Module",
        "LIST_ICON_PATH":"/componentIcons/folder.png",
        "ENTRY_ICON_PATH":"/componentIcons/module.png"
    },

    "es module": {
        "REFERENCE_TYPE": "es module",
        "LIST_NAME": "Web Modules",
        "ADD_ENTRY_TEXT":"Add ES Web Module",
        "UPDATE_ENTRY_TEXT":"Update Web Module",
        "REMOVE_ENTRY_TEXT":"Remove Web Module",
        "LIST_ICON_PATH":"/componentIcons/folder.png",
        "ENTRY_ICON_PATH":"/componentIcons/webModule.png"
    },

    "js link": {
        "REFERENCE_TYPE": "js link",
        "LIST_NAME": "JS Scripts",
        "ADD_ENTRY_TEXT":"Add JS Script Link",
        "UPDATE_ENTRY_TEXT":"Update JS Script Link",
        "REMOVE_ENTRY_TEXT":"Remove JS Script Link",
        "LIST_ICON_PATH":"/componentIcons/folder.png",
        "ENTRY_ICON_PATH":"/componentIcons/javascriptLink.png"
    }
}

//if this is used, replace the reference type and list name
let DEFAULT_LIST_DISPLAY_INFO = {
    "REFERENCE_TYPE": "PUT THE ENTRY TYPE HERE!",
    "LIST_NAME": "PUT THE ENTRY TYPE HERE!",
    "ADD_ENTRY_TEXT":"Add Link",
    "UPDATE_ENTRY_TEXT":"Update Link",
    "REMOVE_ENTRY_TEXT":"Remove Link",
    "LIST_ICON_PATH":"/componentIcons/folder.png",
    "ENTRY_ICON_PATH":"/componentIcons/javascriptLink.png"
}

