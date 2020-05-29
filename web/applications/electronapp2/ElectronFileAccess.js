import {BaseFileAccess} from "/apogeeapp/apogeeAppLib.js";

/* 
 * This class provides file open and save in electron.
 */
export default class ElectronFileAccess extends BaseFileAccess {
    
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
        return {};
    }
    
    /**
     * This method returns true if the workspace has an existing file to which 
     * is can be saved without opening a save dialog. 
     */
    directSaveOk(fileMetadata) {
        return ((fileMetadata)&&(fileMetadata.path));
    }

    /**
     * This method opens a file, including dispalying a dialog
     * to select the file.
     */
    openFile(app,onFileOpen) {
        //use the context bridge api
        var onOpen = function(err,data,fileMetadata) {
            onFileOpen(err,app,data,fileMetadata);
        }
        openSaveApi.openFile(onOpen);
    }

    /** This  method shows a save dialog and saves the file. */
    showSaveDialog(fileMetadata,data,onSave) {
        openSaveApi.saveFile(fileMetadata,data,onSave)
    }

}

