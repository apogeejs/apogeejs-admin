import _ from "/apogeejs-releases/releases/ext/lodash/v4.17.21/lodash.es.js";

//======================
// Fields
//======================
let _callingWindow = null;
let _windowId = null;
let _callingUrl = null;

let _repositoryUrls = null;
let _platform = null;

let _appModules = null;
let _moduleResponseArray = null;
let _refModuleArray = null;

//constants
const STATUS_UNKNOWN = -1;

const NPM_NOT_INSTALLED = 0;
const NPM_INSTALLED_NOT_LOADED = 1;
const NPM_INSTALLED_AND_LOADED = 2;

const ES_NOT_LOADED = 3;
const ES_LOADED = 4;

//const MODULE_REQUEST_URL = "moduleData.json";
//const MODULE_REQUEST_URL = "moduleDataTest.json";

const MODULE_TYPE = "apogee module";
const ES_PLATFORM = "es";
const NODE_PLATFORM = "node";

//======================
// Functions
//======================
/** This method loads the module list. */
export async function load() {
    let paramSuccess = loadInputParams();
    if(!paramSuccess) {
        return;
    }

    //initUi();
    startMessageListener();
}

//=================
// UI Functions
//=================


/** This loads initial data from the caller. */
function loadInputParams() {
    _callingWindow = window.opener;

    var params = new URLSearchParams(window.location.search);

    console.log(window.location.search);

    _callingUrl = params.get("callingUrl");
    if(!_callingUrl) {
        fatalError("CallingUrl not found in input.");
        return false;
    }

    _windowId = params.get("windowId");
    if(!_windowId) {
        fatalError("Window ID not found in input.");
        return false;
    }

    return true;
}

function initUi() {
    console.log("Implement UI!");
}

//=================
// Messaging Functions
//=================

function startMessageListener() {
    window.addEventListener("message",event => receiveMessage(event));
    //notify app the module manager is opened
    sendMessage("opened",{});
}

function receiveMessage(event) {
    switch(event.data.message) {
        case "initModules": 
            initModules(event.data.value);
            break;

        case "appStatus": 
            updateAppModuleData(event.data.value);
            break;

        case "appClosed": 
            window.close();
            break;
    }
}

function sendMessage(messageType,commandData) {
    let messageData = {};
    messageData.commandData = commandData;

    //this identifies the window sending the message
    messageData.windowId = _windowId;

    if((_callingWindow)&&(_callingWindow.postMessage)) {
        _callingWindow.postMessage({message: messageType, value: messageData},_callingUrl);
    }
}

function initModules(initData) {
    _platform = initData.platform;
    _repositoryUrls = initData.repositoryUrls;

    try {
        _moduleResponseArray = await Promise.all(_repositoryUrls.map(url => loadModuleConfig(url)));
        applyStatus();
    }
    catch(error) {
        fatalError("Error loading module data: " + error.toString());
    }
}

/** This updates the status for each module entry. */
function updateAppModuleData(updatedAppModules) {
    _appModules = updatedAppModules; //store this
    applyStatus();
}

//======================
// Repository module data request
//======================

async function loadModuleConfig(url) {
    let response = await fetch(url);

    if(response.ok) {
        return await response.json();
    }
    else {
        throw new Error(`Error in server request. Status: ${response.status}, Message: ${response.statusText}`);
    }
}

//=================================
// status update functions
//=================================

function applyStatus() {
    if((_appModules)&&(_moduleResponseArray)) {
        let refModuleArray = createRefModuleArray(_moduleResponseArray); //throws error on failure
        let statusInfo = {};

        //populate the status for the loaded and installed modules
        if(_appModules.loaded) {
            _appModules.loaded.forEach(loadedEntry => {
                let refModuleEntry = lookupLoadedRefModuleEntry(loadedEntry,refModuleArray);
                if(!refModuleEntry) {
                    refModuleEntry = insertIntoRefModuleArray(loadedEntry,refModuleArray);
                }

                let refVersionData = lookupLoadedVersionData(loadedEntry,refModuleEntry);
                if(!refVersionData) {
                    refVersionData = insertIntoLoadedVersionData(loadedEntry,refModuleEntry);
                }

                //!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
                //ADD A STATUS ENTRY FOR THIS LOADED MODULE!!!
                //!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
            })
        }

        //installed for node only
        if(_appModules.installed) {
            _appModules.installed.forEach(installedEntry => {
                //here we directly look up the installed version entry, not the module entry

                let {refData,refVersionData} = lookupInstalledVersionData(installedEntry,refDataArray);
                if((refData)&&(!refVersionData)) {
                    refVersionData = insertIntoInstalledVersionData(installedEntry,refData);
                }

                //!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
                //ADD AN INSTALLED STATUS ENTRY!!!
                //!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
            })
        }

        //!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
        //SORT THE MODULE VERSION ENTRIES!!!
        //!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!

        _refModuleArray = refModuleArray;
        _statusInfo = statusInfo;

        //!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
        //SEND TO THE UI!!!
        //!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
    }
}

