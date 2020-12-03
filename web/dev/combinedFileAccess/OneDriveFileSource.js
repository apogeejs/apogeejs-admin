import apogeeutil from "/apogeeutil/apogeeUtilLib.js";
import {uiutil}  from "/apogeeui/apogeeUiLib.js";
import OneDriveFileSystem from "./OneDriveFileSystem.js";
import * as fileAccessConstants from "./fileAccessConstants.js";

let OneDriveFileSourceGenerator = {
    getSourceId: function() {
        return OneDriveFileSystem.SOURCE_ID;
    },

    getDisplayName: function() {
        return OneDriveFileSystem.DISPLAY_NAME;
    },

    directSaveOk: function(fileMetadata) {
        return OneDriveFileSystem.directSaveOk(fileMetadata);
    },

    getInstance(action,fileMetadata,fileData,onComplete) {
        return new OneDriveFileSource(action,fileMetadata,fileData,onComplete)
    }
}

export {OneDriveFileSourceGenerator as default};

/** This is the remote file system source */
class OneDriveFileSource {
    /** constructor */
    constructor(action,fileMetadata,fileData,onComplete) {
        this.action = action;
        this.initialFileMetadata = fileMetadata;
        this.fileData = fileData;
        this.onComplete = onComplete;

        //this object is the interface to OneDrive
        this.remoteFileSystem = new OneDriveFileSystem();

        // this.drivesInfo
        // this.selectedDriveId
        this.driveSelectionElementMap = {}

        // this.folderInfo
        this.fileElementMap = {};

        this.loginState = null


        // this.actionElement
        // this.configElement

        // this.saveFileNameField
        // this.openFileNameField
        // this.pathElement
        // this.fileListTable
        // this.drivesListElement
        // this.allCheckbox
        // this.jsonCheckbox
        // this.textCheckbox
        // this.loggedOutShield

        // this.loginElement
        // this.userElement
        // this.logoutElement

        this.filter = _allFilter;
    }

    //============================
    // Public Methods
    //============================

    getGenerator() {
        return OneDriveFileSourceGenerator;
    }

    //-----------------------------
    // File Actions
    //-----------------------------

    updateFile() {
        let fileInfo = this.initialFileMetadata.fileInfo;
        let saveFilePromise = this.remoteFileSystem.updateFile(fileInfo.driveId,fileInfo.fileId,this.fileData);

        saveFilePromise.then( fileMetadata => {
            //success
            if(this.onComplete) this.onComplete(null,true,fileMetadata); 
        }).catch(errorMsg => {
            //error
            if(this.onComplete) this.onComplete(errorMsg,false,null);
        }) ;
    }

    createFile(driveId,folderId,fileName) {
        let saveFilePromise = this.remoteFileSystem.createFile(driveId,folderId,fileName,this.fileData);

        saveFilePromise.then( fileMetadata => {
            //success
            if(this.onComplete) this.onComplete(null,true,fileMetadata); 
        }).catch(errorMsg => {
            //error
            if(this.onComplete) this.onComplete(errorMsg,false,null);
        }) ;
    }

    openFile(driveId,fileId) {
        let openFilePromise = this.remoteFileSystem.openFile(driveId,fileId);

        openFilePromise.then( result => {
            //success
            if(this.onComplete) this.onComplete(null,result.data,result.fileMetadata); 
        }).catch(errorMsg => {
            //error
            if(this.onComplete) this.onComplete(errorMsg,false,null);
        }) ;
    }

    cancelAction() {
        if(this.onComplete) this.onComplete(null,false,null);
    }

    /** This method is called externally after the dialog box using the soruce closes. */
    close() {
        this.remoteFileSystem.close();

        //FILL THIS IN!!!
        if(this.configElement) {
            this.configElement = null;
        }
        if(this.actionElement) {
            this.actionElement = null;
        }
    }

    //-----------------------------
    // UI Interface
    //-----------------------------

