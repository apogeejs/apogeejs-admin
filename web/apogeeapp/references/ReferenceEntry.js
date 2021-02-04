import apogeeutil from "/apogeeutil/apogeeUtilLib.js";
import {FieldObject} from "/apogeebase/apogeeBaseLib.js";
import CommandManager from "/apogeeapp/commands/CommandManager.js";

/** This class manages references for the web page.*/
export default class ReferenceEntry extends FieldObject {
    
    /** The reference data is a json entry with the referenceType, url and optionally nickname.
     * If this is a copy, the reference data wil be ignored and can be set to null. */
    constructor(referenceData,instanceToCopy,keepUpdatedFixed) {
        super("referenceEntry",instanceToCopy,keepUpdatedFixed);

        if(instanceToCopy) {
            this.referenceType = instanceToCopy.referenceType;
        }
        else {
            this.referenceType = referenceData.entryType;
        }

        //==============
        //Fields
        //==============
        //Initailize these if this is a new instance
        if(!instanceToCopy) {
            this.setField("url",referenceData.url);

            //we create in a pending state because the link is not loaded.
            this.setField("state",apogeeutil.STATE_PENDING);
            this.setField("stateMsg",PENDING_STATE_MSG);

            let nickname = referenceData.nickname;
            if(!nickname) nickname = this.createNickname(referenceData.url); 
            this.setField("nickname",nickname);
        }

        //==============
        //Working variables
        //==============
        this.viewStateCallback = null;
        this.cachedViewState = null;    
    }

    //---------------------------
    // references entry interface
    //---------------------------
    
    getEntryType() {
        return this.referenceType;
    }

    getState() {
        return this.getField("state");
    }

    getStateMsg() {
        return this.getField("stateMsg");
    }

    getUrl() {
        return this.getField("url");
    }

    getNickname() {
        return this.getField("nickname");
    }

    setViewStateCallback(viewStateCallback) {
        this.viewStateCallback = viewStateCallback;
    }

    getCachedViewState() {
        return this.cachedViewState;
    }



    ///////////////////////////////////////////////////////////////////////////

    /** This method loads the link onto the page. If passed, the onLoadComplete
     * callback will be called when load completes successfully or fails. */
    loadEntry(workspaceManager) {

        let entryLoadPromise = new Promise( (resolve,reject) => {

            //create load event handlers
            //on completion execute a command to update the link status
            let onLoad = () => {
                let commandData = {
                    type: "updateLinkLoadStatus",
                    entryType: this.referenceType,
                    url: this.getUrl(),
                    success: true
                };
                workspaceManager.getApp().executeCommand(commandData);
                //call resolve in any case
                resolve();
            };
            let onError = (error) => {
                //for osme on loads we get an event object with no error info
                //convert this to a string
                if(error instanceof Event) {
                    error = "Link load unsuccessful";
                }

                let commandData = {
                    type: "updateLinkLoadStatus",
                    entryType: this.referenceType,
                    url: this.getUrl(),
                    success: false,
                    error: error
                };
                workspaceManager.getApp().executeCommand(commandData);
                //call resolve in any case
                resolve();
            }

            this.implementationLoadEntry(onLoad,onError,workspaceManager);
        });

        return entryLoadPromise;
    }

    /** This method loads the link onto the page. It should call the 
     * appropriate callback on completion. */
    //implementationLoadEntry(onLoad,onError);
    
    /** This method removes the reference. It returns true if the link remove is successful. */
    //remove()
    
    
    ///////////////////////////////////////////////////////////////////////////

    /** This method loads the link onto the page. It returns a promise that
     * resolves when the link is loaded. */
    toJson() {
        var entryJson = {};
        entryJson.url = this.getUrl();
        if(this.nickname != NO_NICKNAME_EMPTY_STRING) entryJson.nickname = this.getNickname();
        entryJson.entryType = this.referenceType;
        return entryJson;
    }

    //-------------------------
    // Entry specific management methods
    //-------------------------

