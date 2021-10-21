
let _moduleDataList = [];
let _actionCallback

//module data format:
let moduleData = {
    moduleName: "moduleName, from moduleConfig",
    moduleConfig: "inputData from module info list",
	statusInfo: "status info data structure",
	loadedBodyVersion: "version loaded in dom",
	
    bodyCell: "domElement",
    statusField: "domElement",
    moreContainer: "domElement",
    isOpened: "boolean",
    versionSelector: "domElement",
    notLatestContainer: "domElement",
    workspaceCommandSetContainer: "domElement",
    demoLinkSetContainer: "domElement",
    webLinkSetContainer: "domElement"
}

//for now, onl one version installed/loaded
let statusData = {
    moduleName: "moduleName",
    intallRequired: "boolean",
    
    installedVersion: "null or a version",
    loaded: "boolean",

    loadedVersion: "null or a version"
}

// external functions
//------------------
// createDisplay(moduleListConfig,actionCallback) - create the general dom elements
// setStatusInfo(statusInfo) - populate the status for each module 

// external module data
//---------------------
// moduleConfig
// statusInfo


// internal functions
//------------------
// moreClicked
// lessClicked
// versionSelectorChanged

// external callbacks - actionCallback
//-------------------
// install(moduleName,moduleVersion)
// load(...)
// loadAndInstall(...)
// uninstall(...)
// unload(...)
// (no unload and uninstall?)

//internal module data
//--------------------
// isOpened
// loadedBodyVersion


export function initDisplay(moduleConfigArray,actionCallback) {
    _actionCallback = actionCallback;

    let listContainerElement = document.getElementById("moduleListContainer");
    if(!listContainerElement) {
        fatalError("Error loading page: list container not found!");
        return;
    }

    moduleConfigArray.forEach(_createModuleElement);
}

/*
doh - need more thought on status
- I want to set the status for the specific version, which is being displayed
- (also, on initial display, I want to show the version that is loaded if there is one. Otherwise show the latest.)


*/
export function setStatus(statusDataMap) {
    _moduleDataList.forEach(moduleData => {
        let statusData = statusDataMap[moduleData.moduleName]; //all modules should be present
        _updateModuleStatus(moduleData,statusData);
    })

}


/** This function initially populates the module list, minus elements that 
 * depend on the modules current status. */
 function _createModuleElement(moduleConfig) {

    let moduleData = {};
    moduleData.moduleName = moduleConfig.moduleName;
    moduleData.moduleConfig = moduleConfig;

    //create the main cells
    let moduleCell = document.createElement("div");
    moduleCell.className = "moduleCell";
    let headerCell = document.createElement("div");
    headerCell.className = "headerCell";
    moduleCell.appendChild(headerCell);
    let bodyCell = document.createElement("div");
    bodyCell.className = "bodyCell";
    moduleCell.appendChild(bodyCell);
    moduleData.bodyCell = bodyCell; //save this

    //fill in the header
    let titleField = document.createElement("div");
    titleField.className = "titleField";
    titleField.innerHTML = _getTitle(moduleConfig);
    headerCell.appendChild(titleField);
    let statusField = document.createElement("div");
    statusField.className = "statusField";
    headerCell.appendChild(statusField);
    moduleData.statusField = statusField; //save this
    let shortDescField = document.createElement("div");
    shortDescField.className = "shortDescField";
    shortDescField.innerHTML = _getShortDesc(moduleConfig);
    headerCell.appendChild(shortDescField);

    let moreContainer = document.createElement("div");
    moreContainer.className = "moreOrLessContainer";
    headerCell.appendChild(moreContainer);
    let moreLink = document.createElement("a");
    moreLink.href = "#";
    moreLink.className = "moreOrLessLink";
    moreLink.onclick = () => _moreClicked(moduleData);
    moreLink.innerHTML = "show more";
    moreContainer.appendChild(moreLink);
    moduleData.moreContainer = moreContainer; //save this

    //start in a closed state
    bodyCell.style.display = "none"; //initially invisible
    moreLink.style.display = ""; //initially visible
    moduleData.isOpened = false;

    //fill in the parts of the body that do not depend on the selected version
    let leftCell = document.createElement("div");
    leftCell.className = "leftCell";
    bodyCell.appendChild(leftCell);
    let rightCell = document.createElement("div");
    rightCell.className = "rightCell";
    bodyCell.appendChild(rightCell);

    //left cell
    let versionContainer = document.createElement("div");
    versionContainer.className = "versionContainer";
    leftCell.appendChild(versionContainer);
    let versionLabel = document.createElement("span");
    versionLabel.classname = "versionLabel";
    versionLabel.innerHTML = "Version:";
    versionContainer.appendChild(versionLabel);
    versionSelector = document.createElement("select");
    versionSelector.onchange = () => _versionSelectorChanged(moduleData);
    versionContainer.appendChild(versionSelector);
    let notLatestContainer = document.createElement("div");
    notLatestContainer.className = "notLatestContainer";
    notLatestContainer.innerHTML = "Not Latest Version!"
    versionContainer.appendChild(notLatestContainer);
    _populateVersionSelector(moduleConfig,versionSelector,notLatestContainer);
    moduleData.versionSelector = versionSelector; //save this
    moduleData.notLatestContainer = notLatestContainer; //save this
    
    let workspaceCommandSetContainer = document.createElement("div");
    workspaceCommandSetContainer.className = "workspaceCommandSetContainer";
    leftCell.appendChild(workspaceCommandSetContainer);
    moduleData.workspaceCommandSetContainer = workspaceCommandSetContainer; //save this

    let lessContainer = document.createElement("div");
    lessContainer.className = "moreOrLessContainer";
    leftCell.appendChild(lessContainer);
    let lessLink = document.createElement("a");
    lessLink.href = "#";
    lessLink.className = "moreOrLessLink";
    lessLink.onclick = () => _lessClicked(moduleData);
    lessLink.innerHTML = "show less";
    lessContainer.appendChild(lessLink);

    //right cell
    let demoLinkSetContainer = document.createElement("div");
    demoLinkSetContainer.className = "referenceCommandSetContainer";
    rightCell.appendChild(demoLinkSetContainer);
    moduleData.demoLinkSetContainer = demoLinkSetContainer; //save this

    let webLinkSetContainer = document.createElement("div");
    webLinkSetContainer.className = "referenceCommandSetContainer";
    rightCell.appendChild(webLinkSetContainer);
    moduleData.webLinkSetContainer = webLinkSetContainer; //save this

    //add to the module list
    listContainerElement.appendChild(moduleCell);  
    _moduleDataList.push(moduleData);      
}

