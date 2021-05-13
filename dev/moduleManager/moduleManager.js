


/** This method loads the module list. */
async function load() {
    let initialData = readInputData(); //we use this later

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
        populateList(modulesConfig.modules);
    }
}

const MODULE_REQUEST_URL = "moduleData.json";

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

//=================
// Internal Functions
//=================

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
        bodyCell.style.display = "none"; //initially invisible
        moduleCell.appendChild(bodyCell);
        moduleData.bodyCell = bodyCell; //save this

        //fill in the header
        let titleField = document.createElement("div");
        titleField.className = "titleField";
        titleField.innerHTML = getTitle(moduleConfig);
        headerCell.appendChild(titleField);
        let statusField = document.createElement("div");
        statusField.className = "statusField";
        statusField.innerHTML = getStatus(moduleConfig);
        headerCell.appendChild(statusField);
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
    })
}

function getTitle(moduleConfig) {
    let title;
    if(moduleConfig.displayName) title = moduleConfig.displayName + ": ";
    else title = "";

    title += moduleConfig.moduleName;
    return title;
}

function getStatus(moduleConfig) {
    return "-- status not available --";
}

function getShortDesc(moduleConfig) {
    if(moduleConfig.shortDesc) return moduleConfig.shortDesc;
    else return "No description available";
}

function populateVersionSelector(moduleConfig,versionSelector) {
    moduleConfig.versions.forEach(versionInfo => {
        let optionElement = document.createElement("option");
        optionElement.text = versionInfo.version;
        versionSelector.add(optionElement);
    })
}

function loadBodyForVersion(moduleData) {
    let version = moduleData.versionSelector.value;
    if((moduleData.loadedBodyVersion != version)&&(moduleData.moduleConfig.versions)) {
        //get rid of any old data
        clearBody(moduleData);
        //load the new data
        let activeVersionInfo = moduleData.moduleConfig.versions.find(versionInfo => versionInfo.version == version);
        if(activeVersionInfo) {
            if(activeVersionInfo.esUrl) {
                //for now I will ad fixed commands, without the status
                addWorkspaceCommands(activeVersionInfo.esUrl,moduleData);
            }
            if(activeVersionInfo.demoWorkspaces) {
                //add each demo workspace link
                activeVersionInfo.demoWorkspaces.forEach(workspaceInfo => {
                    addReferenceWorkspace(workspaceInfo,moduleData);
                });
            }
            if(activeVersionInfo.webLink) {
                //add the web link
                addReferenceWebLink(activeVersionInfo.webLink,moduleData);
            }

            moduleData.loadedBodyVersion = version;
        }
    }
}

function clearBody(moduleData) {
    moduleData.workspaceCommandSetContainer.innerHTML = "";
    moduleData.demoLinkSetContainer.innerHTML = "";
    moduleData.webLinkSetContainer.innerHTML = "";
}

function addWorkspaceCommands(moduleUrl,moduleData) {
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

function addReferenceWorkspace(workspaceInfo,moduleData) {
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

function addReferenceWebLink(url,moduleData) {
    let referenceLinkContainer = document.createElement("div");
    referenceLinkContainer.className = "referenceCommandSetContainer";

    let webLink = document.createElement("a");
    webLink.className = "referenceCommandLink";
    webLink.onclick = () => openWebLink(url);
    webLink.innerHTML = "Open Web Link";
    referenceLinkContainer.appendChild(webLink);

    moduleData.webLinkSetContainer.appendChild(referenceLinkContainer);
}

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

function readInputData() {
    queryField = readQueryField("initialData");
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
    var href = window.location.href;
    var reg = new RegExp( '[?&]' + field + '=([^&#]*)', 'i' );
    var string = reg.exec(href);
    return string ? string[1] : null;
}