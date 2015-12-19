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
}

/** setFrame - required method for resource processor used in Basic Resource Control. */
SimpleChartResourceProcessor.prototype.setFrame = function(controlFrame) {
    this.controlFrame = controlFrame;
}

/** These are options for the line that is plotted. */
SimpleChartResourceProcessor.OPTIONS =  {
    "scaleShowGridLines": true,
    "scaleGridLineColor": "rgba(0,0,0,.05)",
    "scaleGridLineWidth": 1,
    "scaleShowHorizontalLines": true,
    "scaleShowVerticalLines": true,
    "bezierCurve": false,
    "bezierCurveTension": 0.4,
    "pointDot": true,
    "pointDotRadius": 4,
    "pointDotStrokeWidth": 1,
    "pointHitDetectionRadius": 20,
    "datasetStroke": true,
    "datasetStrokeWidth": 2,
    "datasetFill": true,
    "legendTemplate": "<ul class=\"<%=name.toLowerCase()%>-legend\"><% for (var i=0; i<datasets.length; i++){%><li><span style=\"background-color:<%=datasets[i].strokeColor%>\"></span><%if(datasets[i].label){%><%=datasets[i].label%><%}%></li><%}%></ul>"
};

/** This is style info for the line that is plotted. */
SimpleChartResourceProcessor.LINE_STYLE =  {
    "fillColor": "rgba(220,220,220,0.2)",
    "strokeColor": "rgba(220,220,220,1)",
    "pointColor": "rgba(220,220,220,1)",
    "pointStrokeColor": "#fff",
    "pointHighlightFill": "#fff",
    "pointHighlightStroke": "rgba(220,220,220,1)"
};

/** updateToJson - required method for resource processor used in Basic Resource Control. 
 * no data to serialize here. */
SimpleChartResourceProcessor.prototype.updateToJson = function() {}

/** updateToJson - required method for resource processor used in Basic Resource Control. 
 * no data to deserialize here. */
SimpleChartResourceProcessor.prototype.updateFromJson = function(json) {}

/** This is the method users will call to initialize the chart. */
SimpleChartResourceProcessor.prototype.setData = function(valueArray,options) {
    if(!options) options = {};
    
    //set up the display element
    var contentElement = this.controlFrame.getWindow().getContent();
    contentElement.innerHTML = "";
    this.canvas = document.createElement("canvas");
    if(options.height) {
        this.canvas.style.height = options.height + "px";
    }
    if(options.width) {
        this.canvas.style.width = options.width + "px";
    }
    contentElement.appendChild(this.canvas);
    
    //get the data structure to plot
    var data = this.createData(valueArray);
    
    //create chart
    var ctx = this.canvas.getContext("2d");
    this.chart = new Chart(ctx).Line(data,SimpleChartResourceProcessor.OPTIONS);
}

/** This method packages the value array into the necesary data structure for the chart. */
SimpleChartResourceProcessor.prototype.createData = function(valueArray) {
    //construct a data set, with format info
    var dataset = {};
    for(var key in SimpleChartResourceProcessor.LINE_STYLE) {
        dataset[key] = SimpleChartResourceProcessor.LINE_STYLE[key];
    }
    dataset.data = valueArray;
    
    //construct the labels
    var labels = [];
    for(var i = 0; i < valueArray.length; i++) {
        labels[i] = i;
    }
    
    //package the data
    var data = {};
    data.labels = labels;
    data.datasets = [];
    data.datasets.push(dataset);
    
    return data;
    
}

//=================================
// Simple Chart Control
//=================================

/** This is the control for the chart. It inherits from the component
 * BasicResourceControl to represent a resource object. */
SimpleChartControl = function(resource) {
    //base init
    visicomp.app.visiui.Control.init.call(this,resource,"Simple Chart Control");
    visicomp.app.visiui.BasicResourceControl.init.call(this);
};

//add components to this class
visicomp.core.util.mixin(SimpleChartControl,visicomp.app.visiui.Control);
visicomp.core.util.mixin(SimpleChartControl,visicomp.app.visiui.BasicResourceControl);


/** This method is implemented to allow serialization. */
SimpleChartControl.prototype.getUniqueTypeName = function() {
    return SimpleChartControl.generator.uniqueName;
}

//======================================
// Static methods
//======================================

/** This method creates a callback to show a "create control" dialog. */
SimpleChartControl.getShowCreateDialogCallback = function(app) {
    return function() {
        visicomp.app.visiui.dialog.showCreateChildDialog("Simple Chart Control",
            app,
            SimpleChartControl.createControl
        );
    }
}

/** This method creates the control. */
SimpleChartControl.createControl = function(workspaceUI,parent,name) {
	//create a resource a simple chart resource processor
	var resourceProcessor = new SimpleChartResourceProcessor();
    var returnValue = visicomp.core.createresource.createResource(parent,name,resourceProcessor);
    if(returnValue.success) {
        var resource = returnValue.resource;
        var simpleChartControl = new SimpleChartControl(resource);
        workspaceUI.addControl(simpleChartControl);
    }
    else {
        //no action for now
    }
    return returnValue;
}

/** This static deserializes the control. */
SimpleChartControl.createfromJson = function(workspaceUI,parent,json,updateDataList) {

    var name = json.name;
    var resultValue = SimpleChartControl.createControl(workspaceUI,parent,name);
    
    if(resultValue.success) {
        var resource = resultValue.resource;
        visicomp.app.visiui.BasicResourceControl.updateFromJson(resource,json,updateDataList);
    }
}

//======================================
// This is the control generator, to register the control
//======================================

SimpleChartControl.generator = {};
SimpleChartControl.generator.displayName = "Simple Chart Control";
SimpleChartControl.generator.uniqueName = "visicomp.example.SimpleChartControl";
SimpleChartControl.generator.getShowCreateDialogCallback = SimpleChartControl.getShowCreateDialogCallback;
SimpleChartControl.generator.createFromJson = SimpleChartControl.createfromJson;


//auto registration
if(registerControl) {
    registerControl(SimpleChartControl.generator);
}

}
)();