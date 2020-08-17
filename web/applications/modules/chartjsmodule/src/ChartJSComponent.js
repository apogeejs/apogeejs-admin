//These are in lieue of the import statements
let {Component} = apogeeapp;

/** This is a simple custom component example. */
export default class ChartJSComponent extends Component {
    constructor(member,modelManager,instanceToCopy,keepUpdatedFixed) {
        super(member,modelManager,instanceToCopy,keepUpdatedFixed);
    }

    getChartType() {
        let chartType = this.getField("chartType");
        if(!chartType) chartType = ChartJSComponent.DEFAULT_CHART_TYPE;
        return chartType;
    }

    setChartType(chartType) {
        let oldChartType = this.getField("chartType");
        if(oldChartType != chartType) {
            this.setField("chartType",chartType);
        }
    }

    getDebugOutputType() {
        let debugOutputType = this.getField("debugOutputType");
        if(!debugOutputType) debugOutputType = ChartJSComponent.DEFAULT_DEBUG_OUTPUT_TYPE;
        return debugOutputType;
    }

    setDebugOutputType(debugOutputType) {
        let oldDebugOutputType = this.getField("debugOutputType");
        if(oldDebugOutputType != debugOutputType) {
            this.setField("debugOutputType",debugOutputType);
        }
    }

    //==============================
    // serialization
    //==============================

    writeToJson(json,modelManager) {
        json.chartType = this.getChartType();
        json.debugOutputType = this.getDebugOutputType();
    }

    readPropsFromJson(json) {
        if(json.chartType !== undefined) {
            this.setChartType(json.chartType);
        }
        if(json.debugOutputType !== undefined) {
            this.setDebugOutputType(json.debugOutputType);
        }
    }

    //======================================
    // properties
    //======================================

    /** This returns the current values for the member and component properties in the  
     * proeprties dialog. */
    readExtendedProperties(values) {
        values.chartType = this.getChartType();
        values.debugOutputType = this.getDebugOutputType();
    }

    //======================================
    // Static methods
    //======================================

    /** This optional static function reads property input from the property 
     * dialog and copies it into a component property json. */
    static transferComponentProperties(inputValues,propertyJson) {
        if(inputValues.chartType !== undefined) {
            propertyJson.chartType = inputValues.chartType;
        }
        if(inputValues.debugOutputType !== undefined) {
            propertyJson.debugOutputType = inputValues.debugOutputType;
        }
    }
}

/** This is the display name for the type of component */
ChartJSComponent.displayName = "Chart.js Cell";

/** This is the univeral unique name for the component, used to deserialize the component. */
ChartJSComponent.uniqueName = "apogeeapp.ChartJSCell";

/** This is the json needed to create the necessary members for the  component */
ChartJSComponent.DEFAULT_MEMBER_JSON = {
     "type": "apogee.JsonMember"
};

ChartJSComponent.DEFAULT_CHART_TYPE = "line";
ChartJSComponent.DEFAULT_DEBUG_OUTPUT_TYPE = "JSON"; //other choice "Chart Config"
