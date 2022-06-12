import {nodeResolve} from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';


//This can be used to construct a es deployable module from the npm source module
export default [
	// ES module (for bundlers) build.
	{
		input: 'react/react.es-gen.js',
		output: [
			//update the version so it writes to the correct spot!
			{ file: '../../apogeejs-releases/releases/ext/react/v16.12.0/react.es.js', format: 'es' }
		],
		plugins: [
			nodeResolve(),
			commonjs()
		]
	},
    {
		input: 'react/reactdom.es-gen.js',
		output: [
			//update the version so it writes to the correct spot!
			{ file: '../../apogeejs-releases/releases/ext/react/v16.12.0/reactdom.es.js', format: 'es' }
		],
		plugins: [
			nodeResolve(),
			commonjs()
		]
	}
];