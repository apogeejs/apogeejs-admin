import {bannerConstants} from "/apogeeview/componentdisplay/banner.js"; 
import ReferenceList from "/apogeeapp/references/ReferenceList.js";

/** This class manages links and other reference entries, loading the references and
 * creating the UI tree elements for display of the references.
 * 
 * Any links needed for the page are managed externally by the Link Loader, which
 * allows multiple users to request the same link.
 */
export default class ReferenceManager {

    constructor(app) {
        this.app = app;

        //references
        this.referenceLists = {};

        this.viewStateCallback = null;
        this.cachedViewState = null;
    }
    
    /** This method sets the reference types for the reference manager. 
     * This method returns a list of command results, for the creation of the reference lists.  */
    initReferenceLists(referenceClassArray) {
        referenceClassArray.forEach( referenceClass => {
            this.referenceLists[referenceClass.REFERENCE_TYPE] = new ReferenceList(referenceClass);
        });
    }
    
    getReferenceLists() {
        return this.referenceLists;
    }

    getApp() {
        return this.app;
    }

    setViewStateCallback(viewStateCallback) {
        this.viewStateCallback = viewStateCallback;
    }

    getCachedViewState() {
        return this.cachedViewState;
    }

    /** This method opens the reference entries, from the structure returned from
     * the save call. It returns a promise that
     * resolves when all entries are loaded. 
     */
    load(json) {

        let referenceCommandResults = [];
        let referencesOpenPromise
        
        //load the reference entries
        if(json.refLists) {
            let referenceLoadPromises = [];

            for(let listType in json.refLists) {
                let listJson = json.refLists[listType];

                let referenceList = this.referenceLists[listType];
                let {listCommandResults,listLoadPromises} = referenceList.load(listJson);

                referenceCommandResults.push(...listCommandResults);
                referenceLoadPromises.push(...listLoadPromises);
            }

            if(referenceLoadPromises.length > 0) {
                referencesOpenPromise = Promise.all(referenceLoadPromises).then(commandResultList => {
                    //package the list of results into a single result
                    let commandResult = {};
                    commandResult.cmdDone = true;
                    commandResult.childCommandResults = commandResultList;
                    return commandResult;
                });
            }
        }
        
        //set the view state
        if(json.viewState !== undefined) {
            this.cachedViewState = json.viewState;
        }

        return {referenceCommandResults,referencesOpenPromise};
    }

    /** This method opens the reference entries, from the structure returned from
     * the save call. It returns a promise that
     * resolves when all entries are loaded. 
     */
    toJson() {
        let json = {};
        let refListsJson = {};
        let hasRefLists = false;
        for(var referenceListType in this.referenceLists) {
            let referenceList = this.referenceLists[referenceListType];
            let refListJson = referenceList.toJson();
            if(refListJson) {
                refListsJson[referenceListType] = refListJson;
                hasRefLists = true;
            }
        }
        if(hasRefLists) {
            json.refLists = refListsJson;
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
        var referenceList = this.referenceLists[entryCommandData.entryType];
        if(!referenceList) throw new Error("Entry type nopt found: " + entryCommandData.entryType);

        return referenceList.createEntry(entryCommandData);
    }

    /** This method should be called when the parent is closed. It removes all links. 
     */
    close() {
        for(var listType in this.referenceLists) {
            var referenceList = this.referenceLists[listType];
            referenceList.close();
        }
    }

    lookupEntry(entryType,url) {
        var referenceList = this.referenceLists[entryType];
        if(referenceList) {
            return referenceList.lookupEntry(url);
        }
        else {
            return null;
        }
    }

    //=================================
    // Private
    //=================================
   
}