    makeActive() {

    }

    getIconUrl() {
        return null;
    }

    getActionElement() {
        if(!this.actionElement) {
            this._createActionElement();
            //populate initial data if we are logged in
            let loginState = this.remoteFileSystem.getLoginInfo();
            if(loginState.state == fileAccessConstants.LOGGED_IN) {
                this._populateActionForm();
            }
        }
        return this.actionElement;
    }

    getConfigElement() {
        if(!this.configElement) {
            this._createConfigElement();
            //set initial login state
            this.remoteFileSystem.setLoginStateCallback(loginState => this._setLoginState(loginState));
            let loginState = this.remoteFileSystem.getLoginInfo();
            this._setLoginState(loginState);
        }
        return this.configElement;
    }


    //===================================
    // Private Methods
    //===================================

    //--------------------
    // command handlers
    //--------------------

    _onLoginCommand() {
        this.remoteFileSystem.login();
    }

    _onLogoutCommand() {
        this.remoteFileSystem.logout();
    }

    _onParentFolderSelect() {
        if(this.folderInfo) {
            //get parent id. For root this is not defined, but our load foler method handles that.
            let parentId = this.folderInfo.folder.parentId;
            this._loadFolder(this.selectedDriveId, parentId);
        }
    }

    _onFilterChange() {
        if(this.allRadio.checked) {
           if(this.filter == _allFilter) return; 
           this.filter = _allFilter;
        }
        else if(this.jsonRadio.checked) {
            if(this.filter == _jsonFilter) return;
            this.filter = _jsonFilter;
        }
        else if(this.jsonTextRadio.checked) {
            if(this.filter == _jsonTextFilter) return;
            this.filter = _jsonTextFilter;
        }

        //repopulate the file list
        this._populateFileList();    
    }

    _onFileClick(fileInfo) {
        //select element
        let selectedFileId = fileInfo.fileId;

        //take any needed action
        if(fileInfo.type == fileAccessConstants.FOLDER_TYPE) {
            //open the folder
            this._loadFolder(this.selectedDriveId, selectedFileId);
        }
        else {
            //put the name in the file name field
            if(this.action == fileAccessConstants.SAVE_ACTION) {
                this.saveFileNameField.value = fileInfo.name;
            }
            else if(this.action == fileAccessConstants.OPEN_ACTION) {
                this.openFile(this.selectedDriveId, selectedFileId);
            }
        }

    }

    _onFileDelete(fileInfo) {
        apogeeUserAlert("Not implemented!");
    //     let objectType = (fileInfo.type == fileAccessConstants.FOLDER_TYPE) ? "folder" : "file";
    //     let okAction = () =>{
    //         let deletePromise = this.remoteFileSystem.deleteFile(this.selectedDriveId,fileInfo.fileId);
    //         deletePromise.then( response => {
    //             //reload folder
    //             this._loadFolder(this.selectedDriveId,this.folderInfo.folder.fileId);
    //         }).catch(errorMsg => {
    //             apogeeUserAlert("There was an error deleting the " + objectType + ": " + errorMsg);
    //         })
    //     }
    //     apogeeUserConfirm("Are you sure you want to delete the " + objectType + ": " + fileInfo.name + "?","Delete","Cancel",okAction,null,true);
    }

    _onFileRename(fileInfo) {
        apogeeUserAlert("Not implemented!");
    //     let objectType = (fileInfo.type == fileAccessConstants.FOLDER_TYPE) ? "folder" : "file";
    //     let okAction = fileName =>{
    //         if(?_fileExists(fileName,this.folderInfo)) {
    //             apogeeUserAlert("That name is already in use: " + fileName);
    //         }
    //         else {
    //             let renamePromise = this.remoteFileSystem.renameFile(this.selectedDriveId,fileInfo.fileId,fileName);
    //             renamePromise.then( response => {
    //                 //reload folder
    //                 this._loadFolder(this.selectedDriveId,this.folderInfo.folder.fileId);
    //             }).catch(errorMsg => {
    //                 apogeeUserAlert("There was an error renaming the " + objectType + ": " + errorMsg);
    //             })
    //         }
    //     }
    //     ?_getUserInput("What is the new name for the " + objectType + ": " + fileInfo.name + "?","Rename","Cancel",okAction,null,true);
    }

