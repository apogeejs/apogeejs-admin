import {uiutil, dialogMgr}  from "/apogeeui/apogeeUiLib.js";

/** This shows the combined file same dialog */
export function showCombinedAccessDialog(title,activeSource,sourceList) {
    
    let dialog = dialogMgr.createDialog({"minimizable":true,"maximizable":true,"movable":true});
            
    let mainContainer = document.createElement("table");
    mainContainer.className = "combinedFileAccess_mainContainer";

    let titleRow = document.createElement("tr");
    mainContainer.appendChild(titleRow);
    let sourceRow = document.createElement("tr");
    mainContainer.appendChild(sourceRow);
    let bodyRow = document.createElement("tr");
    mainContainer.appendChild(bodyRow);

    //title
    let titleElement = document.createElement("td");
    titleElement.colSpan = 2;
    titleElement.className = "combinedFileAccess_titleElement";
    titleElement.innerHTML = title;
    titleRow.appendChild(titleElement);

    //source selection title
    let selectTitleCell = document.createElement("td");
    selectTitleCell.className = "combinedFileAccess_selectCell";
    selectTitleCell.innerHTML = "File Source:"
    sourceRow.appendChild(selectTitleCell);

    //selected source
    this.selectedSourceCell = document.createElement("td");
    selectedSourceCell.className = "combinedFileAccess_sourceSelectTitle";
    sourceRow.appendChild(selectedSourceCell);

    //body
    let selectListCell = document.createElement("td");
    selectListCell.className = "combinedFileAccess_sourceSelectTitle";
    bodyRow.appendChild(selectListCell);

    let selectListElement = document.createElement("div");
    selectListElement.className = "combinedFileAccess_selectList";
    selectCell.appendChild(selectListElement);

    //action element
    let actionElement = document.createElement("td");
    actionElement.className = "combinedFileAccess_actionElement";
    bodyRow.appendChild(actionElement);

    //create a structure to hold our working data
    //and create the selection entries for each source.
    let sourceSelectionInfo = {};
    sourceSelectionInfo.sourceActionElement = actionElement; 
    
    let selectionElementData = sourceList.map(source => {
        return {
            name: source.getName(), 
            element: _getSelectionElement(source,sourceSelectionInfo)
        }
    });

    //add each element to our selection list and store it for later use
    sourceSelectionInfo.selectionElementMap = {};
    selectionElementData.forEach( entryData => {
        selectListElement.appendChild(entryData.element);
        sourceSelectionInfo.selectionElementMap[entryData.name] = entryData.element;
    })

    //make the initial selection
    _selectSource(activeSource,sourceSelectionInfo);
    
    //pass the source finished callback
    //if the dialog should close, the "endAction" argument should be true
    //in this case all sources will have their "close" function called.
    //otherwise, the dialog stays open and the sources are not closed.
    let onSourceFinish = (endAction) => {
        if(endAction) {
            //close dialog
            dialogMgr.closeDialog(dialog);
            //clean up all sources
            sourceList.forEach(source => source.close());
        }
        else {
            //we dont' close if false is passed
        }
    }
    sourceList.forEach(source => source.setOnDialogComplete(onSourceFinish));

    //prepare dialog
    dialog.setContent(mainContainer);
    
    //show dialog
    dialogMgr.showDialog(dialog);
}

/** This function sets of the source selection items */
function _getSelectionElement(source,sourceSelectionInfo) {
    let wrapperElement = document.createElement("div");
    wrapperElement.className = "combinedFileAccess_selectionWrapper";

    let titleElement = document.createElement("div");
    titleElement.className = "combinedFileAccess_selectionTitleWrapper";

    let titleLabel = document.createElement("span");
    titleLabel.className = "combinedFileAccess_selectionTitle";
    titleLabel.innerHTML = source.getDisplayName();
    titleElement.appendChild(titleLabel);

    let iconUrl = source.getIconUrl();
    if(iconUrl) {
        let titleIcon = document.createElement("img");
        titleIcon.className = "combinedFileAccess_selectionIcon";
        titleElement.appendChild(titleIcon);
    }

    titleElement.onclick = () => _selectSource(source,sourceSelectionInfo);
    wrapperElement.appendChild(titleElement);

    let sourceConfigElement = source.getConfigDomElement();
    if(sourceConfigElement) {
        let configWrapperElement = document.createElement("div");
        configWrapperElement.className = "combinedFileAccess_selectionConfigWrapper";
        configWrapperElement.appendChild(sourceConfigElement);
        wrapperElement.appendChild(configWrapperElement);
    }

    return wrapperElement;
}

/** This function changes the active source */
function _selectSource(newActiveSource,sourceSelectInfo) {
    if(sourceSelectInfo.activeSource == newActiveSource) return;

    //old selection
    let oldActiveSource = sourceSelectInfo.activeSource;
    if(oldActiveSource) {
        let oldSelectionElement = _lookupSelectionElement(oldActiveSource,sourceSelectInfo);
        oldSelectionElement.classList.remove("combinedFileAccess_selectionWrapperActive");
        oldActiveSource.makeActive(false);
    }

    //new selection
    newActiveSource.makeActive(true);
    sourceSelectInfo.activeSource = newActiveSource;
    let newSelectionElement = _lookupSelectionElement(newActiveSource,sourceSelectInfo);
    newSelectionElement.classList.add("combinedFileAccess_selectionWrapperActive");

    this.selectedSourceCell.innerHTML = newActiveSource.getDisplayName();

    uiutil.removeAllChildren(sourceSelectInfo.sourceActionElement);
    sourceSelectInfo.sourceActionElement.appendChild(newActiveSource.getActionElement());
}

function _lookupSelectionElement(source,sourceSelectInfo) {
    return sourceSelectInfo.selectionElementMap[source.getName()];
}



