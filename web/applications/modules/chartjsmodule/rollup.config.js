import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import pkg from './package.json';

//test for absolute references-----------------------
let basedir = '/Dave/dev/github/hax_code/master/ApogeeJS/web';
const path = require('path');
function resolveId(importee, importer) {
console.log(__dirname);
//this is to handle the initial file for the cjs case
if(!importer) return null;

  if (isAbsolute(importee)) {
	const root = path.parse(importee).root;
    return ensureExt(path.resolve(basedir, path.relative(root, importee)));
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

	// ES module (for bundlers) build.
	{
		input: 'src/chartjscomponentmodule.js',
		output: [
			{ file: pkg.es_module, format: 'es' }
		],
		plugins: [
			resolve(), // so Rollup can find `chart.js`
			commonjs(), // so Rollup can convert `chart.js` to an ES module
			{resolveId}
		]
	},

	// CommonJS (for Node) build.
	{
		input: 'src/chartjscomponentmodule.js',
		//external: ['chart.js'],
		output: [
			{ file: pkg.npm_module, format: 'cjs' }
		],
		plugins: [
			resolve(), // so Rollup can find `chart.js`
			commonjs(), // so Rollup can convert `chart.js` to an ES module
			{resolveId}
		]
	}
];

// This can be used to construct a es deployable module from the npm source module
// export default [
// 	// ES module (for bundlers) build.
// 	{
// 		input: 'src/Chart.es.js',
// 		output: [
// 			{ file: pkg.chart_lib, format: 'es' }
// 		],
// 		plugins: [
// 			resolve(), // so Rollup can find `chart.js`
// 			commonjs(), // so Rollup can convert `chart.js` to an ES module
// 			{resolveId}
// 		]
// 	},
// ];
