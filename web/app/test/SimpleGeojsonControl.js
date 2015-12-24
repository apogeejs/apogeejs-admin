/** This is a simple chart control using the libary Chart.js. The Chart.js libarry
 * must be loaded separately for this control. */

(function() {

//=================================
// Simple Chart Reousrce Processor
//=================================

/** Constructor */
SimpleGeojsonResourceProcessor = function() {
	this.controlFrame = null;
}

//required links for leaflet
//http://cdn.leafletjs.com/leaflet/v0.7.7/leaflet.js
//http://cdn.leafletjs.com/leaflet/v0.7.7/leaflet.css

/** setFrame - required method for resource processor used in Basic Resource Control. */
SimpleGeojsonResourceProcessor.prototype.setFrame = function(controlFrame) {
    this.controlFrame = controlFrame;
    this.mapDiv = document.createElement("div");
    this.mapDiv.style.height = "100%";
    this.mapDiv.style.width = "100%"; 
    var contentElement = this.controlFrame.getWindow().getContent();
    contentElement.appendChild(this.mapDiv);
    
    //map init note - we can not init the map until the dom is ready.
    //Isn't ready yet. Maybe we need some sort of event that it is?
    //or maybe just init when the user calls it.
    
    //resize note - this resizes the map
    //map.invalidateSize(); 
}

var counter = 0;
function createId() {
    return "map_div_" + counter++;
}

/** updateToJson - required method for resource processor used in Basic Resource Control. 
 * no data to serialize here. */
SimpleGeojsonResourceProcessor.prototype.updateToJson = function() {}

/** updateToJson - required method for resource processor used in Basic Resource Control. 
 * no data to deserialize here. */
SimpleGeojsonResourceProcessor.prototype.updateFromJson = function(json) {}

/** This is the method users will call to initialize the chart. */
SimpleGeojsonResourceProcessor.prototype.setData = function(data,options) {
    if(!options) options = {};
    
    if(!this.map) {
        this.map = L.map(this.mapDiv);

        this.map.setView([41.3565797,2.1343725], 16);

        //microsoft osm
        L.tileLayer('http://otile1.mqcdn.com/tiles/1.0.0/map/{z}/{x}/{y}.jpg', {
            attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>',
            maxZoom: 18
        }).addTo(this.map);
    }
}


//=================================
// Simple Chart Control
//=================================

/** This is the control for the chart. It inherits from the component
 * BasicResourceControl to represent a resource object. */
SimpleGeojsonControl = function(resource) {
    //base init
    visicomp.app.visiui.Control.init.call(this,resource,"Simple GeoJSON Control");
    visicomp.app.visiui.BasicResourceControl.init.call(this);
};

//add components to this class
visicomp.core.util.mixin(SimpleGeojsonControl,visicomp.app.visiui.Control);
visicomp.core.util.mixin(SimpleGeojsonControl,visicomp.app.visiui.BasicResourceControl);

//======================================
// Static methods
//======================================

/** This method creates the control. */
SimpleGeojsonControl.createControl = function(workspaceUI,parent,name) {
	//create a resource a simple chart resource processor
	var resourceProcessor = new SimpleGeojsonResourceProcessor();
    var returnValue = visicomp.core.createresource.createResource(parent,name,resourceProcessor);
    if(returnValue.success) {
        var resource = returnValue.resource;
        var simpleGeojsonControl = new SimpleGeojsonControl(resource);
        workspaceUI.addControl(simpleGeojsonControl);
        returnValue.control = simpleGeojsonControl;
    }
    else {
        //no action for now
    }
    return returnValue;
}

//======================================
// This is the control generator, to register the control
//======================================

SimpleGeojsonControl.generator = {};
SimpleGeojsonControl.generator.displayName = "Simple GeoJSON Control";
SimpleGeojsonControl.generator.uniqueName = "visicomp.example.SimpleGeojsonControl";
SimpleGeojsonControl.generator.createControl = SimpleGeojsonControl.createControl;


//auto registration
if(registerControl) {
    registerControl(SimpleGeojsonControl.generator);
}

}
)();