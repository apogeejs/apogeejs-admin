import {BaseFileAccess} from "/apogeeapp/apogeeAppLib.js";
import {ClipboardFileSource} from "./ClipboardFileSource.js";
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
        this.sourceConstructorList = [ClipboardFileSource];
    }
   
    /**
     * This method returns fileMetadata appropriate for a new workspace.
     */
    getNewFileMetadata() {
        let sourceConstructor = this._getSourceConstructor(null,this.sourceConstructorList);
        return sourceConstructor.NEW_FILE_METADATA;
    }
    
    /**
     * This method returns true if the workspace has an existing file to which 
     * is can be saved without opening a save dialog. 
     */
    directSaveOk(fileMetadata) {
        let sourceConstructor = this._getSourceConstructor(fileMetadata,this.sourceConstructorList)
        return ((sourceConstructor)&&(sourceConstructor.directSaveOk(fileMetadata))); 
    }
    
    /**
     * This method opens a file, including dispalying a dialog
     * to select the file.
     */
    openFile(onOpen) {
        let title = "Open Workspace";
        let sourceList = this.sourceConstructorList.map( sourceConstructor => new sourceConstructor(null,null,"open",onOpen) );
        let activeSource = this._getSourceFromMetadata(null,sourceList);

        showCombinedAccessDialog(title,activeSource,sourceList);
    }

    /** This  method shows a save dialog and saves the file. */
    saveFileAs(fileMetadata,data,onSave) {
        let title = "Save Workspace";
        let sourceList = this.sourceConstructorList.map( sourceConstructor => new sourceConstructor(fileMetadata,data,"save",onSave) );
        let activeSource = this._getSourceFromMetadata(fileMetadata,sourceList);

        showCombinedAccessDialog(title,activeSource,sourceList);
    }

    /** 
     * This method saves a file to the give location. 
     */
    saveFile(fileMetadata,data,onSave) {
        let sourceConstructor = this._getSourceConstructor(fileMetadata,this.sourceConstructorList)
        
        //make sure we can save
        if(sourceConstructor.directSaveOk(fileMetadata)) {
            let source = new sourceConstructor(fileMetadata,data,"save",onSave);
            source.saveFile(fileMetadata,data,onSave);
        }
        else {
            //if we can't save, revert to save as
            this.saveFileAs(fileMetadata,data,onSave);
        }
    }

    //============================
    // Private Functions
    //============================

    _getSourceFromMetadata(fileMetadata,sourceList) {
        let sourceName;
        if((fileMetadata)&&(fileMetadata.source)) {
            sourceName = fileMetadata.source;
        }
        else {
            sourceName = this.defaultSourceName; 
        }
        return sourceList.find( source => source.getName() == sourceName );
    }
    
    _getSourceConstructor(fileMetadata,constructorList) {
        let sourceName;
        if((fileMetadata)&&(fileMetadata.source)) {
            sourceName = fileMetadata.source;
        }
        else {
            sourceName = this.defaultSourceName; 
        }
        return constructorList.find( sourceConstructor => sourceConstructor.NAME == sourceName );
    }


}



