import ReferenceEntry from "/apogeeapp/references/ReferenceEntry.js";
import FieldObject from "/apogeeutil/FieldObject.js";

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
        this.referenceClassArray = this.app.getReferenceClassArray();

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

    getApp() {
        return this.app;
    }

    /** The change map lists the changes to the components and model. This will only be
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

    getReferenceClassArray() {
        return this.referenceClassArray;
    }

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
    load(workspaceManager,json,onReferencesLoaded) {

        let entryLoadedPromises = [];
        let entryLoadedPromise;
        
        //load the reference entries
        let oldReferenceEntryMap = this.getField("referenceEntryMap");
        let newReferenceEntryMap = apogeeutil.jsonCopy(oldReferenceEntryMap);
        if(json.refEntries) {

            //construct the load function
            let loadRefEntry = refEntryJson => {
                //create the entry (this does not actually load it)
                let referenceEntry = this.createEntry(refEntryJson);
                newRefEntryMap[entryKey] = referenceEntry;

                //load the entry - this will be asynchronous
                let loadEntryPromise = referenceEntry.loadEntry(workspaceManager);
                entryLoadedPromises.push(loadEntryPromise);
            }

            //load each entry
            json.entries.forEach(loadRefEntry);
        }

        //set the view state
        if(json.viewState !== undefined) {
            this.cachedViewState = json.viewState;
        }

        //handle the callback
        if(onReferencesLoaded) {
            if(entryLoadedPromises.length > 0) {
                entryLoadedPromise = Promise.all(entryLoadedPromises);
            }
            else {
                entryLoadedPromise = Promise.resolve();
            }

            //call on references loaded whether or not references succeeded
            entryLoadedPromise.catch(onReferencesLoaded).then(onReferencesLoaded).catch( errorMsg => {
                //we shouldnt' get an error here, but handle it just in case
                alert("Unknown error loading: " + errorMsg);
            })
        }

        //set the new reference EntryMap
        this.setField("referenceEntryMap",newReferenceEntryMap);
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

    /** This method creates a reference entry. This does nto however load it, to 
     * do that ReferenceEntry.loadEntry() method must be called.  */
    createEntry(entryCommandData) {
        let oldEntryMap = this.setField("referenceEntryMap");
        
        //check if we already have this reference entry. Do not re-load it if we do.
        let entryKey = this._getEntryKey(entryCommandData.type,entryCommandData.url);
        if(!oldEntryMap[entryKey]) {
            //load the entry
            let referenceEntryClass = this.referenceEntryClasses[entryCommandData.entryType];
            //we might want different error handling here
            if(!referenceEntryClass) throw new Error("Entry type nopt found: " + entryCommandData.entryType);
            let referenceEntry = new this.referenceEntryClass(entryCommandData);

            //update entry map
            let newEntryMap = {};
            Object.assign(newEntryMap,oldEntryMap);
            newEntryMap[entryKey] = referenceEntry;
            this.setField("referenceEntryMap",newEntryMap);

            //add a change map entry for this object
            this.workingChangeMap[referenceEntry.getId()] = {action: "referenceEntry_created", instance: referenceEntry};
        }

        return referenceEntry;
    }

    
    updateEntry(entryType,url,entryData) {
        let oldEntryKey = this._getEntryKey(entryType,url);
        let oldEntryMap = this.getField("referenceEntryMap");
        let oldReferenceEntry = oldEntryMap[oldEntryKey];
        if(oldReferenceEntry) {
            //create a mutable instance copy
            let newReferenceEntry = new ReferenceEntry(null,oldReferenceEntry);

            //update entry
            let url = (entryData.newUrl !== undefined) ? entryData.newUrl : referenceEntry.getUrl();
            let nickname = (entryData.newNickname !== undefined) ? entryData.newNickname : referenceEntry.getNickname();
            referenceEntry.updateData(workspaceManager,url,nickname);

            //update the entry map
            let newEntryKey = this._getEntryKey(entryType,url);
            let newEntryMap = apogeeutil.jsonCopy(oldEntryMap);
            if(newEntryKey != oldEntryKey) {
                delete newEntryMap[oldEntryKey];
            }
            newEntryMap[newEntryKey] = newReferenceEntry;
            this.setField("referenceEntryMap",newEntryMap);

            //update change map
            let oldChangeEntry = this.workingChangeMap[referenceEntry.getId()];
            if(oldChangeEntry.action == "referenceEntry_created") {
                //keep created action, update instance
                this.workingChangeMap[referenceEntry.getId()] = {action: "referenceEntry_created", instance: referenceEntry};
            }
            else {
                //add an updated action entry
                this.workingChangeMap[referenceEntry.getId()] = {action: "referenceEntry_updated", instance: referenceEntry};
            }
        }
        else {
            //entry not found
            throw new Error("Link entry to update not found: " + url);
        }
    }

    removeEntry(entryType,url) {
        let entryKey = _getEntryKey(entryType,url);
        let oldEntryMap = this.getField("referenceEntryMap");
        let referenceEntry = oldEntryMap[entryKey];
        if(referenceEntry) {
            //update entry map
            let newEntryMap = {};
            Object.assign(newEntryMap,oldEntryMap);
            delete newEntryMap[entryKey];
            this.setField("referenceEntryMap",newEntryMap);

            referenceEntry.remove();

            //add a change map entry for this object
            let oldChangeEntry = this.workingChangeMap[referenceEntry.getId()];
            if(oldChangeEntry.action == "referenceEntry_created") {
                this.workingChangeMap[referenceEntry.getId()] = {action: "transient", instance: referenceEntry};
            }
            else {
                this.workingChangeMap[referenceEntry.getId()] = {action: "referenceEntry_deleted", instance: referenceEntry};
            }
        }
        else {
            throw new Error("Reference entry not found: " + url);
        }

    }

    /** This method should be called when the parent is closed. It removes all links. */
    close() {
        let entryMap = this.getField("referenceEntryMap");
        for(let key in entryMap) {
            let referenceEntry = entryMap[key];
            referenceEntry.remove();
        }
    }

    lookupEntry(entryType,url) {
        let entryKey = _getEntryKey(entryType,url);
        let entryMap = this.getField("referenceEntryMap");
        return entryMap[entryKey];
    }

    //=================================
    // Private
    //=================================

    _getEntryKey(entryType,url) {
        return entryType + "|"  + url;
    }

    
}