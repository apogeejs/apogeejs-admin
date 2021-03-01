/** 
 * Build Utilities
 * This module contains some standard build utilities for releasing apogeejs repos.
 */
const fs = require("fs");
const path = require("path");

/** This function creats a function to convert input urls. Absolute urls will be converted to system file paths,
 * with folder remapping as desired. Relative urls are untouched. 
 * The return value is (urlPath) => systemPath; 
 * argument:
 * - currentSystemDirectory - the active file system directory
 * - the page from the active file system directory to the absolute url root directory.
 * - absUrlRemapping - This object allows folder remapping, such as to reposition a url to released codde rather than
 *      original source. The format of the key and value should be absolute urls with a leading and trailing "/". 
 *      If any urls are not in this format, an error will be thrown. 
 *      example: {"/apogeejs-model-lib.src/": "apogeejs-admin/releases/apogee-model-lib/v2.1.1/"}
 * */
exports.createResolveAbsoluteUrl = function(currentSystemDirectory,pathFromCurrentSystemDirToDesiredAbsoluteRoot,absUrlRemapping) {

    let absoluteUrlRoot = path.join(currentSystemDirectory,pathFromCurrentSystemDirToDesiredAbsoluteRoot);

    //test the abs url remapping to make sure it is in the proper format
    for(let remapFromFolder in absUrlRemapping) {
        let remapToFolder = absUrlRemapping[remapFromFolder];
        verifyFormat(remapFromFolder);
        verifyFormat(remapToFolder);
    }

    let resolveAbsoluteUrl = (url) => {
        if(isAbsolutePath(url)) {
            //remap the url if it is in a remapped folder
            url = exports.remapUrl(url,absUrlRemapping)

            //join the abs url (minus the leading /) to the root url
            return path.join(absoluteUrlRoot,url.substr(1));
        }
        else {
            //don't change relative urls
            return url;
        }
    }

    return resolveAbsoluteUrl;
}

/** This function creates a function to act as the resolveID plugin for rollup, according to the absolute url remapping rules
 * The return value is (importedFile,importingFile) => systemPath; 
 * arguments:
 * - resolveAbsoluteUrlFunction - This is the function to resolve abs urls created by createResolveAbsoluteUrl. 
 * */
exports.createResolveId = function(resolveAbsoluteUrlFunction) {
    return (importedFile,importingFile) => {

        //this is to handle the initial file for the cjs case
        if(!importingFile) return null;

        //return ull if this is not an absulote url, to allow the default handling
        if(isAbsolutePath(importedFile))  return resolveAbsoluteUrlFunction(importedFile)
        else return null;
    }
}

/** This function remaps a url. The map oject urlRemapping has the format:
 * {
 *     (starts with path to remap): (replacement path)
 * }
 * 
 * This is intended for absolute urls. The starts with path should start and end with a "/" character.
 */
exports.remapUrl = function(url,urlRemapping) {
    for(let remapFromFolder in urlRemapping) {
        if(url.startsWith(remapFromFolder)) {
            let remapToFolder = urlRemapping[remapFromFolder];
            url = remapToFolder + url.substr(remapFromFolder.length);
            break;
        }
    }
    return url;
}

//returns true if entered path starts with "/"
function isAbsolutePath(path) {
    return /^[\\\/]/.test(path);
}

/** This function makes sure the path segment starts and ends with a '/', which is assumed in our code.
 * If not, an exception is thrown. */
function verifyFormat(pathSegment) {
    if((!pathSegment.startsWith("/"))||(!pathSegment.endsWith("/"))) throw new Error("Remap paths should start and end with '/'");
}

/** This function creates a file header */
exports.getJsFileHeader = function(fileName,version) {
    return "// File: " + fileName + "\n" +
        "// Version: " + version + "\n" +
        "// Copyright (c) 2016-2021 Dave Sutter\n" + 
        "// License: MIT\n";
}

// release folder constants
const RELEASE_PARENT_FOLDER_URL = "/apogeejs-releases";
const ES_FOLDER = "web";
const CJS_FOLDER = "node";
const DEV_RELEASE_FOLDER = "releases-dev"
const PROD_RELEASE_FOLDER = "releases";

exports.getReleaseFolderUrl = function(repoName,format,version,isProductionRelease) {
    let typeFolder;
    if(format == "es") typeFolder = ES_FOLDER;
    else if(format == "cjs") typeFolder = CJS_FOLDER;
    else throw new Error("Unknown format: " + format);

    let releaseFolder = isProductionRelease ?  PROD_RELEASE_FOLDER : DEV_RELEASE_FOLDER;
    let releaseName = "v" + version;
    return path.posix.join(RELEASE_PARENT_FOLDER_URL,typeFolder,releaseFolder,repoName,releaseName);
}

exports.getDeployFolderUrl = function(repoName,version,isProductionRelease) {
    let releaseFolder = isProductionRelease ?  PROD_DEPLOY_FOLDER : DEV_RELEASE_FOLDER;
    let releaseName = "v" + version;
    return path.posix.join("/",releaseFolder,repoName,releaseName);
}

/** This function checks if the release folder is present. */
exports.makeSureReleaseNotPresent = function(outputFolder) {
    return new Promise( (resolve,reject) => {
        fs.stat(outputFolder, (err, stats) => {
            if (err) resolve("File is not present!");
            else reject("Release is already present! If this should not be true, check the version numbers");
        });
    })
}


/** This addresses a funny problem I had on windows. I think this is related to an issue cited in the 
 * rollup "dest" documentation, but I didn't understard how to otherwise fix it.
 * It doesn't seem to be a problem if I convert the path to use the posix path delimiter. */
exports.fixPath = function(path) {
    return path.replace(/\\/g,"/");
}