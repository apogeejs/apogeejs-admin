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

return element;}


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

return element;}


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

return panel;}


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
if(chartInfo.usePoint) {
    if(chartInfo.useLine) {
        //also include he "show" option for pionts if line also used
        insideLayout.push(pointConfigElementWithShow);
    }
    else {
        insideLayout.push(pointConfigElement);
    }
}
if(chartInfo.useRectangle) insideLayout.push(rectConfigElement);
if(chartInfo.useArc) insideLayout.push(arcConfigElement);

let axesElement = getAxesOptionsElement(chartInfo);
if(axesElement) insideLayout.push(axesElement);

return panel;}


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

/** This is the data series input for category data. Category data must be input as a common x category array for all the data series. */
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

/** Here we are adding an option to show or hide the points. */
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
        					key: "tension",
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

/** This entry is only needed when the the data is numeric. There is currently no config for type category. */
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
})()

/** Currently Y axis is always numeric. */
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
    entries: [["Category","category"],["Numeric","numeric"]],
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

return chartConfig;}


/** This function loads the data series where the x values are numeric */
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

return data;}


/** This function loads the data series where the x values are categories */
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
        entry.data = dataSeriesEntry.dataArray.map(dataSeriesEntry.yAccessor);
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

return data;}


/** This function creates the chartConfig options from the apogee format chart input json. */
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
    
return targetOptions;}


/** This function loads the data series options into the target options object from the apogee format input json. */
function loadSeriesOptions(targetOptions,sourceOptions,chartInfo,chartOptions,index) {
if(sourceOptions.label !== undefined) targetOptions.label = sourceOptions.label;

if(chartInfo.usePoint) {
    let options = processOptions(sourceOptions.point,"point","series");
    
    //check for "auto" in chart options
    if((chartOptions)&&(chartOptions.elements)&&(chartOptions.elements.point)&&(chartOptions.elements.point.borderColor == "auto")&&(options.borderColor === undefined)) {
        options.borderColor = _getColorForIndex(index);
    }
    
    //implement for "show points" from chart options or series options - set radius to 0
    if( (options.showPoints === false) ||
        ((chartOptions)&&(chartOptions.elements)&&(chartOptions.elements.point)&&(chartOptions.elements.point.showPoints === false)&&(options.showPoints !== true)) ) {
        options.radius = 0;        
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
    
    //there is some remapping
    if(chartInfo.useLine) {
        _remap(options,LINE_KEY_MAPPING);
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

function _remap(target,mapping) {
    for(let key in mapping) {
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

/** These are the list of colors for "auto" color assignment. (We might want to let the users set these globally since the palette will be very important in many cases.)  */
const COLOR_LIST = ["blue","red","green","navy","maroon","black","teal","purple","olive","gray","fuchsia","yellow","aqua"]

/** The following does standard mapping of options from the input json config to create the raw config. In some cases, additional processing may be needed, which will be done externally. */
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

return outOptions;}

//-- processOptions private code start ---
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
        
        //allow for lookup of modifier function
        if(modifierString !== undefined) {
            if((optionsObject[sourceField] !== undefined)&&(optionsObject[targetField] === undefined)) {
                //right now we have a lookup function for modifier functions. But we only have one modifier.
                let modifierFunction;
                switch(modifierString) {
                    case("addOne"):
                        modifierFunction = _addOne;
                        break;
                        
                    default:
                        modifierFunction = null;
                        break;
                }
                
                if(modifierFunction) {
                    optionsObject[targetField] = modifierFunction(optionsObject[targetField], optionsObject[sourceField]);
                }
            }
        }
        else {
            //if there is no modifier function listed, just set the target value equal the source value
            optionsObject[targetField] = optionsObject[sourceField];
        }
    }
}

/** This is a options modifier function. It adds one to the value. */
function _addOne(initialTarget,initialSource) {
    if( (typeof initialSource) == "string" ) {
        initialSource = parseInt(initialSource);
    }
    return initialSource+1;
}

function _doShowHidePoint(initialTarget,initialSource) {
    if(initialSource === false) {
        //set radius to 0 if we are not showing the point 
        return 0;
    }
    else {
        //otherwise don't change
        return initialTarget;
    }
}
//-- processOptions private code end ---
