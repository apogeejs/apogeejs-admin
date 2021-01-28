import {BaseFileAccess} from "/apogeeapp/apogeeAppLib.js";
import ClipboardFileSourceGenerator from "/applications/webapp/fileaccess/clipboard/ClipboardFileSource.js";
import OneDriveFileSourceGenerator from "/applications/webapp/fileaccess/onedrive/OneDriveFileSource.js";
import CombinedAccessDialog from "/applications/webapp/fileaccess/CombinedFileAccessDialog.js";
import * as fileAccessConstants from "/applications/webapp/fileaccess/fileAccessConstants.js";

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
        this.defaultSourceId = ClipboardFileSourceGenerator.getSourceId();
        this.sourceGeneratorList = [ClipboardFileSourceGenerator,OneDriveFileSourceGenerator];
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
        let dialogObject = new CombinedAccessDialog(fileAccessConstants.OPEN_ACTION,null,null,this.sourceGeneratorList,onOpen);
        dialogObject.showDialog();
    }

    /** This  method shows a save dialog and saves the file. */
    saveFileAs(fileMetadata,data,onSave) {
        let dialogObject = new CombinedAccessDialog(fileAccessConstants.SAVE_ACTION,fileMetadata,data,this.sourceGeneratorList,onSave);
        dialogObject.showDialog();     
    }

    /** 
     * This method saves a file to the give location. 
     */
    saveFile(fileMetadata,data,onSave) {
        //make sure we can save
        let sourceGenerator = this._getSourceGenerator(fileMetadata,this.sourceGeneratorList)
        if((sourceGenerator)&&(sourceGenerator.directSaveOk(fileMetadata))) {
            let source = sourceGenerator.getInstance(fileAccessConstants.SAVE_ACTION,fileMetadata,data,onSave);
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
        let sourceId;
        if((fileMetadata)&&(fileMetadata.source)) {
            sourceId = fileMetadata.source;
        }
        else {
            return null;
        }
        return generatorList.find( sourceGenerator => sourceGenerator.getSourceId() == sourceId );
    }


}


