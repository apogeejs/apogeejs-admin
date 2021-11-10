import {nodeResolve} from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import jsonPlugin from '@rollup/plugin-json';


//This can be used to construct a es deployable module from the npm source module
export default [
	// ES module (for bundlers) build.
	{
		input: 'src/jsxTransform.es-gen.js',
		output: [
			//update the version so it writes to the correct spot!
			{
				file: './releases/v0.0.0-p.0/jsxTransform.es.js',
				format: 'es'
			}
		],
		plugins: [
			nodeResolve(),
			commonjs(),
			jsonPlugin()
		]
	}
];


// return rollup.rollup({
// 	input: alteredSourceFile,
// 	external: externalLibs,
// 	plugins: [
// 		{resolveId}
// 	]
// }).then(bundle => {
// 	return bundle.write(
// 		{ 
// 			file: alteredDestFile,
// 			format: format,
// 			banner: banner,
// 			paths: externalLibMapping,
// 		}
// 	)
// });