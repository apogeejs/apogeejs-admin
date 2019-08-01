var fs = require('fs');
const { Handler } = require('./Handler');

const MIME_TYPES = {
    "js": "text/javascript",
    "txt": "text/plain",
    "html": "text/html",
    "css": "text/css",
    "json": "application/json"
}

const DEAFULT_MIME_TYPE = "text/plain";


/** This is a handler that server static files. */
class FileHandler extends Handler {
    
    /** The file root is the location of the folder that contains the
     * static files. */
    constructor(fileRoot) {
        super();
        
        this.fileRoot = fileRoot;
        this.setStatus(Handler.STATUS_READY);
    }
    
    /** This method handles requests. The pathname given here is the excluding 
     * any parent directories. */
    process(path,queryString,request,response) {
        var filePath = this.fileRoot + path;

        var onData = (err,data) => {
            if(err) {
                console.log(err.msg);
                response.writeHead(500, {"Content-Type":"text/plain"});
                response.write("Error!");
            }
            else {
                var mimeType = this.getMimeType(path);
                if(mimeType) {
                    response.writeHead(200, {"Content-Type":mimeType});
                }
                response.write(data);
            }
            response.end();
        }

        fs.readFile(filePath,onData);      

    }    

    getMimeType(path) {
        var suffixDotIndex = path.lastIndexOf(".");
        if(suffixDotIndex >= 0) {
            var suffix = path.substring(suffixDotIndex+1);
            var mimeType = MIME_TYPES[suffix];
            if(mimeType) return mimeType;
        }
        
        //if we don't find a mime type, return the default
        return DEFAULT_MIME_TYPE;

    }
}

module.exports.createInstance = function(fileRoot) {
    return new FileHandler(fileRoot);
}

