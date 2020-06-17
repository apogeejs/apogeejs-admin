import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';


//This can be used to construct a es deployable module from the npm source module
export default [
	// ES module (for bundlers) build.
	{
		input: 'extLib/crelt.es-gen.js',
		output: [
			{ file: 'dist/crelt.es.js', format: 'es' }
		],
		plugins: [
			resolve(), // so Rollup can find `chart.js`
			commonjs() // so Rollup can convert `chart.js` to an ES module
		]
	},
	{
		input: 'extLib/orderedmap.es-gen.js',
		output: [
			{ file: 'dist/orderedmap.es.js', format: 'es' }
		],
		plugins: [
			resolve(), // so Rollup can find `chart.js`
			commonjs() // so Rollup can convert `chart.js` to an ES module
		]
	},
	{
		input: 'extLib/rope-sequence.es-gen.js',
		output: [
			{ file: 'dist/rope-sequence.es.js', format: 'es' }
		],
		plugins: [
			resolve(), // so Rollup can find `chart.js`
			commonjs() // so Rollup can convert `chart.js` to an ES module
		]
	},
	{
		input: 'extLib/w3c-keyname.es-gen.js',
		output: [
			{ file: 'dist/w3c-keyname.es.js', format: 'es' }
		],
		plugins: [
			resolve(), // so Rollup can find `chart.js`
			commonjs() // so Rollup can convert `chart.js` to an ES module
		]
	},
];