    _onCreateFolder() {
        apogeeUserAlert("Not implemented!");
    //     let okAction = fileName =>{
    //         if(?_fileExists(fileName,this.folderInfo)) {
    //             apogeeUserAlert("That name is already in use: " + fileName);
    //         }
    //         else {
    //             let createFolderPromise = this.remoteFileSystem.createFolder(this.selectedDriveId,this.folderInfo.folder.fileId,fileName);
    //             renamePromise.then( response => {
    //                 //reload folder
    //                 this._loadFolder(this.selectedDriveId,this.folderInfo.folder.fileId);
    //             }).catch(errorMsg => {
    //                 apogeeUserAlert("There was an error creating the folder: " + errorMsg);
    //             })
    //         }
    //     }
    //     ?_getUserInput("What is the name for the folder?","Create","Cancel",okAction,null,true);
    }

    _onSavePress() {
        if(!this.selectedDriveId) {
            apogeeUserAlert("There is no selected drive!");
            return;
        }
        if((!this.folderInfo)||(!this.folderInfo.folder)) {
            apogeeUserAlert("There is no selected folder!");
            return;
        }
        let folderId = this.folderInfo.folder.fileId;
        let fileName = this.saveFileNameField.value.trim();
        if(fileName.length === 0) {
            apogeeUserAlert("No file name is entered");
        }

        this.createFile(this.selectedDriveId,folderId,fileName);
    }

    _onCancelPress() {
        this.cancelAction();
    }

    /** This function changes the active source */
    _onSelectDrive(driveId) {

        let oldSelectedDriveId = this.selectedDriveId;
        this.selectedDriveId = driveId;

        if(oldSelectedDriveId !== undefined) {
            let oldElement = this.driveSelectionElementMap[oldSelectedDriveId];
            oldElement.classList.remove("oneDriveFileAccess_driveElementActive");
        }
        if(this.selectedDriveId !== undefined) {
            let newElement = this.driveSelectionElementMap[this.selectedDriveId];
            newElement.classList.add("oneDriveFileAccess_driveElementActive");

            //store this as default for future use
            _cachedDriveId = driveId;

            //load the initial
            let initialFolderId;
            if((this.initialFileMetadata)&&(this.initialFileMetadata.parentId)) {
                initialFolderId = this.initialFileMetadata.parentId;
            }
            else {
                initialFolderId = _cachedFolderId;
            }
            this._loadFolder(this.selectedDriveId,initialFolderId);
        }
    }

    //---------------------
    //internal methods
    //----------------------

