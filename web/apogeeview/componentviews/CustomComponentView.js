import ComponentView from "/apogeeview/componentdisplay/ComponentView.js";
import AceTextEditor from "/apogeeview/datadisplay/AceTextEditor.js";
import StandardErrorDisplay from "/apogeeview/datadisplay/StandardErrorDisplay.js";
import HtmlJsDataDisplay from "/apogeeview/datadisplay/HtmlJsDataDisplay.js";
import dataDisplayHelper from "/apogeeview/datadisplay/dataDisplayHelper.js";
import DATA_DISPLAY_CONSTANTS from "/apogeeview/datadisplay/dataDisplayConstants.js";
import {uiutil} from "/apogeeui/apogeeUiLib.js";

/** This is a custom resource component. 
 * To implement it, the resource script must have the methods "run()" which will
 * be called when the component is updated. It also must have any methods that are
 * confugred with initialization data from the model. */
export default class CustomComponentView extends ComponentView {

    constructor(modelView,component) {
        super(modelView,component);

        //^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
        //add css to page! I think this should go in a separate on create event, but until I 
        //make this, I iwll put this here.
        let css = component.getField("css");
        if((css)&&(css != "")) {
            uiutil.setObjectCssData(component.getId(),css);
        }
        //^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
    };

    /** This component overrides the componentupdated to process the css data, which is managed directly in the view. */
    componentUpdated(component) {
        super.componentUpdated(component);

        //if this is the css field, set it immediately
        if(component.isFieldUpdated("css")) {
            uiutil.setObjectCssData(component.getId(),component.getField("css"));
        }
    }

    //==============================
    // Protected and Private Instance Methods
    //==============================

    /** This component extends the on delete method to get rid of any css data for this component. */
    onDelete() {
        //remove the css data for this component
        uiutil.setObjectCssData(this.component.getId(),"");
        
        super.onDelete();
    }

    /**  This method retrieves the table edit settings for this component instance
     * @protected */
    getTableEditSettings() {
        return CustomComponentView.TABLE_EDIT_SETTINGS;
    }

    /** This method should be implemented to retrieve a data display of the give type. 
     * @protected. */
    getDataDisplay(displayContainer,viewType) {
        
        var dataDisplaySource;
        var app = this.getModelView().getApp();
        
        //create the new view element;
        switch(viewType) {
            
            case CustomComponentView.VIEW_OUTPUT:
                displayContainer.setDestroyViewOnInactive(this.getComponent().getDestroyOnInactive());
                var dataDisplaySource = this.getOutputDataDisplaySource();
                var dataDisplay = new HtmlJsDataDisplay(displayContainer,dataDisplaySource);
                return dataDisplay;
                
            case CustomComponentView.VIEW_CODE:
                dataDisplaySource = dataDisplayHelper.getMemberFunctionBodyDataSource(app,this,"member");
                return new AceTextEditor(displayContainer,dataDisplaySource,"ace/mode/javascript",AceTextEditor.OPTION_SET_DISPLAY_MAX);
                
            case CustomComponentView.VIEW_SUPPLEMENTAL_CODE:
                dataDisplaySource = dataDisplayHelper.getMemberSupplementalDataSource(app,this,"member");
                return new AceTextEditor(displayContainer,dataDisplaySource,"ace/mode/javascript",AceTextEditor.OPTION_SET_DISPLAY_MAX);
            
            case CustomComponentView.VIEW_HTML:
                dataDisplaySource = this.getUiDataDisplaySource("html");
                return new AceTextEditor(displayContainer,dataDisplaySource,"ace/mode/html",AceTextEditor.OPTION_SET_DISPLAY_MAX);
        
            case CustomComponentView.VIEW_CSS:
                dataDisplaySource = this.getUiDataDisplaySource("css");
                return new AceTextEditor(displayContainer,dataDisplaySource,"ace/mode/css",AceTextEditor.OPTION_SET_DISPLAY_MAX);
                
            case CustomComponentView.VIEW_UI_CODE:
                dataDisplaySource = this.getUiDataDisplaySource("uiCode");
                return new AceTextEditor(displayContainer,dataDisplaySource,"ace/mode/javascript",AceTextEditor.OPTION_SET_DISPLAY_MAX);

            case ComponentView.VIEW_INFO: 
                dataDisplaySource = dataDisplayHelper.getStandardErrorDataSource(app,this);
                return new StandardErrorDisplay(displayContainer,dataDisplaySource);
                
            default:
    //temporary error handling...
                console.error("unrecognized view element: " + viewType);
                return null;
        }
    }

