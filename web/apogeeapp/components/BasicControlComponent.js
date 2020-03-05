import Component from "/apogeeapp/component/Component.js";
import AceTextEditor from "/apogeeview/datadisplay/AceTextEditor.js";
import dataDisplayHelper from "/apogeeview/datadisplay/dataDisplayCallbackHelper.js";
import DATA_DISPLAY_CONSTANTS from "/apogeeview/datadisplay/dataDisplayConstants.js";

/** This is the base class for a  basic control component. To create a
 * new control component, extend this class implementing the needed methods
 * and create a generator. */
export default class BasicControlComponent extends Component{
    
    constructor(modelManager,control) {
        super(modelManager,control);
    
        //&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&
        //FIELDS
        //default to keep alive
        let displayDestroyFlags = DATA_DISPLAY_CONSTANTS.DISPLAY_DESTROY_FLAG_NEVER;
        this.setField("displayDestroyFlags",displayDestroyFlags);
        //&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&
    };

    //==============================
    // Methods to Implement
    //==============================

    //This method must be implemented
    ///** This method returns the outout data display/editor for the control */
    //getOutputDisplay(displayContainer);

    //==============================
    // Protected and Private Instance Methods
    //==============================

    /** Set this value to true if the resource should not be destroyed each time
     * the display is hidden.
     */
    setDisplayDestroyFlags(displayDestroyFlags) {
        this.setField("displayDestroyFlags",displayDestroyFlags);

        if(this.outputDisplayContainer) {
            this.outputDisplayContainer.setDisplayDestroyFlags(displayDestroyFlags);
        }
    }



    /**  This method retrieves the table edit settings for this component instance
     * @protected */
    getTableEditSettings() {
        return BasicControlComponent.TABLE_EDIT_SETTINGS;
    }

    /** This method should be implemented to retrieve a data display of the give type. 
     * @protected. */
    getDataDisplay(displayContainer,viewType) {

        var callbacks;
        var app = this.getModelManager().getApp();

        //create the new view element;
        switch(viewType) {

            case BasicControlComponent.VIEW_OUTPUT:
                displayContainer.setDisplayDestroyFlags(this.getField("displayDestroyFlags"));
                this.outputDisplayContainer = displayContainer;
                return this.getOutputDisplay(displayContainer);

            case BasicControlComponent.VIEW_CODE:
                callbacks = dataDisplayHelper.getMemberFunctionBodyCallbacks(app,this.member);
                return new AceTextEditor(displayContainer,callbacks,"ace/mode/javascript",AceTextEditor.OPTION_SET_DISPLAY_MAX);

            case BasicControlComponent.VIEW_SUPPLEMENTAL_CODE:
                callbacks = dataDisplayHelper.getMemberSupplementalCallbacks(app,this.member);
                return new AceTextEditor(displayContainer,callbacks,"ace/mode/javascript",AceTextEditor.OPTION_SET_DISPLAY_MAX);

            default:
    //temporary error handling...
                alert("unrecognized view element!");
                return null;
        }
    }

    /** This method creates a basic generator for the extending object. */
    static attachStandardStaticProperties(componentClass,displayName,uniqueName) {
        componentClass.displayName = displayName;
        componentClass.uniqueName = uniqueName;
        componentClass.hasTabEntry = false;
        componentClass.hasChildEntry = true;
        componentClass.ICON_RES_PATH = "/componentIcons/chartControl.png";
        componentClass.DEFAULT_MEMBER_JSON = {
            "type": "apogee.JsonTable"
        };
    }
}

//======================================
// Static properties
//======================================

BasicControlComponent.VIEW_OUTPUT = "Output";
BasicControlComponent.VIEW_CODE = "Code";
BasicControlComponent.VIEW_SUPPLEMENTAL_CODE = "Private";

BasicControlComponent.VIEW_MODES = [
	BasicControlComponent.VIEW_OUTPUT,
	BasicControlComponent.VIEW_CODE,
    BasicControlComponent.VIEW_SUPPLEMENTAL_CODE
];

BasicControlComponent.TABLE_EDIT_SETTINGS = {
    "viewModes": BasicControlComponent.VIEW_MODES,
    "defaultView": BasicControlComponent.VIEW_OUTPUT
}





