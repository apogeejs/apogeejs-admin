import BaseFileAccess from "/apogeeapp/app/BaseFileAccess.js";
import {showTextIoDialog} from "./TextIoDialog.js";

/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
export default class CutNPasteFileAccess extends BaseFileAccess {
    
    //========================================
    // Public
    //========================================
    
    constructor() {
        super();
    }
   
    /**
     * This method returns fileMetadata appropriate for a new workspace.
     */
    getNewFileMetadata() {
        return null;
    }
    
    /**
     * This method returns true if the workspace has an existing file to which 
     * is can be saved without opening a save dialog. 
     */
    directSaveOk(fileMetadata) {
        return false;
    }
    
    /**
     * This method opens a file, including dispalying a dialog
     * to select the file.
     */
    openFile(app,onOpen) {
        var onFileOpen = function(data) {
            onOpen(null,app,data,null);
            return true;
        }

        var options = {};
        options.title = "Open Workspace";
        options.instructions = "Paste saved workspace data in the space below.";
        options.submitLabel = "Open";
        showTextIoDialog(options,onFileOpen);
    }

    /** This  method shows a save dialog and saves the file. */
    showSaveDialog(fileMetadata,data,onSaveSuccess) {
        var onSubmit = () => true;
        var options = {};
        options.title = "Save Workspace";
        options.instructions = "Copy the data below and save it in a file to open later.";
        options.initialText = data;
        options.submitLabel = "Save";
        showTextIoDialog(options,onSubmit);

        //I should maybe only do this if you do not press cancel?
        if(onSaveSuccess) onSaveSuccess();
    }

    /** 
     * This method saves a file to the give location. 
     */
    saveFile(fileMetadata,data,onSaveSuccess) {
        this.showSaveDialog(fileMetadata,data,onSaveSuccess);
    }


}

