(function() {

/** This is a simple custom resource component example. */
haxapp.app.SimpleGeojsonControl = function(workspaceUI,control,generator,componentJson) {
    haxapp.app.BasicControlComponent.call(this,workspaceUI,control,generator,componentJson);
};

haxapp.app.SimpleGeojsonControl.prototype = Object.create(haxapp.app.BasicControlComponent.prototype);
haxapp.app.SimpleGeojsonControl.prototype.constructor = haxapp.app.SimpleGeojsonControl;

var DEFAULT_LAT_LNG = [0,0];
var DEFAULT_ZOOM = 1;

/** Implement the method to get the data display. JsDataDisplay is an 
 * easily configurable data display. */
haxapp.app.SimpleGeojsonControl.prototype.getDataDisplay = function(viewMode) {
    return new haxapp.app.SimpleGeojsonDisplay(viewMode);
}

/** TO use JsDataDisplay, implement a class with the following methods, all optional:
 * init(outputElement,outputMode);
 * setData(data,outputElement,outputMode);
 * requestHide(outputElement,outputMode);
 * onHide(outputElement,outputMode);
 * destroy(outputElement,outputMode);
 */
haxapp.app.SimpleGeojsonDisplay = function(viewMode) {
    //extend edit component
    haxapp.app.JsDataDisplay.call(this,viewMode);
    
    //dummy initial view
    this.previousSetView = null;
    
    //resize the editor on window size change
    var instance = this;
    var onLoadCallback = function() {
        instance.loadMap();
    }
    var resizeCallback = function() {
        if(instance.map) {
            instance.map.invalidateSize();
        }
    }
    haxapp.ui.setResizeListener(this.getElement(), resizeCallback, onLoadCallback);
}

haxapp.app.SimpleGeojsonDisplay.prototype = Object.create(haxapp.app.JsDataDisplay.prototype);
haxapp.app.SimpleGeojsonDisplay.prototype.constructor = haxapp.app.SimpleGeojsonDisplay;

haxapp.app.SimpleGeojsonDisplay.prototype.loadMap = function() {
    if(this.map) {
        //already initialized
        return;
    }
    
    //create map
    var outputElement = this.getElement();
    this.map = L.map(outputElement);
    
    //add tiles
    L.tileLayer('https://a.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>',
        maxZoom: 18
    }).addTo(this.map);
    
    this.map.setView(DEFAULT_LAT_LNG,DEFAULT_ZOOM);
    
    //if needed, reset the data
    var outputMode = this.getOutputMode();
    if(this.outputMode) {
        this.outputMode.showData();
    }
}

haxapp.app.SimpleGeojsonDisplay.prototype.showData = function(data) {
    if(this.map) { 
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

//-----------------
//create a component generator
//-----------------
haxapp.app.SimpleGeojsonControl.generator = haxapp.app.BasicControlComponent.createGenerator(
        "SimpleGeojsonControl",
        "haxapp.app.SimpleGeojsonControl",
        haxapp.app.SimpleGeojsonControl);

//-----------------
//auto registration
//-----------------
if(registerComponent) {
    registerComponent(haxapp.app.SimpleGeojsonControl.generator);
}

}
)();
