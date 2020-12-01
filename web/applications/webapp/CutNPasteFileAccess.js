import {BaseFileAccess} from "/apogeeapp/apogeeAppLib.js";
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
    openFile(onOpen) {
        var onDataEntered = function(data) {
            onOpen(null,data,null);
            return true;
        }

        var options = {};
        options.title = "Open Workspace";
        options.instructions = "Paste saved workspace data in the space below.";
        options.submitLabel = "Open";
        showTextIoDialog(options,onDataEntered);
    }

    /** This  method shows a save dialog and saves the file. */
    saveFileAs(fileMetadata,data,onSave) {
        var onSubmit = () => true;
        var options = {};
        options.title = "Save Workspace";
        options.instructions = "Copy the data below and save it in a file to open later.";
        options.initialText = data;
        options.submitLabel = "Save";
        showTextIoDialog(options,onSubmit);

        //I should maybe only do this if you do not press cancel?
        if(onSave) onSave(null,true,null);
    }

    /** 
     * This method saves a file to the give location. 
     */
    saveFile(fileMetadata,data,onSave) {
        this.saveFileAs(fileMetadata,data,onSave);
    }


}

