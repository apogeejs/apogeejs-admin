/** This is a simple chart control using the libary Chart.js. The Chart.js libarry
 * must be loaded separately for this control. */

(function() {

//=================================
// Simple Chart Reousrce Processor
//=================================

/** Constructor */
SimpleGeojsonResource = function() {

    this.contentElement = null;
    this.mapDiv = null;
    
    this.lat = 37;
    this.lon = -120;
    this.zoom = 14;
}

//required links for leaflet
//http://cdn.leafletjs.com/leaflet/v0.7.7/leaflet.js
//http://cdn.leafletjs.com/leaflet/v0.7.7/leaflet.css

/** setFrame - required method for resource processor used in Basic Resource Control. */
SimpleGeojsonResource.prototype.setContentElement = function(contentElement) {
    this.contentElement = contentElement;
    
    this.mapDiv = document.createElement("div");
    this.mapDiv.style.height = "100%";
    this.mapDiv.style.width = "100%"; 
    this.contentElement.appendChild(this.mapDiv);
    
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

/** This is the method users will call to initialize the chart. */
SimpleGeojsonResource.prototype.setData = function(lat,lon,zoom) {
    this.lat = lat;
    this.lon = lon;
    this.zoom = zoom;
}

/** This is the method users will call to initialize the chart. */
SimpleGeojsonResource.prototype.run = function() {  
    if(!this.map) {
        this.map = L.map(this.mapDiv);
        
        //microsoft osm
        L.tileLayer('http://otile1.mqcdn.com/tiles/1.0.0/map/{z}/{x}/{y}.jpg', {
            attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>',
            maxZoom: 18
        }).addTo(this.map);
    }

    this.map.setView([this.lat,this.lon], this.zoom);
}

//=================================
// Simple Chart Control
//=================================

/** This is the control for the chart. It inherits from the component
 * BasicResourceControl to represent a resource object. */
SimpleGeojsonComponent = function(workspaceUI,control,componentJson) {
    //add the resource for the control
    var resource = new SimpleGeojsonResource();
    control.updateResource(resource);
    
    //base init
    visicomp.app.visiui.Component.init.call(this,workspaceUI,control,SimpleGeojsonComponent.generator,componentJson);
    visicomp.app.visiui.BasicControlComponent.init.call(this);
};

//add components to this class
visicomp.core.util.mixin(SimpleGeojsonComponent,visicomp.app.visiui.Component);
visicomp.core.util.mixin(SimpleGeojsonComponent,visicomp.app.visiui.BasicControlComponent);

/** Store the content element for the resource. */
SimpleGeojsonComponent.prototype.addToFrame = function() {
    var control = this.getObject();
    var resource = control.getResource();
    resource.setContentElement(this.getContentElement());
}

//======================================
// Static methods
//======================================

/** This method creates the control. */
SimpleGeojsonComponent.createComponent = function(workspaceUI,data,componentOptions) {
    
    var parent = workspaceUI.getObjectByKey(data.parentKey);
    //should throw an exception if parent is invalid!
    //
    //create a resource a simple chart resource processor
    var json = {};
    json.name = data.name;
    json.type = visicomp.core.Control.generator.type;
    var actionResponse = visicomp.core.createmember.createMember(parent,json);
    
    var control = actionResponse.member;
    if(control) {
        var simpleGeojsonComponent = new SimpleGeojsonComponent(workspaceUI,control,componentOptions);
        actionResponse.component = simpleGeojsonComponent;
    }
    else {
        //no action for now
    }
    return actionResponse;
}

SimpleGeojsonComponent.createComponentFromJson = function(workspaceUI,member,componentJson) {
    return new SimpleGeojsonComponent(workspaceUI,member,componentJson);
}

//======================================
// This is the control generator, to register the control
//======================================

SimpleGeojsonComponent.generator = {};
SimpleGeojsonComponent.generator.displayName = "Simple GeoJSON Control";
SimpleGeojsonComponent.generator.uniqueName = "visicomp.example.SimpleGeojsonComponent";
SimpleGeojsonComponent.generator.createComponent = SimpleGeojsonComponent.createComponent;
SimpleGeojsonComponent.generator.createComponentFromJson = SimpleGeojsonComponent.createComponentFromJson;
SimpleGeojsonComponent.generator.DEFAULT_WIDTH = 500;
SimpleGeojsonComponent.generator.DEFAULT_HEIGHT = 500;

//auto registration
if(registerComponent) {
    registerComponent(SimpleGeojsonComponent.generator);
}

}
)();