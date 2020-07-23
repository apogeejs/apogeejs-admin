import Chart from "./chartjs.esm.js";

//These are in lieue of the import statements
let { DataDisplay,ComponentView,ConfigurableFormEditor,AceTextEditor} = apogeeview;
let { getFormResultFunctionBody } = apogeeui;

/** This is a graphing component using ChartJS. It consists of a single data table that is set to
 * hold the generated chart data. The input is configured with a form, which gives multiple options
 * for how to set the data. */
export default class ChartJSComponentView extends ComponentView {

    constructor(modelView,component) {
        super(modelView,component);
    };

    /**  This method retrieves the table edit settings for this component instance
     * @protected */
    getTableEditSettings() {
        return ChartJSComponentView.TABLE_EDIT_SETTINGS;
    }

    /** This method should be implemented to retrieve a data display of the give type. 
     * @protected. */
    getDataDisplay(displayContainer,viewType) {

        var dataSource;

        //create the new view element;
        switch(viewType) {

            case ChartJSComponentView.VIEW_CHART:
                dataSource = this._getChartDataSource();
                return new ChartJSDisplay(displayContainer,dataSource);

            case ChartJSComponentView.VIEW_INPUT:
                dataSource = this._getInputFormDataSource();
                return new ConfigurableFormEditor(displayContainer,dataSource);

            case ChartJSComponentView.VIEW_CONFIG_DATA:
                dataSource = this._getConfigDebugDataSource();
                return new AceTextEditor(displayContainer,dataSource,"ace/mode/json",AceTextEditor.OPTION_SET_DISPLAY_SOME);

            default:
                alert("unrecognized view element!");
                return null;
        }
    }

    //=================================
    // Implementation Methods
    //=================================

    /** This is the input source for the chart data display */
    _getChartDataSource() {

        return {
            doUpdate: () => {
                //update the display when the member data is updated.
                //NOTE - we only want to update the data from the form and its generated function
                //we should prevent someone else from updating it.
                let reloadData = this.getComponent().isMemberDataUpdated("member");
                let reloadDataDisplay = false;
                return {reloadData,reloadDataDisplay};
            },

            getData: () => {
                return this._getChartConfig();
            },
        }
    }

    /** This is the data source for the input form data display */
    _getInputFormDataSource() {
        return {
            doUpdate: () => {
                //data updates should only be triggered by the form itself
                let reloadData = this.getComponent().isMemberDataUpdated("member");
                //form layout constant
                let reloadDataDisplay = false;
                return {reloadData,reloadDataDisplay};
            }, 
            getDisplayData: () => _getFormLayout(),
            getData: () => this._getFormData(),
            getEditOk: () => true,
            saveData: (formData) => this._onSubmit(formData)
        }
    }

    /** This shows the raw data value for the component data member. */
    _getConfigDebugDataSource() {

        return {
            doUpdate: () => {
                //update the display when the member data is updated.
                //NOTE - we only want to update the data from the form and its generated function
                //we should prevent someone else from updating it.
                let reloadData = this.getComponent().isMemberDataUpdated("member");
                let reloadDataDisplay = false;
                return {reloadData,reloadDataDisplay};
            },

            getData: () => {
                //return JSON.stringify(this._getChartConfig(),null,"\t");
                return JSON.stringify(this.getComponent().getMember().getData(),null,"\t");
            },
        }
    }
    
    //=====================================
    // Private Methods
    //=====================================

    /** This method gets the form value data that will be passed to the input form. */
    _getFormData() {
        let memberData = this.getComponent().getMember().getData();
        if((memberData)&&(memberData.storedFormValue)) {
            return memberData.storedFormValue;
        }
        else {
            return DEFAULT_FORM_DATA_EXPORT;
        }
    }

    /** This method loads the config structure that will be passed to the chart data display. */
    _getChartConfig() {
        try {
            //chart data is held as member value, calculated by formula generated from form input
            let memberData = this.getComponent().getMember().getData();

            let chartConfig;

            if(memberData.inputType == "rawConfig") {
                //raw chart config entered
                //for chart js, this must be a editable, so we will make a copy
                chartConfig = apogeeutil.jsonCopy(memberData.configData);
            }
            else if(memberData.inputType == "json") {
                let chartJson = memberData.jsonData;
                chartConfig = this._getModuleJsonChartConfig(chartJson);
            }
            else if(memberData.inputType == "form") {
                let chartJson = memberData.formData;
                chartConfig = this._getModuleJsonChartConfig(chartJson);
            }

            return chartConfig;
        }
        catch(error) {
            if(error.stack) console.error(error.stack);
            return {};
        }
    }

