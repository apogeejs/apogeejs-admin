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
        
        this.storedData = apogeeapp.app.GoogleChartComponent.DEFAULT_STORED_DATA;
        
        //add a cleanup and save actions
        this.addOpenAction(apogeeapp.app.GoogleChartComponent.readFromJson);
        this.addSaveAction(apogeeapp.app.GoogleChartComponent.writeToJson);
    }
        
    /** Implement the method to get the data display. JsDataDisplay is an 
    * easily configurable data display. */
    getOutputDisplay(viewMode) {
        this.chartDisplay = new apogeeapp.app.GoogleChartDisplay(viewMode,this.getMember(),this.chartType);
        return this.chartDisplay;
    }
    

    getChartType() {
        return this.chartType;
    }

    setChartType(chartType) {
        this.chartType = chartType;
        if(this.chartDisplay) {
            this.chartDisplay.setChartType(chartType);
        }
    }

    addPropFunction(component,values) {
        values.chartType = component.getChartType();
    }

    updateProperties(component,oldValues,newValues) {
        component.setChartType(newValues.chartType);
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
                saveData: (formData) => this.onSubmit(formData)
            }
            return new apogeeapp.app.ConfigurableFormEditor(viewMode,callbacks,apogeeapp.app.GoogleChartComponent.FORM_LAYOUT);
        }
        else {
            return super.getDataDisplay(viewMode,viewType);
        }
    }
    
    onSubmit(formData) {
        this.storedData = formData;
        //options may be the empty string - map this to undefined
        var options = formData.options.trim();
        if(options == "") options = "undefined";
        
        var dataValid = ((formData.rows)&&(formData.rows != "")); 

        var member = this.getMember();
        var functionBody = (dataValid) ?
`
return {
    "columns": ${formData.columns},
    "rows": ${formData.rows},
    "options": ${options}
};` :
"";
        
        var argList = member.getArgList();
        var supplementalCode = member.getSupplementalCode();
        return apogeeapp.app.dataDisplayCallbackHelper.setCode(member,argList,functionBody,supplementalCode); 
    }       
    
    onCancel(panel) {
        panel.setValue(this.storedData);
    }
    
    static writeToJson(json) {
        json.formData = this.storedData;
    }

    static readFromJson(json) {
        if(json.formData !== undefined) {
            this.storedData = json.formData;
        }
    }
            

};

//attach the standard static values to the static object (this can also be done manually)
apogeeapp.app.BasicControlComponent.attachStandardStaticProperties(apogeeapp.app.GoogleChartComponent,
        "GoogleChartComponent",
        "apogeeapp.app.GoogleChartComponent");
        
apogeeapp.app.GoogleChartComponent.AREA_CHART = "area";
apogeeapp.app.GoogleChartComponent.BAR_CHART = "bar";
apogeeapp.app.GoogleChartComponent.LINE_CHART = "line";
apogeeapp.app.GoogleChartComponent.SCATTER_CHART = "scatter";

apogeeapp.app.GoogleChartComponent.DEFAULT_CHART = apogeeapp.app.GoogleChartComponent.LINE_CHART;

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

apogeeapp.app.GoogleChartComponent.DEFAULT_STORED_DATA = {};

apogeeapp.app.GoogleChartComponent.FORM_LAYOUT = [
    {
        type: "heading",
        level: 3,
        text: "Chart Inputs"
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
    }
];

//----------------------------
// methods to add a custom property
//----------------------------

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
apogeeapp.app.GoogleChartDisplay = class extends apogeeapp.app.NonEditorDataDisplay {;
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

    setChartType(chartType) {
        this.chartType = chartType;
        if(this.chart) {
            this.chart = null;
            this.displayData();
        }
    }

    showData() {
        this.data = this.member.getData();
        this.dataLoaded = true;

        if(this.libLoaded) {
            this.displayData();
        }
    }

    onLibLoaded() {
        this.libLoaded = true;

        if(this.dataLoaded) {
            this.displayData();
        }
    }

    displayData() {
        if(!this.data) return;

        //if((this.data.rows === undefined)||(this.data.columns === undefined)) return;

        if(!this.chart) {
            this.chart = this.instantiateChart();
            if(!this.chart) return null;
        }

        var chartOptions = this.data.options;
        if(!chartOptions) chartOptions = {};

        try {
            var chartData = this.createDataTable(this.data.columns,this.data.rows);
            this.chart.draw(chartData, chartOptions);
        }
        catch(error) {
            console.error(error.stack);
        }
    }

    instantiateChart() {
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
    createDataTable(columns,rows) {
        var dataTable = new google.visualization.DataTable();
        for(var i = 0; i < columns.length; i++) {
            var columnInfo = columns[i];
            dataTable.addColumn(columnInfo.type,columnInfo.name);
        }
        dataTable.addRows(rows);

        return dataTable;
    }
}

//end definition
})();
