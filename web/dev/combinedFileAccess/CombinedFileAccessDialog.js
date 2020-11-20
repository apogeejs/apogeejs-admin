import {uiutil, dialogMgr}  from "/apogeeui/apogeeUiLib.js";

/** This shows the combined file same dialog */
export function showCombinedAccessDialog(title,activeSource,sourceList) {
    
    var dialog = dialogMgr.createDialog({"minimizable":true,"maximizable":true,"movable":true});
            
    //add a scroll container
    var mainContainer = document.createElement("div");
    mainContainer.className = "combinedFileAccess_mainContainer";
	dialog.setContent(mainContainer,uiutil.SIZE_WINDOW_TO_CONTENT);
    
    //title
    let titleElement = document.createElement("div");
    titleElement.className = "combinedFileAccess_titleElement";
    titleElement.innerHTML = title;
    mainContainer.appendChild(titleElement);

    //body row
    let bodyElement = document.createElement("div");
    bodyElement.className = "combinedFileAccess_bodyElement";
    mainContainer.appendChild(bodyElement);

    //source selection
    let selectListElement = document.createElement("div");
    selectListElement.className = "combinedFileAccess_selectList";
    mainContainer.appendChild(selectListElement);

    //action element
    let actionElement = document.createElement("div");
    actionElement.className = "combinedFileAccess_actionElement";
    mainContainer.appendChild(actionElement);

    //create the selection entries for each element
    let sourceSelectionInfo = {};
    sourceSelectionInfo.sourceActionElement = actionElement; 
    sourceSelectionInfo.selectionElements = sourceList.forEach(source => _getSelectionElement(source,sourceSelectionInfo));

    //make the initial selection
    _selectSource(activeSource,sourceSelectionInfo);
    
    //pass the source finished callback
    //if the dialog should close, the "endAction" argument should be true
    //in this case all sources will have their "close" function called.
    //otherwise, the dialog stays open and the sources are not closed.
    let onSourceFinish = (endAction) => {
        if(endAction) {
            dialog.closeDialog();
        }
    }
    sourceList.forEach(source => source.setOnDialogComplete(onSourceFinish));

    //prepare dialog
    dialog.setContent(content,uiutil.SIZE_WINDOW_TO_CONTENT);
    
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

    titleElement.onclick(() => _selectSource(source,sourceSelectionInfo));
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
    let oldSelectionElement = _lookupSelectionElement(oldActiveSource,sourceSelectInfo);
    oldSelectionElement.classList.remove("combinedFileAccess_selectionWrapperActive");
    oldActiveSource.makeActive(false);

    //new selection
    newActiveSource.makeActive(true);
    sourceSelectInfo.activeSource = newActiveSource;
    let newSelectionElement = _lookupSelectionElement(oldActiveSource,sourceSelectInfo);
    newSelectionElement.classList.add("combinedFileAccess_selectionWrapperActive");

    uiutil.removeAllChildren(sourceSelectInfo.sourceActionElement);
    sourceSelectInfo.sourceActionElement.appendChild(newActiveSource.getActionElement());
}



