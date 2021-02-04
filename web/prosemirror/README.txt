Prosemirror Lib
------------

Inside the prosemirror lib directory, the following prosemirror repositories should be placed:

prosemirror-commands
prosemirror-dropcursor
prosemirror-example-setup
prosemirror-gapcursor
prosemirror-history
prosemirror-inputrules
prosemirror-keymap
prosemirror-menu
prosemirror-model
prosemirror-schema-basic
prosemirror-schema-list
prosemirror-state
prosemirror-transform
prosemirror-view

This is used a forked version of the prose mirror repositories in the account sutter-dave.

In addition to any code changes, there are changes to the import statements to make them compatible with
standard es module notation. The main repositories use notation for bundlers.

IMPORT STATEMENT CHANGES:

1) For external links in the repositories, it uses notation that
is used by the bundler, for example: import {Node} from "prosemirror-model".

For es modules, we need to have a proper URL. We have updated these to use the proper URL pointing at the library in the 
dist directory, both for the proermirror libs and the external libs.

2) For internal links in the repositories, it uses the notation: import {xxx} from "./module", leaving off the 
file extension. IN these cases we added the ".js" extension in the import statement.

To fix this is the build environment, imported modules with not extension automatically have ".js" appended.

ADDITIONAL WORK IN BUILDING THIS DIRECTORY STRUTURE

1) external links were packaged from npm and placed in the dist directory. This is done by running the command:

npm run-script buildextlib

The package.json file was given the proper dependencies and the rollup.libconfig.js and associated files were constructed
to produce the modules in es module format.

2) Also in the dist directory, for each prosemirror lib, a es module was placed that re-exports the module from the
associated repo. This is to give it a better name.


NOTE - on all repos, my first change was June 17, 2020. I don't have any of their changes after this date. (Note, I didn't check
that I have all their changes up to that date. The cutoff may be a few days earlier.)
