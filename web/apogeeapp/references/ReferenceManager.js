
import {FieldObject} from "/apogeeutil/apogeeBaseLib.js";

/** This class manages links and other reference entries, loading the references and
 * creating the UI tree elements for display of the references.
 * 
 * Any links needed for the page are managed externally by the Link Loader, which
 * allows multiple users to request the same link.
 */
export default class ReferenceManager extends FieldObject {

    constructor(app,instanceToCopy,keepUpdatedFixed) {
        super("referenceManager",instanceToCopy,keepUpdatedFixed);

        this.app = app;
        
        let referenceClassArray = ReferenceManager.getReferenceClassArray();
        this.referenceClassMap = {};
        referenceClassArray.forEach(referenceClass => {
            this.referenceClassMap[referenceClass.REFERENCE_TYPE] = referenceClass;
        })

        //==============
        //Fields
        //==============
        //Initailize these if this is a new instance
        if(!instanceToCopy) {
            //create empty reference map
            this.setField("referenceEntryMap",{});
        }

        //==============
        //Working variables
        //==============
        this.viewStateCallback = null;
        this.cachedViewState = null;

        this.workingChangeMap = {};

        //add a change map entry for this object
        this.workingChangeMap[this.getId()] = {action: instanceToCopy ? "referenceManager_updated" : "referenceManager_created", instance: this};
    }

    //====================================
    // Methods
    //====================================

    getApp() {
        return this.app;
    }

    //====================================
    // Reference Lifecycle Methods
    //====================================

    
    /** This method creates a reference entry. This does nto however load it, to 
     * do that ReferenceEntry.loadEntry() method must be called.  */
    createEntry(entryCommandData) {
        let oldEntryMap = this.getField("referenceEntryMap");
        //check if we already have this reference entry. Do not re-load it if we do.
        let entryKey = this._getEntryKey(entryCommandData.entryType,entryCommandData.url);
        let referenceEntry = oldEntryMap[entryKey];
        if(!referenceEntry) {
            //load the entry
            let referenceEntryClass = this.referenceClassMap[entryCommandData.entryType];
            if(!referenceEntryClass) throw new Error("Entry type nopt found: " + entryCommandData.entryType);
            referenceEntry = new referenceEntryClass(entryCommandData);
            this.registerRefEntry(referenceEntry);
        }
        return referenceEntry;
    }

    // updateEntry(entryType,url,entryData) {
    //     let refEntryId = this.lookupRefEntryId(entryType,url);
    //     if(!refEntryId) throw new Error("Reference entry not found. " + entryType + ":" + url);

    //     let referenceEntry = this.getMutableRefEntryById(refEntryId);
    //     if(!referenceEntry) throw new Error("Reference entry not found. refEntryId: " + refEntryId);

    //     //update entry
    //     let targetUrl = (entryData.newUrl !== undefined) ? entryData.newUrl : referenceEntry.getUrl();
    //     let targetNickname = (entryData.newNickname !== undefined) ? entryData.newNickname : referenceEntry.getNickname();
    //     referenceEntry.updateData(this.workspaceManager,targetUrl,targetNickname);

    //     this.registerRefEntry(referenceEntry);

    // }

    // removeEntry(entryType,url) {
    //     let refEntryId = this.lookupRefEntryId(entryType,url);
    //     if(!refEntryId) throw new Error("Reference entry not found. " + entryType + ":" + url);

    //     let referenceEntry = getMutableRefEntryById(refEntryId);
    //     if(!referenceEntry) throw new Error("Reference entry not found. refEntryId: " + refEntryId);

    //     referenceEntry.remove();

    //     this.unregisterRefEntry(referenceEntry);

    // }

    /** This method should be called when the parent is closed. It removes all links. */
    close() {
        let entryMap = this.getField("referenceEntryMap");
        for(let key in entryMap) {
            let referenceEntry = entryMap[key];
            referenceEntry.removeEntry();
        }
    }

    //====================================
    // Reference Owner Functionality
    //====================================

    /** The change map lists the changes to the referenceEntrys and model. This will only be
     * valid when the ReferenceManager is unlocked */
    getChangeMap() {
        return this.workingChangeMap;
    }