    _setLoginState(loginState) {
        let oldLoginState = this.loginState;
        this.loginState = loginState;
        if(this.configElement) {
            if(loginState.state == fileAccessConstants.LOGGED_IN) {
                this.loginElement.style.display = "none";
                if(loginState.accountName) {
                    this.userElement.innerHTML = loginState.accountName;
                    this.userElement.style.display = "";
                }
                else {
                    this.userElement.style.display = "none";
                }
                this.logoutElement.style.display = "";
                if(loginState.message) {
                    this.accountMsgElement.style.display = "";
                    this.accountMsgElement.innerHTML = loginState.message;
                }
                else {
                    this.accountMsgElement.style.display = "none";
                    this.accountMsgElement.innerHTML = "";
                }

                this.loggedOutShield.style.display = "none";
            }
            else if(loginState.state == fileAccessConstants.LOGGED_OUT) {
                this.loginElement.style.display = "";
                this.userElement.style.display = "none";
                this.userElement.innerHTML = "";
                this.logoutElement.style.display = "none";
                if(loginState.message) {
                    this.accountMsgElement.style.display = "";
                    this.accountMsgElement.innerHTML = loginState.message;
                }
                else {
                    this.accountMsgElement.style.display = "none";
                    this.accountMsgElement.innerHTML = "";
                }
                
                this.loggedOutShield.style.display = "";
            }
            else if(loginState.state == fileAccessConstants.LOGIN_PENDING) {
                //for now we will leave it to this...
                this.accountMsgElement.style.display = "";
                this.accountMsgElement.innerHTML = loginState.message ? loginState.message : "pending";

                this.loginElement.style.display = "none";
                this.userElement.style.display = "none";
                this.userElement.innerHTML = "";
                this.logoutElement.style.display = "none";

                this.loggedOutShield.style.display = "";
            }
            else {
                //handle this
            }
        }

        if((this.loginState.state == fileAccessConstants.LOGGED_IN)&&
            !((oldLoginState)&&(oldLoginState.state == this.loginState.state))&&
            (this.actionElement) ) {
            //populate the action form if we are newly logged in
            this._populateActionForm();
        }
    }

    _setDrivesInfo(drivesInfo) {
        this.drivesInfo = drivesInfo;

        //pick an initial drive
        let atttemptedSelectedDriveId, initialSelectedDriveId;
        if((this.initialFileMetadata)&&(this.initialFileMetadata.fileInfo.driveId)) {
            atttemptedSelectedDriveId = this.initialFileMetadata.fileInfo.driveId;
        }
        else {
            atttemptedSelectedDriveId = _cachedDriveId;
        }

        this.selectedDriveId = undefined;
        this.driveSelectionElementMap = {};
        uiutil.removeAllChildren(this.drivesListElement);

        if(this.drivesInfo) {
            let selectedDriveId; 
            if((this.drivesInfo.drives)&&(this.drivesInfo.drives.length > 0)) {
                this.drivesInfo.drives.forEach( driveInfo => {
                    this._addDriveElement(driveInfo)
                    if(driveInfo.driveId == atttemptedSelectedDriveId) {
                        initialSelectedDriveId = driveInfo.driveId;
                    }
                })

                if((!initialSelectedDriveId)&&(this.drivesInfo.drives.length > 0)) {
                    initialSelectedDriveId = this.drivesInfo.drives[0].driveId;
                }
            }

            //set initial drive state
            if(initialSelectedDriveId) {
                this._onSelectDrive(initialSelectedDriveId);
            }
        }
        
    }

    _loadFolder(driveId, folderId, forceReload) {
        let filesInfoPromise = this.remoteFileSystem.loadFolder(driveId,folderId,forceReload);
        filesInfoPromise.then(folderInfo => {
            this._setFilesInfo(folderInfo);
        }).catch(errorMsg => {
            apogeeUserAlert("Error opening folder: " + errorMsg);
            this._setFilesInfo(null);
            //if we failed to find the folder, try to open the root of the given drive
            if(folderId) {
                this._loadFolder(driveId);
            }
        })
    }


    _setFilesInfo(folderInfo) {
        this.folderInfo = folderInfo;
        this.fileElementMap = {};

        this._populatePathCell();
        this._populateFileList();

        //save this folder
        if((folderInfo)&&(folderInfo.folder)&&(folderInfo.folder.fileId)) {
            _cachedFolderId = folderInfo.folder.fileId;
        }

    }

    _populatePathCell() {
        uiutil.removeAllChildren(this.pathElement);
        uiutil.removeAllChildren(this.fileListTable);

        let selectedDriveInfo = this._getSelectedDriveInfo();
        if(selectedDriveInfo) {
            this.pathElement.appendChild(this._getPathDriveElement(selectedDriveInfo));
        }
        if(this.folderInfo) {
            if(this.folderInfo.path) {
                let isFirstEntry = true;
                this.folderInfo.path.forEach( fileInfo => {
                    //don't add the root name. Just use the drive name.
                    if(fileInfo.isRoot) return;
                    //add a delimiter between entries
                    if(isFirstEntry) {
                        isFirstEntry = false;
                    }
                    else {
                        this.pathElement.appendChild(this._getPathDelimiterElement());
                    }
                    this.pathElement.appendChild(this._getPathElement(fileInfo));
                })
            }
        }
        
    }

