const path = require('path');

//Call this with current system directory, from where the script is being run
//Optionally "pathFromCurrentSystemDirToDesiredAbsoluteRoot" can be added.
//THis gives the path from the current system directory to the desired absolute root directory,
//if it is different from the current system directory.
function createResolveIdPlugin(currentSystemDirectory,pathFromCurrentSystemDirToDesiredAbsoluteRoot) {

    //get the base directory for any absolute reference
    let ABS_IMPORT_BASE_DIR;
    if(pathFromCurrentSystemDirToDesiredAbsoluteRoot) {
        ABS_IMPORT_BASE_DIR = path.join(currentSystemDirectory,pathFromCurrentSystemDirToDesiredAbsoluteRoot);
    }
    else {
        ABS_IMPORT_BASE_DIR = currentSystemDirectory;
    }
    
    //This function creates the file path from the input file and the path that is being imported
    let resolveId = (importedFile, importingFile) => {

        //this is to handle the initial file for the cjs case
        if(!importingFile) return null;

        let importedBaseDir;
        let importedFileFromBase;
        if (isAbsolutePath(importedFile)) {
            importedBaseDir = ABS_IMPORT_BASE_DIR;
            importedFileFromBase = path.relative("/", importedFile);
        } else {
            importedBaseDir = path.dirname(importingFile);
            importedFileFromBase = importedFile;

        }
        return ensureExtension(path.resolve(importedBaseDir, importedFileFromBase));
    }



    return resolveId;
}

module.exports = createResolveIdPlugin;

//-----------------
// internal Functions
//-----------------

//returns true if entered path starts with "/"
function isAbsolutePath(path) {
    return /^[\\\/]/.test(path);
}

//adds the ".js" extension if it is missing
function ensureExtension(fn) {
    return /\.js$/.test(fn) ? fn : fn + '.js';
}
