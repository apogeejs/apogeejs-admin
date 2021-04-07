import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';


//This can be used to construct a es deployable module from the npm source module
export default [
	// ES module (for bundlers) build.
	{
		input: 'esprima/esprima.es-gen.js',
		output: [
			//update the version so it writes to the correct spot!
			{ file: '../../apogeejs-releases/releases/ext/esprima/v4.0.1/esprima.es.js', format: 'es' }
		],
		plugins: [
			resolve(), 
			commonjs() 
		]
	}
];
