//======================
// Fields
//======================
let appModules = null;
let moduleDataList = [];

const STATUS_UNKNOWN = -1;

const NPM_NOT_INSTALL = 0;
const NPM_INTALLED_NOT_LOADED = 1;
const NPM_INSTALLED_AND_LOADED = 3;

const ES_NOT_LOADED = 0;
const ES_LOADED = 3;

const MODULE_REQUEST_URL = "moduleData.json";

//======================
// Functions
//======================
/** This method loads the module list. */
async function load() {

    let modulesConfig = await fetch(MODULE_REQUEST_URL).then(response => {
        if(response.ok) {
            return response.json();
        }
        else {
            alert("Error loading module data from server");
            return null;
        }
    })

    if(modulesConfig) {
        populateDomList(modulesConfig.modules);

        let initialAppModules = readInputData();
        updateAppModuleData(initialAppModules);
    }
}

function receiveMessage() {
    //implement to code to recieve messages
    //use this to call updateAppModuleData(updateAppModules);
}

/** This updates the status for each module entry. */
function updateAppModuleData(updatedAppModules) {
    appModules = updatedAppModules; //store this
    moduleDataList.forEach(moduleData => updateModuleStatus(moduleData));
}

//==================
// External Functions
//==================
function addEsModuleToWorkspace(esModuleUrl) {
    alert("Add module not implemented")
}

function removeEsModuleFromWorkspace(esModuleUrl) {
    alert("Remove module not implemented")
}

function openWebWorkspace(workspaceUrl) {
    alert("Open demo workspace not implemented")
}

function openWebLink(url) {
    alert("Open web link not implemented")
}


//========================
// Handlers
//========================
function moreClicked(moduleData) {
    //make sure the proper version data is populated
    loadBodyForVersion(moduleData)

    moduleData.moreContainer.style.display = "none";
    moduleData.bodyCell.style.display = "";
}

function lessClicked(moduleData) {
    moduleData.moreContainer.style.display = "";
    moduleData.bodyCell.style.display = "none";
}

function versionSelectorChanged(moduleData) {
    loadBodyForVersion(moduleData);
}

//=================
// Internal Functions
//=================

/** This function initially populates the module list. */
function populateList(moduleListConfig) {

    let listContainerElement = document.getElementById("moduleListContainer");
    if(!listContainerElement) {
        alert("Error loading page: list container not found!");
        return;
    }

    moduleListConfig.forEach(moduleConfig => {
        let moduleData = {};
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
        titleField.innerHTML = getTitle(moduleConfig);
        headerCell.appendChild(titleField);
        let statusField = document.createElement("div");
        statusField.className = "statusField";
        headerCell.appendChild(statusField);
        moduleData.bodyCell = bodyCell; //save this
        let shortDescField = document.createElement("div");
        shortDescField.className = "shortDescField";
        shortDescField.innerHTML = getShortDesc(moduleConfig);
        headerCell.appendChild(shortDescField);

        let moreContainer = document.createElement("div");
        moreContainer.className = "moreOrLessContainer";
        headerCell.appendChild(moreContainer);
        let moreLink = document.createElement("a");
        moreLink.href = "#";
        moreLink.className = "moreOrLessLink";
        moreLink.onclick = () => moreClicked(moduleData);
        moreLink.innerHTML = "show more";
        moreContainer.appendChild(moreLink);
        moduleData.moreContainer = moreContainer; //save this

        //start in a closed state
        bodyCell.style.display = "none"; //initially invisible
        moreLink.style.display = ""; //initially visible
        moduleData.isOpen = false;

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
        versionSelector.onchange = () => versionSelectorChanged(moduleData);
        versionContainer.appendChild(versionSelector);
        populateVersionSelector(moduleConfig,versionSelector);
        moduleData.versionSelector = versionSelector; //save this
        
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
        lessLink.onclick = () => lessClicked(moduleData);
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
        moduleDataList.push(moduleData);      
    })
}

/** This sets or updates the part of the module display that depends on the current app/workspace modules. */
function updateModuleStatus(moduleData) {
    let newStatusInfo = getStatus(moduleData);
    if(isStatusEqual(newStatusInfo,moduleData.StatusInfo)) return;

    //set status message
    moduleData.statusField = getStatusMsg(moduleData.statusInfo);

    //set the workspace commands
    if(moduleData.isOpened) {
        let version = moduleData.versionSelector.value;
        let selectedVersionInfo = lookupVersionInfo(version,moduleData);
        setWorkspaceCommands(selectedVersionInfo,moduleData) 
    }
}

/** This method returns the title text for a given module. */
function getTitle(moduleConfig) {
    let title;
    if(moduleConfig.displayName) title = moduleConfig.displayName + ": ";
    else title = "";

    title += moduleConfig.moduleName;
    return title;
}

/** This method returns the status text for a given status value. */
function getStatusMsg(statusValue) {
    return "-- status not available --";
}

/** This function returns the short description for a module. */
function getShortDesc(moduleConfig) {
    if(moduleConfig.shortDesc) return moduleConfig.shortDesc;
    else return "No description available";
}

