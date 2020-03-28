import ReferenceList from "/apogeeapp/references/ReferenceList.js";
import ReferenceEntry from "./ReferenceEntry";

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
    }

    getApp() {
        return this.app;
    }

    getReferenceClassArray() {
        return this.referenceClassArray();
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

        let entryCreateCommandResults = [];
        let entryLoadedPromises = [];
        let entryLoadedPromise;
        
        //load the reference entries
        let oldReferenceEntryMap = this.getField("referenceEntryMap");
        let newReferenceEntryMap = apogeeutil.jsonCopy(oldReferenceEntryMap);
        if(json.refEntries) {

            //construct the load function
            let loadRefEntry = refEntryJson => {
                //create the entry (this does not actually load it)
                let commandResult = this.createEntry(refEntryJson);
                entryCreateCommandResults.push(commandResult);

                //load the entry
                if(commandResult.target) {
                    //place the entry in the entry map
                    let referenceEntry = commandResult.target;
                    newRefEntryMap[entryKey] = referenceEntry;

                    //load the entry - this will be asynchronous
                    let loadEntryPromise = referenceEntry.loadEntry(workspaceManager);
                    entryLoadedPromises.push(loadEntryPromise);
                }
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

            //call callback when all promises resolve
            entryLoadedPromise.then(commandResultList => onReferencesLoaded(commandResultList))
                .catch(error => {
                    //return an error command result
                    let errorCommandResult = {};
                    errorCommandResult.cmdDone = true;
                    errorCommandResult.errorMsg = "Error loading references: " + (error.errorMsg) ? error.errorMsg : "unknown";
                    onReferencesLoaded([errorCommandResult]);
                });
    
            }

        //set the new reference EntryMap
        this.setField("referenceEntryMap",newReferenceEntryMap);
        
        return entryCreateCommandResults;
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

            //update map
            let newEntryMap = {};
            Object.assign(newEntryMap,oldEntryMap);
            newEntryMap[entryKey] = referenceEntry;
            this.setField("referenceEntryMap",newEntryMap);
        }

        return {
            cmdDone: true,
            target: referenceEntry,
            eventAction: "created"
        }
    }

    removeEntry(entryType,url) {
        let commandResult = {};

        let entryKey = _getEntryKey(entryType,url);
        let oldEntryMap = this.getField("referenceEntryMap");
        let referenceEntry = oldEntryMap[entryKey];
        if(referenceEntry) {
            let newEntryMap = apogeeutil.jsonCopy(oldEntryMap);
            delete newEntryMap[entryKey];
            referenceEntry.remove();

            commandResult.cmdDone = true;
            commandResult.targetId = referenceEntry.getId();
            commandResult.targetType = referenceEntry.getType();
            commandResult.eventAction = "deleted";
        }
        else {
            //always return cmd done on references for now
            commandResult.cmdDone = false;
            commandResult.errorMsg = "Reference entry not found: " + url;
        }

        return commandResult;
    }

    updateEntry(entryType,url,entryData) {
        let commandResult = {};

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
            
            commandResult.cmdDone = true;
            commandResult.target = newReferenceEntry;
            commandResult.eventAction = "updated";
        }
        else {
            //entry not found
            commandResult.cmdDone = false;
            commandResult.alertMsg = "Link entry to update not found: " + url;
        }

        return commandResult;
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