    _getSelectedDriveInfo() {
        if((this.drivesInfo)&&(this.drivesInfo.drives)&&(this.selectedDriveId)) {
            return this.drivesInfo.drives.find( driveEntry => driveEntry.driveId == this.selectedDriveId);
        }
        else return undefined;
    }

    _populateFileList() {
        uiutil.removeAllChildren(this.fileListTable);
        if((this.folderInfo)&&(this.folderInfo.children)) {
            this.folderInfo.children.filter(this.filter).forEach(folderInfo => this._addFileListEntry(folderInfo));
        }
    }

    _populateActionForm() {
        let drivesInfoPromise = this.remoteFileSystem.getDrivesInfo();
        drivesInfoPromise.then(drivesInfo => {
            this._setDrivesInfo(drivesInfo);
        }).catch(errorMsg => {
            //figure out what to do here
            apogeeUserAlert("Error loading drive info: " + errorMsg)
        })
    }

    //--------------------
    // create elements
    //--------------------

    _createConfigElement() {
        let container = document.createElement("div");
        container.className = "oneDriveFileAccess_configContainer";

        this.loginElement = document.createElement("div");
        this.loginElement.className = "oneDriveFileAccess_loginElement";
        this.loginElement.innerHTML = "Login"
        this.loginElement.onclick = () => this._onLoginCommand();
        container.appendChild(this.loginElement);

        this.userElement = document.createElement("div");
        this.userElement.className = "oneDriveFileAccess_userElement";
        container.appendChild(this.userElement);

        this.logoutElement = document.createElement("div");
        this.logoutElement.className = "oneDriveFileAccess_logoutElement";
        this.logoutElement.innerHTML = "Logout"
        this.logoutElement.onclick = () => this._onLogoutCommand();
        container.appendChild(this.logoutElement);

        this.accountMsgElement = document.createElement("div");
        this.accountMsgElement.className = "oneDriveFileAccess_accountMsgElement";
        container.appendChild(this.accountMsgElement);

        //this element is used in the action element, but we will modify it with the login data
        this.loggedOutShield = document.createElement("div");
        this.loggedOutShield.className = "oneDriveFileAccess_loggedOutShield";
        this.loggedOutShield.innerHTML = "<em>User not logged in</em>"

        let loggedOutCancelButton = document.createElement("button");
        loggedOutCancelButton.innerHTML = "Cancel";
        loggedOutCancelButton.className = "oneDriveFileAccess_loggedOutCancelButton";
        loggedOutCancelButton.onclick = () => this._onCancelPress();
        this.loggedOutShield.appendChild(loggedOutCancelButton);

        this.configElement = container;
    }


