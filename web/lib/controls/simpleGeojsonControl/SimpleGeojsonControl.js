(function() {

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
apogeeapp.app.SimpleGeojsonDisplay = class extends apogeeapp.app.NonEditorDataDisplay {
    constructor(viewMode,member) {
        super(viewMode)
    
        this.member = member;
        this.previousSetView = null;
    }

    loadMap() {
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
    }

    showData() {
        this.cachedData = this.member.getData();
        if(this.map) {
            this.createDataLayer();
        }
    }

    createDataLayer() {
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


    onLoad() {
        if(!this.map) {
            this.loadMap();
            //this will add data if it has already been cached
            this.createDataLayer();
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
}
//end definition
})();
