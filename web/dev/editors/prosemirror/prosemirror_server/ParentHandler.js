const { Handler } = require('./Handler');

/** This is a http handler that serves as a container for one or more child handlers.
 * The child handlers are at a path beneath the parent handler as defined by
 * a "folder name" passed in when the child is added. 
 * 
 * NOTE - this parent and any child handlers have the handler interface
 * method process(path,queryString,request,response)
 * 
 * On instantiation, the handler status is "ready". This can be updated if it
 * is desired to wait for the child handlers to load
 * */
class ParentHandler extends Handler {
    
    /** Constuctor. */
    constructor() {
        super();
        
        //settings
        this.childHandlers = {};
        this.setStatus(Handler.STATUS_READY);
    }
    
    /** This adds a handler to this parent handler. The path to reach the child
     * is the path to the parent plus the given folder name. */
    addChildHandler(folderName,handler) {
        this.childHandlers[folderName] = handler;
    }
     
    /** This method handles a request. The path passed in should be the path 
     * suffix after the portion of the path which reaches this parent. 
     * For example, all requests to the server starting with "/a/b/" are routed
     * to this parent handler, then a url "https://host.com/a/b/c/d/e.html" would be 
     * passed in as "c/d/e.html"
     * Further, this request would be passed to the child handler registered with 
     * the folder name "c" with the path passed on to it as "d/e.html". 
     */
    process(path,queryString,request,response) { 
        
        //make sure we are ready
        if(this.isHandlerNotReady(response)) return;

        var folderNameLength = path.indexOf("/");
        if(folderNameLength > 0) {
            var folderName = path.substring(0,folderNameLength);
            
            var handler = this.childHandlers[folderName];

            if(handler) {
                var childPath = path.substring(folderNameLength+1);
                handler.process(childPath,queryString,request,response);
                return;
            }
        }
        
        //if we get here, we couldn't honor the request
        this.sendError(404,"Endpoint Resource not found: " + path,response);
        return;
       
    }
    
}

module.exports.ParentHandler = ParentHandler;

