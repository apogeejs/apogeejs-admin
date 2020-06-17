const path = require('path');

const PROSE_MIRROR_REQUEST_START = "/prosemirror/";
const HARDCODE_PATH_MAP = {
    "prosemirror-model": "/prosemirror/lib/prosemirror-model/src/index.js"
}

function mapPath(inPath) {
    //Remap any file in theprose miror directory
    if(inPath.startsWith(PROSE_MIRROR_REQUEST_START)) {
        let hardcodeRemap = getHardcodeRemap(inPath);
        if(hardcodeRemap) {
            return hardCodeRemap;
        }
        else if(path.extname(inPath) == "") {
            return inPath + ".js";
        }
    }

    //if we get here there was no remap
    return inPath;
}

function getHardcodeRemap(inPath) {
    let baseName = path.basename(inPath);
    return HARDCODE_PATH_MAP[baseName];
}

module.exports.mapPath = mapPath;