    /** This function reads the chart data in the local module format and converts it to 
     * ChartJS format. */
    _getModuleJsonChartConfig(chartData) {

        //ADD ERROR CHECKING!

        //---------------------------
        //get the values, factoring in defaults and calculated items
        //---------------------------
        let chartType = chartData.chartType;
        
        //general/graph options
        let chartOptions = chartData.chartOptions;

        //x value input type
        let commonXValues = chartData.xValues;
        let missingSeriesXValues = false;

        //data sets
        let dataSeriesInput = chartData.dataSeries;
        let maxYValuesCount = 0;
        let dataSeries = dataSeriesInput.map( dataSeriesEntry => {
            let entry = {};
            //set options values
            
            let seriesOptions = dataSeriesEntry.seriesOptions;
            if(!seriesOptions) seriesOptions = {};
            Object.assign(entry,seriesOptions);

            //construct data array, according to input type
            let seriesXValues = dataSeriesEntry.xValues;
            let seriesYValues = dataSeriesEntry.yValues;
            if(seriesXValues) {
                //construct data array as a point object list
                entry.data = [];
                let minLength = (seriesXValues.length < seriesXValues.length) ? seriesXValues.length : seriesYValues.length;
                for(let i = 0; i < minLength; i++) {
                    entry.data.push( {x:seriesXValues[i], y:seriesYValues[i]} );
                }
            }
            else {
                //construct data array as simple value list
                entry.data = seriesYValues;
                missingSeriesXValues = true;
            }

            //count the longest data array, in case we need to make a default x value array
            if(entry.data.length > maxYValuesCount) maxYValuesCount = entry.data.length


            return entry;
        })

        //common x values array - assign as integers if used but not provided
        if((missingSeriesXValues)&&((!commonXValues)||((commonXValues.length == 0)&&(maxYValuesCount > 0)))) {
            commonXValues = [];
            for(let i = 0; i < maxYValuesCount; i++) {
                commonXValues.push(i);
            }
        }

        //---------------------------
        //construct the chart config
        //---------------------------
        let chartConfig = {};
        chartConfig.type = chartType;

        chartConfig.data = {};
        if(missingSeriesXValues) chartConfig.data.labels = commonXValues;
        chartConfig.data.datasets = dataSeries;
        chartConfig.options = chartOptions;

        return chartConfig;

    }
    
    /** This method saves the form result converted to a function body that handles expression inputs.
     * This is saved to the formula for the member object. */
    _onSubmit(formData) {
        //load the form meta - we have to look it up from the data display (this is a little clumsy)
        let formMeta;
        let formEditor = this.getCurrentDataDisplayInstance(ChartJSComponentView.VIEW_INPUT);
        if(formEditor) {
            formMeta = formEditor.getFormMeta();
        }

        if(!formMeta) {
            //data display should be present if the person submitted the form
            console.error("Unknown error loading the form meta value.");
            //return true indicates the submit is completed
            return true;
        }
        
        //get the function body
        let functionBody = getFormResultFunctionBody(formData,formMeta);

        //set the code
        var member = this.getComponent().getMember();

        var commandData = {};
        commandData.type = "saveMemberCode";
        commandData.memberId = member.getId();
        commandData.argList = [];
        commandData.functionBody = functionBody;
        commandData.supplementalCode = "";
        
        let app = this.getModelView().getApp();
        app.executeCommand(commandData);

        //if we got this far the form save should be accepted
        return true;
    }       

}

let DEFAULT_FORM_DATA_EXPORT = {
    "chartType": "line"
}

let DEFAULT_FORM_DATA_VALUES = {
    "inputType": "form",
    "formPanel": {
        "chartType": "line",
        "xValuesType": "common",
        "xValues": [],
        "dataSeries": [],
        "chartOptions": {}
    }
}

let DEFAULT_CHART_DATA_INFO = {
    "chartType": "line",
    "dataSeries": []
}

let CHART_TYPE_VALUES = ["bar","line"];
let X_TYPE_VALUES = ["common","paired"];

