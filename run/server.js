const express = require('express');
const app = express();
const serverConfig = require('./serverConfig.json');
const port = 8888;

if(serverConfig.pathMapping) {
    for(let pathStart in serverConfig.pathMapping) {
        let aliasPathStart = serverConfig.pathMapping[pathStart];
        app.use(pathStart,express.static("../.." + aliasPathStart))
    }
}

app.use("/",express.static("../.."));

app.listen(port, () => console.log(`Example app listening on port ${port}!`));