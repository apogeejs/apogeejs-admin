var http = require("http");
var parser = require('url');
var { ParentHandler } = require("./ParentHandler");

//This module exposes a simple parent handler, which allows adding child handlers
//and processing requests.
var handler = new ParentHandler();

module.exports.addHandler = function(folderName,childHandler) {
    handler.addChildHandler(folderName,childHandler);
}

module.exports.route = function(request,response) {
    var url = parser.parse(request.url,true);
    //path for handle should not include leading '/'
    var path = url.pathname.substring(1);
    var queryString = url.search;

    handler.process(path,queryString,request,response);
}
