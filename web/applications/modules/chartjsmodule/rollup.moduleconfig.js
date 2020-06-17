import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import pkg from './package.json';
const createResolveIdPlugin = require("./absoluteRefPlugin.js");

//for absolute references
const BUNDLE_PATH = "";
let resolveId = createResolveIdPlugin(__dirname,BUNDLE_PATH);

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