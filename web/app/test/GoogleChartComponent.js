/** This is a sample component, using google chart. It requires
 * the google chart library to run.  
 * "https://www.gstatic.com/charts/loader.js" */

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
        instance.onLibLoaded();
    }
}

//=================================
// Google Chart Resource
//=================================

/** Constructor */
GoogleChartResource = function() {
	this.window = null;
    this.chart = null;
    
    this.width = 500;
    this.height = 500;
    
    this.libLoaded = false;
    this.dataWaiting = false;
    
    // Load the Visualization API if needed - we can only load once
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
        this.libLoaded = true;
    }
}

/** setFrame - required method for resource processor used in Basic Resource Control. */
GoogleChartResource.prototype.setComponent = function(component) {
    this.component = component;
    this.component.memberUpdated();
}

/** setFrame - required method for resource processor used in Basic Resource Control. */
GoogleChartResource.prototype.setChartSize = function(width,height) {
    this.width = width;
    this.height = height;
}

/** This is the method users will call to initialize the chart. */
GoogleChartResource.prototype.setData = function(data,chartOptions) {
    this.data = data;
    this.chartOptions = chartOptions;
    this.dataWaiting = true;
}

/** This is the method users will call to initialize the chart. */
GoogleChartResource.prototype.onLibLoaded = function() {
    this.libLoaded = true;
    this.component.memberUpdated();
}

/** This is the method users will call to initialize the chart. */
GoogleChartResource.prototype.show = function() {
    if((this.libLoaded)&&(this.component)) {
        //create chart if needed
        if(!this.chart) {
            this.chart = new google.visualization.LineChart(this.component.getOutputElement());
        }
        
        //plot the data
        if(this.dataWaiting) {
            var chartData = this.createDataTable(this.data);
            this.chart.draw(chartData, this.chartOptions);
        }
    }
}

/** This is constructs the data table from the given data. */
GoogleChartResource.prototype.createDataTable = function(data) {
    var dataTable = new google.visualization.DataTable();
    for(var i = 0; i < data.columns.length; i++) {
        var columnInfo = data.columns[i];
        dataTable.addColumn(columnInfo.type,columnInfo.name);
    }
    dataTable.addRows(data.rows);
    
    return dataTable;
}

//======================================
// Static methods
//======================================

var GoogleChartComponent = {};

/** This method creates the control. */
GoogleChartComponent.createComponent = function(workspaceUI,data,componentOptions) {
	var resource = new GoogleChartResource();
	return hax.app.visiui.BasicControlComponent.createBaseComponent(workspaceUI,data,resource,GoogleChartComponent.generator,componentOptions);
}

GoogleChartComponent.createComponentFromJson = function(workspaceUI,member,componentJson) {
	var resource = new GoogleChartResource();
	member.updateResource(resource);
    return hax.app.visiui.BasicControlComponent.createBaseComponentFromJson(workspaceUI,member,GoogleChartComponent.generator,componentJson);
}

//======================================
// This is the control generator, to register the control
//======================================

GoogleChartComponent.generator = {};
GoogleChartComponent.generator.displayName = "Google Chart Control";
GoogleChartComponent.generator.uniqueName = "hax.example.GoogleChartComponent";
GoogleChartComponent.generator.createComponent = GoogleChartComponent.createComponent;
GoogleChartComponent.generator.createComponentFromJson = GoogleChartComponent.createComponentFromJson;
GoogleChartComponent.generator.DEFAULT_WIDTH = 500;
GoogleChartComponent.generator.DEFAULT_HEIGHT = 500;


//auto registration
if(registerComponent) {
    registerComponent(GoogleChartComponent.generator);
}

}
)();