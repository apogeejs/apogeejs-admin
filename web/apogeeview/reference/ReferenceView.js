import {addLink} from "/apogeeview/commandseq/updatelinkseq.js";
import ReferenceEntryView from "/apogeeview/reference/ReferenceEntryView";

export default class ReferenceView {

    constructor(referenceManager) {
        this.referenceManager = referenceManager;
        this.referenceLists = _getReferenceListsInstance();
        this.instantiateTreeEntries();

        referenceManager.addListener("created",target => this.onCreatedObject(target));
        referenceManager.addListener("updated",referenceManager => this.onUpdated(referenceManager));
        referenceManager.addListener("deleted",referenceManager => this.onDeleted(referenceManager));
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

        //update the child tree entry states
        this.referenceLists.forEach(childStruct => {
            childStruct.state = this.referenceManager.getListState(childStruct.typeUiInfo.REFERENCE_TYPE)
        });
    }

    /** @private */
    instantiateTreeEntries() {
        var iconUrl = apogeeui.getResourcePath(REFERENCES_ICON_PATH);
        this.referenceTreeEntry = new TreeEntry("References", iconUrl, null, null, false);
        
        //add child lists
        for(var childKey in this.referenceLists) {
            var childViewStruct = this.referenceLists[childKey];
            this.addListTreeEntry(childViewStruct.treeEntry);
        }
        
        //set the state on the banner entry for all trees
        this.updateState();
    }

    addListTreeEntry(childViewStruct) {
        var typeUiInfo = childViewStruct.typeUiInfo;
        var iconUrl = apogeeui.getResourcePath(typeUiInfo.LIST_ICON_PATH);
        var menuItemCallback = () => this.getListMenuItems(typeUiInfo);
        var listTreeEntry = new TreeEntry(typeUiInfo.LIST_NAME, iconUrl, null, menuItemCallback, false);

        childViewStruct.treeEntry = listTreeEntry;
        this.referenceTreeEntry.addChild(listTreeEntry);
    }

    //==================================
    // Private Methods
    //==================================


    /** @private */
    getListMenuItems(typeUiInfo) {
        //menu items
        var menuItemList = [];

        //add the standard entries
        var itemInfo = {};
        itemInfo.title = typeUiInfo.ADD_ENTRY_TEXT;
        itemInfo.callback = () => addLink(this,typeUiInfo);
        menuItemList.push(itemInfo);
        
        return menuItemList;
    }

}

/** This function creates a child lists structure instance, which 
 * will hold the type info and the lists for entry info for that type. */
function _getReferenceListsInstance() {
    let childLists = {};
    TYPE_UI_INFO_ARRAY.forEach( typeUiInfo => {
        let childStruct = {};
        childStruct.typeUiInfo = typeUiInfo;
        childStruct.refEntries = [];
        childStruct.state = null;
        childStruct.treeEntry = null;
        chidlLists[typeUiInfo.REFERENCE_TYPE] = childStruct;
    });
    return childLists;
}

let REFERENCES_ICON_PATH = "/componentIcons/references.png";

//this is temporary
let TYPE_UI_INFO_ARRAY = [

    {
        "REFERENCE_TYPE": "amd module",
        "LIST_NAME": "Web Modules",
        "ADD_ENTRY_TEXT":"Add Web Module",
        "UPDATE_ENTRY_TEXT":"Update Web Module",
        "LIST_ICON_PATH":"/componentIcons/folder.png",
        "ENTRY_ICON_PATH":"/componentIcons/webModule.png"
    },

    {
        "REFERENCE_TYPE": "css link",
        "LIST_NAME": "CSS Links",
        "ADD_ENTRY_TEXT":"Add CSS Link",
        "UPDATE_ENTRY_TEXT":"Update CSS Link",
        "LIST_ICON_PATH":"/componentIcons/folder.png",
        "ENTRY_ICON_PATH": "/componentIcons/cssLink.png"
    },

    {
        "REFERENCE_TYPE": "npm module",
        "LIST_NAME": "NPM Modules",
        "ADD_ENTRY_TEXT":"Add NPM Module",
        "UPDATE_ENTRY_TEXT":"Update NPM Module",
        "LIST_ICON_PATH":"/componentIcons/folder.png",
        "ENTRY_ICON_PATH":"/componentIcons/module.png"
    },

    {
        "REFERENCE_TYPE": "es module",
        "LIST_NAME": "Web Modules",
        "ADD_ENTRY_TEXT":"Add ES Web Module",
        "UPDATE_ENTRY_TEXT":"Update Web Module",
        "LIST_ICON_PATH":"/componentIcons/folder.png",
        "ENTRY_ICON_PATH":"/componentIcons/webModule.png"
    },

    {
        "REFERENCE_TYPE": "js link",
        "LIST_NAME": "JS Scripts",
        "ADD_ENTRY_TEXT":"Add JS Script Link",
        "UPDATE_ENTRY_TEXT":"Update JS Script Link",
        "LIST_ICON_PATH":"/componentIcons/folder.png",
        "ENTRY_ICON_PATH":"/componentIcons/javascriptLink.png"
    }
]

