/** The module can optionally return a value. If it does, two methods are 
 * used from the module if they are present "initApogeeModule" and 
 * "removeApogeeModule".
 */
var moduleReturn = {}

//This code will be used for loading a css file
var _cssUrl = "https://unpkg.com/leaflet@1.0.1/dist/leaflet.css";
var _linkCallerId;

/**
 * This method is called once the module has been loaded. It passes the
 * apogee and apogeeapp variables. Any work requiring the apogee variables
 * should be done here.
 */
moduleReturn.initApogeeModule = function(apogee,apogeeapp) {

    alert("FIX! - need to load link getLinkLoader");

    //load a css file
    _linkCallerId = apogeeapp.app.getLinkLoader().createLinkCallerId();
    apogeeapp.app.getLinkLoader().addLinkElement("css",_cssUrl,_linkCallerId);

    console.log("Module loaded!");
}

moduleReturn.removeApogeeModule = function(apogee,apogeeapp) {
    apogeeapp.app.getLinkLoader().removeLinkElement("css",_cssUrl,_linkCallerId);

    console.log("Module removed!");
}

module.exports = moduleReturn;

