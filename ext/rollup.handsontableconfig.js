import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';


//This can be used to construct a es deployable module from the npm source module
export default [
	// ES module (for bundlers) build.
	{
		input: 'handsontable/handsontable.es-gen.js',
		output: [
			//update the version so it writes to the correct spot!
			{ file: '../../apogeejs-releases/releases/ext/handsontable/v6.2.2/handsontable.es.js', format: 'es' }
		],
		plugins: [
			resolve(),
			commonjs()
		]
	}
];
