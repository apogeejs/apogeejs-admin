const { src, dest, series, parallel, task } = require('gulp');
const concat = require('gulp-concat');
const clean = require('gulp-clean');
const versionConfig = require('./versionConfig.json');
const rollup = require('rollup');
const inject = require('gulp-inject-string');

//==============================
//for absolute references
//==============================
let baseDir;
const BUNDLE_PATH = "\\gulp";

if(__dirname.endsWith(BUNDLE_PATH)) {
	let baseLength = __dirname.length - BUNDLE_PATH.length;
	baseDir = __dirname.substr(0,baseLength);
}
else {
	throw new Error("Configuration error: unepxected input directory: " + __dirname + "  " + BUNDLE_PATH);
}
const path = require('path');

function resolveId(importee, importer) {

	//this is to handle the initial file for the cjs case
	if(!importer) return null;

	if (isAbsolute(importee)) {
		const root = path.parse(importee).root;
		return ensureExt(path.resolve(baseDir, path.relative(root, importee)));
	} else {
		const importer_dir = path.dirname(importer);
		return ensureExt(importer ? path.resolve(importer_dir, importee) : path.resolve(importee));
	}
	function isAbsolute(path) {
		return /^[\\\/]/.test(path);
	}
	function ensureExt(fn) {
		return /\.js$/.test(fn) ? fn : fn + '.js';
	}
}
//-------------------------------------------------------

//==============================
// Copy some resources
//==============================

function copyWebPageTask(destFolder) {
    let assetsPath = versionConfig.VERSION_ASSETS_PATH;

    return src('../apogeeapp/impl/cutNPasteCode/app/apogee.html')
        .pipe(inject.after('<base href="',assetsPath + "/"))
        .pipe(dest(destFolder));
}

function copyResourcesTask(parentFolder,resourcesFolderName) {
    return src('../resources/**/*')
        .pipe(dest(parentFolder + '/' + resourcesFolderName));
}

function copyAceIncludesTask(parentFolder,aceIncludesFolderName) {
    return src('../ext/ace/ace_1.4.3/ace_includes/**/*')
        .pipe(dest(parentFolder + '/' + aceIncludesFolderName));
}

function copyFilesTask(fileList,destFolder) {
    console.log(fileList);
    return src(fileList)
        .pipe(dest(destFolder));
}

//==============================
// Package CSS Files
//==============================

function packageCssTask(destFolder,cssFiles,cssBundleFileName) {
    return src(cssFiles)
        .pipe(concat(cssBundleFileName))
        .pipe(dest(destFolder));
}

//==============================
// Package Web App
//==============================
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

function prepareAppLibTask(tempFolder) {
    let releasePath = versionConfig.VERSION_RELEASE_HOST + versionConfig.VERSION_ASSETS_PATH;

    return src('../apogeeapp/impl/webAppLib/apogeeAppLib.js')
        .pipe(inject.after('const HOST_OUTPUT_ROOT = "',releasePath))
        .pipe(dest(tempFolder));
}

