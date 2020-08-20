import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import pkg from './package.json';
const createResolveIdPlugin = require("./absoluteRefPlugin.js");
const fs = require("fs");

//for absolute references
const PATH_TO_ABSOLUTE_ROOT = ".";
let resolveId = createResolveIdPlugin(__dirname,PATH_TO_ABSOLUTE_ROOT);

//generate file names
let releaseFolder = pkg.officialRelease ? "releases" : "releases-dev"
let inputUncompiledModule = "src/" + pkg.src_module
let esFileName = releaseFolder + "/v" + pkg.version + "/" + pkg.es_module
let cjsFileName = releaseFolder + "/v" + pkg.version + "/" + pkg.npm_module

//make sure we don't overwrite an existing release
if((fs.existsSync(esFileName))||(fs.existsSync(cjsFileName))) {
    throw new Error("The release files already exists! Please verify the version number is correct.");
}

let versionHeader = "/* CSV Module version " + pkg.version + " */"

export default [

	// ES module (for bundlers) build.
	{
		input: inputUncompiledModule,
		output: [
			{
				file: esFileName,
				format: 'es',
				banner: versionHeader
			}
		],
		plugins: [
			resolve(), // so Rollup can find `chart.js`
			commonjs(), // so Rollup can convert `chart.js` to an ES module
			{resolveId}
		]
	},

	// CommonJS (for Node) build.
	{
		input: inputUncompiledModule,
		output: [
			{ 
				file: cjsFileName,
				format: 'cjs',
				banner: versionHeader,
			}
		],
		plugins: [
			resolve(), // so Rollup can find `chart.js`
			commonjs(), // so Rollup can convert `chart.js` to an ES module
			{resolveId}
		]
	}
];