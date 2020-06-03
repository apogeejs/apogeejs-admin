const { src, dest, series, parallel, task } = require('gulp');
const concat = require('gulp-concat');
const clean = require('gulp-clean');
const versionConfig = require('./versionConfig.json');
const rollup = require('rollup');
const replace = require('gulp-replace');
var rename = require('gulp-rename');
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


const WEBAPP_FOLDER = RELEASE_FOLDER + "/webapp";
const ELECTRON_NODE_FOLDER = RELEASE_FOLDER + "/electronnodeapp";
const ELECTRON_BRIDGE_FOLDER = RELEASE_FOLDER + "/electronbridgeapp";
const NODE_FOLDER = RELEASE_FOLDER + "/nodelib";
const TEMP_FOLDER = "temp";

//======================================
// Release Info
//======================================

//base files - version info
const BASE_FILES = [
    "versionConfig.json"
]

let copyReleaseInfoTask = () => copyFilesTask(BASE_FILES,RELEASE_FOLDER);

//=================================
// Package CSS
//=================================

const CSS_FILES = [
    "../apogeeview/apogeeapp.css",
    "../apogeeview/componentdisplay/literatepage/LiteratePage.css",
    "../apogeeview/editor/toolbar/ApogeeToolbar.css",
    "../apogeeui/window/WindowFrame.css",
    "../apogeeui/window/dialog.css",
    "../apogeeui/displayandheader/DisplayAndHeader.css",
    "../apogeeui/menu/Menu.css",
    "../apogeeui/splitpane/SplitPane.css",
    "../apogeeui/tabframe/TabFrame.css",
    "../apogeeui/treecontrol/TreeControl.css",
    "../apogeeui/configurablepanel/ConfigurablePanel.css", 
    "../prosemirror/lib/compiledCss/editor.css",    
    "../ext/handsontable/handsontable_6.2.0/handsontable.full.min.css"
]

const CSS_BUNDLE_FILENAME = "cssBundle.css";

function packageCssTask() {
    return src(CSS_FILES)
        .pipe(concat(CSS_BUNDLE_FILENAME))
        .pipe(dest(ASSETS_FOLDER))
        .pipe(dest(ELECTRON_BRIDGE_FOLDER))
        .pipe(dest(ELECTRON_NODE_FOLDER))
}



//----------------
// resources (images, mainly)
//----------------

const RESOURCES_FOLDER_NAME = "resources";

function copyResourcesTask() {
    return src('../resources/**/*')
        .pipe(dest(ASSETS_FOLDER + '/' + RESOURCES_FOLDER_NAME))
        .pipe(dest(ELECTRON_BRIDGE_FOLDER + '/' + RESOURCES_FOLDER_NAME))
        .pipe(dest(ELECTRON_NODE_FOLDER + '/' + RESOURCES_FOLDER_NAME))
}

//----------------
// ace includes (themes and things like that)
//----------------
const ACE_INCLUDES_FOLDER_NAME = "ace_includes";

function copyAceIncludesTask() {
    return src('../ext/ace/ace_1.4.3/ace_includes/**/*')
        .pipe(dest(ASSETS_FOLDER + '/' + ACE_INCLUDES_FOLDER_NAME))
        .pipe(dest(ELECTRON_BRIDGE_FOLDER + '/' + ACE_INCLUDES_FOLDER_NAME))
        .pipe(dest(ELECTRON_NODE_FOLDER + '/' + ACE_INCLUDES_FOLDER_NAME))
}

//----------------
// globals definition files
//----------------

let copyGlobalFiles = parallel(
    () => copyFilesTask(["../apogee/webGlobals.js"],ASSETS_FOLDER),
    () => copyFilesTask(["../apogee/debugHook.js"],ASSETS_FOLDER),
    () => copyFilesTask(["../apogee/nodeGlobals.js"],ELECTRON_NODE_FOLDER),
    () => copyFilesTask(["../apogee/debugHook.js"],ELECTRON_NODE_FOLDER),
    () => copyFilesTask(["../apogee/webGlobals.js"],ELECTRON_BRIDGE_FOLDER),
    () => copyFilesTask(["../apogee/debugHook.js"],ELECTRON_BRIDGE_FOLDER),
    () => copyFilesTask(["../apogee/nodeGlobals.js"],NODE_FOLDER),
    () => copyFilesTask(["../apogee/debugHook.js"],NODE_FOLDER),
)