function packageAppLibTask(tempFolder,destFolder,webLibBaseFileName) {
    return rollup.rollup({
        input: tempFolder + '/' + webLibBaseFileName + '.js',
        plugins: [
            {resolveId}
        ]
    }).then(bundle => {
        return Promise.all[
            bundle.write(
                 { file: destFolder + "/" + webLibBaseFileName + ".es6.js", format: 'es' }
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
// Package Core Lib
//==============================
function packageCoreLibTask(destFolder,coreLibBundleFileName) {
    return rollup.rollup({
        input: '../apogee/apogeeCoreLib.js',
		plugins: [
			{resolveId}
		]
    }).then(bundle => {
        return bundle.write(
            { file: destFolder + "/" + coreLibBundleFileName, format: 'es' }
        );
    });
}

//==============================
// Package App Lib
//==============================
function packageAppLibTask(destFolder,appLibBundleFileName) {
    return rollup.rollup({
        input: '../apogeeapp/apogeeAppLib.js',
        external: ["/apogee/apogeeCoreLib.js"],
		plugins: [
			{resolveId}
		]
    }).then(bundle => {
        return bundle.write(
            { 
                file: destFolder + "/" + appLibBundleFileName,
                format: 'es',
                paths: {
                    "/apogee/apogeeCoreLib.js": "apogeeCoreLib.js"
                }, }
        );
    });
}

//==============================
// Clean Output
//==============================
function cleanFolderTask(folder) {
    return src(folder, {read: false, allowEmpty: true})
        .pipe(clean());
}

//==============================
// Collected Tasks
//==============================

const DIST_FOLDER = "dist";
const ASSETS_FOLDER = DIST_FOLDER + "/assets";
const WEBAPP_FOLDER = DIST_FOLDER + "/webapp";
const ELECTRON_FOLDER = DIST_FOLDER + "/electronapp";
const TEMP_FOLDER = "temp";

const RESOURCES_FOLDER_NAME = "resources";
const ACE_INCLUDES_FOLDER_NAME = "ace_includes";

const WEB_APP_JS_FILENAME = "apogeeWebBundle.js";
const WEB_LIB_JS_BASE_FILENAME = "apogeeAppLib";
const ELECTRON_APP_JS_FILENAME = "apogeeElectronBundle.js";
const CORE_LIB_FILE_NAME = "apogeeCoreLib.js";
const APP_LIB_FILE_NAME = "apogeeAppLib.js";
const CSS_BUNDLE_FILENAME = "cssBundle.css";

const BASE_FILES = [
    "versionConfig.json"
]

const ASSETS_ADDED_FILES = [
]

const ELECTRON_ADDED_FILES = [
    "../apogeeapp/impl/electronCode/app/apogee.html",
    "../apogeeapp/impl/electronCode/app/main.js",
    "../apogeeapp/impl/electronCode/app/package.json"
]

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

const ELECTRON_CSS_FILES = [
    ASSETS_FOLDER + '/' + CSS_BUNDLE_FILENAME
]

//This task copies shared resources to the assets folder
//this must be done first because the CSS is bundled here and then must
//be copied to the electron folder.
let copySharedAssets = parallel(
    () => copyFilesTask(BASE_FILES,DIST_FOLDER),
    () => packageCssTask(ASSETS_FOLDER,CSS_FILES,CSS_BUNDLE_FILENAME),
    () => copyResourcesTask(ASSETS_FOLDER,RESOURCES_FOLDER_NAME),
    () => copyAceIncludesTask(ASSETS_FOLDER,ACE_INCLUDES_FOLDER_NAME),
//    () => copyFilesTask(ASSETS_ADDED_FILES,ASSETS_FOLDER),
);

//This releases the web app
let releaseWebApp = parallel(
    () => packageWebAppTask(ASSETS_FOLDER,WEB_APP_JS_FILENAME),
    () => copyWebPageTask(WEBAPP_FOLDER),
);

//this releases the web lib
// let releaseWebLib = series(
//     () => prepareAppLibTask(TEMP_FOLDER),
//     () => packageAppLibTask(TEMP_FOLDER,ASSETS_FOLDER,WEB_LIB_JS_BASE_FILENAME),
//     () => cleanFolderTask(TEMP_FOLDER)
// );

//this releases the eletron app. It depends on the creation of the css
//bundle.
// let releaseElectron = parallel( 
//     () => packageElectronTask(ELECTRON_FOLDER,ELECTRON_APP_JS_FILENAME),
//     () => copyFilesTask(ELECTRON_ADDED_FILES,ELECTRON_FOLDER),
//     () => copyFilesTask(ELECTRON_CSS_FILES,ELECTRON_FOLDER),
//     () => copyResourcesTask(ELECTRON_FOLDER,RESOURCES_FOLDER_NAME),
//     () => copyAceIncludesTask(ELECTRON_FOLDER,ACE_INCLUDES_FOLDER_NAME)
// );

let releaseCoreLib = parallel(
    () => packageCoreLibTask(ASSETS_FOLDER,CORE_LIB_FILE_NAME)
)

let releaseAppLib = parallel(
    () => packageAppLibTask(ASSETS_FOLDER,APP_LIB_FILE_NAME)
)

//============================
// Exports
//============================

function cleanTask()  {
    return cleanFolderTask(DIST_FOLDER);
}

//This cleans the release folder
exports.clean = cleanTask; 

//This task executes the complete release
exports.release = series(
    cleanTask,
    copySharedAssets,
    parallel(
        releaseWebApp,
//        releaseWebLib,
//        releaseElectron,
        releaseCoreLib,
        releaseAppLib
    )
);

//This cleans the release folder
exports.cleanTempFolder = () => cleanFolderTask(TEMP_FOLDER);