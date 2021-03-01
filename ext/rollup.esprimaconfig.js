import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';


//This can be used to construct a es deployable module from the npm source module
export default [
	// ES module (for bundlers) build.
	{
		input: 'esprima/esprima_2.7.3/esprima.es-gen.js',
		output: [
			{ file: 'esprima/esprima_2.7.3/esprima.es.js', format: 'es' }
		],
		plugins: [
			resolve(), 
			commonjs() 
		]
	}
];
