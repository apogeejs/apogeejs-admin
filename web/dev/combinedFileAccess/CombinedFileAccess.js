import {BaseFileAccess} from "/apogeeapp/apogeeAppLib.js";
import ClipboardFileSourceGenerator from "./ClipboardFileSource.js";
import OneDriveFileSourceGenerator from "./OneDriveFileSource.js";
import {showCombinedAccessDialog} from "./CombinedFileAccessDialog.js";

/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
export default class CombinedFileAccess extends BaseFileAccess {
    
    //========================================
    // Public
    //========================================
    
    constructor() {
        super();
        this.defaultSourceName = ClipboardFileSource.NAME;
        this.sourceGeneratorList = [ClipboardFileSourceGenerator,OneDriveFileSourceGenerator];
    }
   
    /**
     * This method returns fileMetadata appropriate for a new workspace.
     */
    getNewFileMetadata() {
        let sourceGenerator = this._getSourceGenerator(null,this.sourceGeneratorList);
        return sourceGenerator.getNewFileMetadata();
    }
    
    /**
     * This method returns true if the workspace has an existing file to which 
     * is can be saved without opening a save dialog. 
     */
    directSaveOk(fileMetadata) {
        let sourceGenerator = this._getSourceGenerator(fileMetadata,this.sourceGeneratorList)
        return ((sourceGenerator)&&(sourceGenerator.directSaveOk(fileMetadata))); 
    }
    
    /**
     * This method opens a file, including dispalying a dialog
     * to select the file.
     */
    openFile(onOpen) {
        //add the close dialog action to on complete
        let closeDialog;
        let onComplete = (errorMsg,data,fileMetadata) => {
            closeDialog();
            onOpen(errorMsg,data,fileMetadata);
        };

        let dialogObject = CombinedAccessDialog("open",null,null,this.sourceGeneratorList,onComplete);
        dialogObject.showDialog();

        closeDialog = () => dialogObject.showDialog();
    }

    /** This  method shows a save dialog and saves the file. */
    saveFileAs(fileMetadata,data,onSave) {
        //add the close dialog action to on complete
        let closeDialog;
        let onComplete = (errorMsg,success,fileMetadata) => {
            closeDialog();
            onSave(errorMsg,success,fileMetadata);
        };

        //show the dialog
        let dialogObject = CombinedAccessDialog("save",fileMetadata,data,this.sourceGeneratorList,onComplete);
        dialogObject.showDialog();

        closeDialog = () => dialogObject.showDialog();
    }

    /** 
     * This method saves a file to the give location. 
     */
    saveFile(fileMetadata,data,onSave) {
        let sourceGenerator = this._getSourceGenerator(fileMetadata,this.sourceGeneratorList)
        
        //make sure we can save
        if(sourceGenerator.directSaveOk(fileMetadata)) {
            let source = souceGenerator.getInstance("save",fileMetadata,data,onSave);
            source.updateFile();
        }
        else {
            //if we can't save, revert to save as
            this.saveFileAs(fileMetadata,data,onSave);
        }
    }

    //============================
    // Private Functions
    //============================
    
    _getSourceGenerator(fileMetadata,generatorList) {
        let sourceName;
        if((fileMetadata)&&(fileMetadata.source)) {
            sourceName = fileMetadata.source;
        }
        else {
            sourceName = this.defaultSourceName; 
        }
        return generatorList.find( sourceGenerator => sourceGenerator.getName() == sourceName );
    }


}