    getOutputDataDisplaySource() {

        return {

            //This method reloads the component and checks if there is a DATA update. UI update is checked later.
            doUpdate: () => {
                //return value is whether or not the data display needs to be udpated
                let reloadData = this.getComponent().isMemberDataUpdated("member");
                let reloadDataDisplay = this.getComponent().areAnyFieldsUpdated(["html","uiCode"]);
                return {reloadData,reloadDataDisplay};
            },

            getData: () => {
                let member = this.getComponent().getMember();
                let wrappedData = DATA_DISPLAY_CONSTANTS.getEmptyWrappedData();
                switch(member.getState()) {
                    case apogeeutil.STATE_NORMAL:
                        wrappedData.data = member.getData();
                        wrappedData.hideDisplay = false;
                        wrappedData.messageType = DATA_DISPLAY_CONSTANTS.MESSAGE_TYPE_NONE;
                        break;

                    case apogeeutil.STATE_ERROR:
                        wrappedData.hideDisplay = true;
                        wrappedData.messageType = DATA_DISPLAY_CONSTANTS.MESSAGE_TYPE_ERROR;
                        wrappedData.message = "Error in data value: " + member.getErrorMsg();
                        break;

                    case apogeeutil.STATE_PENDING:
                        wrappedData.hideDisplay = true;
                        wrappedData.messageType = DATA_DISPLAY_CONSTANTS.MESSAGE_TYPE_INFO;
                        wrappedData.message = "Display data value pending!";
                        break;

                    case apogeeutil.STATE_INVALID:
                        //CAREFUL! We don't want to hide the data view since that is how
                        //the value is set. If we hide it, there will be no way to make the
                        //value not INVALID.
                        wrappedData.data = apogeeutil.INVALID_VALUE;
                        wrappedData.hideDisplay = false;
                        wrappedData.messageType = DATA_DISPLAY_CONSTANTS.MESSAGE_TYPE_INFO;
                        wrappedData.message = "Display data value invalid!";
                        break;

                    default:
                        throw new Error("Unknown display data value state!")
                }

                return wrappedData;
            },

            //below - custom methods for HtmlJsDataDisplay

            //returns the HTML for the data display
            getHtml: () => {
                return this.getComponent().getField("html");
            },

            //returns the resource for the data display
            getResource: () => {
                return this.getComponent().createResource();
            },

            //gets the mebmer used as a refernce for the UI manager passed to the resource functions 
            getContextMember: () => {
                return this.getComponent().getMember();
            }
        }
    }

    /** This method returns the data dispklay data source for the code field data displays. */
    getUiDataDisplaySource(codeFieldName) {

        return {
            doUpdate: () => {
                //return value is whether or not the data display needs to be udpated
                let reloadData = this.getComponent().isFieldUpdated(codeFieldName);
                let reloadDataDisplay = false;
                return {reloadData,reloadDataDisplay};
            },

            getData: () => {
                let codeField = this.getComponent().getField(codeFieldName);
                if((codeField === undefined)||(codeField === null)) codeField = "";
                return codeField;
            },

            getEditOk: () => {
                return true;
            },
            
            saveData: (text) => {
                let app = this.getModelView().getApp();
                this.getComponent().doCodeFieldUpdate(app,codeFieldName,text);
                return true;
            }
        }
    }
}

CustomComponentView.VIEW_OUTPUT = "Display";
CustomComponentView.VIEW_CODE = "Input Code";
CustomComponentView.VIEW_SUPPLEMENTAL_CODE = "Input Private";
CustomComponentView.VIEW_HTML = "HTML";
CustomComponentView.VIEW_CSS = "CSS";
CustomComponentView.VIEW_UI_CODE = "uiGenerator()";

CustomComponentView.VIEW_MODES = [
    ComponentView.VIEW_INFO_MODE_ENTRY,
    {name: CustomComponentView.VIEW_OUTPUT, label: "Display", isActive: true},
    {name: CustomComponentView.VIEW_CODE, label: "Input Code", isActive: false},
    {name: CustomComponentView.VIEW_SUPPLEMENTAL_CODE, label: "Input Private", isActive: false},
    {name: CustomComponentView.VIEW_HTML, label: "HTML", isActive: false},
    {name: CustomComponentView.VIEW_CSS, label: "CSS", isActive: false},
    {name: CustomComponentView.VIEW_UI_CODE, label: "uiGenerator()", isActive: false}
];

CustomComponentView.TABLE_EDIT_SETTINGS = {
    "viewModes": CustomComponentView.VIEW_MODES
}

/** This is the format string to create the code body for updateing the member
 * Input indices:
 * 0: resouce methods code
 * 1: uiPrivate
 * @private
 */
CustomComponentView.GENERATOR_FUNCTION_FORMAT_TEXT = [
    "//member functions",
    "var resourceFunction = function(component) {",
    "{0}",
    "}",
    "//end member functions",
    "return resourceFunction;",
    ""
       ].join("\n");
    
    


//======================================
// This is the control generator, to register the control
//======================================

CustomComponentView.componentName = "apogeeapp.CustomCell";
CustomComponentView.hasTabEntry = false;
CustomComponentView.hasChildEntry = true;
CustomComponentView.ICON_RES_PATH = "/icons3/genericCellIcon.png";
CustomComponentView.propertyDialogLines = [
    {
        "type":"checkbox",
        "label":"Destroy on Hide: ",
        "key":"destroyOnInactive"
    }
];






