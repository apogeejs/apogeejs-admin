import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import pkg from './package.json';

//test for absolute references-----------------------
let baseDir;
const BUNDLE_PATH = "\\applications\\test-electron\\bundle";
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
console.log(__dirname);
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
	// browser-friendly UMD build
	// {
	// 	input: 'src/app.js',
	// 	output: {
	// 		name: 'howLongUntilLunch',
	// 		file: pkg.browser,
	// 		format: 'umd'
	// 	},
	// 	plugins: [
	// 		resolve(), // so Rollup can find `ms`
	// 		commonjs(), // so Rollup can convert `ms` to an ES module
	// 		{resolveId}
	// 	]
	// },

	// ES module (for bundlers) build.
	// {
	// 	input: 'src/app.js',
	// 	output: [
	// 		{ file: pkg.module, format: 'es' }
	// 	],
	// 	plugins: [
	// 		resolve(), // so Rollup can find `ms`
	// 		commonjs(), // so Rollup can convert `ms` to an ES module
	// 		{resolveId}
	// 	]
	// },

	// CommonJS (for Node) build.
	{
		input: 'src/app.js',
		external: ['fs'],
		output: [
			{ file: pkg.main, format: 'cjs' }
		],
		plugins: [
			{resolveId}
		]
	}
];