//==============================
// Web App
//==============================

let releaseWebAppTask = parallel(
    copyWebAppPageTask,
    packageWebAppTask
)

function copyWebAppPageTask() {
    let baseHref = versionConfig.VERSION_ASSETS_PATH + "/";

    return src('../applications/webapp/apogee.DEPLOY.html')
        .pipe(replace("BASE_HREF",baseHref))
        .pipe(dest(WEBAPP_FOLDER));
}

const WEB_APP_JS_FILENAME = "apogeeWebApp.js";

function packageWebAppTask() {
    return rollup.rollup({
        input: '../applications/webapp/app.js',
        plugins: [
            {resolveId}
        ]
    }).then(bundle => {
        return bundle.write(
            { 
                file: ASSETS_FOLDER + "/" + WEB_APP_JS_FILENAME,
                format: 'es'
            }
        );
    });
}

//==============================
// Package Client Web Lib
//==============================

const CLIENT_LIB_JS_BASE_FILENAME = "apogeeWebClientLib";
const CLIENT_LIB_INTERMEDIATE_FILENAME = CLIENT_LIB_JS_BASE_FILENAME + ".js";
const CLIENT_LIB_ES_FILENAME = CLIENT_LIB_JS_BASE_FILENAME + ".es.js";

let CLIENT_LIB_ASSETS_BASE_URL = versionConfig.VERSION_RELEASE_HOST + versionConfig.VERSION_ASSETS_PATH;

//this releases the web lib
let releaseWebClientLibTask = series(
    () => cleanFolderTask(TEMP_FOLDER),
    prepareClientLibTask,
    packageClientLibTask,
    () => cleanFolderTask(TEMP_FOLDER)
);

function prepareClientLibTask() {

    return src('../applications/webclientlib/webClientLib.js')
        .pipe(replace('INCLUDE_BASE_PATH = ""','INCLUDE_BASE_PATH = "' + CLIENT_LIB_ASSETS_BASE_URL + '";'))
        .pipe(rename(CLIENT_LIB_INTERMEDIATE_FILENAME))
        .pipe(dest(TEMP_FOLDER));
}

function packageClientLibTask() {
    return rollup.rollup({
        input: TEMP_FOLDER + '/' + CLIENT_LIB_INTERMEDIATE_FILENAME,
        plugins: [
            {resolveId}
        ]
    }).then(bundle => {
        return Promise.all[
            bundle.write(
                 { 
                    file: ASSETS_FOLDER + "/" + CLIENT_LIB_ES_FILENAME, 
                    format: 'es'
                }
            )
        ]
    });
}

//==============================
// Package Electron Node App
//==============================

const ELECTRON_NODE_APP_JS_FILENAME = "apogeeElectronNodeApp.js";

const ELECTRON_NODE_ADDED_FILES = [
    "../applications/electronnodeapp/apogee.html",
    "../applications/electronnodeapp/main.js"
]

//this releases the eletron app. It depends on the creation of the css
//bundle.
let releaseElectronNodeTask = parallel( 
    packageElectronNodeSourceTask,
    prepareElectronNodePackageJsonTask,
    () => copyFilesTask(ELECTRON_NODE_ADDED_FILES,ELECTRON_NODE_FOLDER)
);

function packageElectronNodeSourceTask() {
    return rollup.rollup({
        input: '../applications/electronnodeapp/app.js',
		external: ['fs'],
		plugins: [
			{resolveId}
		]
    }).then(bundle => {
        return bundle.write(
            {
                file: ELECTRON_NODE_FOLDER + "/" + ELECTRON_NODE_APP_JS_FILENAME,
                format: 'cjs'
            }
        );
    });
}

function prepareElectronNodePackageJsonTask() {
    return src('../applications/electronnodeapp/package.json')
        .pipe(replace('VERSION', versionConfig.VERSION_NUMBER))
        .pipe(dest(ELECTRON_NODE_FOLDER));
}


