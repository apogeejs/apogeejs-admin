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
apogeeapp.app.GoogleChartComponent = class extends apogeeapp.app.BasicControlComponent {
    
    constructor(workspaceUI,control) {
        super(workspaceUI,control,apogeeapp.app.GoogleChartComponent);

        this.chartType = apogeeapp.app.GoogleChartComponent.DEFAULT_CHART;

        //if not yet done, load the google chart library
        if(!googleLoadCalled) {
            googleLoadCalled = true;
            google.charts.load('current', {packages: ['corechart']});
            google.charts.setOnLoadCallback(onLibLoad);
        }
        
        this._setStoredData(apogeeapp.app.GoogleChartComponent.DEFAULT_STORED_DATA);
        
        //add a cleanup and save actions
        this.addOpenAction(apogeeapp.app.GoogleChartComponent.readFromJson);
        this.addSaveAction(apogeeapp.app.GoogleChartComponent.writeToJson);
    }
        
    /** Implement the method to get the data display. JsDataDisplay is an 
    * easily configurable data display. */
    getOutputDisplay(viewMode) {
        this.chartDisplay = new apogeeapp.app.GoogleChartDisplay(viewMode,this.getMember(),this.chartType);
        //set the config data
        this.chartDisplay.setChartType(this.chartType);
        this.chartDisplay.setHasHeaderRow(this.hasHeaderRow);
        return this.chartDisplay;
    }

    //==================================
    // overrides for alternate "code" entry
    //==================================
    
    getTableEditSettings() {
        return apogeeapp.app.GoogleChartComponent.TABLE_EDIT_SETTINGS;
    }
    
    /** This method should be implemented to retrieve a data display of the give type. 
     * @protected. */
    getDataDisplay(viewMode,viewType) {
        
        if(viewType == apogeeapp.app.GoogleChartComponent.VIEW_INPUT_FORM) {
            var callbacks = {
                getData: () => this.storedData,
                getEditOk: () => true,
                saveData: (formData) => this._onSubmit(formData)
            }
            return new apogeeapp.app.ConfigurableFormEditor(viewMode,callbacks,apogeeapp.app.GoogleChartComponent.FORM_LAYOUT);
        }
        else {
            return super.getDataDisplay(viewMode,viewType);
        }
    }
    
    //=====================================
    // Private Methods
    //=====================================
    
    _setStoredData(formData) {
        this.storedData = formData;
        this.chartType = formData.chartType;
        this.hasHeaderRow = formData.headerRow;
        if(this.chartDisplay) {
            this.chartDisplay.setChartType(this.chartType);
            this.chartDisplay.setHasHeaderRow(this.hasHeaderRow);
        }
    }
    
    _onSubmit(formData) {
        
        //there is one thing I am not sure I like here - the form data, which translates 
        //directly to code, is stored separately from the code, rather than reverse engineering the code.
        //One alternate option is to encode the relevent form data as a comment in the code, but I am
        //not sure this is any better, since the same information is stored twice. At least it is
        //in thge same place though.
        this._setStoredData(formData);
        
        //options or columns may be the empty string - map this to undefined
        var options = formData.options.trim();
        if(options == "") options = "undefined";
        var columns = formData.columns.trim();
        if(columns == "") columns = "undefined";
        var rows = formData.rows.trim();
        
        var dataValid = (rows != ""); 

        //compile the function body
        var functionBody = (dataValid) ?
`
return {
    "columns": ${columns},
    "rows": ${rows},
    "options": ${options}
};` :
"";
        //set the code
        var member = this.getMember();
        var argList = member.getArgList();
        var supplementalCode = member.getSupplementalCode();
        return apogeeapp.app.dataDisplayCallbackHelper.setCode(member,argList,functionBody,supplementalCode); 
    }       
    
    //=====================================
    // Static Methods
    //=====================================
    
    static writeToJson(json) {
        json.formData = this.storedData;
    }

    static readFromJson(json) {
        if(json.formData !== undefined) {
            this._setStoredData(json.formData);
        }
    }
            

};

//attach the standard static values to the static object (this can also be done manually)
apogeeapp.app.BasicControlComponent.attachStandardStaticProperties(apogeeapp.app.GoogleChartComponent,
        "GoogleChartComponent",
        "apogeeapp.app.GoogleChartComponent");

apogeeapp.app.GoogleChartComponent.VIEW_INPUT_FORM = "Input";

apogeeapp.app.GoogleChartComponent.VIEW_MODES = [
	apogeeapp.app.BasicControlComponent.VIEW_OUTPUT,
	apogeeapp.app.GoogleChartComponent.VIEW_INPUT_FORM,
    apogeeapp.app.BasicControlComponent.VIEW_DESCRIPTION
];

apogeeapp.app.GoogleChartComponent.TABLE_EDIT_SETTINGS = {
    "viewModes": apogeeapp.app.GoogleChartComponent.VIEW_MODES,
    "defaultView": apogeeapp.app.BasicControlComponent.VIEW_OUTPUT
}

