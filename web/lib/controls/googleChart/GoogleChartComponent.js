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
apogeeapp.app.GoogleChartComponent = function(workspaceUI,control,generator,options) {
    //extend edit component
    apogeeapp.app.BasicControlComponent.call(this,workspaceUI,control,generator);
    
    this.setOptions(options);
    this.memberUpdated();
    
    //if not yet done, load the google chart library
    if(!googleLoadCalled) {
        googleLoadCalled = true;
        google.charts.load('current', {packages: ['corechart']});
        google.charts.setOnLoadCallback(onLibLoad);
    }
};

apogeeapp.app.GoogleChartComponent.prototype = Object.create(apogeeapp.app.BasicControlComponent.prototype);
apogeeapp.app.GoogleChartComponent.prototype.constructor = apogeeapp.app.GoogleChartComponent;

/** Implement the method to get the data display. JsDataDisplay is an 
 * easily configurable data display. */
apogeeapp.app.GoogleChartComponent.prototype.getDataDisplay = function(viewMode) {
    return new apogeeapp.app.GoogleChartDisplay(viewMode);
}

/** Extend ths JsDataDisplay */
apogeeapp.app.GoogleChartDisplay = function(viewMode) {
    //extend edit component
    apogeeapp.app.JsDataDisplay.call(this,viewMode);
    
    if(!google.visualization) {
        //register this instance
        addInstance(this);
    }
    else {
        this.libLoaded = true;
    }
}

apogeeapp.app.GoogleChartDisplay.prototype = Object.create(apogeeapp.app.JsDataDisplay.prototype);
apogeeapp.app.GoogleChartDisplay.prototype.constructor = apogeeapp.app.GoogleChartDisplay;


apogeeapp.app.GoogleChartDisplay.prototype.showData = function(data) {
    this.data = data;
    this.dataLoaded = true;
    
    if(this.libLoaded) {
        this.displayData();
    }
}

apogeeapp.app.GoogleChartDisplay.prototype.onLibLoaded = function() {
    this.libLoaded = true;
    
    if(this.dataLoaded) {
        this.displayData();
    }
}

apogeeapp.app.GoogleChartDisplay.prototype.displayData = function() {
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
apogeeapp.app.GoogleChartDisplay.prototype.createDataTable = function(data) {
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
apogeeapp.app.GoogleChartComponent.generator = apogeeapp.app.BasicControlComponent.createGenerator(
        "GoogleChartComponent",
        "apogeeapp.app.GoogleChartComponent",
        apogeeapp.app.GoogleChartComponent);

//-----------------
//auto registration
//-----------------
if(registerComponent) {
    registerComponent(apogeeapp.app.GoogleChartComponent.generator);
}

}
)();
