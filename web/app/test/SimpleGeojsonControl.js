/** This is a simple chart control using the libary Chart.js. The Chart.js libarry
 * must be loaded separately for this control. */

(function() {

//=================================
// Simple Chart Reousrce Processor
//=================================

/** Constructor */
SimpleGeojsonResource = function() {

    this.map = null;
    this.contentElement = null;
    this.mapDiv = null;
    
    //dummy initial view
    this.lat = 37;
    this.lon = -120;
    this.zoom = 14;
}

//required links for leaflet
//https://unpkg.com/leaflet@1.0.1/dist/leaflet.js
//https://unpkg.com/leaflet@1.0.1/dist/leaflet.css


/** setFrame - required method for resource processor used in Basic Resource Control. */
SimpleGeojsonResource.prototype.setComponent = function(component) {
    this.component = component;
    
    //initialize UI - to be ready for code to be set ---------------------------
    this.mapDiv = document.createElement("div");
    this.mapDiv.style.height = "100%";
    this.mapDiv.style.width = "100%"; 
    var contentElement = this.component.getOutputElement();
    contentElement.appendChild(this.mapDiv);
   
    //set map later - since we need it to be showing before we initialize leaflet
    
    //resize the editor on window size change
    var instance = this;
    var resizeCallback = function() {
        if(instance.map) {
            instance.map.invalidateSize();
        }
    }
    hax.visiui.setResizeListener(this.mapDiv, resizeCallback);
    
    
    //end initailize UI --------------------------------------------------------
    
    //call component updated - though we usually don't need to
    this.component.memberUpdated();
}

/** This is the method users will call to initialize the chart. */
SimpleGeojsonResource.prototype.setData = function(lat,lon,zoom) {
    this.lat = lat;
    this.lon = lon;
    this.zoom = zoom;
    
    //center map if it has been created
    if(this.map) {
        this.map.setView([this.lat,this.lon], this.zoom);
    }
}

/** This is the method users will call to initialize the chart. */
SimpleGeojsonResource.prototype.show = function() {  
    if(!this.map) {
        
        this.map = L.map(this.mapDiv);
        
        //osm tiles
        L.tileLayer('https://a.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>',
            maxZoom: 18
        }).addTo(this.map);
        
        //center map if data has been set
        if(this.lat) {
            this.map.setView([this.lat,this.lon], this.zoom);
        }
    }  
}

SimpleGeojsonResource.prototype.hide = function() {  
    //no action
}

SimpleGeojsonResource.prototype.delete = function() {  
    //no action
}

//======================================
// Static methods
//======================================

var SimpleGeojsonComponent = {};

/** This method creates the control. */
SimpleGeojsonComponent.createComponent = function(workspaceUI,data,componentOptions) {
    var resource = new SimpleGeojsonResource();
	return hax.app.visiui.BasicControlComponent.createBaseComponent(workspaceUI,data,resource,SimpleGeojsonComponent.generator,componentOptions);
}

SimpleGeojsonComponent.createComponentFromJson = function(workspaceUI,member,componentJson) {
    var resource = new SimpleGeojsonResource();
	member.updateResource(resource);
    return hax.app.visiui.BasicControlComponent.createBaseComponentFromJson(workspaceUI,member,SimpleGeojsonComponent.generator,componentJson);
}

//======================================
// This is the control generator, to register the control
//======================================

SimpleGeojsonComponent.generator = {};
SimpleGeojsonComponent.generator.displayName = "Simple GeoJSON Control";
SimpleGeojsonComponent.generator.uniqueName = "hax.example.SimpleGeojsonComponent";
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