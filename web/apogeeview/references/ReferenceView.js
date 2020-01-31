import ReferenceListView from "/apogeeview/references/ReferenceListView";
import ReferenceEntryView from "/apogeeview/references/ReferenceEntryView";

export default class ReferenceView {

    constructor(referenceManager) {
        this.referenceManager = referenceManager;

        this.referenceListViews = {};
        let referenceLists = referencemanager.getReferenceLists();
        for(let entryType in referenceLists) {
            this.referenceListViews = this.createReferenceListView(entryType,referenceLists[entryType]);
        }

        referenceManager.addListener("created",target => this.onCreatedObject(target));
    }

    onCreateObject(target) {
        if(target instanceof ReferenceManager) {
            this.onUpdated();
        }
        else if(target instanceof ReferenceEntry) {
            this.onEntryAdded(target);

            target.addListener("deleted",referenceEntry => this.onEntryDeleted(referenceEntry));
        }
    }

    /** This returns the tree entry to display the reference entry for this reference manager. */
    getTreeEntry() {
        return this.referenceTreeEntry;
    }

    onUpdated() {
        //for now just do a stright state update
        this.updateState();
    }

    onEntryAdded(referenceEntry) {
        let referenceListEntry = this.referenceLists[referenceEntry.getEntryType()];
        if(referenceListEntry) {
            //add a view for this list entry
            let referenceEntryView = new ReferenceEntryView(referenceEntry);
            referenceListEntry.refEntries.push(referenceEntryView);
            
            //add the tree entry for this reference entry to its parent list tree entry
            let listTreeEntry = referenceListEntry.treeEntry;
            listTreeEntry.addChild(referenceEntryView.getTreeEntry());
        }
    }

    onEntryDeleted(referenceEntry) {
        //find the reference entry view
        let childStruct = this.referenceLists[referenceEntry.getEntryType()];
        if(childStruct) {
            let newReferenceList = [];
            let removedRefEntry;
            //lookup and remove the reference view for this entry
            childStruct.refEntries.forEach(referenceView => { 
                let listRefEntry = referenceView.getReferenceEntry();
                if(listRefEntry == referenceEntry) {
                    removedRefEntry = listRefEntry;
                }
                else {
                    newReferenceList.push(listRefEntry);
                }
            });

            //remove the tree entry for this ref
            if(removedRefEntry) {
                let refTreeEntry = removedRefEntry.getTreeEntry();
                let listTreeEntry = childStruct.treeEntry;
                listTreeEntry.removeChild(refTreeEntry)
            }
        }

        //should I tell the list tree entry it is being deleted?
        //should I disconnect the event listening for this to be deleted?
    }

    updateState() {
        //update the main tree entry state
        this.referenceTreeEntry.setBannerState(this.referenceManager.getState());
    }

    /** @private */
    instantiateTreeEntries() {
        var iconUrl = apogeeui.getResourcePath(REFERENCES_ICON_PATH);
        this.referenceTreeEntry = new TreeEntry("References", iconUrl, null, null, false);
        this.referenceTreeEntry.setBannerState(this.referenceManager.getState());
        
        //add child lists
        for(var childKey in this.referenceViewLists) {
            var referenceViewList = this.referenceViewLists[childKey];
            this.addListTreeEntry(referenceViewList.getTreeEntry());
        }
    }


    //==================================
    // Private Methods
    //==================================

    createReferenceListView(entryType,referenceList) {
        let listDisplayInfo = LIST_DISPLAY_INFO[entryType];
        if(!entryTypeInfo) {
            listDisplayInfo = apogeeutil.jsonCopy(DEFAULT_LIST_DISPLAY_INFO);
            //set the proper entry type, and use that for the list name too
            listDisplayInfo.REFERENCE_TYPE = entryType;
            listDisplayInfo.LIST_NAME = entryType;
        }
        return new ReferenceListView(referenceList,listDisplayInfo);
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
    //         this.fieldsUpdated("state");
    //     }
    // }

}

let REFERENCES_ICON_PATH = "/componentIcons/references.png";

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

