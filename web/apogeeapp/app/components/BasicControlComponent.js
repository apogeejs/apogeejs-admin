import Component from "/apogeeapp/app/component/Component.js";
import EditComponent from "/apogeeapp/app/component/EditComponent.js";
import AceTextEditor from "/apogeeapp/app/datadisplay/AceTextEditor.js";
import TextAreaEditor from "/apogeeapp/app/datadisplay/TextAreaEditor.js";
import dataDisplayHelper from "/apogeeapp/app/datadisplay/dataDisplayCallbackHelper.js";

/** This is the base class for a  basic control component. To create a
 * new control component, extend this class implementing the needed methods
 * and create a generator. */
export default class BasicControlComponent extends EditComponent{
    
    constructor(workspaceUI,control,componentGenerator) {
        super(workspaceUI,control,componentGenerator);
    
        //default to keep alive
        this.displayDestroyFlags = apogeeapp.app.DisplayContainer.DISPLAY_DESTROY_FLAG_NEVER;
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
        this.displayDestroyFlags = displayDestroyFlags;

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

        //create the new view element;
        switch(viewType) {

            case BasicControlComponent.VIEW_OUTPUT:
                displayContainer.setDisplayDestroyFlags(this.displayDestroyFlags);
                this.outputDisplayContainer = displayContainer;
                return this.getOutputDisplay(displayContainer);

            case BasicControlComponent.VIEW_CODE:
                callbacks = dataDisplayHelper.getMemberFunctionBodyCallbacks(this.member);
                return new AceTextEditor(displayContainer,callbacks,"ace/mode/javascript");

            case BasicControlComponent.VIEW_SUPPLEMENTAL_CODE:
                callbacks = dataDisplayHelper.getMemberSupplementalCallbacks(this.member);
                return new AceTextEditor(displayContainer,callbacks,"ace/mode/javascript");

            case BasicControlComponent.VIEW_DESCRIPTION:
                callbacks = dataDisplayHelper.getMemberDescriptionCallbacks(this.member);
                //return new AceTextEditor(displayContainer,callbacks,"ace/mode/text");
                return new TextAreaEditor(displayContainer,callbacks);

            default:
    //temporary error handling...
                alert("unrecognized view element!");
                return null;
        }
    }

    /** This method creates a basic generator for the extending object. */
    static attachStandardStaticProperties(componentGenerator,displayName,uniqueName) {
        componentGenerator.displayName = displayName;
        componentGenerator.uniqueName = uniqueName;
        componentGenerator.DEFAULT_WIDTH = 500;
        componentGenerator.DEFAULT_HEIGHT = 500;
        componentGenerator.ICON_RES_PATH = "/componentIcons/chartControl.png";
    }
}

//======================================
// Static properties
//======================================

BasicControlComponent.VIEW_OUTPUT = "Output";
BasicControlComponent.VIEW_CODE = "Code";
BasicControlComponent.VIEW_SUPPLEMENTAL_CODE = "Private";
BasicControlComponent.VIEW_DESCRIPTION = "Notes";

BasicControlComponent.VIEW_MODES = [
	BasicControlComponent.VIEW_OUTPUT,
	BasicControlComponent.VIEW_CODE,
    BasicControlComponent.VIEW_SUPPLEMENTAL_CODE,
    BasicControlComponent.VIEW_DESCRIPTION
];

BasicControlComponent.TABLE_EDIT_SETTINGS = {
    "viewModes": BasicControlComponent.VIEW_MODES,
    "defaultView": BasicControlComponent.VIEW_OUTPUT
}





