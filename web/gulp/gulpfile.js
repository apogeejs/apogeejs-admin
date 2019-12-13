const { src, dest, series, parallel, task } = require('gulp');
const concat = require('gulp-concat');
const clean = require('gulp-clean');
const versionConfig = require('./versionConfig.json');
const rollup = require('rollup');
const inject = require('gulp-inject-string');
const createResolveIdPlugin = require("./absoluteRefPlugin.js");

//for absolute references
const BUNDLE_PATH = "\\gulp";
let resolveId = createResolveIdPlugin(__dirname,BUNDLE_PATH);

//==============================
// Top Level Values
//==============================
const DIST_FOLDER = "dist";
const RELEASE_FOLDER = DIST_FOLDER + "/v" + versionConfig.VERSION_NUMBER;
const ASSETS_FOLDER = RELEASE_FOLDER + "/assets";

//==============================
// Package Util Lib
//==============================

const UTIL_LIB_BASE_FILE_NAME = "apogeeUtilLib";

let releaseUtilLib = () => packageUtilLibTask(ASSETS_FOLDER,UTIL_LIB_BASE_FILE_NAME);

function packageUtilLibTask(destFolder,utilLibBaseFileName) {
    return rollup.rollup({
        input: '../apogeeutil/apogeeUtilLib.js',
		plugins: [
			{resolveId}
		]
    }).then(bundle => {
        return bundle.write(
            { 
                file: destFolder + "/" + utilLibBaseFileName + ".es.js",
                format: 'es'
            }
        );
    });
}

//==============================
// Package Core Lib
//==============================

const CORE_LIB_BASE_FILE_NAME = "apogeeCoreLib";

let releaseCoreLib = () => packageCoreLibTask(ASSETS_FOLDER,CORE_LIB_BASE_FILE_NAME);

function packageCoreLibTask(destFolder,coreLibBaseFileName) {
    return rollup.rollup({
        input: '../apogee/apogeeCoreLib.js',
		plugins: [
			{resolveId}
		]
    }).then(bundle => {
        return bundle.write(
            { 
                file: destFolder + "/" + coreLibBaseFileName + ".es.js",
                format: 'es' 
            }
        );
    });
}

//==============================
// Package App Lib
//==============================

const APP_LIB_BASE_FILE_NAME = "apogeeAppLib";

let releaseAppLib = () => packageAppLibTask(ASSETS_FOLDER,APP_LIB_BASE_FILE_NAME);

function packageAppLibTask(destFolder,appLibBaseFileName) {
    return rollup.rollup({
        input: '../apogeeapp/apogeeAppLib.js',
        external: ["/apogee/apogeeCoreLib.js"],
		plugins: [
			{resolveId}
		]
    }).then(bundle => {
        return bundle.write(
            { 
                file: destFolder + "/" + appLibBaseFileName + ".es.js",
                format: 'es',
                paths: {
                    "/apogee/apogeeCoreLib.js": "apogeeCoreLib.js"
                }, }
        );
    });
}

//=================================
// Package CSS
//=================================

const CSS_FILES = [
    "../apogeeapp/app/apogeeapp.css",
    "../apogeeapp/app/component/literatepage/LiteratePage.css",
    "../apogeeapp/app/editor/toolbar/ApogeeToolbar.css",
    "../apogeeapp/ui/window/WindowFrame.css",
    "../apogeeapp/ui/window/dialog.css",
    "../apogeeapp/ui/displayandheader/DisplayAndHeader.css",
    "../apogeeapp/ui/menu/Menu.css",
    "../apogeeapp/ui/splitpane/SplitPane.css",
    "../apogeeapp/ui/tabframe/TabFrame.css",
    "../apogeeapp/ui/treecontrol/TreeControl.css",
    "../apogeeapp/ui/configurablepanel/ConfigurablePanel.css", 
    "../prosemirror/lib/compiledCss/editor.css",    
    "../ext/handsontable/handsontable_6.2.0/handsontable.full.min.css"
]

const CSS_BUNDLE_FILENAME = "cssBundle.css";

let packageCss = () => packageCssTask(ASSETS_FOLDER,CSS_FILES,CSS_BUNDLE_FILENAME);

function packageCssTask(destFolder,cssFiles,cssBundleFileName) {
    return src(cssFiles)
        .pipe(concat(cssBundleFileName))
        .pipe(dest(destFolder));
}

//======================================
// Some resource Copying
//======================================

//base files - version info
const BASE_FILES = [
    "versionConfig.json"
]

let copyBaseFiles = () => copyFilesTask(BASE_FILES,RELEASE_FOLDER);

//----------------
// resources (images, mainly)
//----------------

const RESOURCES_FOLDER_NAME = "resources";

let copyResources = () => copyResourcesTask(ASSETS_FOLDER,RESOURCES_FOLDER_NAME);

function copyResourcesTask(parentFolder,resourcesFolderName) {
    return src('../resources/**/*')
        .pipe(dest(parentFolder + '/' + resourcesFolderName));
}

//----------------
// ace includes (themes and things like that)
//----------------
const ACE_INCLUDES_FOLDER_NAME = "ace_includes";

let copyAceIncludes = () => copyAceIncludesTask(ASSETS_FOLDER,ACE_INCLUDES_FOLDER_NAME);

function copyAceIncludesTask(parentFolder,aceIncludesFolderName) {
    return src('../ext/ace/ace_1.4.3/ace_includes/**/*')
        .pipe(dest(parentFolder + '/' + aceIncludesFolderName));
}

//----------------
//other assets (nonr for now)
//----------------
const ASSETS_ADDED_FILES = [
]

