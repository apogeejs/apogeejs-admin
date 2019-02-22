/** 
 * SimpleGeojsonControl
 * This module creates a GeoJSON control in apogee. It loads the leaflet library and then 
 * creates a Apogee Control and self installs in the Apogee application.
 * It also downloads a leaflet CSS file.
 */


var L = require('leaflet');

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

    //c
    _linkCallerId = apogeeapp.app.getLinkLoader().createLinkCallerId();
    apogeeapp.app.getLinkLoader().addLinkElement("css",_cssUrl,_linkCallerId);

    /** This is a simple custom resource component example. */
    apogeeapp.app.SimpleGeojsonControl = class extends apogeeapp.app.BasicControlComponent {
        constructor(workspaceUI,control) {
            super(workspaceUI,control,apogeeapp.app.SimpleGeojsonControl);
        }

        getOutputDisplay(viewMode) {
            return new apogeeapp.app.SimpleGeojsonDisplay(viewMode,this.getMember());
        }
    };

    //attach the standard static values to the static object (this can also be done manually)
    apogeeapp.app.BasicControlComponent.attachStandardStaticProperties(apogeeapp.app.SimpleGeojsonControl,
            "SimpleGeojsonControl",
            "apogeeapp.app.SimpleGeojsonControl");

    //-----------------
    //auto registration
    //-----------------
    var app = apogeeapp.app.Apogee.getInstance();
    if(app) {
        app.registerComponent(apogeeapp.app.SimpleGeojsonControl);
    }
    else {
        console.log("Component could not be registered because no Apogee app instance was available at component load time: apogeeapp.app.SimpleGeojsonControl");
    }

    var DEFAULT_LAT_LNG = [0,0];
    var DEFAULT_ZOOM = 1;

    /** Extend ths JsDataDisplay */
    apogeeapp.app.SimpleGeojsonDisplay = class extends apogeeapp.app.DataDisplay {

        //==============================
        // Public
        //==============================
        constructor(viewMode,member) {

            var callbacks = {
                getData: () => this.member.getData()
            }

            super(viewMode,callbacks)

            //create map element - this css class will fill the parent (the window frame) with no scrolling 
            this.mapElement = apogeeapp.ui.createElement("div");
            this.mapElement.className = "visiui_win_container_fixed";

            this.member = member;
            this.previousSetView = null;

            this.map = null;
            this.geoJsonLayer = null;
        }

        //This gets the content for the display
        getContent() {
            return this.mapElement;
        }

        //this method tells the window the type of content:
        //apogeeapp.ui.RESIZABLE - if the window can freely resize it
        //apogeeapp.ui.FIXED_SIZE - if the content is fixed size
        getContentType() {
            return apogeeapp.ui.RESIZABLE;
        }

        setData(data) {
            this.cachedData = data;
            if(this.map) {
                this._createDataLayer();
            }
        }

        onLoad() {
            if(!this.map) {
                this._loadMap();
                //this will add data if it has already been cached
                this._createDataLayer();
            }
            else {
                this.map.invalidateSize();
            }
        }

        onResize() {
            if(this.map) {
                this.map.invalidateSize();
            }
        }

        //==============================
        // Private
        //==============================

         _loadMap() {
            if(this.map) {
                //already initialized
                return;
            }

            this.map = L.map(this.mapElement);

            //add tiles
            L.tileLayer('https://a.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>',
                maxZoom: 18
            }).addTo(this.map);

            this.map.setView(DEFAULT_LAT_LNG,DEFAULT_ZOOM);
        }

        _createDataLayer() {
            if(!this.cachedData) return;    
            var data = this.cachedData;
            this.cachedData = null;

            var features = data.features;
            var theme = data.theme;
            var initialView = data.initialView;

            if((features)&&(theme)) {

                //set the initial view if it changes
                if((initialView)&&(initialView !== this.previousSetView)) {
                    try {
                        var latLng = data.initialView.latLng;
                        var zoom = data.initialView.zoom;
                        this.map.setView(latLng,zoom);
                        this.previousSetView = initialView;
                    }
                    catch(error) {
                        alert("Improper initial view format.");
                    }

                }

                if(this.geoJsonLayer) {
                    this.geoJsonLayer.remove();
                    this.geoJsonLayer = null;
                }
                this.geoJsonLayer = L.geoJSON(features,theme).addTo(this.map);
            }       
        }    
    }
}

moduleReturn.removeApogeeModule = function(apogee,apogeeapp) {
    apogeeapp.app.getLinkLoader().removeLinkElement("css",_cssUrl,_linkCallerId);
}

module.exports = moduleReturn;

