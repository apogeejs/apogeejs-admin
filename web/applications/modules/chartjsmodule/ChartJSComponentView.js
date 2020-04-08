import DataDisplay from "/apogeeview/datadisplay/DataDisplay.js";
import apogeeui from "/apogeeui/apogeeui.js";
import ComponentView from "/apogeeview/componentdisplay/ComponentView.js";
//import ConfigurableFormEditor from "/apogeeview/datadisplay/AceTextEditor.js";
import AceTextEditor from "/apogeeview/datadisplay/AceTextEditor.js";
import dataDisplayHelper from "/apogeeview/datadisplay/dataDisplayHelper.js";

/** This is the base class for a  basic control component. To create a
 * new control component, extend this class implementing the needed methods
 * and create a generator. */
export default class ChartJSComponentView extends ComponentView {

    constructor(modelView,component) {
        //extend edit component
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
                dataSource = this.getChartDataSource();
                return new ChartJSDisplay(displayContainer,dataSource);

            case ChartJSComponentView.VIEW_INPUT:
                // dataSource = this.getInputFormDataSource();
                // return new ConfigurableFormEditor(displayContainer,dataSource);
                let app = this.getModelView().getApp();
                dataSource = dataDisplayHelper.getMemberFunctionBodyDataSource(app,this,"member");
                return new AceTextEditor(displayContainer,dataSource,"ace/mode/javascript",AceTextEditor.OPTION_SET_DISPLAY_MAX);

            default:
                alert("unrecognized view element!");
                return null;
        }
    }

    //=================================
    // Implementation Methods
    //=================================

    getChartDataSource() {

        return {
            doUpdate: () => {
                //return value is whether or not the data display needs to be udpated
                let reloadData = this.getComponent().isMemberDataUpdated("member");
                let reloadDataDisplay = false;
                return {reloadData,reloadDataDisplay};
            },

            getData: () => {
                return this.getComponent().getMember().getData();
            },
        }
    }

    // getInputFormDataSource() {

    // }

}

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

        //it seems if the options change I need to create a new chart object, at least
        //in the scenarios I was trying. I will do that below.
        let prevOptions = this.config.options;

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
        if((!this.chart)||(!apogeeutil.jsonEquals(prevOptions,config.options))) {
            this.chart = new Chart(this.canvasElement,this.config);
        }
        else {
            this.chart.update();
        }
    }

    /** This method is called on loading the display. OPTIONAL */
    // onLoad() {
    // }
}

