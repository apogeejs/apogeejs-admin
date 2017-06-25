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

//===================================
// Google Chart Component
//===================================

/** This is a simple google chart component. */
haxapp.app.GoogleChartComponent = function(workspaceUI,control,generator,componentJson) {
    //extend edit component
    haxapp.app.BasicControlComponent.call(this,workspaceUI,control,generator,componentJson);
    
    //if not yet done, load the google chart library
    if(!googleLoadCalled) {
        googleLoadCalled = true;
        google.charts.load('current', {packages: ['corechart']});
        google.charts.setOnLoadCallback(onLibLoad);
    }
};

haxapp.app.GoogleChartComponent.prototype = Object.create(haxapp.app.BasicControlComponent.prototype);
haxapp.app.GoogleChartComponent.prototype.constructor = haxapp.app.GoogleChartComponent;

/** Implement the method to get the data display. JsDataDisplay is an 
 * easily configurable data display. */
haxapp.app.GoogleChartComponent.prototype.getDataDisplay = function(viewMode) {
    return new haxapp.app.GoogleChartDisplay(viewMode);
}

/** TO use JsDataDisplay, implement a class with the following methods, all optional:
 * init(outputElement,outputMode);
 * setData(data,outputElement,outputMode);
 * requestHide(outputElement,outputMode);
 * onHide(outputElement,outputMode);
 * destroy(outputElement,outputMode);
 */
haxapp.app.GoogleChartDisplay = function(viewMode) {
    //extend edit component
    haxapp.app.JsDataDisplay.call(this,viewMode);
    
    if(!google.visualization) {
        //register this instance
        addInstance(this);
    }
    else {
        this.libLoaded = true;
    }
}

haxapp.app.GoogleChartDisplay.prototype = Object.create(haxapp.app.JsDataDisplay.prototype);
haxapp.app.GoogleChartDisplay.prototype.constructor = haxapp.app.GoogleChartDisplay;


haxapp.app.GoogleChartDisplay.prototype.showData = function(data) {
    this.data = data;
    this.dataLoaded = true;
    
    if(this.libLoaded) {
        this.displayData();
    }
}

haxapp.app.GoogleChartDisplay.prototype.onHide = function() {
    console.log("NewButtonControl.onHide");
}

haxapp.app.GoogleChartDisplay.prototype.destroy = function() {
    console.log("NewButtonControl.destroyed");
}

haxapp.app.GoogleChartDisplay.prototype.onLibLoaded = function() {
    this.libLoaded = true;
    
    if(this.dataLoaded) {
        this.displayData();
    }
}

haxapp.app.GoogleChartDisplay.prototype.displayData = function() {
    if(!this.data) return;
    
    if(!this.chart) {
        this.chart = new google.visualization.LineChart(this.getElement());
    }
    
    var chartData = this.data.chartData;
    var chartOptions = this.data.chartOptions;
    if((!chartData)||(!chartOptions)) {
        return;
    }

    var dataTable = this.createDataTable(chartData);
    this.chart.draw(dataTable, chartOptions);
}

/** This is constructs the data table from the given data. */
haxapp.app.GoogleChartDisplay.prototype.createDataTable = function(data) {
    var dataTable = new google.visualization.DataTable();
    for(var i = 0; i < data.columns.length; i++) {
        var columnInfo = data.columns[i];
        dataTable.addColumn(columnInfo.type,columnInfo.name);
    }
    dataTable.addRows(data.rows);
    
    return dataTable;
}

//-----------------
//create a component generator
//-----------------
haxapp.app.GoogleChartComponent.generator = haxapp.app.BasicControlComponent.createGenerator(
        "GoogleChartComponent",
        "haxapp.app.GoogleChartComponent",
        haxapp.app.GoogleChartComponent);

//-----------------
//auto registration
//-----------------
if(registerComponent) {
    registerComponent(haxapp.app.GoogleChartComponent.generator);
}

}
)();
