/** 
 * This is a base class for workspace opening and saveing, or whatever actions
 * are appropriate. It should be extended to provide functionality.
 */
apogeeapp.app.BaseFileAccess = class {
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
    
    /**
     * This method returns fileMetadata appropriate for a new workspace.
     */
    getNewFileMetadata() {
        
    }
}