/** NOW I AM ONLY HANLDING A SINGLE SOURCE!!! */
function createRefModuleArray(_moduleResponseArray) {

}
// function getRefModuleArray(sourceModulesResponse) {
//     let sourceEntry = sourceModulesResponse.source;
//     if(!sourceEntry) throw new Error("Source entry missing from module response.");
//     let sourceModules = sourceModulesResponse.modules;
//     if(!sourceModules) throw new Error("modules list missing from modules response.");

//     let refModuleArray = [];
//     sourceModules.forEach(sourceModuleEntry => {
//         let refModuleEntry = {};
//         refModuleEntry.name = sourceModuleEntry.name;
//         if(sourceModuleEntry.versions) {
//             refModuleEntry.versions = sourceModuleEntry.versions.map(sourceVersionEntry => {
//                 let refVersionEntry = {};
//                 refVersionEntry.moduleType = "apogee module";
//                 refVersionEntry.platform = _platform;
//                 refVersionEntry.name = sourceModuleEntry.name;
//                 refVersionEntry.sourceData = sourceEntry;
//                 refVersionEntry.versionData = sourceVersionEntry;
//                 return refVersionEntry;
//             });
//         }
//         refModuleEntry.status = {};
//         refModuleArray.push(refModuleEntry);
//     })

//     return refModuleArray;
// }

/** This function takes an entry from the app loaded modules and looks for the
 * module entry from the reference module array */
function lookupLoadedRefModuleEntry(loadedEntry,refModuleArray) {
    return refModuleArray.find(refModuleEntry => (refModuleEntry.name == loadedEntry.name) );
}

/** This function inserts an entry in the referenece module array to match
 * the given (unrecognized) loadedEntry from the app. The "unrecognized module"
 * status is also set.  The new module entry is returned. */
function insertIntoRefModuleArray(loadedEntry,refModuleArray) {
    let refModuleEntry = {
        name: loadedEntry.name,
        versions: [],
        status: {},
        unrecognizedModule: true
    }
    refModuleArray.push(refModuleEntry);
    return refModuleEntry;
}

/** This function takes an entry from the app loaded modules and finds the proper version
 * from the reference module config entry */
function lookupLoadedVersionData(loadedEntry,refModuleEntry) {
    //lookup the version entry with a matching number
    let refVersionEntry = refModuleEntry.versions.find(tempRefVersEntry => {
        if(_platform == ES_PLATFORM) {
            return (loadedEntry.versionData.url == tempRefVersEntry.versionData.url);
        }
        else if(_platform == NODE_PLATFORM) {
            if(loadedEntry.versionData.npmName != tempRefVersEntry.versionData.npmName) return false;
            if(loadedEntry.vesionData.npm) {
                return ((tempRefVersEntry.versionData.npm)&&(loadedEntry.vesionData.version == tempRefVersEntry.versionData.version));
            }
            else {
                return ((!tempRefVersEntry.versionData.npm)&&(loadedEntry.versionData.url == tempRefVersEntry.versionData.url));
            }
        }
        else {
            throw new Error("Unknown platform: " + _platform);
        }
    });

    return refVersionEntry;
}

/** This function inserts a version entry in the reference module config entry to match
 * the given (unrecognized) loadedEntry from the app. The "unrecognized module"
 * status is also set. The new version entry is returned.*/
function insertIntoLoadedVersionData(loadedEntry,refModuleEntry) {

    refModuleEntry.versions.push(loadedEntry);
    
    if(!refModuleEntry.unrecognizedVersions) refModuleEntry.unrecognizedVersions = [];
    refModuleEntry.unrecognizedVersions.push(loadedEntry.versionData.version);

    return loadedEntry;
}

/** This function takes an entry from the app installed modules and finds the proper version
 * from the reference module config entry */
function lookupInstalledVersionData(installedEntry,refModuleArray) {
    let refModuleEntry;
    let refVersionEntry;
    for(let i = 0; i < refModuleArray.length; i++) {
        let tempRefModEntry = refModuleArray[i];

        //find the matching version entry
        refVersionEntry = tempRefModEntry.versions.find(tempRefVersEntry => {

            //look for a npmName match, in case we don't find a verions
            //we will only save the last, if there are multiple!!!
            if(installedEntry.npmName == tempRefModEntry.npmName) {
                refModuleEntry = tempRefModEntry;
            }
            else {
                return false;
            }

            //installed from npm - installed entry will have the proper version number
            let installedFromUrl = isNodePackageUrl(installedEntry.npmVersion);

            if(installedFromUrl) {
                return (installedEntry.npmVersion == tempRefVersEntry.url);
            }
            else {
                return (installedEntry.npmVersion == tempRefVersEntry.version);
            }
        });

        if(refVersionEntry) break;
    }

    return {refModuleEntry, refVersionEntry}
}

