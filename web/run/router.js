var parser = require('url');
var {processFileRequest} = require("./filehandler");
var {mapPath} = require("./pathmapper");

var _doRemap_ = false;

//If this is called with the arg "true", path remapping will be done.
//be default path remapping is not done.
module.exports.setRemap = function(doRemap) {
    _doRemap_ = doRemap;
}

module.exports.route = function(request,response) {
    var url = parser.parse(request.url,true);
    var inPath = url.pathname.toString();

    //this is if we want to remap path names
    var outPath;
    if(_doRemap_) {
        outPath = mapPath(inPath);
    }
    else {
        outPath = inPath;
    }

    processFileRequest(outPath,response);
}
