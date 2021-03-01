import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';


//This can be used to construct a es deployable module from the npm source module
export default [
	// ES module (for bundlers) build.
	{
		input: 'ace/ace_1.4.3/ace.es-gen.js',
		output: [
			{ file: 'ace/ace_1.4.3/ace.es.js', format: 'es' }
		],
		plugins: [
			resolve(),
			commonjs()
		]
	}
];
