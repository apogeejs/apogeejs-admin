import ElectronFileAccess from "/supplemental/electroncode/ElectronFileAccess.js";

/** 
 * This is the format of the AppConfigManager. This class does not need
 * to be extended. It has not internal functionality.
 */
export default class ElectronAppConfigManager {
    
    constructor() {
    }
    
    /** This method should return a Promise object the loades the
     * app configuration.
     */
    getConfigPromise(app) {
        var fs = require('fs');
        var fileLoadPromise;
        
        //load file if it exists
        if(fs.existsSync(ElectronAppConfigManager.CONFIG_FILE_PATH)) {
            var promiseFunction = (resolve,reject) => {
                var onFileOpen = function(err,data) {
                    if(err) reject(err);
                    else resolve(JSON.parse(data));                    
                }              
                fs.readFile(ElectronAppConfigManager.CONFIG_FILE_PATH,onFileOpen);
            }

            var configFilePromise = new Promise(promiseFunction);
            
            //chain the file download promise to the init settings promise
            return configFilePromise.then(appSettings => app.getConfigurationPromise(appSettings));
        }
        else { 
            //if there is no config file, just return an "empty" promise
            return Promise.resolve({});
        }
    };
    
    /** This method should return a default FileAccessObject. It will be loaded
     * if an alternate is not loaded in configuration.
     */
    getDefaultFileAccessObject(app) {
        return new ElectronFileAccess();
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

ElectronAppConfigManager.CONFIG_FILE_PATH = "./config.json";
