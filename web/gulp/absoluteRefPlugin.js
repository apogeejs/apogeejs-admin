const path = require('path');

function createResolveIdPlugin(currentSystemDirectory,currentReferenceDirectory) {

    let baseDir;
    if(currentSystemDirectory.endsWith(currentReferenceDirectory)) {
        let baseLength = currentSystemDirectory.length - currentReferenceDirectory.length;
        baseDir = currentSystemDirectory.substr(0,baseLength);
    }
    else {
        throw new Error("Configuration error: unepxected input directory: " + currentSystemDirectory + "  " + currentReferenceDirectory);
    }
    
    //plugin function
    let resolveId = (importee, importer) => {

        //this is to handle the initial file for the cjs case
        if(!importer) return null;

        if (isAbsolute(importee)) {
            const root = path.parse(importee).root;
            return ensureExt(path.resolve(baseDir, path.relative(root, importee)));
        } else {
            const importer_dir = path.dirname(importer);
            return ensureExt(importer ? path.resolve(importer_dir, importee) : path.resolve(importee));
        }
    }

    return resolveId;
}

module.exports = createResolveIdPlugin;

//-----------------
// internal Functions
//-----------------
function isAbsolute(path) {
    return /^[\\\/]/.test(path);
}

function ensureExt(fn) {
    return /\.js$/.test(fn) ? fn : fn + '.js';
}
