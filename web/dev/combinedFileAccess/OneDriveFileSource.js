import apogeeutil from "/apogeeutil/apogeeUtilLib.js";
import {uiutil}  from "/apogeeui/apogeeUiLib.js";

export class OneDriveFileSource {
    /** constructor */
    constructor(metadata,data,action,onActionComplete) {
        this.data = data;
        this.action = action;
        this.metadata = metadata;
        //this is a callback to signify the save/open is successful/failed/canceled
        this.onActionComplete = onActionComplete;
        //this is a callback to notify the dialog the action is complete
        this.onDialogComplete = null;

        

        // this.driveState
        // this.selectedDriveId
        this.driveSelectionElementMap = {}

        // this.fileState
        // this.selectedFileId
        this.fileElementMap = {};


        // this.actionElement
        // this.configElement

        // this.fileNameTextField
        // this.pathCell
        // this.fileListElement
        // this.drivesListElement
        // this.allRadio
        // this.jsonRadio
    }

    //============================
    // Public Methods
    //============================

    getName() {
        return OneDriveFileSource.NAME;
    }

    getDisplayName() {
        return OneDriveFileSource.DISPLAY_NAME;
    }

    //-----------------------------
    // File Actions
    //-----------------------------

    saveFile(fileMetadata,data) {
        alert("implement this!");
        if(this.action !== "save")  this.onComplete("Unknown Error in action",false,null);

        //automatic success
        if(this.onActionComplete) this.onActionComplete(null,true,fileMetadata); 
        //close dialog
        if(this.onDialogComplete) this.onDialogComplete(true);    
    }

    openFile(fileMetadata,data) {
        alert("implement this!");
        if(this.action !== "open")  this.onComplete("Unknown Error in action",false,null);

        //automatic success
        if(this.onActionComplete) this.onActionComplete(null,data,fileMetadata);
        //close dialog
        if(this.onDialogComplete) this.onDialogComplete(true);
    }

    cancelAction() {
        if(this.onActionComplete) this.onActionComplete(null,false,null);
        //close dialog
        if(this.onDialogComplete) this.onDialogComplete(true);
    }

    /** This method is called externally after the dialog box using the soruce closes. */
    close() {
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

    getConfigDomElement() {
        if(!this.configElement) {
            this.configElement = this._createConfigElement();
        }
        return this.configElement;
    }

    setOnDialogComplete(onDialogComplete) {
        this.onDialogComplete = onDialogComplete
    }

    getActionElement() {
        if(!this.actionElement) {
            this.actionElement = this._createActionElement();
        }
        return this.actionElement;
    }


    //===================================
    // Private Methods
    //===================================

    //--------------------
    // event handler
    //--------------------

    _onParentFolder(parentFileId) {
        __loadFileList(this.selectedDriveId,parentFileId,(fileState) => this._fileStateCallback(fileState));
    }

    _onFilterChange() {

    }

    _onCreateFolder(something) {

    }

    _onFileClick(fileInfo) {
        //select element
        let oldSelectedFileId = this.selectedFileId;
        if(oldSelectedFileId) {
            let oldSelectedFileElement = this.fileElementMap[oldSelectedFileId];
            if(oldSelectedFileElement) {
                oldSelectedFileElement.classList.remove("oneDriveFileAccess_fileListEntryElementActive");
            }
        }
        this.selectedFileId = fileInfo.id;
        if(this.selectedFileId) {
            let newSelectedFileElement = this.fileElementMap[this.selectedFileId];
            if(newSelectedFileElement) {
                newSelectedFileElement.classList.add("oneDriveFileAccess_fileListEntryElementActive");
            }
        }

        //take any needed action
        if(fileInfo.type == "__folder__") {
            //open the folder
            __loadFileList(this.selectedDriveId,fileInfo.id,(fileState) => this._fileStateCallback(fileState));
        }
        else {
            //put the name in the file name field
            this.fileNameTextField.value = fileInfo.name;
        }

    }

    _onFileDelete(something) {

    }

    _onFileRename(something) {

    }

    _onSavePress() {

    }

    _onCancelPress() {

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

            //load the default folder
            __loadFileList(this.selectedDriveId,null,(fileState) => this._fileStateCallback(fileState));
        }
  
    }

    //---------------------
    //internal callbacks
    //----------------------

    _drivesStateCallback(driveState) {
        this.driveState = driveState;

        this.selectedDriveId = undefined;
        this.driveSelectionElementMap = {};
        uiutil.removeAllChildren(this.drivesListElement);

        if(this.driveState) {
            let selectedDriveId; 
            if(driveState.defaultDriveId) selectedDriveId = driveState.defaultDriveId;

            if((this.driveState.drives)&&(this.driveState.drives.length > 0)) {
                this.driveState.drives.forEach( driveInfo => this._addDriveElement(driveInfo))

                if(selectedDriveId === undefined) {
                    selectedDriveId = this.driveState.drives[0].id;
                }
            }

            //set initial drive state
            if(selectedDriveId !== undefined) {
                this._onSelectDrive(selectedDriveId);
            }
        }
        
    }