    /** This method removes and reloads the link, returning a promise. */
    updateData(workspaceManager,url,nickname) {

        //update nickname
        if(!nickname) nickname = NO_NICKNAME_EMPTY_STRING;
        if(this.nickname != nickname) {
            this.setField("nickname",nickname);
        }

        //update url
        if(this.url != url) {
            this.removeEntry();
            this.setField("url",url);
            var promise = this.loadEntry(workspaceManager);
        }

        //if we didn't do a URL update, make a promise that says update was successful
        if(!promise) promise = Promise.resolve({
            cmdDone: true,
            target: this,
            eventAction: "updated"
        });

        return promise;
    }

    //===================================
    // private methods
    //===================================

    setClearState() {
        this.setState(apogeeutil.STATE_NORMAL);
    }

    setError(errorMsg) {
        this.setState(apogeeutil.STATE_ERROR,errorMsg);
    }

    setPendingState() {
        this.setState(apogeeutil.STATE_PENDING,PENDING_STATE_MSG);
    }

    setState(state,msg) {
        let currentState = this.getField("state");
        let currentMessage = this.getField("stateMsg");
        if(currentState != state) {
            //for now we are not tracking msg. If we do, we should check for that change too
            this.setField("state",state);
        }
        if(currentMessage != msg) {
            //for now we are not tracking msg. If we do, we should check for that change too
            if(msg !== undefined) this.setField("stateMsg",msg);
            else this.clearField("stateMsg");
        }
    }

    createNickname(url) {
        let lastSeperatorIndex = url.lastIndexOf("/");
        if(lastSeperatorIndex == 0) return url.substr(0,MAX_AUTO_NICKNAME_LENGTH);

        let fileName = url.substr(lastSeperatorIndex+1);
        let queryStart = fileName.indexOf("?");
        if(queryStart > 0) {
            fileName = fileName.substring(0,queryStart);
        }
        if(fileName.length > MAX_AUTO_NICKNAME_LENGTH) {
            fileName = fileName.substring(0,MAX_AUTO_NICKNAME_LENGTH);
        }
        return fileName;
    }

}

//====================================
// Static Fields
//====================================

let MAX_AUTO_NICKNAME_LENGTH = 24;


ReferenceEntry.ELEMENT_ID_BASE = "__apogee_link_element_";

let NO_NICKNAME_EMPTY_STRING = "";

//=====================================
// Status Commands
// These are commands run to update the status of the link after loading completes
//=====================================

/*
 *
 * Command JSON format:
 * {
 *   "type":"updateLinkLoadStatus",
 *   "entryType":(entry type),
 *   "url":(url),
 *   "success":(boolean),
 *   "error":(error object or error string - optional. Only used in the success=false case)
 * }
 * 
 */ 

let updatelinkstatus = {};

//No undo command. Only the original call needs to be undone.
//updatelinkstatus.createUndoCommand = function(workspaceManager,commandData) {

updatelinkstatus.executeCommand = function(workspaceManager,commandData) {
    
    var commandResult = {};
    var referenceManager = workspaceManager.getMutableReferenceManager();
    
    //lookup entry for this reference
    let refEntryId = referenceManager.lookupRefEntryId(commandData.entryType,commandData.url);
    let referenceEntry = referenceManager.getMutableRefEntryById(refEntryId);
    if(referenceEntry) {
        //update entry status
        //add event handlers
        if(commandData.success) {
            commandResult.cmdDone = true;
            referenceEntry.setClearState();
        }
        else {
            var errorMsg = "Failed to load link '" + referenceEntry.getUrl() + "':" + commandData.error.toString();
            console.error(errorMsg);
            referenceEntry.setError(errorMsg);
        }

        //save the updated entry
        referenceManager.registerRefEntry(referenceEntry);
    }
    else {
        //reference entry not found
        throw new Error("Reference entry not found: " + commandData.url);
    }
    
    return commandResult;
}

updatelinkstatus.commandInfo = {
    "type": "updateLinkLoadStatus",
    "targetType": "referenceEntry",
    "event": "updated"
}

CommandManager.registerCommand(updatelinkstatus);


const PENDING_STATE_MSG = "loading..."