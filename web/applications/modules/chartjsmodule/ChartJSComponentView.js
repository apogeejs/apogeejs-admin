import DataDisplay from "/apogeeview/datadisplay/DataDisplay.js";
import apogeeui from "/apogeeui/apogeeui.js";
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

    _getFormData() {
        let memberData = this.getComponent().getMember().getData();
        if((memberData)&&(memberData.storedData)) {
            return memberData.storedData;
        }
        else {
            return DEFAULT_FORM_DATA;
        }
    }

    _getChartConfig() {
        let memberData = this.getComponent().getMember().getData();

        if(!memberData) return DEFAULT_GRAPH_CONFIG;

        let chartType = memberData.chartType ? memberData.chartType : DEFAULT_GRAPH_CONFIG.chartType;
        let options = memberData.options ? memberData.options : DEFAULT_GRAPH_CONFIG.options;

        let datasetOptions = memberData.datasetOptions ? memberData.datasetOptions : {};

        let plotData = memberData.plotData ? memberData.plotData : [];
        let plotPoints = plotData.map( (yValue,index) => {
            return {x: index, y: yValue};
        });

        let dataset = {};
        Object.assign(dataset,datasetOptions);
        dataset.data = plotPoints;

        let chartConfig = {};
        chartConfig.type = chartType
        chartConfig.data = {};
        chartConfig.data.datasets = []
        chartConfig.data.datasets.push(dataset);
        chartConfig.options = options;

        return chartConfig;
    }
    
    _onSubmit(formData) {
        
        //options or columns may be the empty string - map this to undefined
        let chartType = formData.chartType;
        if(chartType == "") chartType = DEFAULT_GRAPH_CONFIG.type;

        let plotData = formData.plotData;
        if(plotData == "") plotData = "[]";

        let datasetOptions = formData.datasetOptions;
        if(datasetOptions == "") datasetOptions = "{}";

        let options = formData.options;
        if(options == "") options = "{}";

        //compile the function body
        //I think it is just a little hokey putting the form data in with the formula, but I am not sure of a better option.
        var functionBody = 
`
return {
    "chartType": "${chartType}",
    "plotData": ${plotData},
    "datasetOptions": ${datasetOptions},
    "options": ${options},
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

        return true;
    }       
    

}

let DEFAULT_FORM_DATA = {
    "type": "line"
}

let DEFAULT_GRAPH_CONFIG = {
    type: "line",
    data: {
        datasets: [
            {
                data: []
            }
        ]
    },
    options: {

    }
}

let FORM_LAYOUT = [
    {   
        type: "dropdown",
        label: "Chart Type: ",
        entries: ["bar","line"],
        value: "<SET CURRENT VALUE",
        key: "chartType"
    },
    {   
        type: "textField",
        label: "Plot Data: ",
        key: "plotData"
    },
    {   
        type: "textField",
        label: "Dataset Options: ",
        key: "datasetOptions"
    },
    {   
        type: "textField",
        label: "Graph Options: ",
        key: "options"
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