    _createActionElement() {
        //action element
        let mainContainer = document.createElement("table");
        mainContainer.className = "oneDriveFileAccess_mainContainer";

        let pathRow = document.createElement("tr");
        mainContainer.appendChild(pathRow);
        let fileDisplayRow = document.createElement("tr");
        mainContainer.appendChild(fileDisplayRow);
        let filterRow = document.createElement("tr");
        mainContainer.appendChild(filterRow);
        let fileNameRow = document.createElement("tr");
        mainContainer.appendChild(fileNameRow);
        let buttonsRow = document.createElement("tr");
        mainContainer.appendChild(buttonsRow);

        //drive selection
        let drivesCell = document.createElement("td");
        drivesCell.className = "oneDriveFileAccess_drivesCell";
        drivesCell.rowSpan = 5;
        pathRow.appendChild(drivesCell);

        let drivesTitleElement = document.createElement("div");
        drivesTitleElement.className = "oneDriveFileAccess_driveTitle";
        drivesTitleElement.innerHTML = "Drives:"
        drivesCell.appendChild(drivesTitleElement);

        this.drivesListElement = document.createElement("div");
        this.drivesListElement.className = "oneDriveFileAccess_driveList";
        drivesCell.appendChild(this.drivesListElement);

        //path display and folder commands
        let pathCell = document.createElement("td");
        pathCell.className = "oneDriveFileAccess_pathCell";
        pathRow.appendChild(pathCell);

        this.pathElement = document.createElement("div");
        this.pathElement.className = "oneDriveFileAccess_pathElement";
        pathCell.appendChild(this.pathElement);

        //commands - parent folder, file type filter, add folder (for save only)
        let commandElement = document.createElement("div");
        commandElement.className = "oneDriveFileAccess_commandElement";
        pathCell.appendChild(commandElement);

        let parentFolderButton = document.createElement("button");
        parentFolderButton.innerHTML = "^";
        parentFolderButton.onclick = () => this._onParentFolderSelect();
        commandElement.appendChild(parentFolderButton);
        if(this.action == fileAccessConstants.SAVE_ACTION) {
            let addFolderButton = document.createElement("button");
            addFolderButton.innerHTML = "+"
            addFolderButton.onclick = () => this._onCreateFolder();
            commandElement.appendChild(addFolderButton);
        }
        
        //file display list
        let fileListCell = document.createElement("td");
        fileListCell.className = "oneDriveFileAccess_fileListCell";
        fileDisplayRow.appendChild(fileListCell);

        this.fileListTable = document.createElement("table");
        this.fileListTable.className = "oneDriveFileAccess_fileListTable";
        fileListCell.appendChild(this.fileListTable);

        //file filter row
        let filterCell = document.createElement("div");
        filterCell.className = "oneDriveFileAccess_filterCell";
        filterRow.appendChild(filterCell);
        
        let fileFilterLabel = document.createElement("span");
        fileFilterLabel.innerHTML = "Show Files: "
        filterCell.appendChild(fileFilterLabel);
        let radioGroupName = apogeeutil.getUniqueString();
        let allId = apogeeutil.getUniqueString();
        let jsonId = apogeeutil.getUniqueString();
        let jsonTextId = apogeeutil.getUniqueString();

        this.allRadio = document.createElement("input");
        this.allRadio.id = allId;
        this.allRadio.type = "radio";
        this.allRadio.name = radioGroupName;
        this.allRadio.value = "all";
        this.allRadio.checked = (this.filter == _allFilter);
        this.allRadio.onclick = () => this._onFilterChange();
        filterCell.appendChild(this.allRadio);
        let allRadioLabel = document.createElement("label");
        allRadioLabel.for = allId;
        allRadioLabel.innerHTML = "All";
        allRadioLabel.className = "oneDriveFileAccess_filterCheckboxLabel";
        filterCell.appendChild(allRadioLabel);

        this.jsonRadio = document.createElement("input");
        this.jsonRadio.id = jsonId;
        this.jsonRadio.type = "radio";
        this.jsonRadio.name = radioGroupName;
        this.jsonRadio.value = "json";
        this.jsonRadio.checked = (this.filter == _jsonFilter);
        this.jsonRadio.onclick = () => this._onFilterChange();
        filterCell.appendChild(this.jsonRadio);
        let jsonRadioLabel = document.createElement("label");
        jsonRadioLabel.for = jsonId;
        jsonRadioLabel.innerHTML = "JSON Only";
        jsonRadioLabel.className = "oneDriveFileAccess_filterCheckboxLabel";
        filterCell.appendChild(jsonRadioLabel);

        this.jsonTextRadio = document.createElement("input");
        this.jsonTextRadio.id = jsonTextId;
        this.jsonTextRadio.type = "radio";
        this.jsonTextRadio.name = radioGroupName;
        this.jsonTextRadio.value = "jsontext";
        this.jsonTextRadio.checked = (this.filter == _jsonTextFilter);
        this.jsonTextRadio.onclick = () => this._onFilterChange();
        filterCell.appendChild(this.jsonTextRadio);
        let jsonTextRadioLabel = document.createElement("label");
        jsonTextRadioLabel.for = jsonTextId;
        jsonTextRadioLabel.innerHTML = "JSON & Text Only";
        jsonTextRadioLabel.className = "oneDriveFileAccess_filterCheckboxLabel";
        filterCell.appendChild(jsonTextRadioLabel);

        //file name entry
        let fileNameCell = document.createElement("td");
        fileNameCell.className = "oneDriveFileAccess_fileNameCell";
        fileNameRow.appendChild(fileNameCell);

        if(this.action == fileAccessConstants.SAVE_ACTION) {
            let fileNameLabel = document.createElement("span");
            fileNameLabel.className = "oneDriveFileAccess_fileNameLabel";
            fileNameLabel.innerHTML = "File Name:";
            fileNameCell.appendChild(fileNameLabel);

            //save has a text field to enter file name
            this.saveFileNameField = document.createElement("input");
            this.saveFileNameField.type = "text";
            this.saveFileNameField.className = "oneDriveFileAccess_saveFileNameField";
            fileNameCell.appendChild(this.saveFileNameField);

            if((this.initialFileMetadata)&&(this.initialFileMetadata.name)) {
                //initialize name if it is available
                this.saveFileNameField.value = this.initialFileMetadata.name
            }
        }

        //save/open, cancel buttons
        let buttonsCell = document.createElement("td");
        buttonsCell.className = "oneDriveFileAccess_buttonsCell";
        buttonsRow.appendChild(buttonsCell);

        if(this.action == fileAccessConstants.SAVE_ACTION) {
            let submitButton = document.createElement("button");
            submitButton.innerHTML = "Save";
            submitButton.className = "oneDriveFileAccess_submitButton";
            submitButton.onclick = () => this._onSavePress();
            buttonsCell.appendChild(submitButton);
        }
        
        let cancelButton = document.createElement("button");
        cancelButton.innerHTML = "Cancel";
        cancelButton.className = "oneDriveFileAccess_cancelButton";
        cancelButton.onclick = () => this._onCancelPress();
        buttonsCell.appendChild(cancelButton);

        //add the logged out shield - made earlier
        //we are putting it in like this so we can place it beblow the cancle button, but above everything else.
        let shieldParent = document.createElement("div");
        shieldParent.className = "oneDriveFileAccess_shieldParent";
        mainContainer.appendChild(shieldParent);

        shieldParent.appendChild(this.loggedOutShield);

        this.actionElement = mainContainer;
    }