//==============================
// Package Electron Bridge
//==============================

const ELECTRON_BRIDGE_APP_JS_FILENAME = "apogeeElectronBridgeApp.js";

const ELECTRON_BRIDGE_ADDED_FILES = [
    "../applications/electronbridgeapp/apogee.html",
    "../applications/electronbridgeapp/main.js",
    "../applications/electronbridgeapp/preload.js",
    "../applications/electronbridgeapp/create-protocol.js",
    "../applications/electronbridgeapp/mime-types.js"
]

//this releases the eletron app. It depends on the creation of the css
//bundle.
let releaseElectronBridgeTask = parallel( 
    packageElectronBridgeSourceTask,
    prepareElectronBridgePackageJsonTask,
    () => copyFilesTask(ELECTRON_BRIDGE_ADDED_FILES,ELECTRON_BRIDGE_FOLDER)
);

function packageElectronBridgeSourceTask() {
    return rollup.rollup({
        input: '../applications/electronbridgeapp/app.js',
		plugins: [
			{resolveId}
		]
    }).then(bundle => {
        return bundle.write(
            {
                file: ELECTRON_BRIDGE_FOLDER + "/" + ELECTRON_BRIDGE_APP_JS_FILENAME,
                format: 'es'
            }
        );
    });
}

function prepareElectronBridgePackageJsonTask() {
    return src('../applications/electronbridgeapp/package.json')
        .pipe(replace('0.0.0', versionConfig.VERSION_NUMBER))
        .pipe(dest(ELECTRON_BRIDGE_FOLDER));
}




//==============================
// Package Util Lib
//==============================

const UTIL_LIB_BASE_FILE_NAME = "apogeeUtilLib";
const UTIL_LIB_ES_FILE_NAME = UTIL_LIB_BASE_FILE_NAME + ".es.js"
const UTIL_LIB_CJS_FILE_NAME = UTIL_LIB_BASE_FILE_NAME + ".cjs.js"

function packageUtilLibTask() {
    return rollup.rollup({
        input: '../apogeeutil/apogeeUtilLib.js',
		plugins: [
			{resolveId}
		]
    }).then(bundle => {
        return Promise.all([
            // bundle.write(
            //     { 
            //         file: ELECTRON_FOLDER + "/" + UTIL_LIB_CJS_FILE_NAME,
            //         format: 'cjs'
            //     }
            // ),
            bundle.write(
                { 
                    file: NODE_FOLDER + "/" + UTIL_LIB_CJS_FILE_NAME,
                    format: 'cjs'
                }
            )
        ])
    });
}

//==============================
// Package Core Lib
//==============================

const CORE_LIB_BASE_FILE_NAME = "apogeeCoreLib";
const CORE_LIB_ES_FILE_NAME = CORE_LIB_BASE_FILE_NAME + ".es.js"
const CORE_LIB_CJS_FILE_NAME = CORE_LIB_BASE_FILE_NAME + ".cjs.js"

function packageCoreLibTask() {
    return rollup.rollup({
        input: '../apogee/apogeeCoreLib.js',
        external: ["/apogeeutil/apogeeUtilLib.js"],
		plugins: [
			{resolveId}
        ]
    }).then(bundle => {
        return Promise.all([
            // bundle.write(
            //     { 
            //         file: ELECTRON_FOLDER + "/" + CORE_LIB_CJS_FILE_NAME,
            //         format: 'cjs',
            //         paths: {
            //             "/apogeeutil/apogeeUtilLib.js": "./apogeeUtilLib.cjs.js"
            //         }
            //     }
            // ),
            bundle.write(
                { 
                    file: NODE_FOLDER + "/" + CORE_LIB_CJS_FILE_NAME,
                    format: 'cjs',
                    paths: {
                        "/apogeeutil/apogeeUtilLib.js": "./apogeeUtilLib.cjs.js"
                    }
                }
            ),
        ])
    });
}

//==============================
// Package App Lib
//==============================

