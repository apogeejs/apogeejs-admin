//=================================
// Statics to load google code (can only call load once)
//=================================
//
//we need to make sure we try to load only once
var googleLoadCalled = false;
var googleChartLoaded = false;

var instances = [];
function addInstance(instance) {
    instances.push(instance);
}

function onLibLoad() {
    for(var i = 0; i < instances.length; i++) {
        var instance = instances[i];
        googleChartLoaded = true;
        instance.onLibLoaded();
    }
}

let GoogleChartComponent;

//=====================================
//Init Function - module definition here, using passed in apogee sources
//=====================================
export function initApogeeModule(apogee,apogeeapp,apogeeutil) {

    //===================================
    // Google Chart Component
    //===================================

    /** This is a simple google chart component. */
    GoogleChartComponent = class extends apogeeapp.BasicControlComponent {
        
        constructor(workspaceUI,control) {
            super(workspaceUI,control,GoogleChartComponent);

            this.chartType = GoogleChartComponent.DEFAULT_CHART;

            //if not yet done, load the google chart library
            if(!googleLoadCalled) {
                googleLoadCalled = true;
                google.charts.load('current', {packages: ['corechart']});
                google.charts.setOnLoadCallback(onLibLoad);
            }
            
            this._setStoredData(GoogleChartComponent.DEFAULT_STORED_DATA);
        }
            
        /** Implement the method to get the data display. JsDataDisplay is an 
        * easily configurable data display. */
        getOutputDisplay(viewMode) {
            this.chartDisplay = new GoogleChartDisplay(viewMode,this.getMember());
            //set the config data
            this.chartDisplay.setChartType(this.chartType);
            this.chartDisplay.setHasHeaderRow(this.hasHeaderRow);
            return this.chartDisplay;
        }

        //==================================
        // overrides for alternate "code" entry
        //==================================
        
        getTableEditSettings() {
            return GoogleChartComponent.TABLE_EDIT_SETTINGS;
        }
        
        /** This method should be implemented to retrieve a data display of the give type. 
         * @protected. */
        getDataDisplay(viewMode,viewType) {
            
            if(viewType == GoogleChartComponent.VIEW_INPUT_FORM) {
                var callbacks = {
                    getData: () => this.storedData,
                    getEditOk: () => true,
                    saveData: (formData) => this._onSubmit(formData)
                }
                return new apogeeapp.ConfigurableFormEditor(viewMode,callbacks,GoogleChartComponent.FORM_LAYOUT);
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

            var commandData = {};
            commandData.type = "saveMemberCode";
            commandData.memberFullName = member.getFullName();
            commandData.argList = member.getArgList();
            commandData.functionBody = functionBody;
            commandData.supplementalCode = member.getSupplementalCode();;
            
            apogeeapp.Apogee.getInstance().executeCommand(commandData);
            return true;
        }       
        
        //=====================================
        // Static Methods
        //=====================================
        
        writeToJson(json) {
            json.formData = this.storedData;
        }

        readFromJson(json) {
            if(json.formData !== undefined) {
                this._setStoredData(json.formData);
            }
        }
                

    };

    //attach the standard static values to the static object (this can also be done manually)
    apogeeapp.BasicControlComponent.attachStandardStaticProperties(GoogleChartComponent,
            "GoogleChartComponent",
            "apogeeapp.app.GoogleChartComponent");

    GoogleChartComponent.VIEW_INPUT_FORM = "Input";

    GoogleChartComponent.VIEW_MODES = [
        apogeeapp.BasicControlComponent.VIEW_OUTPUT,
        GoogleChartComponent.VIEW_INPUT_FORM,
        apogeeapp.BasicControlComponent.VIEW_DESCRIPTION
    ];

    GoogleChartComponent.TABLE_EDIT_SETTINGS = {
        "viewModes": GoogleChartComponent.VIEW_MODES,
        "defaultView": apogeeapp.BasicControlComponent.VIEW_OUTPUT
    }

    GoogleChartComponent.DEFAULT_STORED_DATA = {
        chartType: "line",
        hasHeaderRow: false
    };

    //format for entries below [ display name , enumeration name, Google constructor name] 
    GoogleChartComponent.CHART_TYPE_INFO = [
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

    GoogleChartComponent.CHART_SELECT_FORM_INFO = GoogleChartComponent.CHART_TYPE_INFO.map(entry => entry.slice(0,2));

    GoogleChartComponent.FORM_LAYOUT = {
        layout: [
            {
                type: "spacer"
            },
            {   
                type: "dropdown",
                label: "Chart Type: ",
                entries: GoogleChartComponent.CHART_SELECT_FORM_INFO,
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
        ]
    };

    //-----------------
    //auto registration
    //-----------------
    var app = apogeeapp.Apogee.getInstance();
    if(app) {
        app.registerComponent(GoogleChartComponent);
    }
    else {
        console.log("Component could not be registered because no Apogee app instance was available at component load time: apogeeapp.app.GoogleChartComponent");
    }

    //-----------------------
    // data display
    //-----------------------

    /** Extend ths JsDataDisplay */
    let GoogleChartDisplay = class extends apogeeapp.DataDisplay {
        
        //=====================================
        // Public Methods
        //=====================================
        
        constructor(viewMode,member) {
            
            var callbacks = {
                getData: () => this.member.getData()
            }
            
            super(viewMode,callbacks,apogeeapp.DataDisplay.SCROLLING);
        
            this.member = member;
            //create a content element of variable size in the top left of the parent
            //the chart library will set the size to match the rendered chart
            this.element = apogeeapp.apogeeui.createElement("div");
            this.element.style =  {
                position:"relative",
                overflow:"auto"
            };

            if(!googleChartLoaded) {
                //register this instance
                addInstance(this);
            }
            else {
                this.libLoaded = true;
            }
        }
        
        //This gets the content for the display
        getContent() {
            return this.element;
        }
        
        //this method tells the window the type of content:
        //apogeeui.RESIZABLE - if the window can freely resize it
        //apogeeui.FIXED_SIZE - if the content is fixed size
        getContentType() {
            return apogeeapp.apogeeui.FIXED_SIZE;
        }

        setData(data) {
            this.data = data;
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
            var chartInfoEntry = GoogleChartComponent.CHART_TYPE_INFO.find(entry => (entry[1] == this.chartType) );
            if(!chartInfoEntry) {
                alert("Chart type not found: " + this.chartType);
            }
            else {
                var constructorName = chartInfoEntry[2];
                return new google.visualization[constructorName](this.element);
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

}

export function removeApogeeModule(apogee,apogeeapp,apogeeutil) {
    var app = apogeeapp.Apogee.getInstance();
    if(app) {
        app.unregisterComponent(GoogleChartComponent);
    }
}

