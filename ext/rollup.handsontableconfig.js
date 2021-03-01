import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';


//This can be used to construct a es deployable module from the npm source module
export default [
	// ES module (for bundlers) build.
	{
		input: 'handsontable/handsontable_6.2.0/handsontable.es-gen.js',
		output: [
			{ file: 'handsontable/handsontable_6.2.0/handsontable.es.js', format: 'es' }
		],
		plugins: [
			resolve(),
			commonjs()
		]
	}
];
