/** This is a simple chart control using the libary Chart.js. The Chart.js libarry
 * must be loaded separately for this control. */

(function() {

//=================================
// Simple Chart Reousrce Processor
//=================================

/** Constructor */
SimpleChartResourceProcessor = function() {
	this.controlFrame = null;
    this.canvas = null;
    this.chart = null;
    
    this.width = 500;
    this.height = 500;
}



/** setFrame - required method for resource processor used in Basic Resource Control. */
SimpleChartResourceProcessor.prototype.setFrame = function(controlFrame) {
    this.controlFrame = controlFrame;
}

/** setFrame - required method for resource processor used in Basic Resource Control. */
SimpleChartResourceProcessor.prototype.setChartSize = function(width,height) {
    this.width = width;
    this.height = height;
}

/** This is the method users will call to initialize the chart. */
SimpleChartResourceProcessor.prototype.setData = function(data,chartOptions) {
    
    //set up the display element
    var contentElement = this.controlFrame.getWindow().getContent();
    contentElement.innerHTML = "";
    this.canvas = document.createElement("canvas");
    if(this.height) {
        this.canvas.style.height = this.height + "px";
    }
    if(this.width) {
        this.canvas.style.width = this.width + "px";
    }
    contentElement.appendChild(this.canvas);
    
    //create chart
    var ctx = this.canvas.getContext("2d");
    this.chart = new Chart(ctx).Line(data,chartOptions);
}


//=================================
// Simple Chart Control
//=================================

/** This is the control for the chart. It inherits from the component
 * BasicResourceControl to represent a resource object. */
SimpleChartControl = function(resource) {
    //base init
    visicomp.app.visiui.Control.init.call(this,resource,SimpleChartControl.generator);
    visicomp.app.visiui.BasicResourceControl.init.call(this);
};

//add components to this class
visicomp.core.util.mixin(SimpleChartControl,visicomp.app.visiui.Control);
visicomp.core.util.mixin(SimpleChartControl,visicomp.app.visiui.BasicResourceControl);

//======================================
// Static methods
//======================================

/** This method creates the control. */
SimpleChartControl.createControl = function(workspaceUI,parent,name) {
	//create a resource a simple chart resource processor
	var resourceProcessor = new SimpleChartResourceProcessor();
    var returnValue = visicomp.core.createresource.createResource(parent,name,resourceProcessor);
    if(returnValue.success) {
        var resource = returnValue.resource;
        var simpleChartControl = new SimpleChartControl(resource);
        workspaceUI.addControl(simpleChartControl);
        returnValue.control = simpleChartControl;
    }
    else {
        //no action for now
    }
    return returnValue;
}

//======================================
// This is the control generator, to register the control
//======================================

SimpleChartControl.generator = {};
SimpleChartControl.generator.displayName = "Simple Chart Control";
SimpleChartControl.generator.uniqueName = "visicomp.example.SimpleChartControl";
SimpleChartControl.generator.createControl = SimpleChartControl.createControl;


//auto registration
if(registerControl) {
    registerControl(SimpleChartControl.generator);
}

}
)();