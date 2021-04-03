/**
 * This gulp file can be used to relese the apogeejs modules, both as needed for es and npm. It
 * requires to configuration files to run:
 * - version info (eg versionInfo.json) - This file lists the version information for the repo and for the dpendent
 *     libraries. It also lists the build info file that it requires.
 * 
 * - build info (eg buildInfo.json) - This file contains a list of actions for the release and the configuration for each.
 *     The operations are:
 *     - copyFileList - This copies a list of files to a specified directory.
 *     - copyAndReplace - This copies a single file to a specified directory, inserting specified values (such as version numbers) 
 *         into marked locations.
 *     - packageLib - This uses rollup to bundle the source es module into an es or cjs module.
 *     - concatFileList - A list of files are concatenated together and saved in the specified directory. This is used for 
 *         combining CSS files.
 * 
 * Files and directories are specifie as absuolute URLs (for the most part), based on the same formalism as is used in the 
 * es modules. The URLs are converted to the relevent file paths as needed. There is an option to not only convert to the 
 * associated file path, but also to substitue for an alternate path, such as to specific a specific release folder to use as an
 * input.
 * 
 * See documentation for a more thorough description.  
 */
const {series, src, dest, parallel} = require('gulp');
const replace = require('gulp-replace');
const concat = require('gulp-concat');
const rollup = require('rollup');
const path = require('path');
const buildUtils = require("./build-utils.js");

const PATH_TO_ABSOLUTE_ROOT = "../..";
const LIB_MAPPING_ABSOLUT_PATH = "/apogeejs-admin/ext/libMapping.json";
let resolveAbsoluteUrl;
let resolveId;
let pathMapping;
let suppressReleasePresentCheck;

/** This function creates the releaese task for the given repository. */
function createReleaseTask(versionInfoFilePath) {

    //release version information
    const versionInfo = require(versionInfoFilePath);
    pathMapping = createPathMapping(versionInfo);
    suppressReleasePresentCheck = versionInfo.suppressReleasePresentCheck;

    //conversions for absolute references - "urls" relative to parent directories holding repos
    //used to convert urls to paths
    resolveAbsoluteUrl = buildUtils.createResolveAbsoluteUrl(__dirname,PATH_TO_ABSOLUTE_ROOT,pathMapping); 
    //used for rollup
    resolveId = buildUtils.createResolveId(resolveAbsoluteUrl); 

    //build data for module, independent of version
    const buildInfo = require(resolveAbsoluteUrl(versionInfo.buildInfoUrl));
    const libMapping = require(resolveAbsoluteUrl(LIB_MAPPING_ABSOLUT_PATH));

    //create the release task
    let releaseTask = createModuleTask(buildInfo,libMapping,versionInfo);
    return releaseTask;
}

/** This function constructs a path mapping to remap file urls to a desired release directory, where applicable. */
function createPathMapping(versionInfo) {
    let pathMapping = {};
    for(let repoName in versionInfo.dependentVersions) {
        let info = versionInfo.dependentVersions[repoName];
        let key = `/${repoName}/`;
        let releaseDirectory = info.isProductionRelease ? "releases" : "releases-dev";
        let value = `/apogeejs-releases/web/${releaseDirectory}/${repoName}/v${info.version}/`;
        pathMapping[key] = value;
    }
    return pathMapping;
}

/** This constructs the module task according to the specified build info */
function createModuleTask(buildInfo,libMapping,versionInfo) {

    let outputFolder = resolveAbsoluteUrl(buildUtils.getReleaseFolderUrl(
            buildInfo.repoName,
            versionInfo.version,
            versionInfo.isProductionRelease
        ));

    //======================================
    // Generate Release Specific Tasks
    //======================================

    let buildTaskList = buildInfo.taskList.map(taskInput => {

        switch(taskInput.type) {
            case "copyFileList": {
                let srcFileList = taskInput.srcFileUrlList.map(resolveAbsoluteUrl);
                let destFolder = taskInput.childFolder ? path.join(outputFolder,taskInput.childFolder) : outputFolder;

                return () => copyFileListTask(srcFileList,destFolder);
            }

            case "copyAndReplace": {
                let srcFile = resolveAbsoluteUrl(taskInput.srcFileUrl);
                let destFolder = taskInput.childFolder ? path.join(outputFolder,taskInput.childFolder) : outputFolder;

                return () => copyAndReplaceTask(srcFile,destFolder,taskInput.replacementList,versionInfo);
            }

            case "concatFileList": {
                let srcFileList = taskInput.srcFileUrlList.map(resolveAbsoluteUrl);
                let destFileName = taskInput.destFileName;
                let destFolder = taskInput.childFolder ? path.join(outputFolder,taskInput.childFolder) : outputFolder;

                return () => concatFileListTask(srcFileList,destFileName,destFolder);
            }

            case "packageLib": {
                let sourceFile = resolveAbsoluteUrl(taskInput.sourceFileUrl);
                let destFile = taskInput.childFolder ? path.join(outputFolder,taskInput.childFolder,taskInput.outputFileName) :
                    path.join(outputFolder,taskInput.outputFileName);

                let externalLibMapping = taskInput.externalLibMapping;
                if(!externalLibMapping) externalLibMapping = {};
                let externalLibs = [];
                for(let libPath in externalLibMapping) {
                    externalLibs.push(libPath);
                }

                let banner = buildUtils.getJsFileHeader(taskInput.outputFileName,versionInfo.version);

                return () => packageLibTask(sourceFile,taskInput.format,destFile,externalLibs,externalLibMapping,banner);
            }

            default:
                throw new Error("Unrecognized task type: " + taskInput.type);
        }
    })

    let releaseTasks = parallel.apply(null,buildTaskList);

    
    //return tasks
    if(!suppressReleasePresentCheck) {
        //======================================
        // Verify release not present
        //======================================
        let verifyReleaseNotPresent = () => buildUtils.makeSureReleaseNotPresent(outputFolder);

        //return the gulp task for the es module
        return series(
            verifyReleaseNotPresent,
            releaseTasks
        )
    }
    else {
        return releaseTasks;
    }

}

