import {BaseFileAccess} from "/apogeeapp/apogeeAppLib.js";

/* 
 * This class provides file open and save in electron.
 */
export default class ElectronNodeFileAccess extends BaseFileAccess {
    
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
    openFile(onOpen) {
        //show file open dialog
        var {dialog} = require('electron').remote;

        var fileList = dialog.showOpenDialog({properties: ['openFile']});
        if((fileList)&&(fileList.length > 0)) {
            var fileMetadata = createFileMetaData(fileList[0]);
            var onFileOpen = function(err,data) {
                onOpen(err,data,fileMetadata);
            }

            var fs = require('fs');
            fs.readFile(fileMetadata.path,onFileOpen);
        }
    }

    /** This  method shows a save dialog and saves the file. */
    saveFileAs(fileMetadata,data,onSave) {
        var {dialog} = require('electron').remote;

        //show file save dialog
        var options = {};
        if((fileMetadata)&&(fileMetadata.path)) options.defaultPath = fileMetadata.path;
        var newPath = dialog.showSaveDialog(options);

        //save file
        var updatedFileMetadata = createFileMetaData(newPath);
        if(updatedFileMetadata) {
            this.saveFile(updatedFileMetadata,data,onSave);
        }
        else {
            onSave(null,false,null);
        }
    }

    /** 
     * This method saves a file to the give location. 
     */
    saveFile(fileMetadata,data,onSave) {
        
        //make sure we have file metadata
        if((!fileMetadata)||(!fileMetadata.path)) return saveFileAs(fileMetadata,data,onSave);
        
        var onComplete = function(err) {
            if(err) {
                alert("Error: " + err.message);
            }
            else {
                if(onSave) {
                    onSave(null,true,fileMetadata);
                }
            }
        }

        var fs = require('fs');
        fs.writeFile(fileMetadata.path,data,onComplete);
    }
}

/** This creates the file metadata for a given path. */
function createFileMetaData(path) {
    return {"path":path};
} 