/** This function populates the version selector for a module. */
function populateVersionSelector(moduleConfig,versionSelector) {
    moduleConfig.versions.forEach(versionInfo => {
        let optionElement = document.createElement("option");
        optionElement.text = versionInfo.version;
        versionSelector.add(optionElement);
    })
}

/** This method loads the body for a given bersion of a given module */
function loadBodyForVersion(moduleData) {
    let version = moduleData.versionSelector.value;
    if((moduleData.loadedBodyVersion != version)&&(moduleData.moduleConfig.versions)) {
        //load the new data
        let selectedVersionInfo = lookupVersionInfo(version,moduleData);
        if(selectedVersionInfo) {

            setWorkspaceCommands(activeVersionInfo,moduleData);
        
            if(selectedVersionInfo.demoWorkspaces) {
                //add each demo workspace link
                activeVersionInfo.demoWorkspaces.forEach(workspaceInfo => {
                    setReferenceWorkspace(workspaceInfo,moduleData);
                });
            }

            if(selectedVersionInfo.webLink) {
                //add the web link
                seReferenceWebLink(activeVersionInfo.webLink,moduleData);
            }

            moduleData.loadedBodyVersion = version;
        }
    }
}

/** This function adds the workspace commands for a module, which is the commands to add and remove
 * the module from the application/workspace. */
function setWorkspaceCommands(versionInfo,moduleData) {
    //clear data
    moduleData.workspaceCommandSetContainer.innerHTML = "";
//FIX THIS!!!! I CHANGED THE INPUT ARGS
    let addContainer = document.createElement("div");
    addContainer.className = "referenceCommandSetContainer";
    let addLink = document.createElement("a");
    addLink.className = "workspaceCommandLink";
    addLink.onclick = () => addEsModuleToWorkspace(moduleUrl);
    addLink.innerHTML = "Add module to Workspace";
    addContainer.appendChild(addLink);
    moduleData.workspaceCommandSetContainer.appendChild(addContainer);

    let removeContainer = document.createElement("div");
    removeContainer.className = "referenceCommandSetContainer";
    let removeLink = document.createElement("a");
    removeLink.className = "workspaceCommandLink";
    removeLink.onclick = () => removeEsModuleFromWorkspace(moduleUrl);
    removeLink.innerHTML = "Remove module from Workspace";
    removeContainer.appendChild(removeLink);
    moduleData.workspaceCommandSetContainer.appendChild(removeContainer);
}

/** This method adds the demo workspaces to a module for a given version. */
function setReferenceWorkspace(workspaceInfo,moduleData) {
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
function setReferenceWebLink(url,moduleData) {
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

//==================
// other utilities
//==================

function lookupVersionInfo(version,moduleData) {
    return moduleData.moduleConfig.versions.find(versionInfo => versionInfo.version == version);
}

function isStatusEqual(statusInfo1,statusInfo2) {
    //POPULATE THIS!!!
}

/** This function gets the status value for a given module. */
function getStatus(moduleData) {
    let statusInfo = {};

    if(!appModules) {
        statusInfo.status = STATUS_UNKNOWN;
        return statusInfo;
    }
    
    if(appModules.moduleType == "es") {
        statusInfo.type = "es";
//===========================================================================
//this is wrong
        let loadedUrl = appModules.esModules[moduleData.moduleName];
//===========================================================================
        if(loadedUrl !== undefined) {
            //find this url in the list, load version from the item
//============================================================================
//rethink this
            let versionInfo = moduleData.versions.find(versionInfo => versionInfo.esUrl == loadedUrl);
//=============================================================================
            statusInfo.status = ES_LOADED;
            statusInfo.url = loadedUrl;
            if(versionInfo) {
                statusInfo.version = versionInfo.version;
            }
            else {
                statusInfo.unknownVersion = true;
            } 
        }
        else {
            statusInfo.status = ES_NOT_LOADED;
        }
    }
    else if(appModules.moduleType == "npm") {
        statusInfo.type = "npm";
        let installedVersion = appModules.npmModules.installed[moduleData.moduleName];
        let isLoaded = appModules.npmModules.loaded[moduleData.moduleName];
//============================================================================
//think about the case where the installed version is not in the app modules list.
//============================================================================
        if(installedVersion !== undefined) {
            statusInfo.status = isLoaded ? NPM_INSTALLED_AND_LOADED : NPM_INSTALLED_NOT_LOADED;
            statusInfo.installedVersion = installedVersion;
        }
        else {
            statusInfo.status = NPM_NOT_INSTALLED;
        }
    }
    else {
        alert("Error: Unknown module type!");
        statusInfo.status = STATUS_UNKNOWN;
    }

    return statusInfo;
}

function readInputData() {
    queryField = readQueryField("appModules");
    if(queryField) {
        try {
            return JSON.parse(queryField);
        }
        catch(error) {
            if(error.stack) console.error(error.stack);
            console.log(error.toString);
            alert("Error loading page: unable to read input data.");
        }
    }
    
    //if we get here we don't have the data
    return {};
}

function readQueryField(field) {
    var params = new URLSearchParams(window.location.search);
    return params.get(field);
}