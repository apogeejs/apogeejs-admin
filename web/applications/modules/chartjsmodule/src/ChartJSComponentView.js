import Chart from "./chartjs.esm.js";

//These are in lieue of the import statements
let { DataDisplay,FormInputBaseComponentView} = apogeeview;

/** This is a graphing component using ChartJS. It consists of a single data table that is set to
 * hold the generated chart data. The input is configured with a form, which gives multiple options
 * for how to set the data. */
export default class ChartJSComponentView extends FormInputBaseComponentView {

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
                return this.getFormDataDisplay(displayContainer);

            default:
                console.error("unrecognized view element: " + viewType);
                return null;
        }
    }

    //=================================
    // Implementation Methods
    //=================================

    
    /** This method returns the form layout.
     * @protected. */
    getFormLayout() {
        return FORM_LAYOUT;
    }
    
    //=====================================
    // Private Methods
    //=====================================

    /** This is the input source for the chart data display */
    _getChartDataSource() {

        return {
            doUpdate: () => {
                //update the display when the member data is updated.
                //NOTE - we only want to update the data from the form and its generated function
                //we should prevent someone else from updating it.
                let reloadData = this.getComponent().isMemberDataUpdated("member.data");
                let reloadDataDisplay = false;
                return {reloadData,reloadDataDisplay};
            },

            getData: () => {
                let chartConfig = this.getComponent().getField("member.data").getData();
                if(chartConfig != apogeeutil.INVALID_VALUE) {
                    //this must be writable for the chart library
                    return apogeeutil.jsonCopy(chartConfig);
                }
                else {
                    return apogeeutil.INVALID_VALUE;
                }
            },
        }
    }
}

//======================================
// Static properties
//======================================

ChartJSComponentView.VIEW_CHART = "Chart";
ChartJSComponentView.VIEW_INPUT = "Input";

ChartJSComponentView.VIEW_MODES = [
	{name: ChartJSComponentView.VIEW_CHART, label: "Chart", isActive: false},
    FormInputBaseComponentView.INPUT_VIEW_MODE_INFO
];

ChartJSComponentView.TABLE_EDIT_SETTINGS = {
    "viewModes": ChartJSComponentView.VIEW_MODES
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
ChartJSComponentView.ICON_RES_PATH = "/icons3/chartCellIcon.png";


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

        this.initialized = true;
    }
    
    /** This method returns the content element for the data display REQUIRED */
    getContent() {
        return this.wrapperElement;
    }
    
    /** This sets the data into the editor display. REQUIRED */
    setData(config) {
        if(!this.initialized) return;

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
        if(!this.initialized) return;

        //make sure proper elements are showing
        if(this.canvasElement.style.display != "none") this.canvasElement.style.display = "none";
        if(this.errorElement.style.display == "none") this.errorElement.style.display = "";

        //show the error message
        this.errorElement.innerHTML = "<b>Chart Error: </b>"  + errorMsg;
    }

    /** This method is called on loading the display. OPTIONAL */
    // onLoad() {
    // }

    destroy() {
        if(this.chart) {
            this.chart.destroy();
            this.chart = null;
        }
        this.config = null;
        this.wrapperElement = null;
        this.contentElement = null;
        this.errorElement = null;
        this.canvasElement = null;
        
        this.initialized = false;
    }
}

let DEFAULT_CHART_CONFIG = {
    data: {
        datasets: []
    },
    options: {}
}


