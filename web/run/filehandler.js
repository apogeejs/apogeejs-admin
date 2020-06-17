
var fs = require('fs');

const MIME_TYPES = {
    "js": "text/javascript",
    "mjs": "text/javascript",
    "txt": "text/plain",
    "html": "text/html",
    "htm": "text/html",
    "css": "text/css",
    "json": "application/json",
    "png": "image/png",
    "jpg": "image/jpeg",
    "jpeg": "image/jpeg",
    "gif": "image/gif",
    "bin": "application/octet-stream"
}

const DEFAULT_MIME_TYPE = "text/plain";
        
/** This method handles requests. The pathname given here is the excluding 
 * any parent directories. */
function processFileRequest(path,response) {
    //string the leading slash from the path
    var filePath = path.substring(1);

    var onData = (err,data) => {
        if(err) {
            console.log(err.msg);
            response.writeHead(500, {"Content-Type":"text/plain"});
            response.write("Error!");
        }
        else {
            var mimeType = getMimeType(path);
            if(mimeType) {
                response.writeHead(200, {"Content-Type":mimeType});
            }
            response.write(data);
        }
        response.end();
    }

    fs.readFile(filePath,onData);      

}    

function getMimeType(path) {
    var suffixDotIndex = path.lastIndexOf(".");
    if(suffixDotIndex >= 0) {
        var suffix = path.substring(suffixDotIndex+1);
        var mimeType = MIME_TYPES[suffix];
        if(mimeType) return mimeType;
        else console.log("Mime type not found: " + suffix);
    }
    else {
        console.log("NO SUFFIX!");
    }

    //if we don't find a mime type, return the default
    return DEFAULT_MIME_TYPE;

}

module.exports.processFileRequest = processFileRequest;