// const APP_LIB_BASE_FILE_NAME = "apogeeAppLib";
// const APP_LIB_ES_FILE_NAME = APP_LIB_BASE_FILE_NAME + ".es.js";
// const APP_LIB_CJS_FILE_NAME = APP_LIB_BASE_FILE_NAME + ".cjs.js";

// function packageAppLibTask() {
//     return rollup.rollup({
//         input: '../apogeeapp/apogeeAppLib.js',
//         external: ["/apogeeutil/apogeeUtilLib.js","/apogee/apogeeCoreLib.js"],
// 		plugins: [
// 			{resolveId}
//         ]
//     }).then(bundle => {
//         return Promise.all([
//             bundle.write(
//                 { 
//                     file: ELECTRON_FOLDER + "/" + APP_LIB_CJS_FILE_NAME,
//                     format: 'cjs',
//                     paths: {
//                         "/apogeeutil/apogeeUtilLib.js": "./apogeeUtilLib.cjs.js",
//                         "/apogee/apogeeCoreLib.js": "./apogeeCoreLib.cjs.js"
//                     }
//                 }
//             )
//         ])
//     });
// }

//==============================
// Package UI Lib
//==============================

// const UI_LIB_BASE_FILE_NAME = "apogeeUiLib";
// const UI_LIB_ES_FILE_NAME = UI_LIB_BASE_FILE_NAME + ".es.js"
// const UI_LIB_CJS_FILE_NAME = UI_LIB_BASE_FILE_NAME + ".cjs.js"

// function packageUiLibTask() {
//     return rollup.rollup({
//         input: '../apogeeui/apogeeUiLib.js',
//         external: ["/apogeeutil/apogeeUtilLib.js"],
// 		plugins: [
// 			{resolveId}
//         ]
//     }).then(bundle => {
//         return Promise.all([
//             bundle.write(
//                 { 
//                     file: ELECTRON_FOLDER + "/" + UI_LIB_CJS_FILE_NAME,
//                     format: 'cjs',
//                     paths: {
//                         "/apogeeutil/apogeeUtilLib.js": "./apogeeUtilLib.cjs.js"
//                     }
//                 }
//             )
//         ])
//     });
// }

//==============================
// Package View Lib
//==============================

// const VIEW_LIB_BASE_FILE_NAME = "apogeeViewLib";
// const VIEW_LIB_ES_FILE_NAME = VIEW_LIB_BASE_FILE_NAME + ".es.js"
// const VIEW_LIB_CJS_FILE_NAME = VIEW_LIB_BASE_FILE_NAME + ".cjs.js"

// function packageViewLibTask() {
//     return rollup.rollup({
//         input: '../apogeeview/apogeeViewLib.js',
//         external: ["/apogeeutil/apogeeUtilLib.js","/apogee/apogeeCoreLib.js","/apogeeapp/apogeeAppLib.js","/apogeeui/apogeeUiLib.js"],
// 		plugins: [
// 			{resolveId}
//         ]
//     }).then(bundle => {
//         return Promise.all([
//             bundle.write(
//                 { 
//                     file: ELECTRON_FOLDER + "/" + VIEW_LIB_CJS_FILE_NAME,
//                     format: 'cjs',
//                     paths: {
//                         "/apogeeutil/apogeeUtilLib.js": "./apogeeUtilLib.cjs.js",
//                         "/apogee/apogeeCoreLib.js": "./apogeeCoreLib.cjs.js",
//                         "/apogeeapp/apogeeAppLib.js": "./apogeeAppLib.cjs.js",
//                         "/apogeeui/apogeeUiLib.js": "./apogeeUiLib.cjs.js"
//                     }
//                 }
//             )
//         ])
//     });
// }


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
    parallel(
        copyReleaseInfoTask,
        packageCssTask,
        copyResourcesTask,
        copyAceIncludesTask,
        copyGlobalFiles,
        packageUtilLibTask,
        packageCoreLibTask,
        //packageAppLibTask,
        //packageUiLibTask,
        //packageViewLibTask,
        releaseWebAppTask,
        releaseWebClientLibTask,
        releaseElectronNodeTask,
        releaseElectronBridgeTask
    )
);