    /** This function sets of the source selection items */
    _addDriveElement(driveInfo) {
        let driveElement = document.createElement("div");
        driveElement.className = "oneDriveFileAccess_driveElement";
        driveElement.innerHTML = driveInfo.name;
        driveElement.onclick = () => this._onSelectDrive(driveInfo.driveId);

        this.driveSelectionElementMap[driveInfo.driveId] = driveElement;
        this.drivesListElement.appendChild(driveElement);
    }


    _getPathDriveElement(driveEntry) {
        let driveElement = document.createElement("span");
        driveElement.className = "oneDriveFileAccess_pathDriveElement";
        driveElement.innerHTML = driveEntry.name + ":";
        return driveElement;
    }

    _getPathDelimiterElement() {
        let delimiterElement = document.createElement("span");
        delimiterElement.className = "oneDriveFileAccess_pathDelimiterElement";
        delimiterElement.innerHTML = ">";
        return delimiterElement;
    }

    _getPathElement(fileInfo) {
        let folderName;
        if(fileInfo === fileAccessConstants.BROKEN_PATH_ENTRY) {
            folderName = "...";
        }
        else {
            folderName = fileInfo.name;
        }

        let folderElement = document.createElement("span");
        folderElement.className = "oneDriveFileAccess_pathFileElement";
        folderElement.innerHTML = folderName;
        return folderElement;
    }

