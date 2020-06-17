const PROSE_MIRROR_DIST_FOLDER = "/prosemirror/dist/";
const PROSE_MIRROR_DEV_IMPORTS_FOLDER = "/prosemirror/devimports/";

//This code remaps urls. For now it is not read from a config file. You have to code in
//tghe remapping you want.

function mapPath(inPath) {
    //pull prose mirror modules from the dev imports directory
    //these use the source rather than the compiled libraries
    if(inPath.startsWith(PROSE_MIRROR_DIST_FOLDER)) {
        return PROSE_MIRROR_DEV_IMPORTS_FOLDER + inPath.substring(PROSE_MIRROR_DIST_FOLDER.length);
    }

    //if we get here there was no remap
    return inPath;
}

module.exports.mapPath = mapPath;