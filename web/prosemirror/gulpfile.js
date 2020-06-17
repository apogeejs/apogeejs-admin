const { src, dest } = require('gulp');
const concat = require('gulp-concat');

//=================================
// Package CSS
//=================================

const CSS_FILES = [
    "repos/prosemirror-view/style/prosemirror.css",
    "repos/prosemirror-menu/style/menu.css",
    "repos/prosemirror-gapcursor/style/gapcursor.css",
    "repos/prosemirror-example-setup/style/style.css",
    "otherInputCss/extra.css"
]

const CSS_BUNDLE_FILENAME = "editor.css";
const CSS_FOLDER = "compiledCss"

function packageCssTask() {
    return src(CSS_FILES)
        .pipe(concat(CSS_BUNDLE_FILENAME))
        .pipe(dest(CSS_FOLDER))
}


//============================
// Exports
//============================

//This task executes the complete release
exports.release = packageCssTask;
