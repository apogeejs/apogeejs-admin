const { src, dest, series, parallel } = require('gulp');
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
console.log(BUNDLE_PATH.length);
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

function copyWebPageTask() {
    let releasePath = versionConfig.VERSION_RELEASE_PATH;

    return src('../apogeeapp/impl/cutNPasteCode/app/apogee.html')
        .pipe(inject.after('<base href="',releasePath))
        .pipe(dest('dist'));
}

function copyResourcesTask() {
    return src('../resources/**/*')
        .pipe(dest('dist/resources'));
}

function copyAceIncludesTask() {
    return src('../ext/ace/ace_1.4.3/ace_includes/**/*')
        .pipe(dest('dist/ace_includes'));
}

const OTHER_COPY_FILES = [
    "../debug/debugHook.js"
]

function copyOtherFilesTask() {
    return src(OTHER_COPY_FILES)
        .pipe(dest('dist'));
}

//==============================
// Package CSS Files
//==============================
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

function packageCssTask() {
    return src(CSS_FILES)
        .pipe(concat('cssBundle.css'))
        .pipe(dest('dist'));
}

//==============================
// Package Web App
//==============================
function packageWebAppTask() {
    return rollup.rollup({
        input: '../apogeeapp/impl/cutNPasteCode/app/app.js',
        plugins: [
            {resolveId}
        ]
    }).then(bundle => {
        return bundle.write(
            { 
                file: "dist/apogeeWebBundle.js",
                format: 'es'
            }
        );
    });
}

//==============================
// Package Web Lib
//==============================
function prepareAppLibTask() {
    let releasePath = versionConfig.VERSION_RELEASE_HOST + versionConfig.VERSION_RELEASE_PATH;

    return src('../apogeeapp/impl/webAppLib/apogeeAppLib.js')
        .pipe(inject.after('const HOST_OUTPUT_ROOT = "',releasePath))
        .pipe(dest('temp'));
}

function packageAppLibTask() {
    return rollup.rollup({
        input: 'temp/apogeeAppLib.js',
        plugins: [
            {resolveId}
        ]
    }).then(bundle => {
        return Promise.all[
            bundle.write(
                 { file: "dist/apogeeAppLib.es6.js", format: 'es' }
            ),
            bundle.write(
                { name: "apogeeAppLib", file: "dist/apogeeAppLib.umd.js", format: 'umd' }
            )
        ]
    });
}

//==============================
// Package Electron
//==============================
function packageElectronTask() {
    return rollup.rollup({
        input: '../apogeeapp/impl/electronCode/app/app.js',
		external: ['fs'],
		plugins: [
			{resolveId}
		]
    }).then(bundle => {
        return bundle.write(
            { file: "dist/apogeeElectronBundle.js", format: 'cjs' }
        );
    });
}

//==============================
// Clean Output
//==============================
function cleanTask() {
    return src('dist', {read: false})
        .pipe(clean());
}
  
exports.clean = cleanDistTask;
exports.packageElectron = packageElectronTask;
exports.packageWebApp = packageWebAppTask;
exports.packageAppLib = series(prepareAppLibTask,packageAppLibTask);
exports.copyWebPage = copyWebPageTask;
exports.packageCss = packageCssTask;
exports.copyResources = copyResourcesTask;
exports.copyAceIncludes = copyAceIncludesTask;
exports.copyOtherFiles = copyOtherFilesTask;