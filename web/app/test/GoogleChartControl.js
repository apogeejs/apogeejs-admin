/** This is a simple chart control using the libary Chart.js. The Chart.js libarry
 * must be loaded separately for this control. */

(function() {

//=================================
// Simple Chart Reousrce Processor
//=================================

/** Constructor */
GoogleChartResourceProcessor = function() {
	this.window = null;
    this.chart = null;
    
    this.width = 500;
    this.height = 500;
    
    this.libLoaded = false;
    this.dataWaiting = false;
}

//requires "https://www.gstatic.com/charts/loader.js"

/** setFrame - required method for resource processor used in Basic Resource Control. */
GoogleChartResourceProcessor.prototype.setWindow = function(window) {
    this.window = window;
    
    //load the control, now that we have the window
    var instance = this;
    var onLoadCallback = function() {
        instance.onLibLoad();
    }
    
    // Load the Visualization API and the piechart package.
    if(!google.visualization) {
        google.charts.load('current', {packages: ['corechart']});
        google.charts.setOnLoadCallback(onLoadCallback);
    }
    else {
        onLoadCallback();
    }
}

GoogleChartResourceProcessor.prototype.onLibLoad = function() {
    this.libLoaded = true;
    
    this.chart = new google.visualization.LineChart(this.window.getContent());
    
    if(this.dataWaiting) {
        this.setData(this.cachedDataGenerator,this.cachedOptions);
        
        delete this.cachedDataGenerator;
        delete this.cachedOptions;        
        this.dataWaiting = false;
    }
}

/** setFrame - required method for resource processor used in Basic Resource Control. */
GoogleChartResourceProcessor.prototype.setChartSize = function(width,height) {
    this.width = width;
    this.height = height;
}

/** This is the method users will call to initialize the chart. */
GoogleChartResourceProcessor.prototype.setData = function(dataGeneratorFunction,chartOptions) {
    
    if(this.libLoaded) {
        var data = dataGeneratorFunction();
        this.chart.draw(data, chartOptions);
    }
    else {
        this.dataWaiting = true;
        this.cachedDataGenerator = dataGeneratorFunction;
        this.cachedOptions = chartOptions;
    }
}


//=================================
// Simple Chart Control
//=================================

/** This is the control for the chart. It inherits from the component
 * BasicResourceControl to represent a resource object. */
GoogleChartControl = function(workspaceUI,resource) {
    //base init
    visicomp.app.visiui.Control.init.call(this,workspaceUI,resource,GoogleChartControl.generator);
    visicomp.app.visiui.BasicResourceControl.init.call(this);
};

//add components to this class
visicomp.core.util.mixin(GoogleChartControl,visicomp.app.visiui.Control);
visicomp.core.util.mixin(GoogleChartControl,visicomp.app.visiui.BasicResourceControl);

//======================================
// Static methods
//======================================

/** This method creates the control. */
GoogleChartControl.createControl = function(workspaceUI,parent,name) {
	//create a resource a simple chart resource processor
	var resourceProcessor = new GoogleChartResourceProcessor();
    var returnValue = visicomp.core.createresource.createResource(parent,name,resourceProcessor);
    if(returnValue.success) {
        var resource = returnValue.resource;
        var googleChartControl = new GoogleChartControl(workspaceUI,resource);
        returnValue.control = googleChartControl;
    }
    else {
        //no action for now
    }
    return returnValue;
}

//======================================
// This is the control generator, to register the control
//======================================

GoogleChartControl.generator = {};
GoogleChartControl.generator.displayName = "Simple Chart Control";
GoogleChartControl.generator.uniqueName = "visicomp.example.GoogleChartControl";
GoogleChartControl.generator.createControl = GoogleChartControl.createControl;


//auto registration
if(registerControl) {
    registerControl(GoogleChartControl.generator);
}

}
)();