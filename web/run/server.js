var http = require("http");
var router = require('./router');

const PORT = 8888;

//NOTE - delay is just so the debugger can start before I do any work
function init() {

    //--------------------------------
    // start server
    //--------------------------------
    
    //create listener
    http.createServer(router.route).listen(PORT);
}

setTimeout(init,2000);