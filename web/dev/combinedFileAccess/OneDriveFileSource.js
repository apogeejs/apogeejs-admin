import apogeeutil from "/apogeeutil/apogeeUtilLib.js";

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

    _onParentFolderLink(something) {

    }

    _onParentFolderButton(something) {

    }

    _onFilterChange() {

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

        // this.drivesListElement
        // this.pathCell
        // this.fileListElement
        // this.fileNameTextField
        // this.allRadio 
        // this.jsonRadio

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