    _addFileListEntry(fileInfo) {
        let fileRow = document.createElement("tr");
        fileRow.className = "oneDriveFileAccess_fileRow";
        let fileIconCell = document.createElement("td");
        fileIconCell.className = "oneDriveFileAccess_fileIconCell";
        fileRow.appendChild(fileIconCell);
        let fileIcon = document.createElement("img");
        fileIcon.src = this._getIconUrl(fileInfo.type);
        fileIconCell.appendChild(fileIcon);

        let fileNameCell = document.createElement("td");
        fileNameCell.className = "oneDriveFileAccess_fileNameCell";
        fileRow.appendChild(fileNameCell);

        let fileLink = document.createElement("a");
        fileLink.innerHTML = fileInfo.name;
        fileLink.onclick = () => this._onFileClick(fileInfo);
        fileNameCell.appendChild(fileLink);

        if(fileInfo.type == fileAccessConstants.FOLDER_TYPE) {
            fileLink.className = "oneDriveFileAcess_fileLinkFolder";
        }
        else if(this.action == fileAccessConstants.OPEN_ACTION) {
            fileLink.className = "oneDriveFileAcess_fileLinkFileOpen";
        }
        else if(this.action == fileAccessConstants.SAVE_ACTION) {
            fileLink.className = "oneDriveFileAcess_fileLinkFileSave";
        }

        let fileMimeCell = document.createElement("td");
        fileMimeCell.className = "oneDriveFileAccess_fileMimeCell";
        if(fileInfo.type != fileAccessConstants.FOLDER_TYPE) fileMimeCell.innerHTML = fileInfo.type;
        fileRow.appendChild(fileMimeCell);

        let fileCmdCell = document.createElement("td");
        fileCmdCell.className = "oneDriveFileAccess_fileCmdCell";
        fileRow.appendChild(fileCmdCell);
        /////////////////////////
        let renameButton = document.createElement("button");
        renameButton.className = "oneDriveFileAccess_renameButton";
        renameButton.innerHTML = "Rename";
        renameButton.onclick = () => this._onFileRename(fileInfo);
        fileCmdCell.appendChild(renameButton);
        let deleteButton = document.createElement("button");
        deleteButton.className = "oneDriveFileAccess_deleteButton";
        deleteButton.innerHTML = "Delete";
        deleteButton.onclick = () => this._onFileDelete(fileInfo);
        fileCmdCell.appendChild(deleteButton);
        /////////////////////////
        
        this.fileElementMap[fileInfo.fileId] = fileRow;

        this.fileListTable.appendChild(fileRow);
    }

    _getIconUrl(mimeType) {
        let resourceName = fileAccessConstants.ICON_MAP[mimeType];
        if(resourceName === undefined) {
            resourceName = fileAccessConstants.DEFAULT_MIME_ICON;
        }
        return uiutil.getResourcePath(resourceName);
    }

}

//These values are saved as defaults for the next time the dialog is used.
let _cachedDriveId = null;
let _cachedFolderId = null;

//filters
const JSON_MIME_TYPE = "application/json";
const TEXT_MIME_TYPE = "text/plain";

let _allFilter = fileInfo => true;
let _jsonFilter = fileInfo => ((fileInfo.type == fileAccessConstants.FOLDER_TYPE)||(fileInfo.type == JSON_MIME_TYPE));
let _jsonTextFilter = fileInfo => ((fileInfo.type == fileAccessConstants.FOLDER_TYPE)||(fileInfo.type == JSON_MIME_TYPE)||(fileInfo.type == TEXT_MIME_TYPE));