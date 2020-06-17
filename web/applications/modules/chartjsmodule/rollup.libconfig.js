import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import pkg from './package.json';


//This can be used to construct a es deployable module from the npm source module
export default [
	// ES module (for bundlers) build.
	{
		input: 'src/Chart.es.js',
		output: [
			{ file: pkg.chart_lib, format: 'es' }
		],
		plugins: [
			resolve(), // so Rollup can find `chart.js`
			commonjs() // so Rollup can convert `chart.js` to an ES module
		]
	},
];