apogeeapp.app.GoogleChartComponent.DEFAULT_STORED_DATA = {
    chartType: "line",
    hasHeaderRow: false
};

//format for entries below [ display name , enumeration name, Google constructor name] 
apogeeapp.app.GoogleChartComponent.CHART_TYPE_INFO = [
    ["Area","area","AreaChart"],
    ["Bar","bar","BarChart"],
    ["Bubble","bubble","BubbleChart"],
    ["Candlestick","candlestick","CandlestickChart"],
    ["Column","column","ColumnChart"],
    ["Combo","combo","ComboChart"],
    ["GeoChart","geochart","GeoChart"],
    ["Histogram","histogram","Histogram"],
    ["Line","line","LineChart"],
    ["Pie","pie","PieChart"],
    ["Scatter","scatter","ScatterChart"],
    ["Stepped Area","steppedArea","SteppedAreaChart"]
];

apogeeapp.app.GoogleChartComponent.CHART_SELECT_FORM_INFO = apogeeapp.app.GoogleChartComponent.CHART_TYPE_INFO.map(entry => entry.slice(0,2));

apogeeapp.app.GoogleChartComponent.FORM_LAYOUT = [
    {
        type: "spacer"
    },
    {   
        type: "dropdown",
        label: "Chart Type: ",
        entries: apogeeapp.app.GoogleChartComponent.CHART_SELECT_FORM_INFO,
        value: "<SET CURRENT>", //set current value
        key: "chartType",
    },
    {
        type: "spacer"
    },
    {   
        type: "textField",
        label: "Columns: ",
        key: "columns",
    },
    {
        type: "textField",
        label: "Rows: ",
        key: "rows",
    },
    {
        type: "textField",
        label: "Options: ",
        key: "options",
    },
    {
        type: "spacer"
    },
    {   
        type: "checkbox",
        label: "Columns included as row header: ",
        value: "<SET CURRENT>", //set current value
        key: "headerRow",
    },
];

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

//-----------------------
// data display
//-----------------------

/** Extend ths JsDataDisplay */
apogeeapp.app.GoogleChartDisplay = class extends apogeeapp.app.NonEditorDataDisplay {
    
    //=====================================
    // Public Methods
    //=====================================
    
    constructor(viewMode,member,chartType) {
        super(viewMode,apogeeapp.app.NonEditorDataDisplay.SCROLLING);
    
        this.member = member;
        this.chartType = chartType;

        if(!google.visualization) {
            //register this instance
            addInstance(this);
        }
        else {
            this.libLoaded = true;
        }
    }

    showData() {
        this.data = this.member.getData();
        this.dataLoaded = true;

        if(this.libLoaded) {
            this._displayData();
        }
    }

    onLibLoaded() {
        this.libLoaded = true;

        if(this.dataLoaded) {
            this._displayData();
        }
    }
    
    setChartType(chartType) {
        if(this.chartType == chartType) return;
        
        this.chartType = chartType;
        if(this.chart) {
            this.chart = null;
        }
    }
    
    setHasHeaderRow(hasHeaderRow) {
        if(this.hasHeaderRow == hasHeaderRow) return;
        
        this.hasHeaderRow = hasHeaderRow;
        if(this.chart) {
            this.chart = null;
        }
    }
    
    //=====================================
    // Private Methods
    //=====================================

    _displayData() {
        if(!this.data) return;

        if(!this.chart) {
            this.chart = this._instantiateChart();
            if(!this.chart) return null;
        }

        var chartOptions = this.data.options;
        if(!chartOptions) chartOptions = {};

        try {
            var chartData = this._createDataTable(this.data.columns,this.data.rows,this.hasHeaderRow);
            this.chart.draw(chartData, chartOptions);
        }
        catch(error) {
            alert("Error rendering chart: " + error.message);
            this.chart.clearChart();
        }
    }

    _instantiateChart() {
        var element = this.getElement();
        var chartInfoEntry = apogeeapp.app.GoogleChartComponent.CHART_TYPE_INFO.find(entry => (entry[1] == this.chartType) );
        if(!chartInfoEntry) {
            alert("Chart type not found: " + this.chartType);
        }
        else {
            var constructorName = chartInfoEntry[2];
            return new google.visualization[constructorName](element);
        }
    }

    /** This is constructs the data table from the given data. */
    _createDataTable(columns,rows,hasHeaderRow) {
        var noHeaderRow;
        var combinedData;
        if((hasHeaderRow)||(columns === undefined)){
            combinedData = rows;
            noHeaderRow = !hasHeaderRow; 
        }
        else {
            combinedData = [columns].concat(rows);
            noHeaderRow = false;    
        }
        var dataTable = google.visualization.arrayToDataTable(combinedData,noHeaderRow);
        return dataTable;
    }
}

//end definition
})();
