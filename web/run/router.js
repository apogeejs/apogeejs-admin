var http = require("http");
var parser = require('url');
var fileHandlerModule = require("./filehandler");

const FILE_ROOT = "";

//This module only has a single handler.
var fileHandler = fileHandlerModule.createInstance(FILE_ROOT);

module.exports.route = function(request,response) {
    var url = parser.parse(request.url,true);
    //path for handle should not include leading '/'
    var path = url.pathname.substring(1);
    var queryString = url.search;

    fileHandler.process(path,queryString,request,response);
}
