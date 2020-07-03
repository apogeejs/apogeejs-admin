var http = require("http");
var router = require('./router');

const PORT = 8888;

//NOTE - delay is just so the debugger can start before I do any work
function init() {

    if(process.argv.length > 2) {
        if(process.argv[2] == "remap") {
            router.setRemap(true);
        }
        else {
            console.log("Invalid argument! Valid argument values: [none] and 'remap'. Found: ") + process.argv.toString();
            return;
        }
    }

    //--------------------------------
    // start server
    //--------------------------------
    
    //create listener
    http.createServer(router.route).listen(PORT);
}

setTimeout(init,1000);