var parser = require('url');
var {processFileRequest} = require("./filehandler");
//var {mapPath} = require("./pathmapper");

module.exports.route = function(request,response) {
    var url = parser.parse(request.url,true);
    var inPath = url.pathname.toString();

    //this is if we want to remap path names
    //var outPath = mapPath(inPath);
    var outPath = inPath;

    processFileRequest(outPath,response);
}
