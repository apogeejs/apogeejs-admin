/** 
 * This is a base class for workspace opening and saveing, or whatever actions
 * are appropriate. It should be extended to provide functionality.
 */
export default class BaseFileAccess {
    /**
     * Constructor
     */
    constructor() {
        
    }

    /** 
     * This method should return a list of menu options for opening and closing
     * the workspace. The format should be a array with each entry being a
     * two entry array. The first item is the menu entry text and the second 
     * is the callback for the menu item action. 
     * Example: [["Open",openCallback],["Save",saveCallback]]
     * */
    getWorkspaceOpenSaveMenuOptions(app) {
        
    }

    //===============================
    // The following methods must be implmented by the extending class
    //===============================

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
     * arguments:
     * - onOpen(err,workspaceData,fileMetadata);
     * 
     * onOpen callback arguments:
     * - err - This is a string that will be populated if there was an error
     * - fileData - This is the file contents as a string
     * - fileMetadata - This is a implementation-defined structure that is used to store the file location.
     */
    //openFile(onOpen);

    /** This  method shows a save dialog and saves the file.
     * arguments:
     * - fileMetadata - This is a implementation-defined structure that is used to store the file location.
     * - fileData - This is the file contents as a string
     * - onSave(err,fileSaved,fileMetadata);
     * 
     * onSave callback arguments:
     * - err - This is a string that will be populated if there was an error
     * - fileSaved - This is boolean telling if the file was saved.
     * - fileMetadata - This is a implementation-defined structure that gives the saved file location.
     */
    //saveFileAs(fileMetadata,data,onSave);

    /** This  method directly saves the file without letting the user select the location.
     * arguments:
     * - fileMetadata - This is a implementation-defined structure that is used to store the file location.
     * - fileData - This is the file contents as a string
     * - onSave(err,fileSaved,fileMetadata);
     * 
     * onSave callback arguments:
     * - err - This is a string that will be populated if there was an error
     * - fileSaved - This is boolean telling if the file was saved.
     * - fileMetadata - This is a implementation-defined structure that gives the saved file location.
     */
    //saveFile(fileMetadata,data,onSave);


}


