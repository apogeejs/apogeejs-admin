import BaseFileAccess from "/apogeeapp/app/BaseFileAccess.js";

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
    openFile(app,onOpen) {
        //show file open dialog
        var electron = require('electron').remote;
        var dialog = electron.dialog;

        var fileList = dialog.showOpenDialog({properties: ['openFile']});
        if((fileList)&&(fileList.length > 0)) {
            var fileMetadata = ElectronFileAccess.createFileMetaData(fileList[0]);
            var onFileOpen = function(err,data) {
                onOpen(err,app,data,fileMetadata);
            }

            var fs = require('fs');
            fs.readFile(fileMetadata.path,onFileOpen);
        }
    }

    /** This  method shows a save dialog and saves the file. */
    showSaveDialog(fileMetadata,data,onSaveSuccess) {
        var electron = require('electron').remote;
        var dialog = electron.dialog;

        //show file save dialog
        var options = {};
        if((fileMetadata)&&(fileMetadata.path)) options.defaultPath = fileMetadata.path;
        var newPath = dialog.showSaveDialog(options);

        //save file
        var updatedFileMetadata = ElectronFileAccess.createFileMetaData(newPath);
        if(updatedFileMetadata) {
            this.saveFile(updatedFileMetadata,data,onSaveSuccess);
        }
        else {
            return false;
        }
    }

    /** 
     * This method saves a file to the give location. 
     */
    saveFile(fileMetadata,data,onSaveSuccess) {
        var onComplete = function(err,data) {
            if(err) {
                alert("Error: " + err.message);
            }
            else {
                if(onSaveSuccess) {
                    onSaveSuccess(fileMetadata);
                }
                alert("Saved!");
            }
        }

        var fs = require('fs');
        fs.writeFile(fileMetadata.path,data,onComplete);
    }

    //================
    //static methods
    //================

    /** This creates the file metadata for a given path. */
    static createFileMetaData(path) {
        return {"path":path};
    } 
}

