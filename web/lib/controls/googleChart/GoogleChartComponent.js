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
    
    this.chartType = apogeeapp.app.GoogleChartComponent.DEFAULT_CHART;
    
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
        
apogeeapp.app.GoogleChartComponent.AREA_CHART = "area";
apogeeapp.app.GoogleChartComponent.BAR_CHART = "bar";
apogeeapp.app.GoogleChartComponent.LINE_CHART = "line";
apogeeapp.app.GoogleChartComponent.SCATTER_CHART = "scatter";

apogeeapp.app.GoogleChartComponent.DEFAULT_CHART = apogeeapp.app.GoogleChartComponent.LINE_CHART;

/** Implement the method to get the data display. JsDataDisplay is an 
 * easily configurable data display. */
apogeeapp.app.GoogleChartComponent.prototype.getDataDisplay = function(viewMode) {
    this.chartDisplay = new apogeeapp.app.GoogleChartDisplay(viewMode,this.chartType);
    return this.chartDisplay;
}

//----------------------------
// methods to add a custom property
//----------------------------

apogeeapp.app.GoogleChartComponent.prototype.getChartType = function() {
    return this.chartType;
}

apogeeapp.app.GoogleChartComponent.prototype.setChartType = function(chartType) {
    this.chartType = chartType;
    if(this.chartDisplay) {
        this.chartDisplay.setChartType(chartType);
    }
}

apogeeapp.app.GoogleChartComponent.addPropFunction = function(component,values) {
    values.chartType = component.getChartType();
}

apogeeapp.app.GoogleChartComponent.updateProperties = function(component,oldValues,newValues) {
    component.setChartType(newValues.chartType);
}

apogeeapp.app.GoogleChartComponent.propertyDialogLines = [
    {
        "type":"dropdown",
        "heading":"Chart Type: ",
        "entries":[
            apogeeapp.app.GoogleChartComponent.AREA_CHART,
            apogeeapp.app.GoogleChartComponent.BAR_CHART,
            apogeeapp.app.GoogleChartComponent.LINE_CHART,
            apogeeapp.app.GoogleChartComponent.SCATTER_CHART
        ],
        "resultKey":"chartType"
    }
];

//-----------------------
// data display
//-----------------------

/** Extend ths JsDataDisplay */
apogeeapp.app.GoogleChartDisplay = function(viewMode,chartType) {
    //extend edit component
    apogeeapp.app.JsDataDisplay.call(this,viewMode);
    
    this.chartType = chartType;
    
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


apogeeapp.app.GoogleChartDisplay.prototype.setChartType = function(chartType) {
    this.chartType = chartType;
    if(this.chart) {
        this.chart = null;
        this.displayData();
    }
}

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
    
    //if((this.data.rows === undefined)||(this.data.columns === undefined)) return;
    
    if(!this.chart) {
        this.chart = this.instantiateChart();
        if(!this.chart) return null;
    }
    
    var chartOptions = this.data.options;
    if(!chartOptions) chartOptions = {};

    var chartData = this.createDataTable(this.data.columns,this.data.rows);
    this.chart.draw(chartData, chartOptions);
}

apogeeapp.app.GoogleChartDisplay.prototype.instantiateChart = function() {
    var element = this.getElement();
    switch(this.chartType) {
        case apogeeapp.app.GoogleChartComponent.AREA_CHART:
            return new google.visualization.AreaChart(element);
            
        case apogeeapp.app.GoogleChartComponent.BAR_CHART:
            return new google.visualization.BarChart(element);
        
        case apogeeapp.app.GoogleChartComponent.LINE_CHART:
            return new google.visualization.LineChart(element);
        
        case apogeeapp.app.GoogleChartComponent.SCATTER_CHART:
            return new google.visualization.ScatterChart(element);
            
        default:
            console.log("Unsupported chart type: " + this.chartType);
            return null;
    }
}

/** This is constructs the data table from the given data. */
apogeeapp.app.GoogleChartDisplay.prototype.createDataTable = function(columns,rows) {
    var dataTable = new google.visualization.DataTable();
    for(var i = 0; i < columns.length; i++) {
        var columnInfo = columns[i];
        dataTable.addColumn(columnInfo.type,columnInfo.name);
    }
    dataTable.addRows(rows);
    
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
