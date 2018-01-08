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
apogeeapp.app.GoogleChartComponent = function(workspaceUI,control) {
    //extend edit component
    apogeeapp.app.BasicControlComponent.call(this,workspaceUI,control,apogeeapp.app.GoogleChartComponent);
    
    //if not yet done, load the google chart library
    if(!googleLoadCalled) {
        googleLoadCalled = true;
        google.charts.load('current', {packages: ['corechart']});
        google.charts.setOnLoadCallback(onLibLoad);
    }
};

apogeeapp.app.GoogleChartComponent.prototype = Object.create(apogeeapp.app.BasicControlComponent.prototype);
apogeeapp.app.GoogleChartComponent.prototype.constructor = apogeeapp.app.GoogleChartComponent;

//attach the standard static values to the static object (this can also be done manually)
apogeeapp.app.BasicControlComponent.attachStandardStaticProperties(apogeeapp.app.GoogleChartComponent,
        "GoogleChartComponent",
        "apogeeapp.app.GoogleChartComponent");

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
//auto registration
//-----------------
var app = apogeeapp.app.Apogee.getInstance();
if(app) {
    app.registerComponent(apogeeapp.app.GoogleChartComponent);
}
else {
    console.log("Component could not be registered because no Apogee app instance was available at component load time: apogeeapp.app.GoogleChartComponent");
}


//end definition
})();