function _getFormLayout() {
    return [
        {
            type: "radioButtonGroup",
            label: "Input Type: ",
            entries: [["Form","form"],["JSON","json"],["Raw ChartJS Config","rawConfig"]],
            horizontal: true,
            value: "form", //initial default
            key: "inputType"
        },    
        {
            type: "textField",
            label: "JSON Config: ",
            key: "jsonData",
            selector: {
                parentKey: "inputType",
                parentValue: "json"
            },
            meta: {
                "expression": "simple"
            }
        },
        {
            type: "textField",
            label: "ChartJS Config: ",
            key: "configData",
            selector: {
                parentKey: "inputType",
                parentValue: "rawConfig"
            },
            meta: {
                "expression": "simple"
            }
        },
        {
            type: "panel",
            selector: {
                parentKey: "inputType",
                parentValue: "form"
            },
            formData: [
                {   
                    type: "dropdown",
                    label: "Chart Type: ",
                    entries: [["Bar","bar"],["Line","line"]],
                    value: "line", //initial default
                    key: "chartType"
                },  
                {   
                    type: "radioButtonGroup",
                    label: "Specifying X Values: ",
                    entries: [["Common Values","common"],["Per Series Values","paired"]],
                    value: "common", //initial default
                    horizontal: true,
                    key: "xValuesType"
                },
                {   
                    type: "textField",
                    label: "Common X Values: ",
                    key: "xValues",
                    selector: {
                        parentKey: "xValuesType",
                        parentValue: "common"
                    },
                    meta: {
                        "expression": "simple"
                    }
                },
                {   
                    type: "textField",
                    label: "Plot Series Data: ",
                    key: "dataSeries",
                    meta: {
                        "expression": "simple"
                    }
                },
                {   
                    type: "textField",
                    label: "Chart Options: ",
                    key: "chartOptions",
                    meta: {
                        "expression": "simple"
                    }
                }
            ],
            key: "formData",
            meta: {
                "expression": "object"
            }
        }
    ];
}

//======================================
// Static properties
//======================================

ChartJSComponentView.VIEW_CHART = "Chart";
ChartJSComponentView.VIEW_INPUT = "Input";
ChartJSComponentView.VIEW_CONFIG_DATA = "Config (Debug)";

ChartJSComponentView.VIEW_MODES = [
	ChartJSComponentView.VIEW_CHART,
    ChartJSComponentView.VIEW_INPUT,
    ChartJSComponentView.VIEW_CONFIG_DATA
];

ChartJSComponentView.TABLE_EDIT_SETTINGS = {
    "viewModes": ChartJSComponentView.VIEW_MODES,
    "defaultView": ChartJSComponentView.VIEW_CHART
}

//===============================
// External Settings
//===============================

/** This is the component name with which this view is associated. */
ChartJSComponentView.componentName = "apogeeapp.ChartJSCell";

/** If true, this indicates the component has a tab entry */
ChartJSComponentView.hasTabEntry = false;
/** If true, this indicates the component has an entry appearing on the parent tab */
ChartJSComponentView.hasChildEntry = true;

/** This is the icon url for the component. */
ChartJSComponentView.ICON_RES_PATH = "/componentIcons/chartControl.png";


//================================
// Chart Data Display
//================================
class ChartJSDisplay extends DataDisplay {
    
    constructor(viewMode,dataSource) {
        super(viewMode,dataSource);

        //we need to reuse thei configuration object
        this.config = {
            type: "bar",
            data: {
                datasets:[]
            },
            options: {}
        };
        this.prevOptions = this.config.options;
        
        //populate the UI element
        this.contentElement = document.createElement("div");
        this.contentElement.style = "position: relative; width: 800px; overflow: none;"
        
        this.canvasElement = document.createElement("canvas");
        this.canvasElement.style = "position: relative;";

        this.contentElement.appendChild(this.canvasElement);

        //this.chart = new Chart(this.canvasElement,this.config);
    }
    
    /** This method returns the content element for the data display REQUIRED */
    getContent() {
        return this.contentElement;
    }
    
    /** This sets the data into the editor display. REQUIRED */
    setData(config) {

        if((!config)||(config === apogeeutil.INVALID_VALUE)) {
            config = DEFAULT_CHART_CONFIG;
        }

        //make a new chart if there is no chart or if the options change (I am not sure about this criteria exactly)
        if((!this.chart)||(!apogeeutil.jsonEquals(this.prevOptions,config.options))) {
            if(this.chart) this.chart.destroy();
            this.config = config;
            try {
                this.chart = new Chart(this.canvasElement,this.config);
            }
            catch(error) {
                console.log("Error loading chart: " + error.toString());
                if(error.stack) console.error(error.stack);
            }
        }
        else {
            //we need to copy our new data into the existing config object
            this.config.type = config.type;
            this.config.options = config.options;
            //the chart modifies the data so we will make a copy
            this.config.data = apogeeutil.jsonCopy(config.data);

            try {
                this.chart.update();
            }
            catch(error) {
                console.log("Error loading chart: " + error.toString());
                if(error.stack) console.error(error.stack);
            }
        }

        //save the options for next time
        this.prevOption = config.options;
    }

    /** This method is called on loading the display. OPTIONAL */
    // onLoad() {
    // }
}

let DEFAULT_CHART_CONFIG = {
    data: {
        datasets: []
    },
    options: {}
}

