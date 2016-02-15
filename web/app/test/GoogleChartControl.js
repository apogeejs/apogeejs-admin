/** This is a simple chart control using the libary Chart.js. The Chart.js libarry
 * must be loaded separately for this control. */

(function() {
    
//=================================
// Statics to load google code (can only call load once)
//=================================
//
//we need to make sure we try to load only once
var googleLoadCalled = false;

var instances = [];
function addInstance(instance) {
    instances.push(instance);
}

function onLibLoad() {
    for(var i = 0; i < instances.length; i++) {
        var instance = instances[i];
        instance.createChartObject();
    }
}

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
    
    // Load the Visualization API - we can only load once
    if(!google.visualization) {
        //register this instance
        addInstance(this);
    
        if(!googleLoadCalled) {
            googleLoadCalled = true;
            google.charts.load('current', {packages: ['corechart']});
            google.charts.setOnLoadCallback(onLibLoad);
        }
    }
    else {
        this.createChartObject();
    }
}

GoogleChartResourceProcessor.prototype.createChartObject = function() {
    this.libLoaded = true;
    
    this.chart = new google.visualization.LineChart(this.window.getContent());
    
    if(this.dataWaiting) {
        this.setData(this.cachedData,this.cachedOptions);
        
        delete this.cachedData;
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
GoogleChartResourceProcessor.prototype.setData = function(data,chartOptions) {
    
    if(this.libLoaded) {
        var dataTable = this.createDataTable(data);
        this.chart.draw(dataTable, chartOptions);
    }
    else {
        this.dataWaiting = true;
        this.cachedData = data;
        this.cachedOptions = chartOptions;
    }
}

/** This is constructs the data table from the given data. */
GoogleChartResourceProcessor.prototype.createDataTable = function(data) {
    var dataTable = new google.visualization.DataTable();
    for(var i = 0; i < data.columns.length; i++) {
        var columnInfo = data.columns[i];
        dataTable.addColumn(columnInfo.type,columnInfo.name);
    }
    dataTable.addRows(data.rows);
    
    return dataTable;
}

//=================================
// Simple Chart Control
//=================================

/** This is the control for the chart. It inherits from the component
 * BasicResourceControl to represent a resource object. */
GoogleChartControl = function(workspaceUI,resource) {
    //base init
    visicomp.app.visiui.Component.init.call(this,workspaceUI,resource,GoogleChartControl.generator);
    visicomp.app.visiui.BasicResourceControl.init.call(this);
};

//add components to this class
visicomp.core.util.mixin(GoogleChartControl,visicomp.app.visiui.Component);
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