/** This function populates the version selector for a module. */
function _populateVersionSelector(moduleConfig,versionSelector,notLatestContainer) {
    moduleConfig.versions.forEach(versionInfo => {
        let optionElement = document.createElement("option");
        optionElement.text = versionInfo.version;
        versionSelector.add(optionElement);
        //make the initial selection the latest
        if(versionInfo.isLatest) {
            versionSelector.selectedIndex = versionSelector.length-1;
        }
    })
    notLatestContainer.style.display = "none"; 
}

/** This method returns the title text for a given module. */
function _getTitle(moduleConfig) {
    let title;
    if(moduleConfig.displayName) title = moduleConfig.displayName + ": ";
    else title = "";

    title += moduleConfig.moduleName;
    return title;
}

/** This function returns the short description for a module. */
function _getShortDesc(moduleConfig) {
    if(moduleConfig.shortDesc) return moduleConfig.shortDesc;
    else return "No description available";
}


/** This method loads the body for a given bersion of a given module */
function _loadBodyForVersion(moduleData) {
    let version = moduleData.versionSelector.value;
    if((moduleData.loadedBodyVersion != version)&&(moduleData.moduleConfig.versions)) {
        //load the new data
        let selectedVersionInfo = lookupVersionInfo(version,moduleData);
        if(selectedVersionInfo) {
            //update commands for the app/workspace
            _setWorkspaceCommands(selectedVersionInfo,moduleData);
            _setReferenceWorkspaces(selectedVersionInfo,moduleData);
            if(selectedVersionInfo.webLink) {
                //add the web link
                _setReferenceWebLink(selectedVersionInfo.webLink,moduleData);
            }
            //set the visibility of the "not latest" label
            moduleData.notLatestContainer.style.display = selectedVersionInfo.isLatest ? "none" : "";
            
            moduleData.loadedBodyVersion = version;
        }
    }
}


//========================
// Handlers
//========================
function _moreClicked(moduleData) {
    //make sure the proper version data is populated
    _loadBodyForVersion(moduleData)

    moduleData.moreContainer.style.display = "none";
    moduleData.bodyCell.style.display = "";
    moduleData.isOpened = true;
}

function _lessClicked(moduleData) {
    moduleData.moreContainer.style.display = "";
    moduleData.bodyCell.style.display = "none";
    moduleData.isOpened = false;
}

function _versionSelectorChanged(moduleData) {
    _loadBodyForVersion(moduleData);
}