    _fileStateCallback(fileState) {
        this.fileState = fileState;
        this.fileElementMap = {};
        this.selectedFileId = undefined;

        this._populatePathCell();
        this._populateFileList();

    }

    _populatePathCell() {
        uiutil.removeAllChildren(this.pathCell);
        uiutil.removeAllChildren(this.fileListElement);

        let selectedDriveInfo = this._getSelectedDriveInfo();
        if(selectedDriveInfo) {
            this.pathCell.appendChild(this._getPathDriveElement(selectedDriveInfo));
        }
        if(this.fileState) {
            if(this.fileState.path) {
                this.fileState.path.forEach( (pathEntry,index) => {
                    if(index >= 1) {
                        this.pathCell.appendChild(this._getPathDelimiterElement());
                    }
                    this.pathCell.appendChild(this._getPathElement(pathEntry));
                })
            }
        }
        
    }

    _populateFileList() {
        uiutil.removeAllChildren(this.fileListElement);
        if((this.fileState)&&(this.fileState.files)) {
            this.fileState.files.forEach(fileInfo => this._addFileListEntry(fileInfo));
        }
    }

    _getSelectedDriveInfo() {
        if((this.driveState)&&(this.driveState.drives)&&(this.selectedDriveId)) {
            return this.driveState.drives.find( driveEntry => driveEntry.id == this.selectedDriveId);
        }
        else return undefined;
    }

    
    /** This function sets of the source selection items */
    _addDriveElement(driveInfo) {
        let driveElement = document.createElement("div");
        driveElement.className = "oneDriveFileAccess_driveElement";
        driveElement.innerHTML = driveInfo.name;
        driveElement.onclick = () => this._onSelectDrive(driveInfo.id);

        this.driveSelectionElementMap[driveInfo.id] = driveElement;
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

    _getPathElement(pathEntry) {
        let folderElement = document.createElement("span");
        folderElement.className = "oneDriveFileAccess_pathFileElement";
        folderElement.innerHTML = pathEntry.name;
        return folderElement;
    }

    _addFileListEntry(fileInfo) {
        let fileElement = document.createElement("div");
        fileElement.className = "oneDriveFileAccess_fileListEntryElement";
        fileElement.innerHTML = fileInfo.name;
        this.fileListElement.appendChild(fileElement);

        fileElement.onclick = () => this._onFileClick(fileInfo);
        this.fileElementMap[fileInfo.id] = fileElement;
    }

    //--------------------
    // create elements
    //--------------------
    _createConfigElement() {
        //not logged in: login button
        //logged in: display name, log out button (on next line)
    }

    
    _createActionElement() {
        //action element
        let mainContainer = document.createElement("table");
        mainContainer.className = "oneDriveFileAccess_mainContainer";

        let pathRow = document.createElement("tr");
        mainContainer.appendChild(pathRow);
        let commandRow = document.createElement("tr");
        mainContainer.appendChild(commandRow);
        let fileDisplayRow = document.createElement("tr");
        mainContainer.appendChild(fileDisplayRow);
        let fileNameRow = document.createElement("tr");
        mainContainer.appendChild(fileNameRow);
        let buttonsRow = document.createElement("tr");
        mainContainer.appendChild(buttonsRow);

        //drive selection
        let drivesTitleCell = document.createElement("td");
        drivesTitleCell.className = "oneDriveFileAccess_driveTitle";
        drivesTitleCell.innerHTML = "Drives:"
        pathRow.appendChild(drivesTitleCell);

        let drivesCell = document.createElement("td");
        drivesCell.className = "oneDriveFileAccess_drivesCell";
        drivesCell.rowSpan = 4;
        commandRow.appendChild(drivesCell);

        this.drivesListElement = document.createElement("div");
        this.drivesListElement.className = "oneDriveFileAccess_driveList";
        drivesCell.appendChild(this.drivesListElement);

        //path display
        this.pathCell = document.createElement("td");
        this.pathCell.className = "oneDriveFileAccess_pathCell";
        pathRow.appendChild(this.pathCell);

        //commands - parent folder, file type filter, add folder (for save only)
        let commandCell = document.createElement("td");
        commandCell.className = "oneDriveFileAccess_commandCell";
        commandRow.appendChild(commandCell);

        let parentFolderButton = document.createElement("button");
        parentFolderButton.innerHTML = "^";
        parentFolderButton.onclick = () => this._onParentFolderButton();
        commandCell.appendChild(parentFolderButton);
        if(this.action == "save") {
            let addFolderButton = document.createElement("button");
            addFolderButton.innerHTML = "+"
            addFolderButton.onclick = () => this._onCreateFolder();
            commandCell.appendChild(addFolderButton);
        }

        let filterWrapper = document.createElement("div");
        filterWrapper.className = "oneDriveFileAccess_filterWrapper";
        commandCell.appendChild(filterWrapper);
        
        let fileFilterLabel = document.createElement("span");
        fileFilterLabel.innerHTML = "Show Files: "
        filterWrapper.appendChild(fileFilterLabel);
        let radioGroupName = apogeeutil.getUniqueString();
        let allId = apogeeutil.getUniqueString();
        let jsonId = apogeeutil.getUniqueString();

        this.allRadio = document.createElement("input");
        this.allRadio.type = "radio";
        this.allRadio.name = radioGroupName;
        this.allRadio.value = "all";
        this.allRadio.onclick = () => this._onFilterChange();
        filterWrapper.appendChild(this.allRadio);
        let allRadioLabel = document.createElement("label");
        allRadioLabel.for = allId;
        allRadioLabel.innerHTML = "All";
        filterWrapper.appendChild(allRadioLabel);

        this.jsonRadio = document.createElement("input");
        this.jsonRadio.type = "radio";
        this.jsonRadio.name = radioGroupName;
        this.jsonRadio.value = "json";
        this.jsonRadio.onChange = () => this._onFilterChange();
        filterWrapper.appendChild(this.jsonRadio);
        let jsonRadioLabel = document.createElement("label");
        jsonRadioLabel.for = jsonId;
        jsonRadioLabel.innerHTML = "JSON";
        filterWrapper.appendChild(jsonRadioLabel);
        
        //file display list
        let fileListCell = document.createElement("td");
        fileListCell.className = "oneDriveFileAccess_fileListCell";
        fileDisplayRow.appendChild(fileListCell);

        this.fileListElement = document.createElement("div");
        this.fileListElement.className = "oneDriveFileAccess_fileListElement";
        fileListCell.appendChild(this.fileListElement);

        //file name entry
        let fileNameCell = document.createElement("td");
        fileNameCell.className = "oneDriveFileAccess_fileNameCell";
        fileNameRow.appendChild(fileNameCell);

        let fileNameLabel = document.createElement("span");
        fileNameLabel.className = "oneDriveFileAccess_fileNameLabel";
        fileNameLabel.innerHTML = "File Name:";
        fileNameCell.appendChild(fileNameLabel);
        this.fileNameTextField = document.createElement("input");
        this.fileNameTextField.type = "text";
        this.fileNameTextField.className = "oneDriveFileAccess_fileNameTextField";
        fileNameCell.appendChild(this.fileNameTextField);

        //save/open, cancel buttons
        let buttonsCell = document.createElement("td");
        buttonsCell.className = "oneDriveFileAccess_buttonsCell";
        buttonsRow.appendChild(buttonsCell);

        let submitButton = document.createElement("button");
        submitButton.innerHTML = (this.action == "save") ? "Save": "Open";
        submitButton.className = "oneDriveFileAccess_submitButton";
        buttonsCell.appendChild(submitButton);
        let cancelButton = document.createElement("button");
        cancelButton.innerHTML = "Cancel";
        cancelButton.className = "oneDriveFileAccess_cancelButton";
        buttonsCell.appendChild(cancelButton);

        this._populateForm();

        return mainContainer;
    }

    _populateForm() {
        __loadDriveList((driveList) => this._drivesStateCallback(driveList));
    }



}

//this is the identifier name for the source
OneDriveFileSource.NAME = "oneDrive";

//this is the identifier name for the source
OneDriveFileSource.DISPLAY_NAME = "Microsoft OneDrive"

//this is metadata for a new file. Name is blank and there is not additional data besides source name.
OneDriveFileSource.NEW_FILE_METADATA = {
    source: OneDriveFileSource.NAME
    //displayName:
    //metadata: { ??? }
}

OneDriveFileSource.directSaveOk = function(fileMetadata) {
    //fix this
    return false;
}

////////////////////////////////
//DEV
function __loadDriveList(drivesStateCallback) {
    drivesStateCallback(TEST_DRIVE_LIST);
}

function __loadFileList(driveId,folderId,fileStateCallback) {
    fileStateCallback(TEST_FILE_STATE_1);
}

const TEST_DRIVE_LIST = {
    defaultDriveId: "drive1",
    drives: [
        {
            name: "Personal Drive",
            id: "drive1"
        },
        {
            name: "Work Drive",
            id: "drive2"
        }
    ]
}

const TEST_FILE_STATE_1 = {
    path: [
        {
            name: "test",
            type: "__folder__",
            id: "folder1"
        },
        {
            name: "workspaces",
            type: "__folder__",
            id: "folder2"
        }
    ],
    files: [
        {
            name: "workspace1.json",
            type: "application/json",
            id: "file1"
        },
        {
            name: "workspace2.json",
            type: "application/json",
            id: "file2"
        },
        {
            name: "workspace3.json",
            type: "application/json",
            id: "file3"
        },
        {
            name: "chidlFolder",
            type: "__folder__",
            id: "folder3"
        }
    ]
}