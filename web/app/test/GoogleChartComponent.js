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
GoogleChartResource.prototype.setContentElement = function(contentElement) {
    this.contentElement = contentElement;
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
    this.run();
}

/** This is the method users will call to initialize the chart. */
GoogleChartResource.prototype.run = function() {
    if((this.libLoaded)&&(this.contentElement)) {
        //create chart if needed
        if(!this.chart) {
            this.chart = new google.visualization.LineChart(this.contentElement);
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

//=================================
// Google Chart Control
//=================================

/** This is the control for the chart. It inherits from the component
 * BasicResourceControl to represent a resource object. */
GoogleChartComponent = function(workspaceUI,control,componentJson) {
    
    //add the resource for the control
    var resource = new GoogleChartResource();
    control.updateResource(resource);
    
    //base init
    visicomp.app.visiui.Component.init.call(this,workspaceUI,control,GoogleChartComponent.generator,componentJson);
    visicomp.app.visiui.BasicControlComponent.init.call(this);
};

//add components to this class
visicomp.core.util.mixin(GoogleChartComponent,visicomp.app.visiui.Component);
visicomp.core.util.mixin(GoogleChartComponent,visicomp.app.visiui.BasicControlComponent);

/** Ordinarily we would populate the UI here. But we might have to wait for the
 * google library to load so we just set the element so it can be loaded later. */
GoogleChartComponent.prototype.addToFrame = function() {
    var control = this.getObject();
    var resource = control.getResource();
    resource.setContentElement(this.getContentElement());
}

//======================================
// Static methods
//======================================

/** This method creates the control. */
GoogleChartComponent.createComponent = function(workspaceUI,parent,name) {
	//create a resource a simple chart resource processor
    var json = {};
    json.name = name;
    json.type = visicomp.core.Control.generator.type;
    var actionResponse = visicomp.core.createmember.createMember(parent,json);
    
    var control = actionResponse.member;
    if(control) {
        var googleChartComponent = new GoogleChartComponent(workspaceUI,control);
        actionResponse.component = googleChartComponent;
    }
    else {
        //no action for now
    }
    return actionResponse;
}

GoogleChartComponent.createComponentFromJson = function(workspaceUI,member,componentJson) {
    return new GoogleChartComponent(workspaceUI,member,componentJson);
}

//======================================
// This is the control generator, to register the control
//======================================

GoogleChartComponent.generator = {};
GoogleChartComponent.generator.displayName = "Google Chart Control";
GoogleChartComponent.generator.uniqueName = "visicomp.example.GoogleChartComponent";
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