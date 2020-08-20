This is a template directory for making a apogee module. It includes a conversion to go from an (single) input npm module 
to an es module. (If more inputs are needed, the project can be adjusted.) 

Files:

(1) package.json - This will be used to install rollup. The following values must be set.

"name": "chartjs-module", //the name we will give out module
"officialRelease": true, //this is used for the release process, to decide if this goes in releases (real releaes) or releases-dev (test build)
"version": "2.0.0-p1", //this is the version for the build output
"npm_module": "chartjsmodule.cjs.js", //this is the output name for the npm module
"es_module": "chartjsmodule.esm.js", //this is the output name for the es module
"uncompiled_lib": "chartjs.esm.js", //this is our input for the library conversion, to construct an es modeul from an npm module.
"compiled_lib": "Chart.es.js, //this is our output for the library conversion, the compiled es module.
"dependencies": {
    "chart.js": "2.9.3" //this shoudl be added if we are converting from an npm module
},

(2) rollup.libconfig.js - This is used to configure rollup to convert the (or any) npm modules to es modules.
The values used here are set in the package.json file.

pkg.uncompiled_lib: "Chart.es.js", //This is our es module stub to convert from npm to es
pkg.compiled_lib: "chartjs.esm.js", //This is the output compiled es module 

(3) rollup.moduleconfig.js - This is used to configure rollup to create the compiled output modules (es and npm)
The values used here are set in the package.json file.

pkg.officialRelease - This is the flag to make an official or test release (see package.json)
pkg.version - This is the version number we are creating.
pkg.src_module: 'src/chartjscomponentmodule.js', //this is the input, uncompiled module
pkg.es_module - This is the name we will give the output es module. It is in the package.json file
pkg.npm_module - This is the name we will give the output npm module. It is in the package.json file

(4) "Chart.es.js" - This is our conversion from npm to es module. It just exports the object from the npm file. In this example there
is just one mocule. The project should be adapted if mulitple are loaded for the module.

(5) "ChartJSComponentModule.js" - This is the es file for our Apogee component. Along with it we should have any other files it references. 
In this sample project, we have the files "ChartJSComponent.js" and "ChartJSComponentView.js". There can be whatever files are needed.

=====================================================================================
to deploy:

npm run-script buildmodule - create a release of the module
npm run-script buildlib - converts "ChartJS" from npm to es module. The main purpose of this is create a es file we can use to debug the module (running without compiling)

NOTES

1) For a release of the module, two items in package.json must be updated:

- "officialRelease": false - Whether the release goes in the releases folder or the releases-dev folder.
- "version": "1.0.0-p2" - The release number

On completing release, the field "officialRelease" should be set to false, to stop us from accidentally overwriting a
saved release. (Ideally we should put in a error/warning to prevent overwriting a file.)