/** This function is a gulp task that copies files to a destination folder. */
function copyFileListTask(srcFileList,destFolder) {
    //I had some occasional problems on windows without this step
    //I think this is related to an issue cited in the rollup "dest" documentation, but
    //I didn't understard how to otherwise fix it.
    let alteredFileList = srcFileList.map(buildUtils.fixPath);
    let alteredDestFolder = buildUtils.fixPath(destFolder);

    return src(alteredFileList,{allowEmpty: true})
        .pipe(dest(alteredDestFolder));
}

/** This function is a gulp task that concatenates a list of files and sends the result to destination folder. */
function concatFileListTask(srcFileList,destFileName,destFolder) {
    //I had some occasional problems on windows without this step
    //I think this is related to an issue cited in the rollup "dest" documentation, but
    //I didn't understard how to otherwise fix it.
    let alteredFileList = srcFileList.map(buildUtils.fixPath);
    let alteredDestFolder = buildUtils.fixPath(destFolder);

    return src(alteredFileList)
        .pipe(concat(destFileName))
        .pipe(dest(alteredDestFolder));
}

/** This function copys a srcFile to the destFolder, making the specified replacements.
 * The replacement list has entries of the format:
 * {
 *     "marker": (the text that should be replaced),
 *     "type": (that value to be used in the replacement. Options:
 *           "version" - Inserts the version of the specified lib
 *           "esReleasePath" - Inserts the release path for the specified es module release path
 *           "npmReleasePath" - Inserts the release path for the specified npm module release ath
 *           "deployPath" - Inserts the deploy path (used for web requests) for the specified es module
 *           "additionalValue" - Inserts a named value.  
 *     "lib": This field specifies the lib for the types: version, esReleasePath, npmReleasePath, deployPath
 *     "valueName": This is the lookup name for the value. This is used only for the type "additionalValue". The
 *            values are looked up in the versionInfo.json field "additionalValues".
 * }
 */
function copyAndReplaceTask(srcFile,destFolder,replacementList,versionInfo) {
    //I had some occasional problems on windows without this step
    //I think this is related to an issue cited in the rollup "dest" documentation, but
    //I didn't understard how to otherwise fix it.
    let alteredSourceFile = buildUtils.fixPath(srcFile)
    let alteredDestFolder = buildUtils.fixPath(destFolder);
	let stream = src(alteredSourceFile);
	replacementList.forEach( replacement => {
        //get the value to insert
        let value;

        if(replacement.type == "additionalValue") {
            //explicit named value
            value = versionInfo.additionalValues[replacement.valueName]
        }
        else {
            //lib version value
            let repoInfo;
            if(replacement.lib == "this") {
                repoInfo = versionInfo;
            }
            else {
                repoInfo = versionInfo.dependentVersions[replacement.lib];
            }
            
            if(replacement.type =="version") {
                value = repoInfo.version;
            }
            else if(replacement.type == "npmVersion") {
                if(repoInfo.isProductionRelease) {
                    //for now exact version. Later add qualifier
                    value = repoInfo.version;
                }
                else {
                    //add a url to request version from the local server
                    value = `http://localhost:8888/apogeejs-releases/node/releases-dev/${repoInfo.repoName}/v${repoInfo.version}/${repoInfo.repoName}-${repoInfo.version}.tgz`
                }
            }
            // else if(replacement.type == "esReleasePath") {
            //     value = buildUtils.getReleaseFolderUrl(repoInfo.repoName,"es",repoInfo.version,repoInfo.isProductionRelease);
            // }
            // else if(replacement.type == "npmReleasePath") {
            //     value = buildUtils.getReleaseFolderUrl(repoInfo.repoName,"cjs",repoInfo.version,repoInfo.isProductionRelease);
            // }
            else if(replacement.type == "deployPath") {
                value = buildUtils.getDeployFolderUrl(repoInfo.repoName,repoInfo.version,repoInfo.isProductionRelease);
            }
        }

        if(value === undefined) throw new Error("Replacement value not found for marker " + replacement.marker);

		stream = stream.pipe(replace(replacement.marker,value));
    })
	
    return stream.pipe(dest(alteredDestFolder));
}