/** This sets or updates the part of the module display that depends on the current app/workspace modules. */
function _updateModuleStatus(moduleData,newStatusData) {
    if(isStatusEqual(moduleData.statusData,newStatusData)) return;

    moduleData.statusData = newStatusData;

    //set status message
    moduleData.statusField.innerHTML = _getStatusMsg(newStatusData);

    //set the workspace commands
    if(moduleData.isOpened) {
        _setWorkspaceCommands(moduleData) 
    }
}


/** This method returns the status text for a given status value. */
function _getStatusMsg(statusData) {
    let msg;
    let addVersion = false;
    switch(statusInfo.status) {
        case ES_NOT_LOADED:
            msg = "Not Loaded in Workspace";
            break;

        case ES_LOADED:
            msg = "Loaded in Workspace: ";
            addVersion = true;
            break;

        case NPM_NOT_INSTALLED:
            msg = "Not Installed in App";
            break;

        case NPM_INSTALLED_NOT_LOADED:
            msg = "Not loaded in Workspace; Installed in App: ";
            addVersion = true;
            break;

        case NPM_INSTALLED_AND_LOADED:
            msg = "Installed and Loaded in Workspace: ";
            addVersion = true;
            break;

        case STATUS_UNKNOWN:
        default:
            msg = "Status Unknown";
            break;
    }

    if(addVersion) {
        msg += statusInfo.version;
        if(statusInfo.unrecognizedVersion) {
            msg += " (Unrecognized Version!)";
        }
    }

    return msg;
}




/** This function adds the workspace commands for a module, which is the commands to add and remove
 * the module from the application/workspace. */
function _setWorkspaceCommands(selectedVersionInfo,moduleData) {
    let domContainer = moduleData.workspaceCommandSetContainer;
    let statusInfo = moduleData.statusInfo;

    //clear data
    domContainer.innerHTML = "";

    switch(statusInfo.status) {
        case STATUS_UNKNOWN:
            //figure out what to do here
            break;

        case ES_NOT_LOADED:
            //load the selected version
            {
                let handler = () => loadEsModule(selectedVersionInfo.esUrl,moduleData.moduleName); 
                let msg;
                if(selectedVersionInfo.isLatest) {
                    msg = "Load Module to Workspace";
                }
                else {
                    msg = "Load this Version to Workspace (not latest) "
                }
                moduleData.workspaceCommandSetContainer.appendChild(createWorkspaceCommand(msg,handler));
            }
            break;

        case ES_LOADED:
            //unload the current version, whichever that is
            {
                let handler = () => unloadEsModule(statusInfo.url); 
                let msg = "Unload Module from Workspace";
                moduleData.workspaceCommandSetContainer.appendChild(createWorkspaceCommand(msg,handler));
            }

            //if the selected version is not loaded, allow for a switch
            //specify if the selected is latest/newer, not latest/older
            if(statusInfo.version != selectedVersionInfo.version) {
                let oldUrl = statusInfo.url;
                let newUrl = selectedVersionInfo.esUrl;
                let handler = () => updateEsModule(newUrl,oldUrl,moduleData.moduleName);
                let msg;
                if(selectedVersionInfo.isLatest) msg = "Upgrade to this Version (latest)"
                else if(selectedVersionInfo.version > statusInfo.version) msg = "Upgrade to this Version (not latest version)"
                else msg = "Downgrade to this Older Version"
                moduleData.workspaceCommandSetContainer.appendChild(createWorkspaceCommand(msg,handler));
            }
            break;

        case NPM_NOT_INSTALLED:
            //two commands - install and load, or just install
            {
                let handlerInstall = () => installNpmModule(moduleData.moduleName,selectedVersionInfo);
                let handlerInstallAndLoad = () => installAndLoadNpmModule(moduleData.moduleName,selectedVersionInfo);
                let msgInstall, msgInstallAndLoad;
                //message is different for latest versus not latest
                if(selectedVersionInfo.isLatest) {
                    msgInstall = "Install Module, without Loading to Workspace";
                    msgInstallAndLoad = "Install Module and Load to Workspace";
                }
                else {
                    msgInstall = "Install this Version, without Loading to Workspace (not latest)"
                    msgInstallAndLoad = "Install this Version and Load to Workspace (not latest)"
                }
                moduleData.workspaceCommandSetContainer.appendChild(createWorkspaceCommand(msgInstallAndLoad,handlerInstallAndLoad));
                moduleData.workspaceCommandSetContainer.appendChild(createWorkspaceCommand(msgInstall,handlerInstall));
            }
            break;

        case NPM_INSTALLED_NOT_LOADED:
            //load module to workspace
            {
                let handler = () => loadNpmModule(moduleData.moduleName); 
                let msg = "Load Module to Workspace";
                moduleData.workspaceCommandSetContainer.appendChild(createWorkspaceCommand(msg,handler));
            }

            //if the selected version is not installed, allow for a switch
            if(statusInfo.version != selectedVersionInfo.version) {
                let handler = () => updateNpmModule(moduleData.moduleName,selectedVersionInfo);
                let msg;
                if(selectedVersionInfo.isLatest) msg = "Upgrade Installed to this Version (latest)"
                else if(selectedVersionInfo.version > statusInfo.version) msg = "Upgrade Installed to this Version (not latest version)"
                else msg = "Downgrade Installed to this Version (older!)"
                moduleData.workspaceCommandSetContainer.appendChild(createWorkspaceCommand(msg,handler));
            }

            //uninstall, whicher version is installed
            {
                let handler = () => uninstallNpmModule(moduleData.moduleName);
                let msg = "Uninstall Module from App";
                moduleData.workspaceCommandSetContainer.appendChild(createWorkspaceCommand(msg,handler));
            }
            break;

        case NPM_INSTALLED_AND_LOADED:
            //unload module to workspace
            {
                let handler = () => unloadModule(moduleData.moduleName); 
                let msg = "Unload Module from Workspace";
                moduleData.workspaceCommandSetContainer.appendChild(createWorkspaceCommand(msg,handler));
            }

            //if the selected version is not installed, allow for a switch
            //specify if the selected is latest/newer, not latest/older (same logic as above)
            //if the selected version is not installed, allow for a switch
            if(statusInfo.version != selectedVersionInfo.version) {
                let newVersion = selectedVersionInfo.version;
                let handler = () => updateNpmModule(moduleData.moduleName,newVersion);
                let msg;
                if(selectedVersionInfo.isLatest) msg = "Upgrade Installed to this Version (latest)"
                else if(selectedVersionInfo.version > statusInfo.version) msg = "Upgrade Installed to this Version (not latest version)"
                else msg = "Downgrade Installed to this Version (older!)"
                moduleData.workspaceCommandSetContainer.appendChild(createWorkspaceCommand(msg,handler));
            }

            //note - no uninstall command
            break;
    }
}