//=====================================================
// Form Layout
// (This is big)
//=====================================================
const FORM_LAYOUT = [
	{
		"type": "radioButtonGroup",
		"label": "Input Type: ",
		"entries": [
			[
				"Form",
				"form"
			],
			[
				"Config JSON",
				"config"
			]
		],
		"horizontal": true,
		"help": "Indicates the way you will enter data:\n- <b>Form</b> gives you several fields to guide input for the chart data and style.\n- <b>Config JSON</b> lets you specify a single config JSON to specify the form data and style. See documentation for the required format for the config JSON.",
		"value": "form",
		"key": "inputType"
	},
	{
		"type": "radioButtonGroup",
		"label": "Config Format: ",
		"entries": [
			[
				"Apogee Format",
				"apogee"
			],
			[
				"ChartJS Format",
				"chartjs"
			]
		],
		"horizontal": true,
		"help": "Two config formats are available. See the documentation for more information on each.\n- <b>Apogee Format</b> is the format that mirrors that data entered with the form input type.\n- <b>ChartJS Format</b> is the format of ChartJS. Using this allows more flexibility. ",
		"value": "apogee",
		"key": "configFormat",
		"selector": {
			"parentKey": "inputType",
			"parentValue": "config"
		}
	},
	{
		"type": "dropdown",
		"label": "Chart Type: ",
		"entries": [
			[
				"Line",
				"line"
			],
			[
				"Bar",
				"bar"
			],
			[
				"Scatter",
				"scatter"
			]
		],
		"value": "line",
		"key": "chartType",
		"selector": {
			"parentKeys": ["inputType","configFormat"],
			"actionFunction": (child,it,cf) => {
			  if((it.getValue() == "form")||(cf.getValue() == "apogee")) {
			    child.setState("normal");
			  } 
			  else {
			    child.setState("inactive");
			  }
			}
		}
	},
	{
		"type": "textField",
		"label": "Config JSON: ",
		"size": 60,
		"hint": "expression",
		"help": "Enter the name of the cell containing the config json, or any other javascript expression returning the desired config json value. ",
		"key": "configJson",
		"selector": {
			"parentKey": "inputType",
			"parentValue": "config"
		},
		"meta": {
			"expression": "simple"
		}
	},
	{
		"type": "panel",
		"selector": {
			"parentKey": "inputType",
			"parentValue": "form"
		},
		"formData": [
			{
				"type": "radioButtonGroup",
				"label": "X Values Type: ",
				"size": 60,
				"entries": [
					[
						"Category",
						"category"
					],
					[
						"Numeric",
						"numeric"
					]
				],
				"value": "category",
				"horizontal": true,
				"help": "The x values can be (1) categories, such as days of the week or other discrete values, or (2) numeric values. ",
				"key": "xValuesType",
				"selector": {
					"parentKey": ["chartType"],
					"parentValue": "line"
				}
			},
			{
				"type": "textField",
				"label": "X Category Array: ",
				"size": 60,
				"hint": "expression, optional",
				"help": "This is a javascript expression, such as the name of a cell, giving the array of category values. If the categories are not provided, either here or in the data series, integer values will be used starting with 1.",
				"key": "xCategories",
				"meta": {
					"expression": "simple",
					"excludeValue": ""
				},
				"selector": {
				  parentKeys: [["chartType"],["formData","xValuesType"]],
				  actionFunction: (child,ct,xvt) => {
				    let chartType = ct.getValue();
				    if((chartType == "bar")||((chartType == "line")&&(xvt.getValue() == "category"))) {
				      child.setState("normal");
				    }
				    else {
				      child.setState("inactive");
				    }
				  }
				}
				
			},
			{
				"type": "textField",
				"label": "X Category Accessor: ",
				"size": 60,
				"hint": "function, optional",
				"help": "Enter a javascript expression giving a function f to read the X category value from the above data array: categoryArray = categoryDataArray.map( f ); ",
				"key": "xCatAccessor",
				"meta": {
					"expression": "simple",
					"excludeValue": ""
				},
				"selector": {
				  parentKeys: [["chartType"],["formData","xValuesType"]],
				  actionFunction: (child,ct,xvt) => {
				    let chartType = ct.getValue();
				    if((chartType == "bar")||((chartType == "line")&&(xvt.getValue() == "category"))) {
				      child.setState("normal");
				    }
				    else {
				      child.setState("inactive");
				    }
				  }
				}
			},
			{
				"type": "list",
				"label": "Plot Series Data",
				"entryType": {
					"label": "Data Series",
					"layout": {
						"type": "panel",
						"formData": [
							{
								"type": "dropdown",
								"label": "Data Format: ",
								"entries": [
									[
										"X Array and Y Arrays",
										"values"
									],
									[
										"Single Data Array",
										"structs"
									]
								],
								"value": "values",
								"help": "Select the desired data format to enter the X and Y Values for the chart. ",
								"key": "dataFormat"
							},
							{
								"type": "textField",
								"label": "X Data Array: ",
								"size": 60,
								"hint": "expression",
								"help": "Enter a javascript expression, such as the name of a cell, giving the array of X values. ",
								"key": "xValues",
								"selector": {
									"parentKey": "dataFormat",
									"parentValue": "values"
								},
								"meta": {
									"expression": "simple",
									"excludeValue": ""
								}
							},
							{
								"type": "textField",
								"label": "Y Data Array: ",
								"size": 60,
								"hint": "expression",
								"help": "Enter a javascript expression, such as the name of a cell, giving the array of Y values.  ",
								"key": "yValues",
								"selector": {
									"parentKey": "dataFormat",
									"parentValue": "values"
								},
								"meta": {
									"expression": "simple",
									"excludeValue": ""
								}
							},
							{
								"type": "textField",
								"label": "Data Array: ",
								"size": 60,
								"hint": "expression",
								"help": "Enter a javascript expression, such as the name of a cell, giving the array of arbitrary objects. The X and Y values will be read from it using the function specified below.",
								"key": "dataArray",
								"selector": {
									"parentKey": "dataFormat",
									"parentValue": "structs"
								},
								"meta": {
									"expression": "simple",
									"excludeValue": ""
								}
							},
							{
								"type": "textField",
								"label": "X Accessor: ",
								"size": 60,
								"hint": "function, optional",
								"help": "Enter a javascript expression giving a function f to read the X value from the above data array: xValueArray = dataArray.map( f ); ",
								"key": "xAccessor",
								"meta": {
									"expression": "simple",
									"excludeValue": ""
								}
							},
							{
								"type": "textField",
								"label": "Y Accessor: ",
								"size": 60,
								"hint": "function, optional",
								"help": "Enter a javascript expression giving a function f to read the Y value from the above data array: yValueArray = dataArray.map( f ); ",
								"key": "yAccessor",
								"meta": {
									"expression": "simple",
									"excludeValue": ""
								}
							},
							{
								"type": "showHideLayout",
								"heading": "Series Options",
								"closed": true,
								"formData": [
									{
										"type": "panel",
										"formData": [
											{
												"type": "textField",
												"label": "Label: ",
												"size": 40,
												"hint": "text",
												"key": "label",
												"meta": {
													"excludeValue": ""
												}
											},
											{
												"type": "showHideLayout",
												"heading": "Line Style",
												"closed": true,
												"formData": [
													{
														"type": "panel",
														"formData": [
															{
																"type": "horizontalLayout",
																"formData": [
																	{
																		"type": "radioButtonGroup",
																		"label": "Color: ",
																		"entries": [
																			[
																				"Use Default",
																				false
																			],
																			[
																				"Select",
																				true
																			]
																		],
																		"horizontal": true,
																		"value": false,
																		"key": "selectColor"
																	},
																	{
																		"type": "colorPicker",
																		"key": "borderColor",
																		"value": "#0000ff",
																		"selector": {
																			"parentKey": "selectColor",
																			"parentValue": true
																		}
																	}
																]
															},
															{
																"type": "dropdown",
																"label": "Line Width: ",
																"entries": [
																	[
																		"Use Default",
																		"default"
																	],
																	[
																		"1px",
																		1
																	],
																	[
																		"2px",
																		2
																	],
																	[
																		"3px",
																		3
																	],
																	[
																		"5px",
																		5
																	],
																	[
																		"7px",
																		7
																	],
																	[
																		"10px",
																		10
																	]
																],
																"key": "borderWidth",
																"meta": {
																	"excludeValue": "default"
																}
															},
															{
																"type": "radioButtonGroup",
																"label": "Fill Area Under Line: ",
																"entries": [
																	[
																		"Use Default",
																		"default"
																	],
																	[
																		"Don't Show",
																		false
																	],
																	[
																		"Show",
																		true
																	]
																],
																"value": "default",
																"horizontal": true,
																"key": "fill",
																"meta": {
																	"excludeValue": "default"
																}
															},
															{
																"type": "horizontalLayout",
																"formData": [
																	{
																		"type": "radioButtonGroup",
																		"label": "Area Color: ",
																		"entries": [
																			[
																				"Use Default",
																				false
																			],
																			[
																				"Select",
																				true
																			]
																		],
																		"horizontal": true,
																		"value": false,
																		"key": "selectAreaColor"
																	},
																	{
																		"type": "colorPicker",
																		"key": "backgroundColor",
																		"value": "#0000ff",
																		"selector": {
																			"parentKey": "selectAreaColor",
																			"parentValue": true
																		}
																	}
																]
															},
															{
																"type": "horizontalLayout",
																"formData": [
																	{
																		"type": "radioButtonGroup",
																		"label": "Line Tension: ",
																		"entries": [
																			[
																				"Use Default",
																				"default"
																			],
																			[
																				"Select",
																				true
																			]
																		],
																		"value": "default",
																		"horizontal": true,
																		"key": "doLineTension",
																		"meta": {
																			"excludeValue": "default"
																		}
																	},
																	{
																		"type": "slider",
																		"key": "tension",
																		"min": 0,
																		"max": 0.5,
																		"step": 0.05,
																		"value": 0,
																		"selector": {
																			"parentKey": "doLineTension",
																			"parentValue": true
																		}
																	}
																]
															},
															{
																"type": "dropdown",
																"label": "Span Gaps: ",
																"entries": [
																	[
																		"Use Default",
																		"default"
																	],
																	true,
																	false
																],
																"key": "spanGaps",
																"meta": {
																	"excludeValue": "default"
																}
															},
															{
																"type": "dropdown",
																"label": "Stepped Line: ",
																"entries": [
																	[
																		"Use Default",
																		"default"
																	],
																	false,
																	[
																		"Before",
																		"before"
																	],
																	[
																		"Middle",
																		"middle"
																	],
																	[
																		"After",
																		"after"
																	]
																],
																"key": "stepped",
																"meta": {
																	"excludeValue": "default"
																}
															}
														],
														"key": "line",
														"meta": {
															"expression": "object"
														}
													}
												]
											},
											{
												"type": "showHideLayout",
												"heading": "Point Style",
												"closed": true,
												"formData": [
													{
														"type": "panel",
														"formData": [
															{
																"type": "radioButtonGroup",
																"label": "Show Points: ",
																"entries": [
																	[
																		"Use Default",
																		"default"
																	],
																	[
																		"Show",
																		true
																	],
																	[
																		"Don't Show",
																		false
																	]
																],
																"horizontal": true,
																"value": "default",
																"key": "showPoints",
																"meta": {
																	"excludeValue": "default"
																},
																"selector": {
																	"parentKey": ["chartType"],
																	"parentValue": "line"
																}
															},
															{
																"type": "dropdown",
																"label": "Symbol: ",
																"entries": [
																	[
																		"Use Default",
																		"default"
																	],
																	"circle",
																	"cross",
																	"dash",
																	"line",
																	"rect",
																	"rectRounded",
																	"rectRot",
																	"star",
																	"triangle"
																],
																"value": "default",
																"key": "pointStyle",
																"meta": {
																	"excludeValue": "default"
																}
															},
															{
																"type": "dropdown",
																"label": "Radius: ",
																"entries": [
																	[
																		"Use Default",
																		"default"
																	],
																	[
																		"1px",
																		1
																	],
																	[
																		"2px",
																		2
																	],
																	[
																		"3px",
																		3
																	],
																	[
																		"5px",
																		5
																	],
																	[
																		"7px",
																		7
																	],
																	[
																		"10px",
																		10
																	]
																],
																"key": "radius",
																"meta": {
																	"excludeValue": "default"
																}
															},
															{
																"type": "horizontalLayout",
																"formData": [
																	{
																		"type": "radioButtonGroup",
																		"label": "Color: ",
																		"entries": [
																			[
																				"Use Default",
																				false
																			],
																			[
																				"Select",
																				true
																			]
																		],
																		"horizontal": true,
																		"value": false,
																		"key": "selectColor"
																	},
																	{
																		"type": "colorPicker",
																		"key": "borderColor",
																		"value": "#0000ff",
																		"selector": {
																			"parentKey": "selectColor",
																			"parentValue": true
																		}
																	}
																]
															},
															{
																"type": "dropdown",
																"label": "Weight: ",
																"entries": [
																	[
																		"Use Default",
																		"default"
																	],
																	[
																		"1px",
																		1
																	],
																	[
																		"2px",
																		2
																	],
																	[
																		"3px",
																		3
																	],
																	[
																		"5px",
																		5
																	],
																	[
																		"7px",
																		7
																	],
																	[
																		"10px",
																		10
																	]
																],
																"key": "borderWidth",
																"meta": {
																	"excludeValue": "default"
																}
															}
														],
														"key": "point",
														"meta": {
															"expression": "object"
														}
													}
												]
											}
										],
										"key": "options",
										"meta": {
											"expression": "object"
										}
									}
								]
							}
						],
						"key": "numericFormDataSeries",
						"meta": {
							"expression": "object"
						}
					}
				},
				"key": "numericDataSeries",
				"meta": {
					"expression": "array"
				},
				"selector": {
				  parentKeys: [["chartType"],["formData","xValuesType"]],
				  actionFunction: (child,ct,xvt) => {
				    let chartType = ct.getValue();
				    if((chartType == "scatter")||((chartType == "line")&&(xvt.getValue() == "numeric"))) {
				      child.setState("normal");
				    }
				    else {
				      child.setState("inactive");
				    }
				  }
				}
			},
			{
				"type": "list",
				"label": "Plot Series Data",
				"entryType": {
					"label": "Data Series",
					"layout": {
						"type": "panel",
						"formData": [
							{
								"type": "dropdown",
								"label": "Data Format: ",
								"entries": [
									[
										"Data Array",
										"array"
									],
									[
										"Data Map (JSON Object)",
										"map"
									]
								],
								"value": "values",
								"help": "This is the format for Y data. It can be either an array or a map (JSON object). In the case of the map, the keys are the category values.",
								"key": "dataType"
							},
							{
								"type": "textField",
								"label": "Data Array: ",
								"size": 60,
								"hint": "expression",
								"help": "Enter a javascript expression, such as the name of a cell, giving the data array. The array can hold Y values or more complex structs. If it holds structs, use the 'Y Accessor' field to provide a function to read the y value from the struct.",
								"key": "dataArray",
								"selector": {
									"parentKey": "dataType",
									"parentValue": "array"
								},
								"meta": {
									"expression": "simple",
									"excludeValue": ""
								}
							},
							{
								"type": "textField",
								"label": "Data Map: ",
								"size": 60,
								"hint": "expression",
								"help": "Enter a javascript expression, such as the name of a cell, giving the data map (JSON Object). The keys are the category. The values can either be Y values or more complex structs. If it holds structs, use the 'Y Accessor' field to provide a function to read the y value from the struct.",
								"key": "dataMap",
								"selector": {
									"parentKey": "dataType",
									"parentValue": "map"
								},
								"meta": {
									"expression": "simple",
									"excludeValue": ""
								}
							},
							{
								"type": "textField",
								"label": "Y Accessor: ",
								"size": 60,
								"hint": "function, optional",
								"help": "<em>Optional</em> Enter a javascript expression giving a function f to read the Y value from entries in the array or map entries. This is not needed if the entries are the y values to be graphed.",
								"key": "yAccessor",
								"meta": {
									"expression": "simple",
									"excludeValue": ""
								}
							},
							{
								"type": "showHideLayout",
								"heading": "Series Options",
								"closed": true,
								"formData": [
									{
										"type": "panel",
										"formData": [
											{
												"type": "textField",
												"label": "Label: ",
												"size": 40,
												"hint": "text",
												"key": "label",
												"meta": {
													"excludeValue": ""
												}
											},
											{
												"type": "showHideLayout",
												"heading": "Line Style",
												"closed": true,
												"formData": [
													{
														"type": "panel",
														"formData": [
															{
																"type": "horizontalLayout",
																"formData": [
																	{
																		"type": "radioButtonGroup",
																		"label": "Color: ",
																		"entries": [
																			[
																				"Use Default",
																				false
																			],
																			[
																				"Select",
																				true
																			]
																		],
																		"horizontal": true,
																		"value": false,
																		"key": "selectColor"
																	},
																	{
																		"type": "colorPicker",
																		"key": "borderColor",
																		"value": "#0000ff",
																		"selector": {
																			"parentKey": "selectColor",
																			"parentValue": true
																		}
																	}
																]
															},
															{
																"type": "dropdown",
																"label": "Line Width: ",
																"entries": [
																	[
																		"Use Default",
																		"default"
																	],
																	[
																		"1px",
																		1
																	],
																	[
																		"2px",
																		2
																	],
																	[
																		"3px",
																		3
																	],
																	[
																		"5px",
																		5
																	],
																	[
																		"7px",
																		7
																	],
																	[
																		"10px",
																		10
																	]
																],
																"key": "borderWidth",
																"meta": {
																	"excludeValue": "default"
																}
															},
															{
																"type": "radioButtonGroup",
																"label": "Fill Area Under Line: ",
																"entries": [
																	[
																		"Use Default",
																		"default"
																	],
																	[
																		"Don't Show",
																		false
																	],
																	[
																		"Show",
																		true
																	]
																],
																"value": "default",
																"horizontal": true,
																"key": "fill",
																"meta": {
																	"excludeValue": "default"
																}
															},
															{
																"type": "horizontalLayout",
																"formData": [
																	{
																		"type": "radioButtonGroup",
																		"label": "Area Color: ",
																		"entries": [
																			[
																				"Use Default",
																				false
																			],
																			[
																				"Select",
																				true
																			]
																		],
																		"horizontal": true,
																		"value": false,
																		"key": "selectAreaColor"
																	},
																	{
																		"type": "colorPicker",
																		"key": "backgroundColor",
																		"value": "#0000ff",
																		"selector": {
																			"parentKey": "selectAreaColor",
																			"parentValue": true
																		}
																	}
																]
															},
															{
																"type": "horizontalLayout",
																"formData": [
																	{
																		"type": "radioButtonGroup",
																		"label": "Line Tension: ",
																		"entries": [
																			[
																				"Use Default",
																				"default"
																			],
																			[
																				"Select",
																				true
																			]
																		],
																		"value": "default",
																		"horizontal": true,
																		"key": "doLineTension",
																		"meta": {
																			"excludeValue": "default"
																		}
																	},
																	{
																		"type": "slider",
																		"key": "tension",
																		"min": 0,
																		"max": 0.5,
																		"step": 0.05,
																		"value": 0,
																		"selector": {
																			"parentKey": "doLineTension",
																			"parentValue": true
																		}
																	}
																]
															},
															{
																"type": "dropdown",
																"label": "Span Gaps: ",
																"entries": [
																	[
																		"Use Default",
																		"default"
																	],
																	true,
																	false
																],
																"key": "spanGaps",
																"meta": {
																	"excludeValue": "default"
																}
															},
															{
																"type": "dropdown",
																"label": "Stepped Line: ",
																"entries": [
																	[
																		"Use Default",
																		"default"
																	],
																	false,
																	[
																		"Before",
																		"before"
																	],
																	[
																		"Middle",
																		"middle"
																	],
																	[
																		"After",
																		"after"
																	]
																],
																"key": "stepped",
																"meta": {
																	"excludeValue": "default"
																}
															}
														],
														"key": "line",
														"meta": {
															"expression": "object"
														}
													}
												]
											},
											{
												"type": "showHideLayout",
												"heading": "Point Style",
												"closed": true,
												"formData": [
													{
														"type": "panel",
														"formData": [
															{
																"type": "radioButtonGroup",
																"label": "Show Points: ",
																"entries": [
																	[
																		"Use Default",
																		"default"
																	],
																	[
																		"Show",
																		true
																	],
																	[
																		"Don't Show",
																		false
																	]
																],
																"horizontal": true,
																"value": "default",
																"key": "showPoints",
																"meta": {
																	"excludeValue": "default"
																},
																"selector": {
																	"parentKey": ["chartType"],
																	"parentValue": "line"
																}
															},
															{
																"type": "dropdown",
																"label": "Symbol: ",
																"entries": [
																	[
																		"Use Default",
																		"default"
																	],
																	"circle",
																	"cross",
																	"dash",
																	"line",
																	"rect",
																	"rectRounded",
																	"rectRot",
																	"star",
																	"triangle"
																],
																"value": "default",
																"key": "pointStyle",
																"meta": {
																	"excludeValue": "default"
																}
															},
															{
																"type": "dropdown",
																"label": "Radius: ",
																"entries": [
																	[
																		"Use Default",
																		"default"
																	],
																	[
																		"1px",
																		1
																	],
																	[
																		"2px",
																		2
																	],
																	[
																		"3px",
																		3
																	],
																	[
																		"5px",
																		5
																	],
																	[
																		"7px",
																		7
																	],
																	[
																		"10px",
																		10
																	]
																],
																"key": "radius",
																"meta": {
																	"excludeValue": "default"
																}
															},
															{
																"type": "horizontalLayout",
																"formData": [
																	{
																		"type": "radioButtonGroup",
																		"label": "Color: ",
																		"entries": [
																			[
																				"Use Default",
																				false
																			],
																			[
																				"Select",
																				true
																			]
																		],
																		"horizontal": true,
																		"value": false,
																		"key": "selectColor"
																	},
																	{
																		"type": "colorPicker",
																		"key": "borderColor",
																		"value": "#0000ff",
																		"selector": {
																			"parentKey": "selectColor",
																			"parentValue": true
																		}
																	}
																]
															},
															{
																"type": "dropdown",
																"label": "Weight: ",
																"entries": [
																	[
																		"Use Default",
																		"default"
																	],
																	[
																		"1px",
																		1
																	],
																	[
																		"2px",
																		2
																	],
																	[
																		"3px",
																		3
																	],
																	[
																		"5px",
																		5
																	],
																	[
																		"7px",
																		7
																	],
																	[
																		"10px",
																		10
																	]
																],
																"key": "borderWidth",
																"meta": {
																	"excludeValue": "default"
																}
															}
														],
														"key": "point",
														"meta": {
															"expression": "object"
														}
													}
												]
											},
											{
												"type": "showHideLayout",
												"heading": "Bar Style",
												"closed": true,
												"formData": [
													{
														"type": "panel",
														"formData": [
															{
																"type": "horizontalLayout",
																"formData": [
																	{
																		"type": "radioButtonGroup",
																		"label": "Fill Color: ",
																		"entries": [
																			[
																				"Use Default",
																				false
																			],
																			[
																				"Select",
																				true
																			]
																		],
																		"horizontal": true,
																		"value": false,
																		"key": "selectAreaColor"
																	},
																	{
																		"type": "colorPicker",
																		"key": "backgroundColor",
																		"value": "#0000ff",
																		"selector": {
																			"parentKey": "selectAreaColor",
																			"parentValue": true
																		}
																	}
																]
															},
															{
																"type": "horizontalLayout",
																"formData": [
																	{
																		"type": "radioButtonGroup",
																		"label": "Border Color: ",
																		"entries": [
																			[
																				"Use Default",
																				false
																			],
																			[
																				"Select",
																				true
																			]
																		],
																		"horizontal": true,
																		"value": false,
																		"key": "selectBorderColor"
																	},
																	{
																		"type": "colorPicker",
																		"key": "borderColor",
																		"value": "#0000ff",
																		"selector": {
																			"parentKey": "selectBorderColor",
																			"parentValue": true
																		}
																	}
																]
															},
															{
																"type": "dropdown",
																"label": "Border Width: ",
																"entries": [
																	[
																		"Use Default",
																		"default"
																	],
																	[
																		"1px",
																		1
																	],
																	[
																		"2px",
																		2
																	],
																	[
																		"3px",
																		3
																	],
																	[
																		"5px",
																		5
																	],
																	[
																		"7px",
																		7
																	],
																	[
																		"10px",
																		10
																	]
																],
																"key": "borderWidth",
																"meta": {
																	"excludeValue": "default"
																}
															}
														],
														"key": "rectangle",
														"meta": {
															"expression": "object"
                                                        },
                                                        "selector": {
                                                            "parentKey": ["chartType"],
                                                            "parentValue": "bar"
                                                        }
													}
												],
												"plotTypes": [
													1
												]
											}
										],
										"key": "options",
										"meta": {
											"expression": "object"
										}
									}
								]
							}
						],
						"key": "categoryFormDataSeries",
						"meta": {
							"expression": "object"
						}
					}
				},
				"key": "categoryDataSeries",
				"meta": {
					"expression": "array"
				},
				"selector": {
				  parentKeys: [["chartType"],["formData","xValuesType"]],
				  actionFunction: (child,ct,xvt) => {
				    let chartType = ct.getValue();
				    if((chartType == "bar")||((chartType == "line")&&(xvt.getValue() == "category"))) {
				      child.setState("normal");
				    }
				    else {
				      child.setState("inactive");
				    }
				  }
				}
			},
			{
				"type": "panel",
				"formData": [
					{
						"type": "showHideLayout",
						"heading": "Chart Options",
						"closed": true,
						"formData": [
							{
								"type": "showHideLayout",
								"heading": "Title",
								"closed": true,
								"formData": [
									{
										"type": "panel",
										"formData": [
											{
												"type": "checkbox",
												"label": "Show: ",
												"value": false,
												"key": "display"
											},
											{
												"type": "textField",
												"label": "Text: ",
												"size": 40,
												"hint": "text",
												"key": "text",
												"meta": {
													"excludeValue": ""
												}
											},
											{
												"type": "dropdown",
												"label": "Font Size: ",
												"entries": [
													[
														"Use Default",
														"default"
													],
													[
														"10px",
														10
													],
													[
														"12px",
														12
													],
													[
														"14px",
														14
													],
													[
														"18px",
														18
													],
													[
														"24px",
														24
													],
													[
														"36px",
														36
													],
													[
														"48px",
														48
													]
												],
												"key": "fontSize",
												"meta": {
													"excludeValue": "default"
												}
											},
											{
												"type": "horizontalLayout",
												"formData": [
													{
														"type": "radioButtonGroup",
														"label": "Font Color: ",
														"entries": [
															[
																"Use Default",
																false
															],
															[
																"Select",
																true
															]
														],
														"horizontal": true,
														"value": false,
														"key": "selectColor"
													},
													{
														"type": "colorPicker",
														"key": "fontColor",
														"value": "#0000ff",
														"selector": {
															"parentKey": "selectColor",
															"parentValue": true
														}
													}
												]
											}
										],
										"key": "title",
										"meta": {
											"expression": "object"
										}
									}
								]
							},
							{
								"type": "showHideLayout",
								"heading": "Legend",
								"closed": true,
								"formData": [
									{
										"type": "panel",
										"formData": [
											{
												"type": "horizontalLayout",
												"formData": [
													{
														"type": "checkbox",
														"label": "Show: ",
														"value": true,
														"key": "display"
													},
													{
														"type": "dropdown",
														"label": "Position: ",
														"entries": [
															"default",
															"top",
															"bottom",
															"right",
															"left"
														],
														"value": "default",
														"key": "position",
														"selector": {
															"parentKey": "display",
															"parentValue": true
														},
														"meta": {
															"excludeValue": "default"
														}
													}
												]
											}
										],
										"key": "legend",
										"meta": {
											"expression": "object"
										}
									}
								]
							},
							{
								"type": "showHideLayout",
								"heading": "Line Style",
								"closed": true,
								"formData": [
									{
										"type": "panel",
										"formData": [
											{
												"type": "horizontalLayout",
												"formData": [
													{
														"type": "radioButtonGroup",
														"label": "Color: ",
														"entries": [
															[
																"Use Default",
																false
															],
															[
																"Select",
																true
															]
														],
														"horizontal": true,
														"value": false,
														"key": "selectColor"
													},
													{
														"type": "colorPicker",
														"key": "borderColor",
														"value": "#0000ff",
														"selector": {
															"parentKey": "selectColor",
															"parentValue": true
														}
													}
												]
											},
											{
												"type": "dropdown",
												"label": "Line Width: ",
												"entries": [
													[
														"Use Default",
														"default"
													],
													[
														"1px",
														1
													],
													[
														"2px",
														2
													],
													[
														"3px",
														3
													],
													[
														"5px",
														5
													],
													[
														"7px",
														7
													],
													[
														"10px",
														10
													]
												],
												"key": "borderWidth",
												"meta": {
													"excludeValue": "default"
												}
											},
											{
												"type": "radioButtonGroup",
												"label": "Fill Area Under Line: ",
												"entries": [
													[
														"Use Default",
														"default"
													],
													[
														"Don't Show",
														false
													],
													[
														"Show",
														true
													]
												],
												"value": "default",
												"horizontal": true,
												"key": "fill",
												"meta": {
													"excludeValue": "default"
												}
											},
											{
												"type": "horizontalLayout",
												"formData": [
													{
														"type": "radioButtonGroup",
														"label": "Area Color: ",
														"entries": [
															[
																"Use Default",
																false
															],
															[
																"Select",
																true
															]
														],
														"horizontal": true,
														"value": false,
														"key": "selectAreaColor"
													},
													{
														"type": "colorPicker",
														"key": "backgroundColor",
														"value": "#0000ff",
														"selector": {
															"parentKey": "selectAreaColor",
															"parentValue": true
														}
													}
												]
											},
											{
												"type": "horizontalLayout",
												"formData": [
													{
														"type": "radioButtonGroup",
														"label": "Line Tension: ",
														"entries": [
															[
																"Use Default",
																"default"
															],
															[
																"Select",
																true
															]
														],
														"value": "default",
														"horizontal": true,
														"key": "doLineTension",
														"meta": {
															"excludeValue": "default"
														}
													},
													{
														"type": "slider",
														"key": "tension",
														"min": 0,
														"max": 0.5,
														"step": 0.05,
														"value": 0,
														"selector": {
															"parentKey": "doLineTension",
															"parentValue": true
														}
													}
												]
											},
											{
												"type": "dropdown",
												"label": "Span Gaps: ",
												"entries": [
													[
														"Use Default",
														"default"
													],
													true,
													false
												],
												"key": "spanGaps",
												"meta": {
													"excludeValue": "default"
												}
											},
											{
												"type": "dropdown",
												"label": "Stepped Line: ",
												"entries": [
													[
														"Use Default",
														"default"
													],
													false,
													[
														"Before",
														"before"
													],
													[
														"Middle",
														"middle"
													],
													[
														"After",
														"after"
													]
												],
												"key": "stepped",
												"meta": {
													"excludeValue": "default"
												}
											}
										],
										"key": "line",
										"meta": {
											"expression": "object"
										}
									}
								],
								"selector": {
									"parentKey": "chartType",
									"parentValue": "line"
								}
							},
							{
								"type": "showHideLayout",
								"heading": "Point Style",
								"closed": true,
								"formData": [
									{
										"type": "panel",
										"formData": [
											{
												"type": "radioButtonGroup",
												"label": "Show Points: ",
												"entries": [
													[
														"Use Default",
														"default"
													],
													[
														"Show",
														true
													],
													[
														"Don't Show",
														false
													]
												],
												"horizontal": true,
												"value": "default",
												"key": "showPoints",
												"meta": {
													"excludeValue": "default"
												},
												"selector": {
													"parentKey": ["chartType"],
													"parentValue": "line"
												}
											},
											{
												"type": "dropdown",
												"label": "Symbol: ",
												"entries": [
													[
														"Use Default",
														"default"
													],
													"circle",
													"cross",
													"dash",
													"line",
													"rect",
													"rectRounded",
													"rectRot",
													"star",
													"triangle"
												],
												"value": "default",
												"key": "pointStyle",
												"meta": {
													"excludeValue": "default"
												}
											},
											{
												"type": "dropdown",
												"label": "Radius: ",
												"entries": [
													[
														"Use Default",
														"default"
													],
													[
														"1px",
														1
													],
													[
														"2px",
														2
													],
													[
														"3px",
														3
													],
													[
														"5px",
														5
													],
													[
														"7px",
														7
													],
													[
														"10px",
														10
													]
												],
												"key": "radius",
												"meta": {
													"excludeValue": "default"
												}
											},
											{
												"type": "horizontalLayout",
												"formData": [
													{
														"type": "radioButtonGroup",
														"label": "Color: ",
														"entries": [
															[
																"Use Default",
																false
															],
															[
																"Select",
																true
															]
														],
														"horizontal": true,
														"value": false,
														"key": "selectColor"
													},
													{
														"type": "colorPicker",
														"key": "borderColor",
														"value": "#0000ff",
														"selector": {
															"parentKey": "selectColor",
															"parentValue": true
														}
													}
												]
											},
											{
												"type": "dropdown",
												"label": "Weight: ",
												"entries": [
													[
														"Use Default",
														"default"
													],
													[
														"1px",
														1
													],
													[
														"2px",
														2
													],
													[
														"3px",
														3
													],
													[
														"5px",
														5
													],
													[
														"7px",
														7
													],
													[
														"10px",
														10
													]
												],
												"key": "borderWidth",
												"meta": {
													"excludeValue": "default"
												}
											}
										],
										"key": "point",
										"meta": {
											"expression": "object"
										}
									}
								],
								"selector": {
									"parentKey": "chartType",
									"parentValues": [
										"line",
										"scatter"
									]
								}
							},
							{
								"type": "showHideLayout",
								"heading": "Bar Style",
								"closed": true,
								"formData": [
									{
										"type": "panel",
										"formData": [
											{
												"type": "horizontalLayout",
												"formData": [
													{
														"type": "radioButtonGroup",
														"label": "Fill Color: ",
														"entries": [
															[
																"Use Default",
																false
															],
															[
																"Select",
																true
															]
														],
														"horizontal": true,
														"value": false,
														"key": "selectAreaColor"
													},
													{
														"type": "colorPicker",
														"key": "backgroundColor",
														"value": "#0000ff",
														"selector": {
															"parentKey": "selectAreaColor",
															"parentValue": true
														}
													}
												]
											},
											{
												"type": "horizontalLayout",
												"formData": [
													{
														"type": "radioButtonGroup",
														"label": "Border Color: ",
														"entries": [
															[
																"Use Default",
																false
															],
															[
																"Select",
																true
															]
														],
														"horizontal": true,
														"value": false,
														"key": "selectBorderColor"
													},
													{
														"type": "colorPicker",
														"key": "borderColor",
														"value": "#0000ff",
														"selector": {
															"parentKey": "selectBorderColor",
															"parentValue": true
														}
													}
												]
											},
											{
												"type": "dropdown",
												"label": "Border Width: ",
												"entries": [
													[
														"Use Default",
														"default"
													],
													[
														"1px",
														1
													],
													[
														"2px",
														2
													],
													[
														"3px",
														3
													],
													[
														"5px",
														5
													],
													[
														"7px",
														7
													],
													[
														"10px",
														10
													]
												],
												"key": "borderWidth",
												"meta": {
													"excludeValue": "default"
												}
											}
										],
										"key": "rectangle",
										"meta": {
											"expression": "object"
										},
										"selector": {
											"parentKey": ["chartType"],
											"parentValue": "bar"
										}
									}
								]
							},
							{
								"type": "showHideLayout",
								"heading": "Axes",
								"closed": true,
								"formData": [
									{
										"type": "panel",
										"formData": [
											{
												"type": "dropdown",
												"label": "X Axis Scale: ",
												"entries": [
													"linear",
													"logarithmic"
												],
												"value": "linear",
												"key": "type"
											}
										],
										"key": "xAxes",
										"meta": {
											"expression": "object"
										},
										"selector": {
                        				  parentKeys: [["chartType"],["formData","xValuesType"]],
                        				  actionFunction: (child,ct,xvt) => {
                        				    let chartType = ct.getValue();
                        				    if((chartType == "scatter")||((chartType == "line")&&(xvt.getValue() == "numeric"))) {
                        				      child.setState("normal");
                        				    }
                        				    else {
                        				      child.setState("inactive");
                        				    }
                        				  }
                        				}
									},
									{
										"type": "panel",
										"formData": [
											{
												"type": "dropdown",
												"label": "Y Axis Scale: ",
												"entries": [
													"linear",
													"logarithmic"
												],
												"value": "linear",
												"key": "type"
											},
											{
												"type": "radioButtonGroup",
												"label": "Data Series Stacking: ",
												"entries": [
													[
														"Normal",
														false
													],
													[
														"Stacked",
														true
													]
												],
												"value": false,
												"horizontal": true,
												"key": "stacked",
												"meta": {
													"excludeValue": "default"
												}
											}
										],
										"key": "yAxes",
										"meta": {
											"expression": "object"
										}
									}
								]
							}
						]
					}
				],
				"key": "options",
				"meta": {
					"expression": "object"
				}
			}
		],
		"key": "formData",
		"meta": {
			"expression": "object"
		}
	}
];
