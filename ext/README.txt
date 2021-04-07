This directory has scripts to create ES modules for the needed external libraries.

There are TWO steps before running the commands:

1) Update to the desired version of the lib in the package.json file and run npm install.
2) Update the target directory in the rollup file for the that library, so the output goes 
to a folder with the proper version.

(I should clean this up so this manual work is not needed.)

the libraries can be created in es module format with the following commands 

1) ace: npm run-script buildace
2) esprima: npm run-script buildesprima
3) handsontable: npm run-script buildhandsontable

NOTE - In package.json, "@babel/polyfill" is needed for the current version of handsontable.

Some additional style related files are also needed, and must be downloaded separately

1) ace_includes directory in the ace directory. (These should be from a no-conflict build!) Ones I had added:

version 1.4.3
--------------
mode-css.js
mode-html.js
mode-javascript.js
mode-json.js
theme-eclipse.js
worker-css.js
worker-html.js
worker-javascript.js
worker-json.js

version 1.4.12
--------------
(i added a bunch more)

2) handsontable.full.min.css
