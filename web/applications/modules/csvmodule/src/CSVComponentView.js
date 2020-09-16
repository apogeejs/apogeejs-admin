//These are in lieue of the import statements
let { ComponentView,ConfigurableFormEditor,dataDisplayHelper,HandsonGridEditor} = apogeeview;
let { getFormResultFunctionBody } = apogeeui;

/** This is a graphing component using ChartJS. It consists of a single data table that is set to
 * hold the generated chart data. The input is configured with a form, which gives multiple options
 * for how to set the data. */
export default class CSVComponentView extends ComponentView {

    constructor(modelView,component) {
        super(modelView,component);
    };

    /**  This method retrieves the table edit settings for this component instance
     * @protected */
    getTableEditSettings() {
        return CSVComponentView.TABLE_EDIT_SETTINGS;
    }

    /** This method should be implemented to retrieve a data display of the give type. 
     * @protected. */
    getDataDisplay(displayContainer,viewType) {

        let dataDisplaySource;
        let app = this.getModelView().getApp();

        //create the new view element;
        switch(viewType) {

            case CSVComponentView.VIEW_HEADER:
                dataDisplaySource = this._getHeaderDataSource();
                let editor = new HandsonGridEditor(displayContainer,dataDisplaySource);
                editor.updateHeight(HEADER_GRID_PIXEL_HEIGHT);
                return editor;

            case CSVComponentView.VIEW_DATA:
                dataDisplaySource = dataDisplayHelper.getMemberDataJsonDataSource(app,this,"member.data.body");
                return new HandsonGridEditor(displayContainer,dataDisplaySource);

            case CSVComponentView.VIEW_INPUT:
                dataDisplaySource = this._getInputFormDataSource();
                return new ConfigurableFormEditor(displayContainer,dataDisplaySource);

            default:
                console.error("unrecognized view element: " + viewType);
                return null;
        }
    }

    //=================================
    // Implementation Methods
    //=================================

    /** This is the data source for the input form data display */
    _getInputFormDataSource() {
        return {
            doUpdate: () => {
                //data updates should only be triggered by the form itself
                let reloadData = this.getComponent().isMemberDataUpdated("member.input");
                //form layout constant
                let reloadDataDisplay = false;
                return {reloadData,reloadDataDisplay};
            }, 
            getDisplayData: () => this._getFormLayout(),
            getData: () => this._getFormData(),
            getEditOk: () => true,
            saveData: (formData) => this._onSubmit(formData)
        }
    }

    _getHeaderDataSource() {
        return {
            doUpdate: () => {
                //return value is whether or not the data display needs to be udpated
                let reloadData = this.getComponent().isMemberDataUpdated("member.data.header");
                let reloadDataDisplay = false;
                return {reloadData,reloadDataDisplay};
            },
    
            getData: () => {
                let headerRow = this.getComponent().getField("member.data.header").getData();
                if(headerRow != apogeeutil.INVALID_VALUE) {
                    //for display wrap header row into a matrix
                    return [headerRow];
                }
                else {
                    return apogeeutil.INVALID_VALUE;
                }
            }
        }
    }

    //=====================================
    // Private Methods
    //=====================================

    /** This method gets the form value data that will be passed to the input form. */
    _getFormData() {
        let memberData = this.getComponent().getField("member.input").getData();
        if((memberData)&&(memberData.storedFormValue)) {
            return memberData.storedFormValue;
        }
        else {
            return {};
        }
    }

    _getFormLayout() {
        return [
            {
                type: "textField",
                label: "Input Text Data: ",
                size: 60,
                key: "input",
                hint: "expression",
                help: INPUT_HELP_TEXT,
                meta: {
                    expression: "simple",
                    excludeValue: ""
                }
            },
            {
                type: "checkbox",
                label: "Dynamic Typing: ",
                value: false,
                key: "dynamicTyping",
                help: DYNAMIC_TYPING_HELP_TEXT
            },
            {
                type: "checkbox",
                label: "Skip Empty Lines: ",
                value: false,
                key: "skipEmptyLines",
                help: SKIP_EMPTY_HELP_TEXT
            }
        ]
    }
    
    /** This method saves the form result converted to a function body that handles expression inputs.
     * This is saved to the formula for the member object. */
    _onSubmit(formData) {
        //load the form meta - we have to look it up from the data display (this is a little clumsy)
        let formMeta;
        let formEditor = this.getCurrentDataDisplayInstance(CSVComponentView.VIEW_INPUT);
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
        var member = this.getComponent().getField("member.input");

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

//======================================
// Static properties
//======================================

CSVComponentView.VIEW_HEADER = "Header";
CSVComponentView.VIEW_DATA = "Data";
CSVComponentView.VIEW_INPUT = "Input";

CSVComponentView.VIEW_MODES = [
    {name: CSVComponentView.VIEW_HEADER, label: "Header", isActive: false},
	{name: CSVComponentView.VIEW_DATA, label: "Data", isActive: false},
    {name: CSVComponentView.VIEW_INPUT, label: "Configuration", isActive: true}
];

CSVComponentView.TABLE_EDIT_SETTINGS = {
    "viewModes": CSVComponentView.VIEW_MODES,
    "defaultView": CSVComponentView.VIEW_DATA
}

const INPUT_HELP_TEXT = "This should be a javascript expression, such as the name of a cell, which gives the raw CSV text. It will be converted to JSON format." + 
" To access this json value, use the expression <em>[cell name].data</em> to access the data rows and <em>[cell name].header</em>  to access the header row.";
const DYNAMIC_TYPING_HELP_TEXT = "Check this box to automatically convert numbers and booleans. If this is not selected, all data will be strings.";
const SKIP_EMPTY_HELP_TEXT = "Check this box to omit a row with no content, often the last row.";

const HEADER_GRID_PIXEL_HEIGHT = 75;


//===============================
// External Settings
//===============================

/** This is the component name with which this view is associated. */
CSVComponentView.componentName = "apogeeapp.CSVCell";

/** If true, this indicates the component has a tab entry */
CSVComponentView.hasTabEntry = false;
/** If true, this indicates the component has an entry appearing on the parent tab */
CSVComponentView.hasChildEntry = true;

/** This is the icon url for the component. */
CSVComponentView.ICON_RES_PATH = "/icons3/gridCellIcon.png";

