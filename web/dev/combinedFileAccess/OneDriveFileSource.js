import ace from "/ext/ace/ace_1.4.3/ace.es.js";
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
            this.actionElement = null;
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

    _onParentFolderLink(something) {

    }

    _onParentFolderButton(something) {

    }

    _onFileFilterChange(something) {

    }

    _onCreateFolder(something) {

    }

    _onFileClick(something) {

    }

    _onFileDelete(something) {

    }

    _onFileRename(something) {

    }

    _onSavePress() {

    }

    _onCancelPress() {

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
        mainContainer.appendChild(commandsRow);
        let fileDisplayRow = document.createElement("tr");
        mainContainer.appendChild(fileDisplayRow);
        let fileNameRow = document.createElement("tr");
        mainContainer.appendChild(fileNameRow);
        let buttonsRow = document.createElement("tr");
        mainContainer.appendChild(bodbuttonsRowyRow);

        //drive selection
        let drivesCell = document.createElement("td");
        drivesCell.className = "oneDriveFileAccess_drivesCell";
        drivesCell.rowSpan = 5;
        bodyRow.appendChild(drivesCell);

        let drivesTitleElement = document.createElement("h3");
        drivesTitleElement.className = "oneDriveFileAccess_driveTitle";
        drivesTitleElement.innerHTML = "Drives:"
        drivesCell.appendChild(drivesTitleElement);

        this.drivesListElement = document.createElement("div");
        drivesListElement.className = "oneDriveFileAccess_driveList";
        drivesCell.appendChild(drivesListElement);

        //path display
        this.pathCell = document.createElement("td");
        actionElement.className = "oneDriveFileAccess_pathCell";
        pathRow.appendChild(pathCell);

        //commands - parent folder, file type filter, add folder (for save only)
        let commandCell = document.createElement("td");
        actionElement.className = "oneDriveFileAccess_pathCell";
        commandRow.appendChild(commandCell);

        let parentFolderButton = document.createElement("button");
        parentFolderButton.onclick = () => this._onParentFolderButton();
        commandRow.appendChild(parentFolderButton);
        let addFolderButton = document.createElement("button");
        addFolderButton.onclick = () => this._onCreateFolder();
        commandRow.appendChild(addFolderButton);
        // let fileFilterLabel = document.createElement("span");
        // parentFolderButton.onclick = () => this._onParentFolderButton();
        // commandRow.appendChild(parentFolderButton);
        // let fileFilterDropdown = document.createElement("dropdown");
        // parentFolderButton.onclick = () => this._onParentFolderButton();
        // commandRow.appendChild(parentFolderButton);

        //file display list
        let fileListCell = document.createElement("td");
        fileListCell.className = "oneDriveFileAccess_fileListCell";
        fileDisplayRow.appendChild(fileListCell);

        this.fileListElement = document.createElement("div");
        this.fileListElement.className = "oneDriveFileAccess_fileListElement";
        fileListCell.appendChild(fileListElement);

        //file name entry
        let fileNameCell = document.createElement("td");
        actionElement.className = "oneDriveFileAccess_pathCell";
        fileNameRow.appendChild(fileNameCell);

        let fileNameLabel = document.createElement("span");
        fileNameLabel.className = "oneDriveFileAccess_fileNameLabel"
        fileNameCell.appendChild(fileNameLabel);
        let fileNameTextField = document.createElement("input");
        fileNameTextField.type = "text";
        fileNameTextField.classname = "oneDriveFileAccess_fileNameTextField";
        fileNameCell.appendChild(fileNameTextField);

        //save/open, cancel buttons
        let buttonsCell = document.createElement("td");
        actionElement.className = "oneDriveFileAccess_pathCell";
        buttonsRow.appendChild(buttonsCell);

        let submitButton = document.createElement("button");
        submitButton.innerHTML = (this.action == "open") ? "Open" : "Save";
        submitButton.className = "oneDriveFileAccess_submitButton";
        buttonsCell.appendChild(submitButton);
        let cancelButton = document.createElement("button");
        cancelButton.innerHTML = "Cancel";
        cancelButton.className = "oneDriveFileAccess_cancelButton";
        buttonsCell.appendChild(cancelButton);

        this._populateForm();

        return mainContainer;
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