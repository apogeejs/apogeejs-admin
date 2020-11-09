import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import pkg from './package.json';

//prevent someone from accidentally changing the library
throw new Error("This is temporaril diabled to prevent accidental use!");

let inputLibModule = "src/" + pkg.uncompiled_lib;
let outputLibModule = "src/" + pkg.compiled_lib;


//This rollup config is used to conver an NPM module into an ES module
//FIELDS:
// input: the input es module, which loads from NPM through rollup
//output: the name should be given in the packge.js file.
export default [
	// ES module (for bundlers) build.
	{
		input: inputLibModule,
		output: [
			{ file: outputLibModule, format: 'es' }
		],
		// external: [
		// 	"__globals__"
		// ],
		plugins: [
			resolve(), // so Rollup can find `chart.js`
			commonjs() // so Rollup can convert `chart.js` to an ES module
		]
	},
];
