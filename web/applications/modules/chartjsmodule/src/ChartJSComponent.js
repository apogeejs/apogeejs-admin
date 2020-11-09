//These are in lieue of the import statements
let {FormInputBaseComponent} = apogeeapp;

/** This is a simple custom component example. */
export default class ChartJSComponent extends FormInputBaseComponent {
    constructor(member,modelManager,instanceToCopy,keepUpdatedFixed) {
        super(member,modelManager,instanceToCopy,keepUpdatedFixed);
    }
}

const DATA_MEMBER_FUNCTION_BODY = `
    return ChartJSCell.formResultToChartConfig(formResult);
`

FormInputBaseComponent.initializeClass(ChartJSComponent,"Chart.js Cell","apogeeapp.ChartJSCell",DATA_MEMBER_FUNCTION_BODY);


//==========================
// Here we export a function into the globals we will use in the member function name(params)
//==========================

let ChartJSCell = {};

__globals__.ChartJSCell = ChartJSCell;

const EMPTY_CHART_CONFIG = {
    data: {
        datasets: []
    },
    options: {}
}

 /** This method loads the config structure that will be passed to the chart data display. */
ChartJSCell.formResultToChartConfig = function(formResult) {
    try {
        let chartConfig;
        if(formResult) {
            if(formResult.inputType == "config") {
                let configJson = formResult.configJson;
                if(formResult.configFormat == "apogee") {
                    //"apogee format", matching form result
                    let chartType = formResult.chartType;
                    chartConfig = createChartConfig(configJson,chartType);
                }
                else if(formResult.configFormat == "chartjs") {
                    //raw chart js format
                    chartConfig = apogeeutil.jsonCopy(configJson);
                }
                else {
                    throw new Error("Input error: a valid config type is not given.");
                }
            }
            else if(formResult.inputType == "form") {
                let chartJson = formResult.formData;
                let chartType = formResult.chartType;
                chartConfig = createChartConfig(chartJson,chartType);
            }
            else {
                throw new Error("Input error: a valid input type is not given.")
            }
        }
        else {
            //provide empty chart config data
            chartConfig = EMPTY_CHART_CONFIG;
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


/** This function creates a raw chart config from a chart input json, either from the form or from a chart json input. */
function createChartConfig(chartJson,chartType) {
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
            //this option is no longer supported
            if(!Array.isArray(dataSeriesEntry.xyPoints)) throw new Error("The value for xyPoints must be an Array!");

            //points, format {x:x, y:y}
            entry.data = dataSeriesEntry.xyPoints;
        }
        else if ((dataSeriesEntry.xValues !== undefined) && (dataSeriesEntry.yValues !== undefined)) {
            if(!Array.isArray(dataSeriesEntry.xValues)) throw new Error("The value of X Data Array must be an Array!");
            if(!Array.isArray(dataSeriesEntry.yValues)) throw new Error("The value of Y Data Array must be an Array!");

            //x and y value arrays
            if (dataSeriesEntry.xValues.length != dataSeriesEntry.yValues.length) throw new Error("Data series x and y values are not the same length!");
            if((dataSeriesEntry.xAccessor)&&(!(dataSeriesEntry.xAccessor instanceof Function))) throw new Error("If an X Accessor is used, it must be a Function");
            if((dataSeriesEntry.yAccessor)&&(!(dataSeriesEntry.yAccessor instanceof Function))) throw new Error("If a Y Accessor is used, it must be a Function");

            entry.data = [];
            for (let i = 0; i < dataSeriesEntry.xValues.length; i++) {
                let point = {
                    x: dataSeriesEntry.xAccessor ? dataSeriesEntry.xAccessor(dataSeriesEntry.xValues[i]) : dataSeriesEntry.xValues[i],
                    y: dataSeriesEntry.yAccessor ? dataSeriesEntry.yAccessor(dataSeriesEntry.yValues[i]) : dataSeriesEntry.yValues[i],
                }
                entry.data.push(point);
            }
        }
        else if (dataSeriesEntry.dataArray !== undefined) {
            if(!Array.isArray(dataSeriesEntry.dataArray)) throw new Error("The value for Data Array must be an Array!");
            if((dataSeriesEntry.xAccessor)&&(!(dataSeriesEntry.xAccessor instanceof Function))) throw new Error("If an X Accessor is used, it must be a Function");
            if((dataSeriesEntry.yAccessor)&&(!(dataSeriesEntry.yAccessor instanceof Function))) throw new Error("If a Y Accessor is used, it must be a Function");

            //data array and x and y accessor function (no accessor means point format)
            entry.data = [];
            for (let i = 0; i < dataSeriesEntry.dataArray.length; i++) {
                let point = {
                    x: dataSeriesEntry.xAccessor ? dataSeriesEntry.xAccessor(dataSeriesEntry.dataArray[i]) : dataSeriesEntry.dataArray[i].x,
                    y: dataSeriesEntry.yAccessor ? dataSeriesEntry.yAccessor(dataSeriesEntry.dataArray[i]) : dataSeriesEntry.dataArray[i].y
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
        if(!Array.isArray(sourceData.xCategories)) throw new Error("The value for X Categories must be an Array, or left blank!");
        if((sourceData.xCatAccessor)&&(!(sourceData.xCatAccessor instanceof Function))) throw new Error("If a Category Accessor is used, it must be a Function");

        xCategories = sourceData.xCatAccessor ? sourceData.xCategories.map(sourceData.xCatAccessor) : sourceData.xCategories;
    }
    else {
        xCategories = [];

        //auto generator categories
        hasImplicitXCategories = true;
    }

    //read the dataset data
    data.datasets = sourceData.categoryDataSeries.map((dataSeriesEntry, index) => {
        let entry = {};

        //read the data
        if (dataSeriesEntry.dataArray !== undefined) {
            if(!Array.isArray(dataSeriesEntry.dataArray)) throw new Error("The value for Data Array must be an Array!");

            if (dataSeriesEntry.yAccessor !== undefined) {
                if(!(dataSeriesEntry.yAccessor instanceof Function)) throw new Error("If a Y Accessor is used, it must be a Function");

                entry.data = dataSeriesEntry.dataArray.map(dataSeriesEntry.yAccessor);
            }
            else {
                entry.data = dataSeriesEntry.dataArray;
            }
        }
        else if (dataSeriesEntry.dataMap !== undefined) {
            if(Array.isArray(dataSeriesEntry.dataMap)) throw new Error("The value for Data Map should be a JSON Object, not a JSON Array!");

            //we need to convert to a row array
            let data = [];
            for (let cat in dataSeriesEntry.dataMap) {
                let index = xCategories.indexOf(cat);
                if (index < 0) {
                    if (hasImplicitXCategories) {
                        //if index is not found AND categories not specified, add the category to our category array
                        index = xCategories.length;
                        xCategories.push(cat);
                    }
                    else {
                        //if categories ARE explicitly defined, ignore any unspecified category
                        continue;
                    }
                }
                let entry = dataSeriesEntry.dataMap[cat];
                let value;
                if (dataSeriesEntry.yAccessor !== undefined) {
                    if(!(dataSeriesEntry.yAccessor instanceof Function)) throw new Error("If a Y Accessor is used, it must be a Function");

                    value = dataSeriesEntry.yAccessor(entry);
                }
                else {
                    value = entry;
                }

                data[index] = value;
            }
            entry.data = data;
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
    if ((hasImplicitXCategories) && (xCategories.length === 0)) {
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