/** This function inserts a version entry in the reference module config entry to match
 * the given (unrecognized) installedEntry from the app. The "unrecognized module"
 * status is also set. The new version entry is returned.*/
function insertIntoInstalledVersionData(installedEntry,refModuleEntry) {
    let installedFromUrl = isNodePackageUrl(installedEntry.npmVersion);

    let refVersionEntry = {};
    refVersionEntry.moduleType = "apogee module";
    refVersionEntry.platform = _platform;
    refVersionEntry.name = installedEntry.name;

    //create the version entry
    let sourceVersionEntry = {};
    sourceVersionEntry.version = installedEntry.npmVersion; //MAYBE RENMAE THIS FOR URL?
    sourceVersionEntry.npmName = installedEntry.npmName;

    if(installedFromUrl) {
        sourceVersionEntry.url = installedEntry.version;
    }
    else {
        sourceVersionEntry.npm = true;
        sourceVersionEntry.version = installedEntry.version;
    }
    refVersionEntry.versionData = sourceVersionEntry;

    refVersionEntry.sourceEntry = {
        name: "Unrecognized Installed Modules"
    }
    
    //add this version entry
    refModuleEntry.versions.push(versionEntry);
    if(!refData.unrecognizedVersions) refModuleEntry.unrecognizedVersions = [];
    refModuleEntry.unrecognizedVersions.push(versionEntry.version);

    return refVersionEntry;
}

/** This returns true if the vesion string represents a url for the package. 
 * The values supported are - they all have a / character (or a \ character, for windows maybe)
 * Standard or GIT URL: <protocol>://...
 * Local Paths:  ../foo/bar, ~/foo/bar, ./foo/bar, /foo/bar
 */
function isNodePackageUrl(versionString) {
    return ((versionString.indexOf("/") >= 0)||(versionString.indexOf("\\") >= 0));
}


//==================
// External Command Functions
//==================
function loadEsModule(moduleUrl,moduleName) {
    let commandData = {
        moduleIdentifier: moduleUrl,
        moduleName: moduleName
    }
    sendMessage("loadModule",commandData);
}

function unloadEsModule(moduleUrl) {
    let commandData = {
        moduleIdentifier: moduleUrl
    }
    sendMessage("unloadModule",commandData);
}

function updateEsModule(newUrl,oldUrl,moduleName) {
    let commandData = {
        newIdentifier: newUrl,
        oldIdentifier: oldUrl,
        moduleName: moduleName
    }
    sendMessage("updateModule",commandData);
}

function installNpmModule(moduleName,selectedVersionInfo) {
    let commandData = {
        installArg: getNpmInstallArg(moduleName,selectedVersionInfo)
    }
    sendMessage("installNpmModule",commandData);
}

function getNpmInstallArg(moduleName,selectedVersionInfo) {
    if(selectedVersionInfo.npmUrl) {
        //url of tgz file
        return selectedVersionInfo.npmUrl;
    }
    else if(selectedVersionInfo.version) {
        //install the given version
        return moduleName + "@" + selectedVersionInfo.version;
    }
    else {
        //this shouldn't happen, but it will instsall latest
        //we might want some different handling
        return moduleName;
    }
}

function installAndLoadNpmModule(moduleName,selectedVersionInfo) {
    let commandData = {
        moduleName: moduleName,
        installArg: getNpmInstallArg(moduleName,selectedVersionInfo)
    }
    sendMessage("installAndLoadNpmModule",commandData);
}

function loadNpmModule(moduleName) {
    let commandData = {
        moduleIdentifier: moduleName,
        moduleName: moduleName
    }
    sendMessage("loadModule",commandData);
}

function uninstallNpmModule(moduleName) {
    let commandData = {
        moduleName: moduleName
    }
    sendMessage("uninstallNpmModule",commandData);
}

function unloadModule(moduleName) {
    let commandData = {
        moduleIdentifier: moduleName
    }
    sendMessage("unloadModule",commandData);
}

function updateNpmModule(moduleName,selectedVersionInfo) {
    //same as install
    installNpmModule(moduleName,selectedVersionInfo)
}

function openWebWorkspace(workspaceUrl) {
    if(openLinkFromApp) {
        //let the app open the workspace
        let commandData = {
            workspaceUrl: workspaceUrl
        }
        sendMessage("openWorkspace",commandData);
    }
    else {
        //open the workspace in a browser
        if(callingUrl) {
            let url = callingUrl + "?url=" + workspaceUrl; 
            this.openWebLink(url);
        }
    }
}

function openWebLink(linkUrl) {
    if(openLinkFromApp) {
        //let the app open the link
        let commandData = {
            linkUrl: linkUrl
        }
        sendMessage("openLink",commandData);
    }
    else {
        //open the link in a browser
        window.open(linkUrl)
        window.opener = null;
    }
}



//=========================
// Other Internal Functions
//=========================
function fatalError(reason) {
    alert("Fatal error opening module manager: " + reason);
    window.close();
}