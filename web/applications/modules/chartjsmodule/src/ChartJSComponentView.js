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
            let chartType = this.getComponent().getChartType();

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

            return chartConfig;
        }
        catch(error) {
            if(error.stack) console.error(error.stack);
            return {};
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
        
        this.canvasElement = document.createElement("canvas");
        this.canvasElement.style = "position: relative;";

        this.contentElement.appendChild(this.canvasElement);
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

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//code generated using dev chart workspace
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

//---------------------------------------------
// Chart layout Functions
//---------------------------------------------

/** The constructs the chart form layout for a given chart type. 
 * NOTE - this does not include the wrapper to choose json or raw config input. This is 
 * only the form input.
*/
function getChartLayout(chartType) {
    let chartInfo = CHART_INFO_MAP[chartType];

    if(!chartInfo) throw new Error("Unrecognized chart type: " + chartType);

    let layout = [];

    if((chartInfo.allowXNumeric)&&(chartInfo.allowXCategory)) {
        layout.push(xValuesTypeElement);
        layout.push(categoryElementWithSelector);
    }
    else if(chartInfo.allowXCategory) {
        layout.push(categoryElement);
    }

    if(chartInfo.allowXNumeric) layout.push(getNumericDataSeriesElement(chartInfo));
    if(chartInfo.allowXCategory) layout.push(getCategoryDataSeriesElement(chartInfo));

    layout.push(getChartOptionsElement(chartInfo));


    return layout;
}

/** This gets the layout element for a x numeric data series element, for the given chart info. */
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
    if((chartInfo.allowXNumeric)&&(chartInfo.allowXCategory)) {
        element.selector = {
            parentKey: "xValuesType",
            parentValue: "numeric"
        };
    }
    
    return element;  
}

/** This gets the layout element for a x category data series element, for the given chart info. */
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
    if((chartInfo.allowXNumeric)&&(chartInfo.allowXCategory)) {
        element.selector = {
            parentKey: "xValuesType",
            parentValue: "category"
        };
    }
    
    return element;
}

/** This function gets the series options element for the given chart info. */
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
    if(chartInfo.useLine) insideLayout.push(lineConfigElement);
    if(chartInfo.usePoint) {
        if(chartInfo.useLine) {
            //also include he "show" option for pionts if line also used
            insideLayout.push(pointConfigElementWithShow);
        }
        else {
            insideLayout.push(pointConfigElement);
        }
    }
    if(chartInfo.useRectangle) {
        insideLayout.push(rectConfigElement);
    }
    if(chartInfo.useArc) {
        insideLayout.push(arcConfigElement);
    }
    
    return panel;    
}

/** This function gets the chart options element for the given chart info. */
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
    if((chartInfo.allowXCategory)&&(chartInfo.allowXNumeric)) {
        panel.inherit = [{
        parentKey: "xValuesType",
        childKey: "xValuesType"
        }];
        insideLayout.push(invisibleXValuesTypeElement);
    }

    //universal element
    insideLayout.push(titleConfigElement);
    insideLayout.push(legendConfigElement);

    if(chartInfo.useLine) insideLayout.push(lineConfigElement);
    if(chartInfo.usePoint) insideLayout.push(pointConfigElement);
    if(chartInfo.useRectangle) insideLayout.push(rectConfigElement);
    if(chartInfo.useArc) insideLayout.push(arcConfigElement);

    let axesElement = getAxesOptionsElement(chartInfo);
    if(axesElement) insideLayout.push(axesElement);

    return panel;
}

/** This function gets the axes options element for the given chart info. */
function getAxesOptionsElement(chartInfo) {
    let element = {
        type: "showHideLayout",
        heading: "Axes",
        closed: true,
        formData: []
    }
    
    //construct x element, if needed
    let xElement;
    if(chartInfo.allowXNumeric) {
        if(chartInfo.allowXCategory) {
            xElement = xAxisConfigElementWithSelector;
        }
        else {
            xElement = xAxisConfigElement;
        }
    }
    
    //add the axes elements
    if(chartInfo.allowXNumeric) {
        if(xElement) element.formData.push(xElement);
    }
    element.formData.push(yAxisConfigElement);
    
    return element;
    
}