/** This function bundles the output es module. */
function packageLibTask(srcFile,format,destFile,externalLibs,externalLibMapping,banner) {
    //I had some occasional problems on windows without this step
    //I think this is related to an issue cited in the rollup "dest" documentation, but
    //I didn't understard how to otherwise fix it.
    let alteredSourceFile = buildUtils.fixPath(srcFile)
    let alteredDestFile = buildUtils.fixPath(destFile);

    return rollup.rollup({
        input: alteredSourceFile,
        external: externalLibs,
        plugins: [
            {resolveId}
        ]
    }).then(bundle => {
        return bundle.write(
            { 
                file: alteredDestFile,
                format: format,
                banner: banner,
                paths: externalLibMapping,
            }
        )
    });
}

//============================
// Exports
//============================

exports.releaseWebApp = (cb) => createReleaseTask("../../apogeejs-web-app/versionInfo.json")(cb);
exports.releaseServerIde = (cb) => createReleaseTask("../../apogeejs-server-ide/versionInfo.json")(cb);
exports.releaseServer = (cb) => createReleaseTask("../../apogeejs-server/versionInfo.json")(cb);
exports.releaseNetIde = (cb) => createReleaseTask("../../apogeejs-net-ide/versionInfo.json")(cb);
exports.releaseWebRuntime = (cb) => createReleaseTask("../../apogeejs-web-runtime/versionInfo.json")(cb);

// //This task executes the complete release
// exports.releaseBaseLib = (cb) => createReleaseTask("../../apogeejs-base-lib/versionInfo.json")(cb);
// exports.releaseUtilLib = (cb) => createReleaseTask("../../apogeejs-util-lib/versionInfo.json")(cb);
// exports.releaseModelLib = (cb) => createReleaseTask("../../apogeejs-model-lib/versionInfo.json")(cb);
// exports.releaseAppLib = (cb) => createReleaseTask("../../apogeejs-app-lib/versionInfo.json")(cb);
// exports.releaseUiLib = (cb) => createReleaseTask("../../apogeejs-ui-lib/versionInfo.json")(cb);
// exports.releaseViewLib = (cb) => createReleaseTask("../../apogeejs-view-lib/versionInfo.json")(cb);
// exports.releaseCombinedFileAccess = (cb) => createReleaseTask("../../apogeejs-combined-file-access/versionInfo.json")(cb);

// exports.releaseAppBundle = (cb) => createReleaseTask("../../apogeejs-app-bundle/versionInfo.json")(cb);
// exports.releaseWebRuntime = (cb) => createReleaseTask("../../apogeejs-web-runtime/versionInfo.json")(cb);

// exports.releaseWebApp = (cb) => createReleaseTask("../../apogeejs-web-app/versionInfo.json")(cb);
// exports.releaseServerIde = (cb) => createReleaseTask("../../apogeejs-server-ide/versionInfo.json")(cb);
// exports.releaseNetIde = (cb) => createReleaseTask("../../apogeejs-net-ide/versionInfo.json")(cb);
// exports.releaseServer = (cb) => createReleaseTask("../../apogeejs-server/versionInfo.json")(cb);

// //"local" releases - These are for repos with npm modules that have dependencies on other repo npm modules
// //With these releases we will reference local copies of the releases, as served from the file server
// exports.releaseBaseLibLocal = (cb) => createReleaseTask("../../apogeejs-base-lib/versionInfoLocal.json")(cb);
// exports.releaseUtilLibLocal = (cb) => createReleaseTask("../../apogeejs-util-lib/versionInfoLocal.json")(cb);
// exports.releaseModelLibLocal = (cb) => createReleaseTask("../../apogeejs-model-lib/versionInfoLocal.json")(cb);
// exports.releaseAppLibLocal = (cb) => createReleaseTask("../../apogeejs-app-lib/versionInfoLocal.json")(cb);
// exports.releaseUiLibLocal = (cb) => createReleaseTask("../../apogeejs-ui-lib/versionInfoLocal.json")(cb);
// exports.releaseViewLibLocal = (cb) => createReleaseTask("../../apogeejs-view-lib/versionInfoLocal.json")(cb);
// exports.releaseAppBundleLocal = (cb) => createReleaseTask("../../apogeejs-app-bundle/versionInfoLocal.json")(cb);
// //these local releases also flag not checking if the releaese is present, so we don't have to reinstall the node modules
// exports.releaseServerIdeLocal = (cb) => createReleaseTask("../../apogeejs-server-ide/versionInfoLocal.json")(cb);
// exports.releaseNetIdeLocal = (cb) => createReleaseTask("../../apogeejs-net-ide/versionInfoLocal.json")(cb);
// exports.releaseServerLocal = (cb) => createReleaseTask("../../apogeejs-server/versionInfoLocal.json")(cb);

