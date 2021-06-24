import {nodeResolve} from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';


//This can be used to construct a es deployable module from the npm source module
export default [
	// ES module (for bundlers) build.
	{
		input: 'lodash/lodash.es-gen.js',
		output: [
			//update the version so it writes to the correct spot!
			{ file: '../../apogeejs-releases/releases/ext/lodash/v4.17.21/lodash.es.js', format: 'es' }
		],
		plugins: [
			nodeResolve(),
			commonjs()
		]
	}
];
