//for absolute references-----------------------
let baseDir;
const BUNDLE_PATH = "\\bundle";
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

export default [

	// ES module build for Web App
	{
		input: '../apogeeapp/impl/cutNPasteCode/app/app.js',
		output: [
			{ file: "../dist/apogeeWebBundle.js", format: 'es' }
		],
		plugins: [
			{resolveId}
		]
	},

	// ES module build for Web App Lib
	{
		input: '../apogeeapp/impl/webAppCode/apogeeAppLib.js',
		output: [
			{ file: "../dist/apogeeAppLib.es6.js", format: 'es' },
			{ name: "apogeeAppLib", file: "../dist/apogeeAppLib.umd.js", format: 'umd' },
		],
		plugins: [
			{resolveId}
		]
	},

	// CommonJS build for Electron App
	{
		input: '../apogeeapp/impl/electronCode/app/app.js',
		external: ['fs'],
		output: [
			{ file: "../dist/apogeeElectronBundle.js", format: 'cjs' }
		],
		plugins: [
			{resolveId}
		]
	}
];
