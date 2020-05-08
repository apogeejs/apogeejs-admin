import ReferenceEntry from "/apogeeapp/references/ReferenceEntry.js";
import CommandManager from "/apogeeapp/commands/CommandManager.js";

/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
export default class EsModuleEntry extends ReferenceEntry {
    
    constructor(referenceList,referenceData) {
        super(referenceList,referenceData,EsModuleEntry.REFERENCE_TYPE_INFO);
    }
            
    /** This method loads the actual link. */
    implementationLoadEntry(onLoad,onError,workspaceManager) {
        let localOnLoad = (module) => {
            if(module) {
                if(module.initApogeeModule) module.initApogeeModule();
            
                let commandData = {
                    type: "setEsModule",
                    entryType: this.referenceType,
                    url: this.getUrl(),
                    module: module
                };
                workspaceManager.runFutureCommand(commandData);
                onLoad();
            }
            else {
                onError("Unknown error: Module not properly loaded. " + this.getUrl());
            }

        }

        //load the module
        var moduleLoadPromise = import(this.getUrl()).then(localOnLoad).catch(onError);
    }
    
    /** This method removes the link. This returns a command result for the removed link. */
    removeEntry() {
        //allow for an optional module remove step
        let module = this.getField("module");
        if(module) {
            if(module.removeApogeeModule) module.removeApogeeModule();
            this.clearField("module");
        }
        return true;
    }
    
}

EsModuleEntry.REFERENCE_TYPE = "es module";

//=====================================
//Load Module Command
// These are commands run to update the status of the link after loading completes
//=====================================

/*
 *
 * Command JSON format:
 * {
 *   "type":"setEsModule",
 *   "entryType":(entry type),
 *   "url":(url),
 *   "module":(the module),
 * }
 * 
 */ 

let setesmodule = {};

//No undo command. Only the original call needs to be undone.
//setesmodule.createUndoCommand = function(workspaceManager,commandData) {

setesmodule.executeCommand = function(workspaceManager,commandData) {
    
    let referenceManager = workspaceManager.getMutableReferenceManager();

    let refEntryId = referenceManager.lookupRefEntryId(commandData.entryType,commandData.url);
    if(!refEntryId) throw new Error("Reference entry not found. " + commandData.entryType + ":" + commandData.url);

    let referenceEntry = referenceManager.getMutableRefEntryById(refEntryId);
    if(!referenceEntry) throw new Error("Reference entry not found. refEntryId: " + refEntryId);
    
    referenceEntry.setField("module",commandData.module);
}

setesmodule.commandInfo = {
    "type": "setEsModule",
    "targetType": "referenceEntry",
    "event": "updated"
}

CommandManager.registerCommand(setesmodule);