    /** This method locks the reference manager and all reference entries. */
    lockAll() {
        this.workingChangeMap = null;

        let referenceEntryMap = this.getField("referenceEntryMap");
        for(let id in referenceEntryMap) {
            referenceEntryMap[id].lock();
        }
        this.lock();
    }

    getRefEntryById(refEntryId) {
        return this.getField("referenceEntryMap")[refEntryId];
    }

    /** This method gets a mutable ref entry. If the current ref entry is mutable it returns
     * that. If not, it creates a mutable copy and registers the new mutable copy. It returns
     * null if the reference entry ID is not found. */
    getMutableRefEntryById(refEntryId) {
        let oldRefEntryMap = this.getField("referenceEntryMap");
        var oldRefEntry = oldRefEntryMap[refEntryId];
        if(oldRefEntry) {
            if(oldRefEntry.getIsLocked()) {
                //create an unlocked instance of the ref entry
                let newRefEntry = new oldRefEntry.constructor(null,oldRefEntry);

                //register this instance
                this.registerRefEntry(newRefEntry);

                return newRefEntry;
            }
            else {
                return oldRefEntry;
            }
        }
        else {
            return null;
        }
    }

    /** This method returns the ref entry ID for a given entry type and url. */
    lookupRefEntryId(entryType,url) {
        let urlMap = this.getField("urlMap");
        let entryKey = this._getEntryKey(entryType,url)
        return urlMap[entryKey];
    }

    /** This method returns the ref entry for a given entry type and url. */
    lookupEntry(entryType,url) {
        let refEntryId = this.lookupRefEntryId(entryType,url);
        if(refEntryId) {
            return this.getRefEntryById(refEntryId);
        }
        else {
            return null;
        }
    }

    /** This method stores the reference entry instance. It must be called when a
     * new reference entry is created and when a reference entry instance is replaced. */
    registerRefEntry(referenceEntry) {
        let refEntryId = referenceEntry.getId();
        let oldRefEntryMap = this.getField("referenceEntryMap");
        let oldRefEntry = oldRefEntryMap[refEntryId];

        //create the udpated map
        let newRefEntryMap = {};
        Object.assign(newRefEntryMap,oldRefEntryMap);
        newRefEntryMap[refEntryId] = referenceEntry;
        this.setField("referenceEntryMap",newRefEntryMap);

        //update the url map for this entry
        let oldUrlMap = this.getField("urlMap");
        let newUrlMap = {};
        Object.assign(newUrlMap,oldUrlMap);
        let newUrlKey = this._getEntryKey(referenceEntry.getEntryType(),referenceEntry.getUrl());
        if(oldRefEntry) {
            let oldUrlKey = this._getEntryKey(referenceEntry.getEntryType(),referenceEntry.getUrl());
            //delete the old entry id the key changed
            if(oldUrlKey != newUrlKey) {
                delete newUrlMap[oldUrlKey];
            }
        }
        newUrlMap[newUrlKey] = refEntryId;
        this.setField("urlMap",newUrlMap);

        //update the change map
        let oldChangeEntry = this.workingChangeMap[refEntryId];  
        let newAction; 
        if(oldChangeEntry) {
            //we will assume the events come in order
            //the only scenarios assuming order are:
            //created then updated => keep action as created
            //updated then updated => no change
            //we will just update the referenceEntry
            newAction = oldChangeEntry.action;
        }
        else {
            //new action will depend on if we have the ref entry in our old ref entry map
            newAction = oldRefEntryMap[refEntryId] ? "referenceEntry_updated" : "referenceEntry_created"; 
        }
        this.workingChangeMap[refEntryId] = {action: newAction, instance: referenceEntry};
    }

