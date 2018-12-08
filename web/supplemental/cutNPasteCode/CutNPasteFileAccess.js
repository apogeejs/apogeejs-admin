/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
apogeeapp.app.CutNPasteFileAccess = class extends apogeeapp.app.BaseFileAccess {
    
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
        
        itemInfo = {};
        itemInfo.title = "Save";
        itemInfo.callback = this.getSaveCallback(app);
        menuEntryList.push(itemInfo);
        
        return menuEntryList;
    }
    
    /**
     * This method returns fileMetadata appropriate for a new workspace.
     */
    getNewFileMetadata() {
        return null;
    }
    
    //========================================
    // Private
    //========================================
    
    
    getOpenCallback(app) {
        return () => {

            //make sure there is not an open workspace
            if(app.getWorkspaceUI()) {
                alert("There is an open workspace. You must close the workspace first.");
                return;
            }    

            this.openFile(app,apogeeapp.app.openworkspace.onOpen);
        }
    }
    

    getSaveCallback(app) {
        return () => {

            var activeWorkspaceUI = app.getWorkspaceUI();
            var workspaceText;
            if(activeWorkspaceUI) {
                var workspaceJson = activeWorkspaceUI.toJson();
                workspaceText = JSON.stringify(workspaceJson);
            }
            else {
                alert("There is no workspace open.");
                return;
            }

            //clear workspace dirty flag on completion of save
            var onSaveSuccess = () => {
                app.clearWorkspaceIsDirty();
            }

            this.saveFile(workspaceText,onSaveSuccess);
        }
    }
    
    

//PASTE IMPLEMENTATION
    openFile(app,onOpen) {
        var onFileOpen = function(data) {
            onOpen(null,app,data,null);
            return true;
        }

        var options = {};
        options.title = "Open Workspace";
        options.instructions = "Paste saved workspace data in the space below.";
        options.submitLabel = "Open";
        apogeeapp.app.dialog.showTextIoDialog(options,onFileOpen);
    }

    showSaveDialog(data,onSaveSuccess) {
        var onSubmit = () => true;
        var options = {};
        options.title = "Save Workspace";
        options.instructions = "Copy the data below and save it in a file to open later.";
        options.initialText = data;
        options.submitLabel = "Save";
        apogeeapp.app.dialog.showTextIoDialog(options,onSubmit);

        //I should maybe only do this if you do not press cancel?
        if(onSaveSuccess) onSaveSuccess();
    }

    saveFile(data,onSaveSuccess) {
        apogeeapp.app.saveworkspace.showSaveDialog(data);
    }


}

