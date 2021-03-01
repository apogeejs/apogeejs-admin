//These are in lieue of the import statements
let {FormInputBaseComponentView,AceTextEditor} = apogeeview;

/** This is a graphing component using ChartJS. It consists of a single data table that is set to
 * hold the generated chart data. The input is configured with a form, which gives multiple options
 * for how to set the data. */
export default class WebRequestComponentView extends FormInputBaseComponentView {

    constructor(modelView,component) {
        super(modelView,component);
    };

    //=================================
    // Implementation Methods
    //=================================

    /**  This method retrieves the table edit settings for this component instance
     * @protected */
    getTableEditSettings() {
        return WebRequestComponentView.TABLE_EDIT_SETTINGS;
    }

    /** This method should be implemented to retrieve a data display of the give type. 
     * @protected. */
    getDataDisplay(displayContainer,viewType) {
        let dataDisplaySource;
        switch(viewType) {

            case WebRequestComponentView.VIEW_HEADER:
                dataDisplaySource = this._getHeaderDataSource();
                return new AceTextEditor(displayContainer,dataDisplaySource,"ace/mode/json",AceTextEditor.OPTION_SET_DISPLAY_SOME);

            case WebRequestComponentView.VIEW_DATA:
                //figure out if we want a grid or plain json
                let formResultMember = this.getComponent().getField("member.formResult");
                let formResultData = formResultMember.getData();
                let useJsonFormat = false;
                if(formResultData) {
                    useJsonFormat = (formResultData.outputFormat == "json");
                }

                dataDisplaySource = this._getBodyDataSource(useJsonFormat);
                if(useJsonFormat) {
                    return new AceTextEditor(displayContainer,dataDisplaySource,"ace/mode/json",AceTextEditor.OPTION_SET_DISPLAY_SOME);
                }
                else {
                    return new AceTextEditor(displayContainer,dataDisplaySource,"ace/mode/text",AceTextEditor.OPTION_SET_DISPLAY_SOME);
                }

            case WebRequestComponentView.VIEW_INPUT:
                return this.getFormDataDisplay(displayContainer);

            default:
                console.error("unrecognized view element: " + viewType);
                return null;
        }
    }

    /** This method returns the form layout.
     * @protected. */
    getFormLayout() {
        return [
            {
                type: "heading",
                level: 2,
                text: "Request"
            },
            {
                type: "textField",
                label: "URL: ",
                size: 80,
                key: "url",
                hint: "string"
            },
            {
                type: "dropdown",
                label: "Method: ",
                entries: [["--not specified--",null],"GET","POST","PUT","HEAD","PATCH","DELETE"],
                value: "GET",
                key: "method",
                meta: {
                    excludeValue: null
                }
            },
            {
                type: "textField",
                label: "Body: ",
                size: 80,
                key: "body",
                meta: {
                    expression: "simple",
                    excludeValue: ""
                },
                hint: "optional, reference"
            },
             {
                type: "showHideLayout", //REQUIRED
                heading: "Headers", //OPTIONAL
                level: 3, //OPTIONAL
                closed: true, //OPTIONAL - This gives the initial state
                formData: [ //REQUIRED - These are elements in the layout. They still appead as children in the parent form.
                    {
                        type: "list",
                        label: "Headers: ",
                        entryType: {
                            label: "Header",
                            layout: {
                                type: "panel",
                                formData: [
                                    {
                                        type: "textField",
                                        label: "Key: ",
                                        key: "key"
                                    },
                                    {
                                        type: "textField",
                                        label: "Value: ",
                                        key: "value"
                                    }
                                ],
                                key: "header"
                            }
                        },
                        key: "headers"
                    }
                ]
            },
            {
                type: "heading",
                level: 2,
                text: "Response",
            },
            {
                type: "radioButtonGroup",
                label: "Output Format: ",
                entries: [["Text","text"],["JSON","json"]],
                key: "outputFormat",
            }
        ]
    }

    //==========================
    // Private Methods
    //==========================

    _getBodyDataSource(useJsonFormat) {
        return {
            doUpdate: () => {
                //return value is whether or not the data display needs to be udpated
                let reloadData = this.getComponent().isMemberDataUpdated("member.data");
                //we only need to reload if the output format changes, but for now we will reload for any input change 
                let reloadDataDisplay = this.getComponent().isMemberDataUpdated("member.formData");
                return {reloadData,reloadDataDisplay};
            },
    
            getData: () => {
                let bodyData = this.getComponent().getField("member.data").getData();
                if(bodyData != apogeeutil.INVALID_VALUE) {
                    if(!bodyData) bodyData = "";
                    if(useJsonFormat) {
                        //return json as text for text editor
                        return JSON.stringify(bodyData,null,JSON_TEXT_FORMAT_STRING);
                    }
                    else {
                        //return the plain text
                        return bodyData;
                    }
                }
                else {
                    return apogeeutil.INVALID_VALUE;
                }
            }
        }
    }

    _getHeaderDataSource() {
        return {
            doUpdate: () => {
                //return value is whether or not the data display needs to be udpated
                let reloadData = this.getComponent().isMemberDataUpdated("member.data");
                //we only need to reload if the output format changes, but for now we will reload for any input change 
                let reloadDataDisplay = this.getComponent().isMemberDataUpdated("member.formData");
                return {reloadData,reloadDataDisplay};
            },
    
            getData: () => {
                return {};
            }
        }
    }

}

//======================================
// Static properties
//======================================

//===================================
// View Definitions Constants (referenced internally)
//==================================

WebRequestComponentView.VIEW_HEADER = "Header";
WebRequestComponentView.VIEW_DATA = "Data";

WebRequestComponentView.VIEW_MODES = [
    {name: WebRequestComponentView.VIEW_HEADER, label: "Header", isActive: false},
    {name: WebRequestComponentView.VIEW_DATA, label: "Body", isActive: false},
    FormInputBaseComponentView.INPUT_VIEW_MODE_INFO
];

WebRequestComponentView.TABLE_EDIT_SETTINGS = {
    "viewModes": WebRequestComponentView.VIEW_MODES
}


//===============================
// Required External Settings
//===============================

/** This is the component name with which this view is associated. */
WebRequestComponentView.componentName = "apogeeapp.WebRequestCell";

/** If true, this indicates the component has a tab entry */
WebRequestComponentView.hasTabEntry = false;
/** If true, this indicates the component has an entry appearing on the parent tab */
WebRequestComponentView.hasChildEntry = true;

/** This is the icon url for the component. */
WebRequestComponentView.ICON_RES_PATH = "/icons3/mapCellIcon.png";

//-----------------------
// Other random internal constants
//-----------------------

const JSON_TEXT_FORMAT_STRING = "\t";