    /** This method takes the local actions needed when a referenceEntry is deleted. It is called internally. */
    unregisterRefEntry(referenceEntry) {
        let refEntryId = referenceEntry.getId();

        //update the referenceEntry map
        let oldRefEntryMap = this.getField("referenceEntryMap");
        let newRefEntryMap = {};
        Object.assign(newRefEntryMap,oldRefEntryMap);
        //remove the given referenceEntry
        delete newRefEntryMap[refEntryId];
        //save the updated map
        this.setField("referenceEntryMap",newRefEntryMap);

        //update the url map
        let oldUrlMap = this.getField("urlMap");
        let newUrlMap = {};
        Object.assign(newUrlMap,oldUrlMap);
        for(let urlKey in newUrlMap) {
            let urlRefEntryId = newUrlMap[urlKey];
            if(urlRefEntryId == refEntryId) {
                delete newUrlMap[urlKey];
            }
        }
        this.setField("urlMap",newUrlMap);

        //update the change map
        let oldChangeEntry = this.workingChangeMap[refEntryId];
        let newChangeEntry;
        if(oldChangeEntry) {
            //handle the case of an existing change entry
            if(oldChangeEntry.action == "referenceEntry_created") {
                //referenceEntry created and deleted during this action - flag it as transient
                newChangeEntry = {action: "transient", instance: referenceEntry};
            }
            else if(oldChangeEntry.action == "referenceEntry_updated") {
                newChangeEntry = {action: "referenceEntry_deleted", instance: referenceEntry};
            }
            else {
                //this shouldn't happen. If it does there is no change to the action
                //we will just update the referenceEntry
                newChangeEntry = {action: oldChangeEntry.action, instance: referenceEntry};
            }
        }
        else {
            //add a new change entry
            newChangeEntry = {action: "referenceEntry_deleted", instance: referenceEntry};
        }
        this.workingChangeMap[refEntryId] = newChangeEntry;  
    }


    //====================================
    // open and save methods
    //====================================

    setViewStateCallback(viewStateCallback) {
        this.viewStateCallback = viewStateCallback;
    }

    getCachedViewState() {
        return this.cachedViewState;
    }

    /** This method opens the reference entries. An on references load callback 
     * can be passed and it will be a called when all references are loaded, with the
     * load completion command result for each. The return value for this function is the
     * initial command result for starting the refernce loading.
     */
    load(workspaceManager,json) {

        let entryLoadedPromises = [];
        
        //load the reference entries
        if(json.refEntries) {

            //construct the load function
            let loadRefEntry = refEntryJson => {
                //create the entry (this does not actually load it)
                let referenceEntry = this.createEntry(refEntryJson);

                //load the entry - this will be asynchronous
                let loadEntryPromise = referenceEntry.loadEntry(workspaceManager);
                entryLoadedPromises.push(loadEntryPromise);
            }

            //load each entry
            json.refEntries.forEach(loadRefEntry);
        }

        //set the view state
        if(json.viewState !== undefined) {
            this.cachedViewState = json.viewState;
        }

        //create the return promise
        let referencesLoadedPromise;
        if(entryLoadedPromises.length > 0) {
            referencesLoadedPromise = Promise.all(entryLoadedPromises);
        }
        else {
            referencesLoadedPromise = Promise.resolve();
        }
        return referencesLoadedPromise;
    }

    /** This method opens the reference entries, from the structure returned from
     * the save call. It returns a promise that
     * resolves when all entries are loaded. 
     */
    toJson() {
        let json = {};
        let entryMap = this.getField("referenceEntryMap");
        let entriesJson = [];
        for(let key in entryMap) {
            let refEntry = entryMap[key];
            entriesJson.push(refEntry.toJson());
        }
        if(entriesJson.length > 0) {
            json.refEntries = entriesJson;
        }
    
        //set the view state
        if(this.viewStateCallback) {
            this.cachedViewState = this.viewStateCallback();
            if(this.cachedViewState) json.viewState = this.cachedViewState;
        }

        return json;
    }

    //=================================
    // Private
    //=================================

    _getEntryKey(entryType,url) {
        return entryType + "|"  + url;
    }

    /** This method returns the reference entry type classes which will be used in the app. */
    static getReferenceClassArray() {
        return ReferenceManager.referenceClassArray;
    }

    /** This method sets the reference entry type classes. */
    static setReferenceClassArray(referenceClassArray) {
        ReferenceManager.referenceClassArray = referenceClassArray
    }
    
}