// function _createWorkspaceCommand(text,handler) {
//     let container = document.createElement("div");
//     container.className = "referenceCommandSetContainer";
//     let link = document.createElement("a");
//     link.className = "workspaceCommandLink";
//     link.onclick = handler;
//     link.innerHTML = text;
//     container.appendChild(link);
//     return container;
// }

function _setReferenceWorkspaces(selectedVersionInfo,moduleData) {
    let demoWorkspaces;
    if(moduleType == ES_MODULE_TYPE) {
        demoWorkspaces = selectedVersionInfo.esDemoWorkspaces
    }
    else if(moduleType == NPM_MODULE_TYPE) {
        demoWorkspaces = selectedVersionInfo.npmDemoWorkspaces
    }
    else {
        //unknown type
        return;
    }

    if(demoWorkspaces) {
        //add each demo workspace link
        demoWorkspaces.forEach(workspaceInfo => {
            _setReferenceWorkspace(workspaceInfo,moduleData);
        });
    }
}

/** This method adds the demo workspaces to a module for a given version. */
function _setReferenceWorkspace(workspaceInfo,moduleData) {
    //clear data
    moduleData.demoLinkSetContainer.innerHTML = "";

    if(workspaceInfo.webUrl) {
        let referenceLinkContainer = document.createElement("div");
        referenceLinkContainer.className = "referenceCommandSetContainer";

        let workspaceLink = document.createElement("a");
        workspaceLink.className = "referenceCommandLink";
        workspaceLink.onclick = () => openWebWorkspace(workspaceInfo.webUrl);
        let text = "Open Sample Workspace";
        if(workspaceInfo.name) text += ": " + workspaceInfo.name;
        workspaceLink.innerHTML = text;
        referenceLinkContainer.appendChild(workspaceLink);

        moduleData.demoLinkSetContainer.appendChild(referenceLinkContainer);
    }
}

/** This method adds the web links to a module for a given version. */
function _setReferenceWebLink(url,moduleData) {
    //clear data
    moduleData.webLinkSetContainer.innerHTML = "";

    let referenceLinkContainer = document.createElement("div");
    referenceLinkContainer.className = "referenceCommandSetContainer";

    let webLink = document.createElement("a");
    webLink.className = "referenceCommandLink";
    webLink.onclick = () => openWebLink(url);
    webLink.innerHTML = "Open Web Link";
    referenceLinkContainer.appendChild(webLink);

    moduleData.webLinkSetContainer.appendChild(referenceLinkContainer);
}
