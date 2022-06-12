import {nodeResolve} from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import pluginJson from "@rollup/plugin-json";


//This can be used to construct a es deployable module from the npm source module
export default [
	// ES module (for bundlers) build.
	{
		input: 'babel/babel.es-gen.js',
		output: [
			//update the version so it writes to the correct spot!
			{ file: '../../apogeejs-releases/releases/ext/babel/v7.8.3/babel.es.js', format: 'es' }
		],
		plugins: [
			nodeResolve(),
			commonjs(),
            pluginJson()
		]
	}
];