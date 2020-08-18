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
                let reloadDataDisplay = this.getComponent().isFieldUpdated("chartType");
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
                let reloadDataDisplay = this.getComponent().isFieldUpdated("chartType");
                return {reloadData,reloadDataDisplay};
            }, 
            getDisplayData: () => _getFormLayout(this.getComponent().getChartType()),
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
                let reloadDataDisplay = this.getComponent().isFieldUpdated("debugOutputType");
                return {reloadData,reloadDataDisplay};
            },

            getData: () => {
                let debugChartConfig = this.getComponent().getField("debugOutputType")
                if(debugChartConfig == "Chart Config") {
                    return JSON.stringify(this._getChartConfig(),null,"\t")
                }
                else {
                    return JSON.stringify(this.getComponent().getMember().getData(),null,"\t");
                }
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
            return {};
        }
    }

    /** This method loads the config structure that will be passed to the chart data display. */
    _getChartConfig() {
        try {
            //chart data is held as member value, calculated by formula generated from form input
            let memberData = this.getComponent().getMember().getData();

            let chartConfig;
            let chartType = this.getComponent().getChartType();

            if(memberData) {
                if(memberData.inputType == "rawConfig") {
                    //raw chart config entered
                    //for chart js, this must be a editable, so we will make a copy
                    chartConfig = apogeeutil.jsonCopy(memberData.configData);
                }
                else if(memberData.inputType == "json") {
                    let chartJson = memberData.jsonData;
                    chartConfig = createChartConfig(chartJson,chartType);
                }
                else if(memberData.inputType == "form") {
                    let chartJson = memberData.formData;
                    chartConfig = createChartConfig(chartJson,chartType);
                }
                else {
                    throw new Error("Input error: a valid input type is not given.")
                }
            }
            else {
                //provide empty chart config data
                chartConfig = DEFAULT_CHART_CONFIG_DATA[chartType];
            }

            return chartConfig;
        }
        catch(error) {
            if(error.stack) console.error(error.stack);
            let chartConfig = {
                errorMsg: error.toString()
            }
            return chartConfig;
        }
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

function _getFormLayout(chartType) {
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
            formData: getChartLayout(chartType),
            key: "formData",
            meta: {
                "expression": "object"
            }
        }
    ];
}

