(function() {

/** This is a simple custom resource component example. */
apogeeapp.app.SimpleGeojsonControl = function(workspaceUI,control,generator,componentJson) {
    apogeeapp.app.BasicControlComponent.call(this,workspaceUI,control,generator,componentJson);
};

apogeeapp.app.SimpleGeojsonControl.prototype = Object.create(apogeeapp.app.BasicControlComponent.prototype);
apogeeapp.app.SimpleGeojsonControl.prototype.constructor = apogeeapp.app.SimpleGeojsonControl;

var DEFAULT_LAT_LNG = [0,0];
var DEFAULT_ZOOM = 1;

/** Implement the method to get the data display. JsDataDisplay is an 
 * easily configurable data display. */
apogeeapp.app.SimpleGeojsonControl.prototype.getDataDisplay = function(viewMode) {
    return new apogeeapp.app.SimpleGeojsonDisplay(viewMode);
}

/** TO use JsDataDisplay, implement a class with the following methods, all optional:
 * init(outputElement,outputMode);
 * setData(data,outputElement,outputMode);
 * requestHide(outputElement,outputMode);
 * onHide(outputElement,outputMode);
 * destroy(outputElement,outputMode);
 */
apogeeapp.app.SimpleGeojsonDisplay = function(viewMode) {
    //extend edit component
    apogeeapp.app.JsDataDisplay.call(this,viewMode);
    
    //dummy initial view
    this.previousSetView = null;
    
    //resize the editor on window size change
    var instance = this;
    this.shownCallback = function() {
        if(!instance.map) {
            instance.loadMap();
        }
        else {
            instance.map.invalidateSize();
        }
    }
    this.resizeCallback = function() {
        if(instance.map) {
            instance.map.invalidateSize();
        }
    }
    this.callbackAttached = false;
}

apogeeapp.app.SimpleGeojsonDisplay.prototype = Object.create(apogeeapp.app.JsDataDisplay.prototype);
apogeeapp.app.SimpleGeojsonDisplay.prototype.constructor = apogeeapp.app.SimpleGeojsonDisplay;

apogeeapp.app.SimpleGeojsonDisplay.prototype.loadMap = function() {
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

apogeeapp.app.SimpleGeojsonDisplay.prototype.showData = function(data) {
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
    
    if(!this.callbackAttached) {
        var viewMode = this.getOutputMode();
        var displayWindow = viewMode.getDisplayWindow();
        if(displayWindow) {
            displayWindow.addListener(apogeeapp.ui.RESIZED_EVENT,this.resizeCallback);
            displayWindow.addListener(apogeeapp.ui.SHOWN_EVENT,this.shownCallback);
            this.callbackAttached = true;
        }
    }
    
}

apogeeapp.app.SimpleGeojsonControl.prototype.hide = function() {
    var displayWindow = this.viewMode.getDisplayWindow();
    if(displayWindow) {
        displayWindow.removeListener(apogeeapp.ui.RESIZED_EVENT,this.resizeCallback);
        displayWindow.removeListener(apogeeapp.ui.RESIZED_EVENT,this.shownCallback);
        this.callbackAttached = false;
    }
}

//-----------------
//create a component generator
//-----------------
apogeeapp.app.SimpleGeojsonControl.generator = apogeeapp.app.BasicControlComponent.createGenerator(
        "SimpleGeojsonControl",
        "apogeeapp.app.SimpleGeojsonControl",
        apogeeapp.app.SimpleGeojsonControl);

//-----------------
//auto registration
//-----------------
if(registerComponent) {
    registerComponent(apogeeapp.app.SimpleGeojsonControl.generator);
}

}
)();
