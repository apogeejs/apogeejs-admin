/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
apogeeapp.app.ElectronFileAccess = class extends apogeeapp.app.BaseFileAccess {
    
    //========================================
    // Public
    //========================================
    
    constructor() {
        super();
    }
    
    /** 
     * This method should return a list of menu options for opening and closing
     * the workspace. The format should be a array with each entry being a
     * two entry array. The first item is the menu entry text and the second 
     * is the callback for the menu item action. 
     * Example: [["Open",openCallback],["Save",saveCallback]]
     * */
    getWorkspaceOpenSaveMenuOptions(app) {
        var menuEntryList = [];
        var itemInfo;

        itemInfo = {};
        itemInfo.title = "Open";
        itemInfo.callback = this.getOpenCallback(app);
        menuEntryList.push(itemInfo);

        var workspaceUI = app.getWorkspaceUI();
        if(workspaceUI) {
            var fileMetadata = workspaceUI.getFileMetadata();
            
            if(fileMetadata.path) {
                itemInfo = {};
                itemInfo.title = "Save";
                itemInfo.callback = this.getSaveCallback(app,true);
                menuEntryList.push(itemInfo);
            }

            itemInfo = {};
            itemInfo.title = "Save as";
            itemInfo.callback = this.getSaveCallback(app,false);
            menuEntryList.push(itemInfo);
        }  
        
        return menuEntryList;
    }
    
    /**
     * This method returns fileMetadata appropriate for a new workspace.
     */
    getNewFileMetadata() {
        return {};
    }
    
    //========================================
    // Private
    //========================================
    
    
    getOpenCallback(app) {
        return () => {

            //make sure there is not an open workspace
            if(app.getWorkspaceIsDirty()) {
                alert("There is an open workspace with unsaved data. You must close the workspace first.");
                return;
            }    

            this.openFile(app,apogeeapp.app.openworkspace.onOpen);
        }
    }
    

    getSaveCallback(app,doDirectSave) {
        return () => {

            var activeWorkspaceUI = app.getWorkspaceUI();
            var workspaceText;
            var fileMetadata;
            if(activeWorkspaceUI) {
                var workspaceJson = activeWorkspaceUI.toJson();
                workspaceText = JSON.stringify(workspaceJson);
                fileMetadata = activeWorkspaceUI.getFileMetadata();
            }
            else {
                alert("There is no workspace open.");
                return;
            }

            //clear workspace dirty flag on completion of save
            var onSaveSuccess = (updatedFileMetadata) => {
                var workspaceUI = app.getWorkspaceUI();
                workspaceUI.setFileMetadata(updatedFileMetadata);
                app.clearWorkspaceIsDirty();
            }

            if((!doDirectSave)||(!fileMetadata)||(!fileMetadata.directSaveOk)) {
                this.showSaveDialog(fileMetadata,workspaceText,onSaveSuccess);
            }
            else {
                this.saveFile(fileMetadata,workspaceText,onSaveSuccess);
            }
        }
    }


    openFile(app,onOpen) {
        //show file open dialog
        var electron = require('electron').remote;
        var dialog = electron.dialog;

        var fileList = dialog.showOpenDialog({properties: ['openFile']});
        if((fileList)&&(fileList.length > 0)) {
            var fileMetadata = {};
            fileMetadata.directSaveOk = true;
            fileMetadata.path = fileList[0];
            var onFileOpen = function(err,data) {
                onOpen(err,app,data,fileMetadata);
            }

            var fs = require('fs');
            fs.readFile(fileMetadata.path,onFileOpen);
        }
    }


    showSaveDialog(fileMetadata,data,onSaveSuccess) {
        var electron = require('electron').remote;
        var dialog = electron.dialog;

        //show file save dialog
        var options = {};
        if((fileMetadata)&&(fileMetadata.path)) options.defaultPath = fileMetadata.path;
        var filename = dialog.showSaveDialog(options);

        //save file
        var updatedFileMetadata = {};
        updatedFileMetadata.directSaveOk = true;
        updatedFileMetadata.path = filename;
        if(filename) {
            apogeeapp.app.saveworkspace.saveFile(updatedFileMetadata,data,onSaveSuccess);
        }
        else {
            return false;
        }
    }

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
}