let copyOtherAssets = () => copyFilesTask(ASSETS_ADDED_FILES,ASSETS_FOLDER);

//==============================
// Web App
//==============================

const WEBAPP_FOLDER = RELEASE_FOLDER + "/webapp";
const WEB_APP_JS_FILENAME = "apogeeWebApp.js";

//This releases the web app
let releaseWebApp = parallel(
    () => packageWebAppTask(ASSETS_FOLDER,WEB_APP_JS_FILENAME),
    () => copyWebPageTask(WEBAPP_FOLDER),
);

function copyWebPageTask(destFolder) {
    let assetsPath = versionConfig.VERSION_ASSETS_PATH;

    return src('../apogeeapp/impl/cutNPasteCode/app/apogee.html')
        .pipe(inject.after('<base href="',assetsPath + "/"))
        .pipe(dest(destFolder));
}

function packageWebAppTask(destFolder,webAppBundleFileName) {
    return rollup.rollup({
        input: '../apogeeapp/impl/cutNPasteCode/app/app.js',
        external: ["/apogee/apogeeCoreLib.js","/apogeeapp/apogeeAppLib.js"],
        plugins: [
            {resolveId}
        ]
    }).then(bundle => {
        return bundle.write(
            { 
                file: destFolder + "/" + webAppBundleFileName,
                format: 'es',
                paths: {
                    "/apogee/apogeeCoreLib.js": "apogeeCoreLib.js",
                    "/apogeeapp/apogeeAppLib.js": "apogeeAppLib.js"
                },
            }
        );
    });
}

//==============================
// Package Web Lib
//==============================

const TEMP_FOLDER = "temp";

const CLIENT_LIB_JS_BASE_FILENAME = "apogeeClientLib";

//this releases the web lib
let releaseWebClientLib = series(
    () => cleanFolderTask(TEMP_FOLDER),
    () => prepareClientLibTask(TEMP_FOLDER),
    () => packageClientLibTask(TEMP_FOLDER,ASSETS_FOLDER,CLIENT_LIB_JS_BASE_FILENAME),
    () => cleanFolderTask(TEMP_FOLDER)
);

function prepareClientLibTask(tempFolder) {
    let releasePath = versionConfig.VERSION_RELEASE_HOST + versionConfig.VERSION_ASSETS_PATH;

    return src('../applications/webclientlib/webClientLib.js')
        .pipe(inject.after('const HOST_OUTPUT_ROOT = "',releasePath))
        .pipe(dest(tempFolder));
}

function packageClientLibTask(tempFolder,destFolder,webLibBaseFileName) {
    return rollup.rollup({
        input: tempFolder + '/' + webLibBaseFileName + '.js',
        plugins: [
            {resolveId}
        ]
    }).then(bundle => {
        return Promise.all[
            bundle.write(
                 { file: destFolder + "/" + webLibBaseFileName + ".es.js", format: 'es' }
            ),
            bundle.write(
                { name: webLibBaseFileName, file: destFolder + "/" + webLibBaseFileName + ".umd.js", format: 'umd' }
            )
        ]
    });
}

//==============================
// Package Electron
//==============================


const ELECTRON_FOLDER = RELEASE_FOLDER + "/electronapp";

const ELECTRON_APP_JS_FILENAME = "apogeeElectronApp.js";

const ELECTRON_ADDED_FILES = [
    "../apogeeapp/impl/electronCode/app/apogee.html",
    "../apogeeapp/impl/electronCode/app/main.js",
    "../apogeeapp/impl/electronCode/app/package.json"
]

const ELECTRON_CSS_FILES = [
    ASSETS_FOLDER + '/' + CSS_BUNDLE_FILENAME
]

//this releases the eletron app. It depends on the creation of the css
//bundle.
let releaseElectron = parallel( 
    () => packageElectronTask(ELECTRON_FOLDER,ELECTRON_APP_JS_FILENAME),
    () => copyFilesTask(ELECTRON_ADDED_FILES,ELECTRON_FOLDER),
    () => copyFilesTask(ELECTRON_CSS_FILES,ELECTRON_FOLDER),
    () => copyResourcesTask(ELECTRON_FOLDER,RESOURCES_FOLDER_NAME),
    () => copyAceIncludesTask(ELECTRON_FOLDER,ACE_INCLUDES_FOLDER_NAME)
);

function packageElectronTask(destFolder,electronBundleFileName) {
    return rollup.rollup({
        input: '../apogeeapp/impl/electronCode/app/app.js',
		external: ['fs'],
		plugins: [
			{resolveId}
		]
    }).then(bundle => {
        return bundle.write(
            { file: destFolder + "/" + electronBundleFileName, format: 'cjs' }
        );
    });
}

//==============================
// Utility Tasks
//==============================

//clean (delete) a folder
function cleanFolderTask(folder) {
    return src(folder, {read: false, allowEmpty: true})
        .pipe(clean({force: true}));
}


//copy files utility function
function copyFilesTask(fileList,destFolder) {
    return src(fileList,{allowEmpty: true})
        .pipe(dest(destFolder));
}

//============================
// Exports
//============================

function cleanTask()  {
    return cleanFolderTask(RELEASE_FOLDER);
}

//This cleans the release folder
exports.clean = cleanTask; 

//This task executes the complete release
exports.release = series(
    cleanTask,
    copySharedAssets,
    parallel(
        releaseUtilLib,
        releaseCoreLib,
        releaseAppLib,
        releaseWebApp,
//        releaseWebClientLib,
//        releaseElectron,

    )
);