const DEFAULT_CHART_CONFIG_DATA = {
    line: {"categoryDataSeries": [] },
    bar: {"categoryDataSeries": [] },
    scatter: {"numericDataSeries": [] }
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

 /** This is configuration for the properties dialog box, the results of which
 * our code will read in. */
ChartJSComponentView.propertyDialogLines = [
    {
        "type":"dropdown",
        "heading":"Chart Types: ",
        "entries":["line","bar","scatter"],
        "resultKey":"chartType"
    },
    {
        "type":"dropdown",
        "heading":"Config Output: ",
        "entries":["JSON","Chart Config"],
        "resultKey":"debugOutputType"
    }
];

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
            type: "line",
            data: {
                datasets:[]
            },
            options: {}
        };
        this.prevOptions = this.config.options;
        
        //populate the UI element
        this.wrapperElement = document.createElement("div");
        this.wrapperElement.style = "position: relative; width: 100%; height: 100%; overflow: auto;";

        this.contentElement = document.createElement("div");
        this.contentElement.style = "position: relative; width: 800px; overflow: none;"

        this.errorElement = document.createElement("div");
        this.errorElement.style = "position: relative; color: red;"
        
        this.canvasElement = document.createElement("canvas");
        this.canvasElement.style = "position: relative;";

        this.contentElement.appendChild(this.canvasElement);
        this.contentElement.appendChild(this.errorElement);
        this.wrapperElement.appendChild(this.contentElement);

        //this.chart = new Chart(this.canvasElement,this.config);
    }
    
    /** This method returns the content element for the data display REQUIRED */
    getContent() {
        return this.wrapperElement;
    }
    
    /** This sets the data into the editor display. REQUIRED */
    setData(config) {

        if((!config)||(config === apogeeutil.INVALID_VALUE)) {
            config = DEFAULT_CHART_CONFIG;
        }
        else if(config.errorMsg) {
            this.showChartErrorMessage(config.errorMsg);
        }
        else {
            //make sure proper elements are showing
            if(this.canvasElement.style.display == "none") this.canvasElement.style.display = "";
            if(this.errorElement.style.display != "none") this.errorElement.style.display = "none";

            //make a new chart if there is no chart or if the options change (I am not sure about this criteria exactly)
            if((!this.chart)||(!apogeeutil.jsonEquals(this.prevOptions,config.options))) {
                if(this.chart) this.chart.destroy();
                this.config = config;
                try {
                    this.chart = new Chart(this.canvasElement,this.config);
                }
                catch(error) {
                    let msg = "Error loading chart: " + error.toString();
                    console.log(msg);
                    if(error.stack) console.error(error.stack);
                    this.showChartErrorMessage(msg);
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
                    let msg = "Error loading chart: " + error.toString();
                    console.log(msg);
                    if(error.stack) console.error(error.stack);
                    this.showChartErrorMessage(msg);
                }
            }
        }

        //save the options for next time
        this.prevOption = config.options;
    }

    showChartErrorMessage(errorMsg) {
        //make sure proper elements are showing
        if(this.canvasElement.style.display != "none") this.canvasElement.style.display = "none";
        if(this.errorElement.style.display == "none") this.errorElement.style.display = "";

        //show the error message
        this.errorElement.innerHTML = "<b>Chart Error: </b>"  + errorMsg;
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

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//code generated using dev chart workspace
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/** This struct gives the information needed to construct the forms for each chart type. */
const CHART_INFO_MAP = {
    line: {
        type: "line",
        usePoint: true,
        useLine: true,
        allowXCategory: true,
        allowXNumeric: true
    },
    bar: {
        type: "bar",
        useRectangle: true,
        allowXCategory: true,
    },
    scatter: {
        type: "scatter",
        usePoint: true,
        allowXNumeric: true
    }
}

/** The constructs the chart form layout for a given chart type. */
function getChartLayout(chartType) {
    let chartInfo = CHART_INFO_MAP[chartType];

    if (!chartInfo) throw new Error("Unrecognized chart type: " + chartType);

    let layout = [];

    if ((chartInfo.allowXNumeric) && (chartInfo.allowXCategory)) {
        layout.push(xValuesTypeElement);
        layout.push(categoryElementWithSelector);
    }
    else if (chartInfo.allowXCategory) {
        layout.push(categoryElement);
    }

    if (chartInfo.allowXNumeric) layout.push(getNumericDataSeriesElement(chartInfo));
    if (chartInfo.allowXCategory) layout.push(getCategoryDataSeriesElement(chartInfo));

    layout.push(getChartOptionsElement(chartInfo));


    return layout;
}


function getNumericDataSeriesElement(chartInfo) {
    let numericDataSeriesLayout = baseNumericDataSeriesDataLayout.concat([getSeriesOptionsElement(chartInfo)]);

    let element = {
        type: "list",
        label: "Plot Series Data",
        entryType: {
            "label": "Data Series",
            "layout": {
                type: "panel",
                formData: numericDataSeriesLayout,
                key: "numericFormDataSeries",
                meta: {
                    expression: "object"
                }
            }
        },
        key: "numericDataSeries",
        meta: {
            "expression": "array"
        }

    }

    //add a selector for this series if we allow both category and numeric
    if ((chartInfo.allowXNumeric) && (chartInfo.allowXCategory)) {
        element.selector = {
            parentKey: "xValuesType",
            parentValue: "numeric"
        };
    }

    return element;
}


function getCategoryDataSeriesElement(chartInfo) {
    let categoryDataSeriesDataLayout = baseCategoryDataSeriesDataLayout.concat([getSeriesOptionsElement(chartInfo)]);

    let element = {
        type: "list",
        label: "Plot Series Data",
        entryType: {
            "label": "Data Series",
            "layout": {
                type: "panel",
                formData: categoryDataSeriesDataLayout,
                key: "categoryFormDataSeries",
                meta: {
                    expression: "object"
                }
            }
        },
        key: "categoryDataSeries",
        meta: {
            "expression": "array"
        }
    }

    //add a selector for this series if we allow both category and numeric
    if ((chartInfo.allowXNumeric) && (chartInfo.allowXCategory)) {
        element.selector = {
            parentKey: "xValuesType",
            parentValue: "category"
        };
    }

    return element;
}


/** These are the options for the series. */
function getSeriesOptionsElement(chartInfo) {
    let panel = {
        type: "showHideLayout",
        heading: "Series Options",
        closed: true,
        formData: [
            {
                type: "panel",
                formData: [],
                key: "options",
                meta: {
                    expression: "object"
                }
            }
        ]
    };

    let insideLayout = panel.formData[0].formData;

    insideLayout.push(seriesLabelElement);
    if (chartInfo.useLine) insideLayout.push(lineConfigElement);
    if (chartInfo.usePoint) {
        if (chartInfo.useLine) {
            //also include he "show" option for pionts if line also used
            insideLayout.push(pointConfigElementWithShow);
        }
        else {
            insideLayout.push(pointConfigElement);
        }
    }
    if (chartInfo.useRectangle) {
        insideLayout.push(rectConfigElement);
    }
    if (chartInfo.useArc) {
        insideLayout.push(arcConfigElement);
    }

    return panel;
}


/** These are the general options for the chart. */
function getChartOptionsElement(chartInfo) {
    //construct the options panel
    let panel = {
        type: "panel",
        formData: [
            {
                type: "showHideLayout",
                heading: "Chart Options",
                closed: true,
                formData: []
            }
        ],
        key: "options",
        meta: {
            expression: "object",
        }
    }

    //populate the inside layout
    let insideLayout = panel.formData[0].formData;

    //if we allow category and numeric axes, we need to include a switch (in axes)
    if ((chartInfo.allowXCategory) && (chartInfo.allowXNumeric)) {
        panel.inherit = [{
            parentKey: "xValuesType",
            childKey: "xValuesType"
        }];
        insideLayout.push(invisibleXValuesTypeElement);
    }

    //universal element
    insideLayout.push(titleConfigElement);
    insideLayout.push(legendConfigElement);

    if (chartInfo.useLine) insideLayout.push(lineConfigElement);
    if (chartInfo.usePoint) {
        if (chartInfo.useLine) {
            //also include he "show" option for pionts if line also used
            insideLayout.push(pointConfigElementWithShow);
        }
        else {
            insideLayout.push(pointConfigElement);
        }
    }
    if (chartInfo.useRectangle) insideLayout.push(rectConfigElement);
    if (chartInfo.useArc) insideLayout.push(arcConfigElement);

    let axesElement = getAxesOptionsElement(chartInfo);
    if (axesElement) insideLayout.push(axesElement);

    return panel;
}


/** This is the axes config section. */
function getAxesOptionsElement(chartInfo) {
    let element = {
        type: "showHideLayout",
        heading: "Axes",
        closed: true,
        formData: []
    }

    //construct x element, if needed
    let xElement;
    if (chartInfo.allowXNumeric) {
        if (chartInfo.allowXCategory) {
            xElement = xAxisConfigElementWithSelector;
        }
        else {
            xElement = xAxisConfigElement;
        }
    }

    //add the axes elements
    if (chartInfo.allowXNumeric) {
        if (xElement) element.formData.push(xElement);
    }
    element.formData.push(yAxisConfigElement);

    return element;
}


const baseNumericDataSeriesDataLayout = [
    {
        type: "dropdown",
        label: "Data Format: ",
        entries: [["X Array and Y Array", "values"], ["XY Point Array", "points"], ["Data Array and X and Y Acccessors", "structs"]],
        value: "values", //default
        key: "dataFormat"
    },
    {
        type: "textField",
        label: "X Values: ",
        key: "xValues",
        selector: {
            parentKey: "dataFormat",
            parentValue: "values"
        },
        meta: {
            "expression": "simple",
            "excludeValue": ""
        }
    },
    {
        type: "textField",
        label: "Y Values: ",
        key: "yValues",
        selector: {
            parentKey: "dataFormat",
            parentValue: "values"
        },
        meta: {
            "expression": "simple",
            "excludeValue": ""
        }
    },
    {
        type: "textField",
        label: "XY Point Array: ",
        key: "xyPoints",
        selector: {
            parentKey: "dataFormat",
            parentValue: "points"
        },
        meta: {
            "expression": "simple",
            "excludeValue": ""
        }
    },
    {
        type: "textField",
        label: "Data Array: ",
        key: "dataArray",
        selector: {
            parentKey: "dataFormat",
            parentValue: "structs"
        },
        meta: {
            "expression": "simple",
            "excludeValue": ""
        }
    },
    {
        type: "textField",
        label: "X Accessor: ",
        key: "xAccessor",
        selector: {
            parentKey: "dataFormat",
            parentValue: "structs"
        },
        meta: {
            "expression": "simple",
            "excludeValue": ""
        }
    },
    {
        type: "textField",
        label: "Y Accessor: ",
        key: "yAccessor",
        selector: {
            parentKey: "dataFormat",
            parentValue: "structs"
        },
        meta: {
            "expression": "simple",
            "excludeValue": ""
        }
    }
];

/** This is the data series input for category data. Category data must be input as a common x category array for all the data series. */
const baseCategoryDataSeriesDataLayout = [
    {
        type: "dropdown",
        label: "Data Type: ",
        entries: [["Y Array", "values"], ["Data Array and Y Acccessor", "structs"]],
        value: "values", //default
        key: "dataType"
    },
    {
        type: "textField",
        label: "Y Values: ",
        key: "yValues",
        selector: {
            parentKey: "dataType",
            parentValue: "values"
        },
        meta: {
            "expression": "simple",
            "excludeValue": ""
        }
    },
    {
        type: "textField",
        label: "Data Array: ",
        key: "dataArray",
        selector: {
            parentKey: "dataType",
            parentValue: "structs"
        },
        meta: {
            "expression": "simple",
            "excludeValue": ""
        }
    },
    {
        type: "textField",
        label: "Y Accessor: ",
        key: "yAccessor",
        selector: {
            parentKey: "dataType",
            parentValue: "structs"
        },
        meta: {
            "expression": "simple",
            "excludeValue": ""
        }
    }
];

/** The layout configures the title of the chart. */
const titleConfigElement = {
    type: "showHideLayout",
    heading: "Title",
    closed: true,
    formData: [
        {
            type: "panel",
            formData: [
                {
                    type: "checkbox",
                    label: "Show: ",
                    value: false,
                    key: "display"
                },
                {
                    type: "textField",
                    label: "Text: ",
                    key: "text",
                    meta: {
                        "excludeValue": ""
                    }
                },
                {
                    type: "dropdown",
                    label: "Font Size: ",
                    entries: [["Use Default", "default"], ["10px", 10], ["12px", 12], ["14px", 14], ["18px", 18], ["24px", 24], ["36px", 36], ["48px", 48]],
                    key: "fontSize",
                    meta: {
                        "excludeValue": "default"
                    }
                },
                {
                    type: "horizontalLayout",
                    formData: [
                        {
                            type: "radioButtonGroup",
                            label: "Font Color: ",
                            entries: [["Use Default", false], ["Select", true]],
                            horizontal: true,
                            value: false,
                            key: "selectColor"
                        },
                        {
                            type: "colorPicker",
                            key: "fontColor",
                            value: "#0000ff", //this is a dummy default value, otherwise we get black
                            selector: {
                                parentKey: "selectColor",
                                parentValue: true
                            }
                        }
                    ]
                }
            ],
            key: "title",
            meta: {
                "expression": "object"
            }
        }
    ]
}

/** This layout configures the layout of the chart. */
const legendConfigElement = {
    type: "showHideLayout",
    heading: "Legend",
    closed: true,
    formData: [
        {
            type: "panel",
            formData: [
                {
                    type: "horizontalLayout",
                    formData: [
                        {
                            type: "checkbox",
                            label: "Show: ",
                            value: true,
                            key: "display"
                        },
                        {
                            type: "dropdown",
                            label: "Position: ",
                            entries: ["default", "top", "bottom", "right", "left"],
                            value: "default",
                            key: "position",
                            selector: {
                                parentKey: "display",
                                parentValue: true
                            },
                            meta: {
                                "excludeValue": "default"
                            }
                        }
                    ]
                }
            ],
            key: "legend",
            meta: {
                "expression": "object"
            }
        }
    ]
}

const basePointConfigElement = {
    type: "panel",
    formData: [
        {
            type: "dropdown",
            label: "Symbol: ",
            entries: [["Use Default", "default"], 'circle', 'cross', 'dash', 'line', 'rect', 'rectRounded', 'rectRot', 'star', 'triangle'],
            value: "default",
            key: "pointStyle",
            meta: {
                "excludeValue": "default"
            }
        },
        {
            type: "dropdown",
            label: "Radius: ",
            entries: [["Use Default", "default"], ["1px", 1], ["2px", 2], ["3px", 3], ["5px", 5], ["7px", 7], ["10px", 10]],
            key: "radius",
            meta: {
                "excludeValue": "default"
            }
        },
        {
            type: "horizontalLayout",
            formData: [
                {
                    type: "radioButtonGroup",
                    label: "Color: ",
                    entries: [["Use Default", false], ["Select", true]],
                    horizontal: true,
                    value: false,
                    key: "selectColor"
                },
                {
                    type: "colorPicker",
                    key: "borderColor",
                    value: "#0000ff", //this is a dummy default value, otherwise we get black
                    selector: {
                        parentKey: "selectColor",
                        parentValue: true
                    }
                }
            ]
        },
        {
            type: "dropdown",
            label: "Weight: ",
            entries: [["Use Default", "default"], ["1px", 1], ["2px", 2], ["3px", 3], ["5px", 5], ["7px", 7], ["10px", 10]],
            key: "borderWidth",
            meta: {
                "excludeValue": "default"
            }
        }
    ],
    key: "point",
    meta: {
        "expression": "object"
    }
};

const pointConfigElement = {
    type: "showHideLayout",
    heading: "Point Style",
    closed: true,
    formData: [
        basePointConfigElement
    ]
};

/** Here we are adding an option to show or hide the points. */
const showPointsElement = {
    type: "radioButtonGroup",
    label: "Show Points: ",
    entries: [["Use Default", "default"], ["Show", true], ["Don't Show", false]],
    horizontal: true,
    value: "default",
    key: "showPoints",
    meta: {
        "excludeValue": "default"
    }
}

const pointConfigElementWithShow = (() => {
    let element = apogeeutil.jsonCopy(pointConfigElement);
    element.formData[0].formData = [showPointsElement].concat(element.formData[0].formData);
    return element;
})()

const lineConfigElement = {
    type: "showHideLayout",
    heading: "Line Style",
    closed: true,
    formData: [
        {
            type: "panel",
            formData: [
                {
                    type: "horizontalLayout",
                    formData: [
                        {
                            type: "radioButtonGroup",
                            label: "Color: ",
                            entries: [["Use Default", false], ["Select", true]],
                            horizontal: true,
                            value: false,
                            key: "selectColor"
                        },
                        {
                            type: "colorPicker",
                            key: "borderColor",
                            value: "#0000ff", //this is a dummy default value, otherwise we get black
                            selector: {
                                parentKey: "selectColor",
                                parentValue: true
                            }
                        }
                    ]
                },
                {
                    type: "dropdown",
                    label: "Line Width: ",
                    entries: [["Use Default", "default"], ["1px", 1], ["2px", 2], ["3px", 3], ["5px", 5], ["7px", 7], ["10px", 10]],
                    key: "borderWidth",
                    meta: {
                        "excludeValue": "default"
                    }
                },
                {
                    type: "radioButtonGroup",
                    label: "Fill Area Under Line: ",
                    entries: [["Use Default", "default"], ["Don't Show", false], ["Show", true]],
                    value: "default",
                    horizontal: true,
                    key: "fill",
                    meta: {
                        "excludeValue": "default"
                    }
                },
                {
                    type: "horizontalLayout",
                    formData: [
                        {
                            type: "radioButtonGroup",
                            label: "Area Color: ",
                            entries: [["Use Default", false], ["Select", true]],
                            horizontal: true,
                            value: false,
                            key: "selectAreaColor"
                        },
                        {
                            type: "colorPicker",
                            key: "backgroundColor",
                            value: "#0000ff", //this is a dummy default value, otherwise we get black
                            selector: {
                                parentKey: "selectAreaColor",
                                parentValue: true
                            }
                        }
                    ]
                },
                {
                    type: "horizontalLayout",
                    formData: [
                        {
                            type: "radioButtonGroup",
                            label: "Line Tension: ",
                            entries: [["Use Default", "default"], ["Select", true]],
                            value: "default",
                            horizontal: true,
                            key: "doLineTension",
                            meta: {
                                "excludeValue": "default"
                            }
                        },
                        {
                            type: "slider",
                            key: "tension",
                            min: 0,
                            max: .5,
                            step: .05,
                            value: 0,
                            selector: {
                                parentKey: "doLineTension",
                                parentValue: true
                            }
                        }
                    ]
                },
                {
                    type: "dropdown",
                    label: "Span Gaps: ",
                    entries: [["Use Default", "default"], true, false],
                    key: "spanGaps",
                    meta: {
                        "excludeValue": "default"
                    }
                },
                {
                    type: "dropdown",
                    label: "Stepped Line: ",
                    entries: [["Use Default", "default"], false, ["Before", "before"], ["Middle", "middle"], ["After", "after"]],
                    key: "stepped",
                    meta: {
                        "excludeValue": "default"
                    }
                }
            ],
            key: "line",
            meta: {
                "expression": "object"
            }
        }
    ]
};

const rectConfigElement = {
    type: "showHideLayout",
    heading: "Bar Style",
    closed: true,
    formData: [
        {
            type: "panel",
            formData: [
                {
                    type: "horizontalLayout",
                    formData: [
                        {
                            type: "radioButtonGroup",
                            label: "Fill Color: ",
                            entries: [["Use Default", false], ["Select", true]],
                            horizontal: true,
                            value: false,
                            key: "selectAreaColor"
                        },
                        {
                            type: "colorPicker",
                            key: "backgroundColor",
                            value: "#0000ff", //this is a dummy default value, otherwise we get black
                            selector: {
                                parentKey: "selectAreaColor",
                                parentValue: true
                            }
                        }
                    ]
                },
                {
                    type: "horizontalLayout",
                    formData: [
                        {
                            type: "radioButtonGroup",
                            label: "Border Color: ",
                            entries: [["Use Default", false], ["Select", true]],
                            horizontal: true,
                            value: false,
                            key: "selectBorderColor"
                        },
                        {
                            type: "colorPicker",
                            key: "borderColor",
                            value: "#0000ff", //this is a dummy default value, otherwise we get black
                            selector: {
                                parentKey: "selectBorderColor",
                                parentValue: true
                            }
                        }
                    ]
                },
                {
                    type: "dropdown",
                    label: "Border Width: ",
                    entries: [["Use Default", "default"], ["1px", 1], ["2px", 2], ["3px", 3], ["5px", 5], ["7px", 7], ["10px", 10]],
                    key: "borderWidth",
                    meta: {
                        "excludeValue": "default"
                    }
                },
            ],
            key: "rectangle",
            meta: {
                "expression": "object"
            }
        }
    ]
}

const arcConfigElement = {
    type: "showHideLayout",
    heading: "Arc Style",
    closed: true,
    formData: [
        {
            type: "panel",
            formData: [
                {
                    type: "horizontalLayout",
                    formData: [
                        {
                            type: "radioButtonGroup",
                            label: "Fill Color: ",
                            entries: [["Use Default", false], ["Select", true]],
                            horizontal: true,
                            value: false,
                            key: "selectAreaColor"
                        },
                        {
                            type: "colorPicker",
                            key: "backgroundColor",
                            value: "#0000ff", //this is a dummy default value, otherwise we get black
                            selector: {
                                parentKey: "selectAreaColor",
                                parentValue: true
                            }
                        }
                    ]
                },
                {
                    type: "horizontalLayout",
                    formData: [
                        {
                            type: "radioButtonGroup",
                            label: "Border Color: ",
                            entries: [["Use Default", false], ["Select", true]],
                            horizontal: true,
                            value: false,
                            key: "selectBorderColor"
                        },
                        {
                            type: "colorPicker",
                            key: "borderColor",
                            value: "#0000ff", //this is a dummy default value, otherwise we get black
                            selector: {
                                parentKey: "selectBorderColor",
                                parentValue: true
                            }
                        }
                    ]
                },
                {
                    type: "dropdown",
                    label: "Border Width: ",
                    entries: [["Use Default", "default"], ["1px", 1], ["2px", 2], ["3px", 3], ["5px", 5], ["7px", 7], ["10px", 10]],
                    key: "borderWidth",
                    meta: {
                        "excludeValue": "default"
                    }
                },
            ],
            key: "rectangle",
            meta: {
                "expression": "object"
            }
        }
    ]
}

/** This entry is only needed when the the data is numeric. There is currently no config for type category. */
const xAxisConfigElement = {
    type: "panel",
    formData: [
        {
            type: "dropdown",
            label: "X Axis Scale: ",
            entries: ["linear", "logarithmic"],
            value: "linear",
            key: "type"
        }
    ],
    key: "xAxes",
    meta: {
        "expression": "object"
    }
}

const xAxisConfigElementWithSelector = (() => {
    let configElement = apogeeutil.jsonCopy(xAxisConfigElement);

    configElement.selector = {
        parentKey: "xValuesType",
        parentValue: "numeric"
    }

    return configElement;
})()

/** Currently Y axis is always numeric. */
const yAxisConfigElement = {
    type: "panel",
    formData: [
        {
            type: "dropdown",
            label: "Y Axis Scale: ",
            entries: ["linear", "logarithmic"],
            value: "linear",
            key: "type"
        },
        {
            type: "radioButtonGroup",
            label: "Data Series Stacking: ",
            entries: [["Normal", false], ["Stacked", true]],
            value: false,
            horizontal: true,
            key: "stacked",
            meta: {
                "excludeValue": "default"
            }
        },
    ],
    key: "yAxes",
    meta: {
        "expression": "object"
    }
}

/** This element is to enter category data. */
const categoryElement = {
    type: "textField",
    label: "X Category Array: ",
    key: "xCategories",
    meta: {
        "expression": "simple"
    }
};

const categoryElementWithSelector = (() => {
    let configElement = apogeeutil.jsonCopy(categoryElement);

    configElement.selector = {
        parentKey: "xValuesType",
        parentValue: "category"
    }

    return configElement;
})()

/** The following element is used when we can switch between x data types. */
const xValuesTypeElement = {
    type: "radioButtonGroup",
    label: "X Values Type: ",
    entries: [["Category", "category"], ["Numeric", "numeric"]],
    value: "category", //initial default
    horizontal: true,
    key: "xValuesType"
}

/** This element is used to pass the x value (using inherit) to child panel elements. */
const invisibleXValuesTypeElement = {
    type: "invisible",
    value: null,
    key: "xValuesType"
}

/** This element should be included in the data series options. */
const seriesLabelElement = {
    type: "textField",
    label: "Label: ",
    key: "label",
    meta: {
        "excludeValue": ""
    }
}

/** This function creates a raw chart config from a chart input json, either from the form or from a chart json input. */
function createChartConfig(chartJson, chartType) {
    //create output
    let chartConfig = {};
    chartConfig.type = chartType;

    let chartInfo = CHART_INFO_MAP[chartType];
    if (!chartInfo) throw new Error("Unknown chart type: " + chartType);

    //load the general chart options
    chartConfig.options = getChartOptions(chartJson, chartInfo);

    //load the data series
    if (chartJson.numericDataSeries) {
        if (!chartInfo.allowXNumeric) {
            throw new Error("Unexpected X numeric data series for chart type: " + chartInfo.type);
        }

        chartConfig.data = getXNumericChartData(chartJson, chartInfo, chartConfig.options);
    }
    else if (chartJson.categoryDataSeries) {
        if (!chartInfo.allowXCategory) {
            throw new Error("Unexpected X category data series for chart type: " + chartInfo.type);
        }

        chartConfig.data = getXCategoryChartData(chartJson, chartInfo, chartConfig.options);
    }

    return chartConfig;
}


/** This function loads the data series where the x values are numeric */
function getXNumericChartData(sourceData, chartInfo, generalChartOptions) {
    let data = {};

    if (!sourceData.numericDataSeries) throw new Error("Unknown error: Numeric data series array missing for numeric data chart.");

    //read the datasets
    data.datasets = sourceData.numericDataSeries.map((dataSeriesEntry, index) => {
        let entry = {};

        //read the data - one of three formats
        if (dataSeriesEntry.xyPoints !== undefined) {
            //points, format {x:x, y:y}
            entry.data = dataSeriesEntry.xyPoints;
        }
        else if ((dataSeriesEntry.xValues !== undefined) && (dataSeriesEntry.yValues !== undefined)) {
            //x and y value arrays
            if (dataSeriesEntry.xValues.length != dataSeriesEntry.yValues.length) throw new Error("Data series x and y values are not the same length!");

            entry.data = [];
            for (let i = 0; i < dataSeriesEntry.xValues.length; i++) {
                let point = {
                    x: dataSeriesEntry.xValues[i],
                    y: dataSeriesEntry.yValues[i]
                }
                entry.data.push(point);
            }
        }
        else if ((dataSeriesEntry.dataArray !== undefined) && (dataSeriesEntry.xAccessor) && (dataSeriesEntry.yAccessor)) {
            //data array and x and y accessor function
            entry.data = [];
            for (let i = 0; i < dataSeriesEntry.dataArray.length; i++) {
                let point = {
                    x: dataSeriesEntry.xAccessor(dataSeriesEntry.dataArray[i]),
                    y: dataSeriesEntry.yAccessor(dataSeriesEntry.dataArray[i])
                }
                entry.data.push(point);
            }
        }
        else {
            throw new Error("Input X and/or Y data is not defined!");
        }

        //read the options
        if (dataSeriesEntry.options) {
            loadSeriesOptions(entry, dataSeriesEntry.options, chartInfo, generalChartOptions, index);
        }

        return entry;
    });

    return data;
}


/** This function loads the data series where the x values are categories */
function getXCategoryChartData(sourceData, chartInfo, generalChartOptions) {
    let data = {};

    if (!sourceData.categoryDataSeries) throw new Error("Unknown error: Category data series array missing for category data chart.");

    //read the category data
    let xCategories;
    let hasImplicitXCategories = false;
    let maxYLength = 0;

    if (sourceData.xCategories) {
        xCategories = sourceData.xCategories;
    }
    else {
        //auto generator categories
        hasImplicitXCategories = true;
    }

    //read the dataset data
    data.datasets = sourceData.categoryDataSeries.map((dataSeriesEntry, index) => {
        let entry = {};

        //read the data
        if (dataSeriesEntry.yValues !== undefined) {
            entry.data = dataSeriesEntry.yValues;
        }
        else if ((dataSeriesEntry.dataArray !== undefined) && (dataSeriesEntry.yAccessor)) {
            entry.data = dataSeriesEntry.dataArray.map(dataSeriesEntry.yAccessor);
        }
        else {
            throw new Error("Input Y data is not defined!");
        }

        if ((entry.data) && (entry.data.length > maxYLength)) maxYLength = entry.data.length;

        //read the options
        if (dataSeriesEntry.options) {
            loadSeriesOptions(entry, dataSeriesEntry.options, chartInfo, generalChartOptions, index);
        }

        return entry;
    });

    //if needed construct explicit categories. It is simple integers, starting with 1
    if (hasImplicitXCategories) {
        xCategories = [];
        for (let i = 1; i <= maxYLength; i++) xCategories.push(i);
    }

    data.labels = xCategories;

    return data;
}


/** This function creates the chartConfig options from the apogee format chart input json. */
function getChartOptions(sourceData, chartInfo) {
    let sourceOptions = sourceData.options ? sourceData.options : {};
    let targetOptions = {};

    //elements
    targetOptions.elements = {};

    if (chartInfo.usePoint) {
        targetOptions.elements.point = processOptions(sourceOptions.point, "point", "chart");
    }

    if (chartInfo.useLine) {
        targetOptions.elements.line = processOptions(sourceOptions.line, "line", "chart");

        //merge a currently hard coded pacity into the background color, if it exists and is not "auto"
        if ((targetOptions.elements.line) && (targetOptions.elements.line.backgroundColor) && (targetOptions.elements.line.backgroundColor != "auto")) {
            let opacity = .2;
            targetOptions.elements.line.backgroundColor = mergeOpacity(targetOptions.elements.line.backgroundColor, opacity);
        }
    }

    if (chartInfo.useRectangle) {
        targetOptions.elements.rectangle = processOptions(sourceOptions.rectangle, "rectangle", "chart");
    }

    if (chartInfo.useArc) {
        targetOptions.elements.arc = processOptions(sourceOptions.arc, "arc", "chart");
    }

    targetOptions.title = processOptions(sourceOptions.title, "title", "chart");

    targetOptions.legend = processOptions(sourceOptions.legend, "legend", "chart");

    //scales
    //for now out inputs are single axis, but the chart config takes an array,
    //for multiple axes. We will add that later. For now we just support one.
    targetOptions.scales = {};
    let tempTarget;

    tempTarget = processOptions(sourceOptions.xAxes, "xAxes", "chart");
    targetOptions.scales.xAxes = [tempTarget];

    tempTarget = processOptions(sourceOptions.yAxes, "yAxes", "chart");
    targetOptions.scales.yAxes = [tempTarget];

    return targetOptions;
}


/** This function loads the data series options into the target options object from the apogee format input json. */
function loadSeriesOptions(targetOptions, sourceOptions, chartInfo, chartOptions, index) {
    if (sourceOptions.label !== undefined) targetOptions.label = sourceOptions.label;
    else {
        targetOptions.label = "Series " + (index + 1);
    }

    if (chartInfo.usePoint) {
        let seriesPointOptions = processOptions(sourceOptions.point, "point", "series");

        //------------
        //special rules
        //------------
        let chartPointOptions;
        if ((chartOptions) && (chartOptions.elements) && (chartOptions.elements.point)) chartPointOptions = chartOptions.elements.point;
        else chartPointOptions = {};

        //check for "auto" border color in chart options
        if (seriesPointOptions.borderColor === undefined) {
            if (chartPointOptions.borderColor == "auto") {
                seriesPointOptions.borderColor = _getColorForIndex(index);
            }
            else if (chartPointOptions.borderColor !== undefined) {
                seriesPointOptions.borderColor = chartPointOptions.borderColor;
            }
        }

        //implement for "show points" from chart options or series options - set radius to 0
        if ((seriesPointOptions.showPoints === false) ||
            ((chartPointOptions.showPoints === false) && (seriesPointOptions.showPoints !== true))) {
            seriesPointOptions.radius = 0;
        }

        //if we are also using line we need to remap some keys
        if (chartInfo.useLine) {
            _remap(seriesPointOptions, LINE_POINT_KEY_MAPPING);
        }

        //map these back to our series options
        Object.assign(targetOptions, seriesPointOptions);
    }

    if (chartInfo.useLine) {
        let seriesLineOptions = processOptions(sourceOptions.line, "line", "series");

        //------------
        //special rules
        //------------
        let chartLineOptions;
        if ((chartOptions) && (chartOptions.elements) && (chartOptions.elements.line)) chartLineOptions = chartOptions.elements.line;
        else chartLineOptions = {};

        //explictily set line color since we added the "auto" option
        if (seriesLineOptions.borderColor === undefined) {
            if (chartLineOptions.borderColor == "auto") {
                seriesLineOptions.borderColor = _getColorForIndex(index);
            }
            else if (chartLineOptions.borderColor !== undefined) {
                seriesLineOptions.borderColor = chartLineOptions.borderColor;
            }
        }

        //explictily set the point color
        //we are using results of target options set above.
        if (targetOptions.pointBorderColor === undefined) {
            seriesLineOptions.pointBorderColor = seriesLineOptions.borderColor;
        }

        //explictily set the area color since we added the "auto" option
        if (seriesLineOptions.backgroundColor === undefined) {
            if (chartLineOptions.backgroundColor == "auto") {
                seriesLineOptions.backgroundColor = _getColorForIndex(index);
            }
            else if (chartLineOptions.backgroundColor !== undefined) {
                seriesLineOptions.backgroundColor = chartLineOptions.backgroundColor;
            }
            else {
                //default to line color
                seriesLineOptions.backgroundColor = seriesLineOptions.borderColor;
            }
        }

        //merge a currently hard coded pacity into the background color, if it exists.
        if (seriesLineOptions.backgroundColor) {
            let opacity = .2;
            seriesLineOptions.backgroundColor = mergeOpacity(seriesLineOptions.backgroundColor, opacity);
        }

        //there is some remapping for the series
        _remap(seriesLineOptions, LINE_KEY_MAPPING);

        //map these back to our series options
        Object.assign(targetOptions, seriesLineOptions);
    }

    if (chartInfo.useRectangle) {
        let seriesRectOptions = processOptions(sourceOptions.rectangle, "rectangle", "series");

        //------------
        //special rules
        //------------
        let chartRectOptions;
        if ((chartOptions) && (chartOptions.elements) && (chartOptions.elements.rectangle)) chartRectOptions = chartOptions.elements.rectangle;
        else chartRectOptions = {};

        //check for "auto" in chart options
        if (seriesRectOptions.backgroundColor === undefined) {
            if (chartRectOptions.backgroundColor == "auto") {
                seriesRectOptions.backgroundColor = _getColorForIndex(index);
            }
            else if (chartRectOptions.backgroundColor == "auto") {
                seriesRectOptions.backgroundColor = chartRectOptions.backgroundColor;
            }
        }

        //map these back to our series options
        Object.assign(targetOptions, seriesRectOptions);
    }

    if (chartInfo.useArc) {
        let seriesArcOptions = processOptions(sourceOptions.arc, "arc", "series");

        //------------
        //special rules
        //------------
        let chartArcOptions;
        if ((chartOptions) && (chartOptions.elements) && (chartOptions.elements.arc)) chartArcOptions = chartOptions.elements.arc;
        else chartArcOptions = {};

        //check for "auto" in chart options
        if (seriesArcOptions.backgroundColor === undefined) {
            if (chartArcOptions.backgroundColor == "auto") {
                seriesArcOptions.backgroundColor = _getColorForIndex(index);
            }
            else if (chartArcOptions.backgroundColor == "auto") {
                seriesArcOptions.backgroundColor = chartArcOptions.backgroundColor;
            }
        }

        //map these back to our series options
        Object.assign(targetOptions, seriesArcOptions);
    }
}

//-- loadSeriesOptions private code start ---
const LINE_POINT_KEY_MAPPING = {
    radius: "pointRadius",
    borderColor: "pointBorderColor",
    borderWidth: "pointBorderWidth",
    backgroundColor: "pointBackgroundColor"
}

const LINE_KEY_MAPPING = {
    stepped: "steppedLine",
    tension: "lineTension",
}

function _remap(target, mapping) {
    for (let key in mapping) {
        target[mapping[key]] = target[key];
        delete target[key];
    }
}

function _getColorForIndex(index) {
    return COLOR_LIST[index % COLOR_LIST.length];
}


//-- loadSeriesOptions private code end ---

/** For the associations, there is an added field "modifier" which is the string name for a function to modify the source value. Right now the only option is addOne. */
const OPTION_MODIFIER = {
    defaults: {
        point: {
            borderColor: "auto"
        },
        line: {
            borderColor: "auto",
            fill: false,
        },
        rectangle: {
            backgroundColor: "auto"
        },
        arc: {
            backgroundColor: "auto"
        },
        title: {
            display: false
        }

    },
    associations: {
        point: {
            hoverRadius: {
                source: "radius",
                target: "hoverRadius",
                modifier: "addOne"
            },
            hoverBorderWidth: {
                source: "borderWidth",
                target: "hoverBorderWidth",
                modifier: "addOne"
            },
            hitRadius: {
                source: "radius",
                target: "hitRadius",
                modifier: "addOne"
            }
        },
        rectangle: {
            hoverBorderWidth: {
                source: "borderWidth",
                target: "hoverBorderWidth",
                modifier: "addOne"
            },
        }
    }
}

/** These are the list of colors for "auto" color assignment. (We might want to let the users set these globally since the palette will be very important in many cases.)  */
const COLOR_LIST = ["#0000ff", "#ff0000", "#008000", "#000080", "#800000", "#000000", "#008080", "#800080", "#808000", "#808080", "#ff00ff", "#ffff00", "#00ffff"]

/** The following does standard mapping of options from the input json config to create the raw config. In some cases, additional processing may be needed, which will be done externally. */
function processOptions(inJsonObject, optionsType, optionsOrigin) {
    let outOptions = {};

    if (inJsonObject !== undefined) Object.assign(outOptions, inJsonObject);

    //set any defaults, but only if this is chart options
    if (optionsOrigin == "chart") {
        let defaultsMap = OPTION_MODIFIER.defaults[optionsType];
        if (defaultsMap) {
            _setDefaults(outOptions, defaultsMap);
        }
    }

    //add any associations - this is when one value should equal (or be a function of) ONE other field.
    let associationsMap = OPTION_MODIFIER.associations[optionsType];
    if (associationsMap) {
        _addAssociations(outOptions, associationsMap);
    }

    return outOptions;
}

//-- processOptions private code start ---
/** This explicitly sets the defaults that we want to override from chart.js */
function _setDefaults(optionsObject, defaultsMap) {
    for (let key in defaultsMap) {
        if (optionsObject[key] === undefined) {
            optionsObject[key] = defaultsMap[key];
        }
    }
}

/** This function makes an association between options values. */
function _addAssociations(optionsObject, associationsMap) {
    for (let key in associationsMap) {
        let association = associationsMap[key];
        let sourceField = association.source;
        let targetField = association.target;
        let modifierString = association.modifier;

        //allow for lookup of modifier function
        if ((optionsObject[sourceField] !== undefined) && (optionsObject[targetField] === undefined)) {
            if (modifierString !== undefined) {
                //right now we have a lookup function for modifier functions. But we only have one modifier.
                let modifierFunction;
                switch (modifierString) {
                    case ("addOne"):
                        modifierFunction = _addOne;
                        break;

                    default:
                        modifierFunction = null;
                        break;
                }

                if (modifierFunction) {
                    optionsObject[targetField] = modifierFunction(optionsObject[targetField], optionsObject[sourceField]);
                }
            }
            else {
                //if there is no modifier function listed, just set the target value equal the source value
                optionsObject[targetField] = optionsObject[sourceField];
            }
        }
    }
}

/** This is a options modifier function. It adds one to the value. */
function _addOne(initialTarget, initialSource) {
    if ((typeof initialSource) == "string") {
        initialSource = parseInt(initialSource);
    }
    return initialSource + 1;
}

function _doShowHidePoint(initialTarget, initialSource) {
    if (initialSource === false) {
        //set radius to 0 if we are not showing the point 
        return 0;
    }
    else {
        //otherwise don't change
        return initialTarget;
    }
}
//-- processOptions private code end ---

function mergeOpacity(color, opacity) {
    let colorStruct = _parseColorString(color);
    if (colorStruct) {
        let rgbaVector = colorStruct.rgba;
        rgbaVector[3] = opacity;
        let colorArgs = rgbaVector.join(",");
        return `rgba(${colorArgs})`;
    }
    else {
        //we could not parse this for now
        return color;
    }
}

//-- mergeOpacity private code start ---
/** This parses just rgb, rgba and hex colors. Otherwise it returns false. 
* This is from the code from jscolor.js */
function _parseColorString(str) {
    var ret = {
        rgba: null,
        format: null // 'hex' | 'rgb' | 'rgba'
    };

    var m;
    if (m = str.match(/^\W*([0-9A-F]{3}([0-9A-F]{3})?)\W*$/i)) {
        // HEX notation

        ret.format = 'hex';

        if (m[1].length === 6) {
            // 6-char notation
            ret.rgba = [
                parseInt(m[1].substr(0, 2), 16),
                parseInt(m[1].substr(2, 2), 16),
                parseInt(m[1].substr(4, 2), 16),
                null
            ];
        } else {
            // 3-char notation
            ret.rgba = [
                parseInt(m[1].charAt(0) + m[1].charAt(0), 16),
                parseInt(m[1].charAt(1) + m[1].charAt(1), 16),
                parseInt(m[1].charAt(2) + m[1].charAt(2), 16),
                null
            ];
        }
        return ret;

    } else if (m = str.match(/^\W*rgba?\(([^)]*)\)\W*$/i)) {
        // rgb(...) or rgba(...) notation

        var params = m[1].split(',');
        var re = /^\s*(\d+|\d*\.\d+|\d+\.\d*)\s*$/;
        var mR, mG, mB, mA;
        if (
            params.length >= 3 &&
            (mR = params[0].match(re)) &&
            (mG = params[1].match(re)) &&
            (mB = params[2].match(re))
        ) {
            ret.format = 'rgb';
            ret.rgba = [
                parseFloat(mR[1]) || 0,
                parseFloat(mG[1]) || 0,
                parseFloat(mB[1]) || 0,
                null
            ];

            if (
                params.length >= 4 &&
                (mA = params[3].match(re))
            ) {
                ret.format = 'rgba';
                ret.rgba[3] = parseFloat(mA[1]) || 0;
            }
            return ret;
        }
    }

    return false;
}
//-- mergeOpacity private code end ---
