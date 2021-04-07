import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';


//This can be used to construct a es deployable module from the npm source module
export default [
	// ES module (for bundlers) build.
	{
		input: 'ace/ace.es-gen.js',
		output: [
			//update the version so it writes to the correct spot!
			{ file: '../../apogeejs-releases/releases/ext/ace/v1.4.12/ace.es.js', format: 'es' }
		],
		plugins: [
			resolve(),
			commonjs()
		]
	}
];
