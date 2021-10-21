import _ from "/apogeejs-releases/releases/ext/lodash/v4.17.21/lodash.es.js";

//======================
// Fields
//======================
let _callingWindow = null;
let _windowId = null;
let _callingUrl = null;
let _platform = null;

let _appModules = null;
let _modulesConfigResponse = null;
let _modulesConfigArray = null;

//constants
const STATUS_UNKNOWN = -1;

const NPM_NOT_INSTALLED = 0;
const NPM_INSTALLED_NOT_LOADED = 1;
const NPM_INSTALLED_AND_LOADED = 2;

const ES_NOT_LOADED = 3;
const ES_LOADED = 4;

const MODULE_REQUEST_URL = "moduleData.json";

const MODULE_TYPE = "apogee module";
const ES_PLATFORM = "es";
const NODE_PLATFORM = "node";

//======================
// Functions
//======================
/** This method loads the module list. */
async function load() {
    let paramSuccess = loadInputParams();
    if(!paramSuccess) {
        return;
    }

    initUi();
    startMessageListener();
    loadModuleConfig();
}

window.onLoad = () => load();

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

    _platform = params.get("platform");
    if(!_platform) {
        fatalError("Platform not found in input.");
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
        case "appModules": 
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

/** This updates the status for each module entry. */
function updateAppModuleData(updatedAppModules) {
    _appModules = updatedAppModules; //store this
    applyStatus();
}

//======================
// Repository module data request
//======================

async function loadModuleConfig() {
    let url = getModuleDataUrl();
    try {
        let response = await fetch(url);

        if(response.ok) {
            try {
                _modulesConfigResponse = await response.json();

                if(_modulesConfigResponse.modules) {
                    _modulesConfigArray = _modulesConfigResponse.modules;
                    applyStatus();
                }
                else {
                    fatalError("Modules data not found in server response!");
                }
            }
            catch(error) {
                fatalError("Error parsing module data from server: " + error.toString());
            }
        }
        else {
            fatalError(`Error loading module data from server. Status: ${response.status}, Message: ${response.statusText}`);
        }
    }
    catch(error) {
        fatalError("Error loading module data from server: " + error.toString());
    }
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

//=================================
// status update functions
//=================================

function applyStatus() {
    if((_appModules)&&(_modulesConfigArray)) {
        //create the ref config array that holds themodule status info for the UI
        let refConfigArray = _moduleConfigArray.map(moduleConfig => { 
            return {
                moduleConfig: _cloneDeep(_modulesConfigArray),
                status: {}
            }
        })

        //populate the status for the loaded and installed modules
        if(_appModules.loaded) {
            _appModules.loaded.forEach(loadedEntry => {
                let refConfig = lookupLoadedModule(loadedEntry,refConfigArray);
                if(!refConfig) {
                    refConfig = insertIntoRefConfigArray(loadedEntry,refConfigArray);
                    refConfig.status.moduleUnrecognized = true;
                }

                let refVersionData = lookupLoadedVersionData(loadedEntry,refConfig);
                if(!refVersionData) {
                    refVersionData = insertIntoLoadedVersionData(loadedEntry,refConfig);
                }
                refConfig.status.loaded = refVersionData.version;
            })
        }

        if(_appModules.installed) {
            _appModules.installed.forEach(installedEntry => {
                let refConfig = lookupInstalledModule(installedEntry,refConfigArray);
                if(!refConfig) {
                    //this is either a non-apogee module or an apogee module for which
                    //we do not know the name. So we will ignore it
                    return;
                }

                let refVersionData = lookupInstalledVersionData(installedEntry,refConfig);
                if(!refVersionData) {
                    refVersionData = insertIntoInstalledVersionData(installedEntry,refConfig);
                }
                refConfig.status.installed = refVersionData.version;
            })
        }

        _refConfigArray = refConfigArray;
        ////////////////////////////////////////
        //sort?
        //send to the ui
        /////////////////////////////////////////
    }
}

/** This function takes an entry from the app loaded modules and looks for the
 * module entry from the reference module config array */
function lookupLoadedModule(loadedEntry,refConfigArray) {
    return refConfigArray.find(refConfigEntry => (refConfigEntry.moduleName == loadedEntry.moduleName) );
}

/** This function inserts an entry in the referenece module config array to match
 * the given (unrecognized) loadedEntry from the app. The "unrecognized module"
 * status is also set.  The new module entry is returned. */
function insertIntoRefConfigArray(loadedEntry,refConfigArray) {
    let refConfig = {
        moduleConfig: {
            moduleName: loadedEntry.moduleName,
            versions: []
        },
        status: {
            moduleUnrecognized: true
        }
    }
    refConfigArray.modules.push(refConfig);
    return refConfig;
}

/** This function takes an entry from the app loaded modules and finds the proper version
 * from the reference module config entry */
function lookupLoadedVersionData(loadedEntry,refConfig) {
    return refConfig.versions.find(verionEntry => (versionEntry.version == loadedEntry.version));
}

/** This function inserts a version entry in the reference module config entry to match
 * the given (unrecognized) loadedEntry from the app. The "unrecognized module"
 * status is also set. The new version entry is returned.*/
function insertIntoLoadedVersionData(loadedEntry,refConfig) {
    let versionEntry = {}
    Object.assign(versionEntry,loadedEntry);
    delete versionEntry.moduleName;
    delete versionEntry.moduleType;

    refConfig.versions.push(versionEntry);
    
    if(!refConfig.status.unrecognizedVersions) refConfig.status.unrecognizedVersions = [];
    refConfig.status.unrecognizedVersions.push(versionEntry.version);

    return versionEntry;
}

/** This function takes an entry from the app installed modules (only from node platform) and looks for the
 * module entry from the reference module config array */
function lookupInstalledModule(installedEntry,refConfigArray) {
    return refConfigArray.find(refConfigEntry => (refConfigEntry.npmName == installedEntry.npmName))
}

/** This function takes an entry from the app installed modules and finds the proper version
 * from the reference module config entry */
function lookupInstalledVersionData(installedEntry,refConfig) {
    return refConfig.versions.find(versionEntry => {
        //installed from npm - installed entry will have the proper version number
        if(versionEntry.version == installedEntry.version) return true;

        //installed by url - installed entry will have a url as the version
        if((versionEntry.application)&&(versionEntry.application.node)&&(versionEntry.application.node.url == installedEntry.version)) return true;
        
        //no match 
        return false;
    })
}

/** This function inserts a version entry in the reference module config entry to match
 * the given (unrecognized) installedEntry from the app. The "unrecognized module"
 * status is also set. The new version entry is returned.*/
function insertIntoInstalledVersionData(installedEntry,refConfig) {
    let versionEntry = {};
    versionEntry.application = {};
    versionEntry.application.node = {};

    if(isNodePackageUrl(installedEntry.version)) {
        versionEntry.version = "<UNKNOWN VERSION>";
        vesion.application.url = installedEntry.version;
    }
    else {
        versionEntry.version = installedEntry.version;
        versionEntry.application.npm = true;
    }
    
    refConfig.versions.push(versionEntry);
    
    if(!refConfig.status.unrecognizedVersions) refConfig.status.unrecognizedVersions = [];
    refConfig.status.unrecognizedVersions.push(versionEntry.version);

    return versionEntry;
}

/** This returns true if the vesion string represents a url for the package. 
 * The values supported are - they all have a / character (or a \ character, for windows maybe)
 * Standard or GIT URL: <protocol>://...
 * Local Paths:  ../foo/bar, ~/foo/bar, ./foo/bar, /foo/bar
 */
function isNodePackageUrl(versionString) {
    return ((versionString.indexOf("/") >= 0)||(versionString.indexOf("\\") >= 0));
}


//=========================
// Other Internal Functions
//=========================
function fatalError(reason) {
    alert("Fatal error opening module manager: " + reason);
    window.close();
}

//later there will be more stuff in here - at least platform, maybe app version
function getModuleDataUrl() {
    return MODULE_REQUEST_URL;
}
