import DataDisplay from "/apogeeview/datadisplay/DataDisplay.js";
import ComponentView from "/apogeeview/componentdisplay/ComponentView.js";
import ConfigurableFormEditor from "/apogeeview/datadisplay/ConfigurableFormEditor.js";

/** This is the base class for a  basic control component. To create a
 * new control component, extend this class implementing the needed methods
 * and create a generator. */
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
                let reloadData = false;
                //form layout constant
                let reloadDataDisplay = false;
                return {reloadData,reloadDataDisplay};
            }, 
            getDisplayData: () => FORM_LAYOUT,
            getData: () => this._getFormData(),
            getEditOk: () => true,
            saveData: (formData) => this._onSubmit(formData)
        }
    }
    
        //=====================================
        // Private Methods
        //=====================================

    /** This method gets the form value data that will be passed to the input form. */
    _getFormData() {
        let memberData = this.getComponent().getMember().getData();
        if((memberData)&&(memberData.storedData)) {
            return memberData.storedData;
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
            if(!memberData) memberData = DEFAULT_FORM_DATA_VALUES;

            //---------------------------
            //get the values, factoring in defaults and calculated items
            //---------------------------
            let chartType = memberData.chartType;
            
            //general/graph options
            let generalOptions = memberData.generalOptions;

            //x value input type
            let xValuesInputType = memberData.xValuesInputType;

            //data sets
            let datasetsInput = memberData.datasets;
            let maxYArrayLength = 0;
            let datasets = datasetsInput.map( datasetEntry => {
                let entry = {};
                //set options values
                
                let datasetOptions = datasetEntry.datasetOptions;
                if(!datasetOptions) datasetOptions = {};
                Object.assign(entry,datasetOptions);

                //construct data array, according to input type
                let plotDataXInput = datasetEntry.xArray;
                let plotDataYInput = datasetEntry.yArray;
                if(xValuesInputType == "paired") {
                    //construct data array as a point object list
                    entry.data = [];
                    for(let i = 0; i < plotDataXInput.length; i++) {
                        entry.data.push( {x:plotDataXInput[i], y:plotDataYInput[i]} );
                    }
                }
                else {
                    //construct data array as simple value list
                    entry.data = plotDataYInput;
                }

                //count the longest data array, in case we need to make a default x value array
                if(entry.data.length > maxYArrayLength) maxYArrayLength = entry.data.length


                return entry;
            })

            //common x value array
            let commonXValueArray;
            if(xValuesInputType == "common") {
                commonXValueArray = memberData.commonXValueArray
                
                //construct a default array if values not specified and we have datasets
                if((commonXValueArray.length == 0)&&(maxYArrayLength > 0)) {
                    commonXValueArray = [];
                    for(let i = 0; i < maxYArrayLength; i++) {
                        commonXValueArray.push(i);
                    }
                }
            }

            //---------------------------
            //construct the chart config
            //---------------------------
            let chartConfig = {};
            chartConfig.type = chartType;

            chartConfig.data = {};
            if(xValuesInputType == "common") chartConfig.data.labels = commonXValueArray;
            chartConfig.data.datasets = datasets;
            chartConfig.options = generalOptions;

            return chartConfig;
        }
        catch(error) {
            if(error.stack) console.log(error.stack);
            return {};
        }
    }
    
    /** This method receives the form input data. It does validation to accept or reject the data. If data is saved here
     * it should meet minimum validate criteria. Otherwise there should be an error when the user tries to save. */
    _onSubmit(formData) {

        let errorMessages = [];
        
        //read in and validate all data
        let chartType = formData.chartType;
        if(CHART_TYPE_VALUES.indexOf(chartType) < 0) errorMessages.push("The chart type must be set");

        let xValuesInputType = formData.xValuesInputType;
        if(X_INPUT_TYPE_VALUES.indexOf(xValuesInputType) < 0) errorMessages.push("The X value specification type must be set");
        
        let commonXValueArray = formData.commonXValueArray;
        if(commonXValueArray == "") commonXValueArray = "[]";

        let datasets = formData.datasets;
        if(datasets == "") datasets = "[]";

        let generalOptions = formData.generalOptions;
        if(generalOptions == "") generalOptions = "{}";

        //handle error case here
        if(errorMessages.length > 0) {
            //reject for input
            let errorMsg = errorMessages.join("; ");
            alert(errorMsg);
            return false;
        }

        //compile the function body
        //I think it is just a little hokey putting the form data in with the formula, but I am not sure of a better option.
        var functionBody = `
    return {
        "chartType": "${chartType}",
        "xValuesInputType": "${xValuesInputType}",
        "commonXValueArray": ${commonXValueArray},
        "datasets": ${datasets},
        "generalOptions": ${generalOptions},
        "storedData": ${JSON.stringify(formData)}
    };`;

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
    "chartType": "line",
    "xValuesInputType": "common",
    "commonXValueArray": [],
    "datasets": [],
    "generalOptions": {}
}

let CHART_TYPE_VALUES = ["bar","line"];
let X_INPUT_TYPE_VALUES = ["common","paired"];

let FORM_LAYOUT = [
    {   
        type: "dropdown",
        label: "Chart Type: ",
        entries: [["Bar","bar"],["Line","line"]],
        value: "<SET CURRENT VALUE>",
        key: "chartType"
    },
    {   
        type: "radioButtonGroup",
        label: "Specifying X Values: ",
        entries: [["One Common Array","common"],["Per Series Arrays","paired"]],
        value: "<SET CURRENT VALUE>",
        key: "xValuesInputType"
    },
    {   
        type: "textField",
        label: "Common X Value Array: ",
        key: "commonXValueArray"
    },
    {   
        type: "textField",
        label: "Plot Series Data: ",
        key: "datasets"
    },
    {   
        type: "textField",
        label: "General Options: ",
        key: "generalOptions"
    }
]

//======================================
// Static properties
//======================================

ChartJSComponentView.VIEW_CHART = "Chart";
ChartJSComponentView.VIEW_INPUT = "Input";

ChartJSComponentView.VIEW_MODES = [
	ChartJSComponentView.VIEW_CHART,
	ChartJSComponentView.VIEW_INPUT,
];

ChartJSComponentView.TABLE_EDIT_SETTINGS = {
    "viewModes": ChartJSComponentView.VIEW_MODES,
    "defaultView": ChartJSComponentView.VIEW_CHART
}

//===============================
// External Settings
//===============================

/** This is the component name with which this view is associated. */
ChartJSComponentView.componentName = "apogeeapp.app.ChartJSComponent";

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

        if(config) {
            //we need to copy our data onto the existing config object
            this.config.type = config.type;
            this.config.options = config.options;
            //the chart modifies the data so we will make a copy
            this.config.data = apogeeutil.jsonCopy(config.data);
        }
        else {
            //set data for an empty chart
            this.config.data = {
                datasets: []
            }
            this.config.options = {};
        }

        //make a new chart if there is no chart or if the options change (I am not sure about this criteria exactly)
        if((!this.chart)||(!apogeeutil.jsonEquals(this.prevOptions,config.options))) {
            this.chart = new Chart(this.canvasElement,this.config);
        }
        else {
            this.chart.update();
        }

        //save the options for next time
        this.prevOption = config.options;
    }

    /** This method is called on loading the display. OPTIONAL */
    // onLoad() {
    // }
}

