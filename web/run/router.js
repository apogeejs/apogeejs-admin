var parser = require('url');
var {processFileRequest} = require("./filehandler");
var {mapPath} = require("./pathmapper");

module.exports.route = function(request,response) {
    var url = parser.parse(request.url,true);
    var inPath = url.pathname.toString();

    console.log(inPath);

    var outPath = mapPath(inPath);

    processFileRequest(outPath,response);
}