//----------------------------------------
// Chart Input Processing Functions
//----------------------------------------

function createChartConfig(chartJson,chartType) {
    //create output
    let chartConfig = {};
    chartConfig.type = chartType;

    let chartInfo = CHART_INFO_MAP[chartType];
    if(!chartInfo) throw new Error("Unknown chart type: " + chartType);

    //load the general chart options
    chartConfig.options = getChartOptions(chartJson,chartInfo);

    //load the data series
    if(chartJson.numericDataSeries) {
        if(!chartInfo.allowXNumeric) {
            throw new Error("Unexpected X numeric data series for chart type: " + chartInfo.type);
        }
        
        chartConfig.data = getXNumericChartData(chartJson,chartInfo,chartConfig.options);
    }
    else if(chartJson.categoryDataSeries) {
        if(!chartInfo.allowXCategory) {
            throw new Error("Unexpected X category data series for chart type: " + chartInfo.type);
        }
        
        chartConfig.data = getXCategoryChartData(chartJson,chartInfo,chartConfig.options);
    }

    return chartConfig;
}

function getXNumericChartData(sourceData,chartInfo,generalChartOptions) {
    let data = {};

    if(!sourceData.numericDataSeries) throw new Error("Unknown error: Numeric data series array missing for numeric data chart.");
    
    //read the datasets
    data.datasets = sourceData.numericDataSeries.map( (dataSeriesEntry,index) => {
        let entry = {};
        
        //read the data - one of three formats
        if(dataSeriesEntry.xyPoints !== undefined) {
            //points, format {x:x, y:y}
            entry.data = dataSeriesEntry.xyPoints;
        }
        else if((dataSeriesEntry.xValues !== undefined)&&(dataSeriesEntry.yValues !== undefined)) {
            //x and y value arrays
            if(dataSeriesEntry.xValues.length != dataSeriesEntry.yValues.length) throw new Error("Data series x and y values are not the same length!");
            
            entry.data = [];
            for(let i = 0; i < dataSeriesEntry.xValues.length; i++) {
                let point = {
                    x: dataSeriesEntry.xValues[i],
                    y: dataSeriesEntry.yValues[i]
                }
                entry.data.push(point);
            }
        }
        else if((dataSeriesEntry.dataArray !== undefined)&&(dataSeriesEntry.xAccessor)&&(dataSeriesEntry.yAccessor)) {
            //data array and x and y accessor function
            entry.data = [];
            for(let i = 0; i < dataSeriesEntry.dataArray.length; i++) {
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
        if(dataSeriesEntry.options) {
            loadSeriesOptions(entry,dataSeriesEntry.options,chartInfo,generalChartOptions,index);
        }
        
        return entry;
    });
    
    return data;
}

function getXCategoryChartData(sourceData,chartInfo,generalChartOptions) {
    let data = {};

    if(!sourceData.categoryDataSeries) throw new Error("Unkonwn error: Category data series array missing for category data chart.");
    
    //read the category data
    let xCategories;
    let hasImplicitXCategories = false;
    let maxYLength = 0;
    
    if(sourceData.xCategories) {
        xCategories = sourceData.xCategories;
    }
    else {
        //auto generator categories
        hasImplicitXCategories = true;
    }
    
    //read the dataset data
    data.datasets = sourceData.categoryDataSeries.map( (dataSeriesEntry,index) => {
        let entry = {};
        
        //read the data
        if(dataSeriesEntry.yValues !== undefined) {
            entry.data = dataSeriesEntry.yValues;
        }
        else if((dataSeriesEntry.dataArray !== undefined)&&(dataSeriesEntry.yAccessor)) {
            entry.data = dataSeriesEntry.dataArray.map(yAccessor);
        }
        else {
            throw new Error("Input Y data is not defined!");
        }
        
        if((entry.data)&&(entry.data.length > maxYLength)) maxYLength = entry.data.length;
        
        //read the options
        if(dataSeriesEntry.options) {
            loadSeriesOptions(entry,dataSeriesEntry.options,chartInfo,generalChartOptions,index);
        }
    
        return entry;
    });
    
    //if needed construct explicit categories. It is simple integers, starting with 1
    if(hasImplicitXCategories) {
        xCategories = [];
        for(let i = 1; i <= maxYLength; i++) xCategories.push(i);
    }
    
    data.labels = xCategories;
    
    return data;
}

function getChartOptions(sourceData,chartInfo) {
    let sourceOptions = sourceData.options ? sourceData.options : {};
    let targetOptions = {};
    
    //elements
    targetOptions.elements = {};
        
    if(chartInfo.usePoint) {
        targetOptions.elements.point = processOptions(sourceOptions.point,"point","chart");
    }
    
    if(chartInfo.usePoint) {
        targetOptions.elements.line = processOptions(sourceOptions.line,"line","chart");
    }
    
    if(chartInfo.useRectangle) {
        targetOptions.elements.rectangle = processOptions(targetOptions.elements.rectangle,"rectangle","chart");
    }
    
    if(chartInfo.useArc) {
        targetOptions.elements.arc = processOptions(targetOptions.elements.arc,"arc","chart");
    }
    
    targetOptions.title = processOptions(sourceOptions.title,"title","chart");
    
    targetOptions.legend = processOptions(sourceOptions.legend,"legend","chart");
    
    //scales
    //for now out inputs are single axis, but the chart config takes an array,
    //for multiple axes. We will add that later. For now we just support one.
    targetOptions.scales = {};
    let tempTarget;
    
    tempTarget = processOptions(sourceOptions.xAxes,"xAxes","chart");
    targetOptions.scales.xAxes = [tempTarget];
    
    tempTarget = processOptions(sourceOptions.yAxes,"yAxes","chart");
    targetOptions.scales.yAxes = [tempTarget];
        
    return targetOptions;
}

function loadSeriesOptions(targetOptions,sourceOptions,chartInfo,chartOptions,index) {
    if(sourceOptions.label !== undefined) targetOptions.label = sourceOptions.label;

    if(chartInfo.usePoint) {
        let options = processOptions(sourceOptions.point,"point","series");
        
        //check for "auto" in chart options
        if((chartOptions)&&(chartOptions.elements)&&(chartOptions.elements.point)&&(chartOptions.elements.point.borderColor == "auto")&&(options.borderColor === undefined)) {
            options.borderColor = _getColorForIndex(index);
        }
        
        //if we are also using line we need to remap some keys
        if(chartInfo.useLine) {
            _remap(options,LINE_POINT_KEY_MAPPING);
        }
        
        //map these back to our series options
        Object.assign(targetOptions,options);
    }
    
    if(chartInfo.useLine) {
        let options = processOptions(sourceOptions.line,"line","series");
    
        //check for "auto" in chart options
        if((chartOptions)&&(chartOptions.elements)&&(chartOptions.elements.line)&&(chartOptions.elements.line.borderColor == "auto")&&(options.borderColor === undefined)) {
            options.borderColor = _getColorForIndex(index);
        }
        
        //for some reason this single value is remapped
        if(options.stepped !== undefined) {
            options.steppedLine = options.stepped;
            delete options.stepped
        }
        
        //map these back to our series options
        Object.assign(targetOptions,options);
    }
    
    if(chartInfo.useRectangle) {
        let options = processOptions(sourceOptions.rectangle,"rectangle","series");
        
        //check for "auto" in chart options
        if((chartOptions)&&(chartOptions.elements)&&(chartOptions.elements.rectangle)&&(chartOptions.elements.rectangle.backgroundColor == "auto")&&(options.backgroundColor === undefined)) {
            options.backgroundColor = _getColorForIndex(index);
        }
        
        //map these back to our series options
        Object.assign(targetOptions,options);
    }
    
    if(chartInfo.useArc) {
        let options = processOptions(sourceOptions.arc,"arc","series");
        
        //check for "auto" in chart options
        if((chartOptions)&&(chartOptions.elements)&&(chartOptions.elements.arc)&&(chartOptions.elements.rectangle.arc == "auto")&&(options.backgroundColor === undefined)) {
            options.backgroundColor = _getColorForIndex(index);
        }
        
        //map these back to our series options
        Object.assign(targetOptions,options);
    }
    
}

//=======================================================================================
// INTERNAL FUNCTIONS FOR loadSeriesOptions -  START

const LINE_POINT_KEY_MAPPING = {
    radius: "pointRadius",
    borderColor: "pointBorderColor",
    borderWidth: "pointBorderWidth",
    //ignore fill
    backgroundColor: "pointBackgrounddColor"
}

function _remap(target,mapping) {
    for(let key in mapping) {
        target[mapping[key]] = target[key]; 
        delete target[key];
    }
}

function _getColorForIndex(index) {
    return COLOR_LIST[index % COLOR_LIST.length];
}

// INTERNAL FUNCTIONS FOR loadSeriesOptions -  END
//=======================================================================================



/** The following does standard mapping of options from the input json config 
 * to create the raw config. In some cases, additional processing may be needed, which will be done externally. */
function processOptions(inJsonObject,optionsType,optionsOrigin) {
    let outOptions = {};
    
    if(inJsonObject !== undefined) Object.assign(outOptions,inJsonObject);
    
    //set any defaults, but only if this is chart options
    if(optionsOrigin == "chart") {
        let defaultsMap = OPTION_MODIFIER.defaults[optionsType];
        if(defaultsMap) {
            _setDefaults(outOptions,defaultsMap);
        }
    }
    
    //add any associations
    let associationsMap = OPTION_MODIFIER.associations[optionsType];
    if(associationsMap) {
        _addAssociations(outOptions,associationsMap);
    }
    
    return outOptions;
}

//=======================================================================================
// INTERNAL FUNCTIONS FOR processOptions -  START

/** This explicitly sets the defaults that we want to override from chart.js */
function _setDefaults(optionsObject,defaultsMap) {
    for(let key in defaultsMap) {
        if(optionsObject[key] === undefined) {
            optionsObject[key] = defaultsMap[key];
        }
    }
}

/** This function makes an association between options values. */
function _addAssociations(optionsObject,associationsMap) {
    for(let key in associationsMap) {
        let association = associationsMap[key];
        let sourceField = association.source;
        let targetField = association.target;
        let modifierString = association.modifier;
        if((optionsObject[sourceField] !== undefined)&&(optionsObject[targetField] === undefined)) {
            //right now we have a lookup function for modifier functions. But we only have one modifier.
            let modifierFunction;
            if(modifierString === "addOne") {
                modifierFunction = _addOne;
            }
            
            //later we should add the ability to make the value different, such as by adding 1 (which is what the chart.js does for hover sometimes)
            optionsObject[targetField] = modifierFunction ? modifierFunction(optionsObject[sourceField]) : optionsObject[sourceField];
        }
    }
}

/** This is a options modifier function. It adds one to the value. */
function _addOne(inValue) {
    if( (typeof inValue) == "string" ) {
        inValue = parseInt(inValue);
    }
    return inValue+1;
}

// INTERNAL FUNCTIONS FOR processOptions -  END
//=======================================================================================



//----------------------------------------
// Chart Metadata Structs
//----------------------------------------

/** This structure defines the content of the different chart types. */
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

/** This defines modifiers to the input json options to construct the raw chart config options. */
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
            pointHoverRadius: {
                source: "radius",
                target: "hoverPointRadius",
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

/** These are the colors that will be used for chart data series by default, when "auto" is selected. */
const COLOR_LIST = [
	"blue",
	"red",
	"green",
	"navy",
	"maroon",
	"black",
	"teal",
	"purple",
	"olive",
	"gray",
	"fuchsia",
	"yellow",
	"aqua"
]

//----------------------------------------
// Chart Layout Data structs
//----------------------------------------

/** This is the layout for a base numeric data series */
const baseNumericDataSeriesDataLayout = [
    {
        type: "dropdown",
        label: "Data Format: ",
        entries: [["X Array and Y Array","values"],["XY Point Array","points"],["Data Array and X and Y Acccessors","structs"]],
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

/** This is the layout for a base numeric data series */
const baseCategoryDataSeriesDataLayout = [
    {
        type: "dropdown",
        label: "Data Type: ",
        entries: [["Y Array","values"],["Data Array and Y Acccessor","structs"]],
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
            		entries: [["Use Default","default"],["10px",10],["12px",12],["14px",14],["18px",18],["24px",24],["36px",36],["48px",48]],
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
                    	    entries: [["Use Default",false],["Select",true]],
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
                			entries: ["default","top","bottom","right","left"],
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
    		entries: [["Use Default","default"],'circle', 'cross', 'dash', 'line', 'rect', 'rectRounded', 'rectRot', 'star', 'triangle'],
    		value: "default",
    		key: "pointStyle",
    		meta: {
    			"excludeValue": "default"
    		}
    	},
    	{
    		type: "dropdown",
    		label: "Radius: ",
    		entries: [["Use Default","default"],["1px",1],["2px",2],["3px",3],["5px",5],["7px",7],["10px",10]],
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
            	    entries: [["Use Default",false],["Select",true]],
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
    		entries: [["Use Default","default"],["1px",1],["2px",2],["3px",3],["5px",5],["7px",7],["10px",10]],
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

const showPointsElement = {
    type: "radioButtonGroup",
    label: "Show Points: ",
    entries: [["Use Default","default"],["Show",true],["Don't Show",false]],
    horizontal: true,
    value: "default",
    key: "showPoints",
    meta: {
		"excludeValue": "default"
	}
}

const pointConfigElementWithShow = {
    type: "showHideLayout",
    heading: "Point Style",
    closed: true,
    formData: [
        showPointsElement,
        basePointConfigElement
    ]
}

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
                    	    entries: [["Use Default",false],["Select",true]],
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
            		entries: [["Use Default","default"],["1px",1],["2px",2],["3px",3],["5px",5],["7px",7],["10px",10]],
            		key: "borderWidth",
            		meta: {
            			"excludeValue": "default"
            		}
            	},	
            	{
					type: "radioButtonGroup",
					label: "Fill Area Under Line: ",
					entries: [["Use Default","default"],["Don't Show",false],["Show",true]],
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
                    	    entries: [["Use Default",false],["Select",true]],
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
        					entries: [["Use Default","default"],["Select",true]],
        					value: "default",
        					horizontal: true,
        					key: "doLineTension",
        					meta: {
        						"excludeValue": "default"
        					}
        				},
        				{
        					type: "slider",
        					key: "lineTension",
        					min: 0,
        					max: 1,
        					step: .1,
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
                    entries: [["Use Default","default"],true,false],
                    key: "spanGaps",
                    meta: {
        				"excludeValue": "default"
        			}
                },
                {
                    type: "dropdown",
                    label: "Stepped Line: ",
                    entries: [["Use Default","default"],false,["Before","before"],["Middle","middle"],["After","after"]],
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
                    	    entries: [["Use Default",false],["Select",true]],
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
                    	    entries: [["Use Default",false],["Select",true]],
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
            		entries: [["Use Default","default"],["1px",1],["2px",2],["3px",3],["5px",5],["7px",7],["10px",10]],
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
                    	    entries: [["Use Default",false],["Select",true]],
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
                    	    entries: [["Use Default",false],["Select",true]],
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
            		entries: [["Use Default","default"],["1px",1],["2px",2],["3px",3],["5px",5],["7px",7],["10px",10]],
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

const xAxisConfigElement = {
	type: "panel",
	formData: [
		{
        	type: "dropdown",
        	label: "X Axis Scale: ",
        	entries: ["linear","logarithmic"],
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
})();

const yAxisConfigElement = {
    type: "panel",
    formData: [
        {
            type: "dropdown",
            label: "Y Axis Scale: ",
            entries: ["linear","logarithmic"],
            value: "linear",
            key: "type"
        },
        {
            type: "radioButtonGroup",
            label: "Data Series Stacking: ",
            entries: [["Normal",false],["Stacked",true]],
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
})();

const xValuesTypeElement = {   
    type: "radioButtonGroup",
    label: "X Values Type: ",
    entries: [["Category","category"],["Numeric","numeric"]],
    value: "category", //initial default
    horizontal: true,
    key: "xValuesType"
}

const invisibleXValuesTypeElement = {
    type: "invisible",
    value: null,
    key: "xValuesType"
}

const seriesLabelElement = {
    type: "textField",
    label: "Label: ",
    key: "label",
    meta: {
        "excludeValue": ""
    }
}



