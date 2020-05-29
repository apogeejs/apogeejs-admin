import ElectronBridgeFileAccess from "./ElectronBridgeFileAccess.js";

/** 
 * This is the format of the AppConfigManager. This class does not need
 * to be extended. It has not internal functionality.
 */
export default class ElectronBridgeAppConfigManager {
    
    constructor() {
    }
    
    /** This method should return a Promise object the loades the
     * app configuration.
     */
    getConfigPromise(app) {
        var promiseFunction = (resolve,reject) => {
            var onOpen = function(err,data) {
                if(err) reject(err);

                let configJson;
                if(data !== null) {
                    try {
                        configJson = JSON.parse(data);
                    }
                    catch(error) {
                        if(error.stack) console.error(error.stack);
                        reject("Error parsing config: " + error.toString());
                    }
                }
                else {
                    configJson = null;
                }
                resolve(configJson);                   
            }      

            openSaveApi.loadConfig(onOpen);
        }        
            
        return new Promise(promiseFunction);
    }
    
    /** This method should return a default FileAccessObject. It will be loaded
     * if an alternate is not loaded in configuration.
     */
    getDefaultFileAccessObject(app) {
        return new ElectronBridgeFileAccess();
    }
    
    /** This method should return a promise for the initial workspace
     * that should be loaded.
     */
    getInitialWorkspaceFilePromise(app) {
        //no initial workspace set up in electron
        return null;
    }
    
    /** This method should return the file metadata for the intial workspace.
     * This will be used in saving the initail workspace. (For example, if the
     * initial workspace is a locally loaded file in the electron version, this
     * file metadata will allow the user to select "save" to update the file 
     * without having to select a file to save to.
     */
    getInitialWorkspaceFileMetadata(app) {
        return null;
    }
}
