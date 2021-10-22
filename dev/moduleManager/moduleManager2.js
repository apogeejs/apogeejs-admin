import { platform } from "os";
import _ from "/apogeejs-releases/releases/ext/lodash/v4.17.21/lodash.es.js";

//======================
// Fields
//======================
let _callingWindow = null;
let _windowId = null;
let _callingUrl = null;
let _platform = null;

let _appModules = null;
let _sourceModulesResponse = null;
let _refDataArray = null;

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
                _sourceModulesResponse = await response.json();
                applyStatus();
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
        let refDataArray = getCompiledModules(_sourceModulesReponse); //throws error on failure

        //populate the status for the loaded and installed modules
        if(_appModules.loaded) {
            _appModules.loaded.forEach(loadedEntry => {
                let refData = lookupLoadedModule(loadedEntry,refDataArray);
                if(!refData) {
                    refData = insertIntoRefDataArray(loadedEntry,refDataArray);
                    refData.status.moduleUnrecognized = true;
                }

                let refVersionData = lookupLoadedVersionData(loadedEntry,refData);
                if(!refVersionData) {
                    refVersionData = insertIntoLoadedVersionData(loadedEntry,refData);
                }
                refData.status.loaded = refVersionData.version;
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
                refData.status.installed = refVersionData.version;
            })
        }

        _refDataArray = refDataArray;
        ////////////////////////////////////////
        //sort?
        //send to the ui
        /////////////////////////////////////////
    }
}

/** NOW I AM ONLY HANLDING A SINGLE SOURCE!!! */
function getCompiledModules(sourceModulesResponse) {
    let sourceEntry = sourceModulesResponse.source;
    if(!sourceEntry) throw new Error("Source entry missing from module response.");
    if(!sourceEntry.modules) throw new Error("modules list missing from modules response.");

    let compiledModules = [];
    sourceEntry.modules.forEach(sourceModuleEntry => {
        let moduleEntry = {};
        moduleEntry.name = sourceModuleEntry.name;
        if(sourceModuleEntry.versions) {
            moduleEntry.versions = sourceModuleEntry.versions.map(sourceVersionEntry => {
                let versionEntry = {};
                versionEntry.moduleType = "apogee module";
                versionEntry.platform = "_platform";
                versionEntry.name = moduleEntry.name;
                versionEntry.source = sourceEntry;
                Object.assign(versionEntry,sourceVersionEntry);
            });
        }
        compiledModules.push(moduleEntry);
        moduleEntry.status = {};
    })

    return compiledModules;
}

/** This function takes an entry from the app loaded modules and looks for the
 * module entry from the reference module array */
function lookupLoadedModule(loadedEntry,refDataArray) {
    return refDataArray.find(refDataEntry => (refDataEntry.moduleName == loadedEntry.moduleName) );
}

/** This function inserts an entry in the referenece module array to match
 * the given (unrecognized) loadedEntry from the app. The "unrecognized module"
 * status is also set.  The new module entry is returned. */
function insertIntoRefDataArray(loadedEntry,refDataArray) {
    let refData = {
        moduleConfig: {
            moduleName: loadedEntry.moduleName,
            versions: []
        },
        status: {},
        moduleUnrecognized: true
    }
    refDataArray.modules.push(refData);
    return refData;
}

/** This function takes an entry from the app loaded modules and finds the proper version
 * from the reference module config entry */
function lookupLoadedVersionData(loadedEntry,refData) {
    //lookup the version entry with a matching number
    let refVersionData = refData.moduleConfig.versions.find(versionEntry => {
        if(_platform == ES_PLATFORM) {
            return (loadedEntry.url == refData.url);
        }
        else if(_platform == NODE_PLATFORM) {
            if(loadedEntry.npmName != refData.npmName) return false;
            if(loadedEntry.npm) {
                return ((refData.npm)&&(loadedEntry.version == refData.version));
            }
            else {
                return ((!refData.npm)&&(loadedEntry.url == refData.url));
            }
        }
        else {
            throw new Error("Unkonwn platform: " + _platform);
        }
    });

    return refVersionData;
}

/** This function inserts a version entry in the reference module config entry to match
 * the given (unrecognized) loadedEntry from the app. The "unrecognized module"
 * status is also set. The new version entry is returned.*/
function insertIntoLoadedVersionData(loadedEntry,refData) {

    refData.versions.push(loadedEntry);
    
    if(!refData.unrecognizedVersions) refData.status.unrecognizedVersions = [];
    refData.unrecognizedVersions.push(loadedEntry.version);

    return loadedEntry;
}

/** This function takes an entry from the app installed modules and finds the proper version
 * from the reference module config entry */
function lookupInstalledVersionData(installedEntry,refDataArray) {
    let refData;
    let refVersionEntry;
    for(let i = 0; i < refDataArray.length; i++) {
        let tempRefData = refDataArray[i];

        //find the matching version entry
        refVersionEntry = tempRefData.versions.find(tempRefVersionEntry => {

            //look for a npmName match, in case we don't find a verions
            //we will only save the last, if there are multiple!!!
            if(installedEntry.npmName == tempRefVersionEntry.npmName) {
                refData = tempRefData;
            }
            else {
                return false;
            }

            //installed from npm - installed entry will have the proper version number
            let installedFromUrl = isNodePackageUrl(installedEntry.npmVersion);

            if(installedFromUrl) {
                return (installedEntry.npmVersion == tempRefVersionEntry.url);
            }
            else {
                return (installedEntry.npmVersion == tempRefVersionEntry.version);
            }
        });

        if(refVersionEntry) break;
    }

    return {refData, refVersionEntry}
}

/** This function inserts a version entry in the reference module config entry to match
 * the given (unrecognized) installedEntry from the app. The "unrecognized module"
 * status is also set. The new version entry is returned.*/
function insertIntoInstalledVersionData(installedEntry,refData) {
    let installedFromUrl = isNodePackageUrl(installedEntry.npmVersion);

    let refVersionEntry = {};
    refVersionEntry.moduleType = "apogee module";
    refVersionEntry.platform = _platform;
    refVersionEntry.moduleName = installedEntry.npmName;

    //create the version entry
    let versionEntry = {};
    versionEntry.version = installedEntry.npmVersion; //MAYBE RENMAE THIS FOR URL?
    versionEntry.npmName = installedEntry.npmName;

    if(installedFromUrl) {
        vesionEntry.url = installedEntry.version;
    }
    else {
        versionEntry.npm = true;
        versionEntry.version = installedEntry.version;
    }
    refVersionEntry.versionEntry = versionEntry;

    refVersionEntry.sourceEntry = {
        name: "Unrecognized Installed Modules"
    }
    
    //add this version entry
    refData.versions.push(versionEntry);
    if(!refData.unrecognizedVersions) refData.unrecognizedVersions = [];
    refData.unrecognizedVersions.push(versionEntry.version);

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
