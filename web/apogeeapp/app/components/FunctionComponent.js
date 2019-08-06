import util from "/apogeeutil/util.js";

import EditComponent from "/apogeeapp/app/component/EditComponent.js";

/** This component represents a table object. */
export default class FunctionComponent extends EditComponent {

    constructor(workspaceUI, functionObject) {
        //extend edit component
        super(workspaceUI,functionObject,FunctionComponent);
    };

    //==============================
    // Protected and Private Instance Methods
    //==============================

    /**  This method retrieves the table edit settings for this component instance
     * @protected */
    getTableEditSettings() {
        return FunctionComponent.TABLE_EDIT_SETTINGS;
    }

    /** This method should be implemented to retrieve a data display of the give type. 
     * @protected. */
    getDataDisplay(displayContainer,viewType) {
        
        var callbacks;
        
        //create the new view element;
        switch(viewType) {
                
            case FunctionComponent.VIEW_CODE:
                callbacks = apogeeapp.app.dataDisplayCallbackHelper.getMemberFunctionBodyCallbacks(this.member);
                return new apogeeapp.app.AceTextEditor(displayContainer,callbacks,"ace/mode/javascript");
                
            case FunctionComponent.VIEW_SUPPLEMENTAL_CODE:
                callbacks = apogeeapp.app.dataDisplayCallbackHelper.getMemberSupplementalCallbacks(this.member);
                return new apogeeapp.app.AceTextEditor(displayContainer,callbacks,"ace/mode/javascript");
                
            case FunctionComponent.VIEW_DESCRIPTION:
                callbacks = apogeeapp.app.dataDisplayCallbackHelper.getMemberDescriptionCallbacks(this.member);
                //return new apogeeapp.app.AceTextEditor(displayContainer,callbacks,"ace/mode/text");
                return new apogeeapp.app.TextAreaEditor(displayContainer,callbacks);
                
            default:
    //temporary error handling...
                alert("unrecognized view element!");
                return null;
        }
    }

}


FunctionComponent.VIEW_CODE = "Code";
FunctionComponent.VIEW_SUPPLEMENTAL_CODE = "Private";
FunctionComponent.VIEW_DESCRIPTION = "Notes";

FunctionComponent.VIEW_MODES = [
    FunctionComponent.VIEW_CODE,
    FunctionComponent.VIEW_SUPPLEMENTAL_CODE,
    FunctionComponent.VIEW_DESCRIPTION
];

FunctionComponent.TABLE_EDIT_SETTINGS = {
    "viewModes": FunctionComponent.VIEW_MODES,
    "defaultView": FunctionComponent.VIEW_CODE
}


//======================================
// This is the component generator, to register the component
//======================================

FunctionComponent.displayName = "Function";
FunctionComponent.uniqueName = "apogeeapp.app.FunctionComponent";
FunctionComponent.DEFAULT_WIDTH = 400;
FunctionComponent.DEFAULT_HEIGHT = 400;
FunctionComponent.ICON_RES_PATH = "/componentIcons/functionTable.png";
FunctionComponent.DEFAULT_MEMBER_JSON = {
    "type": "apogee.FunctionTable"
};
FunctionComponent.propertyDialogLines = [
    {
        "type":"inputElement",
        "heading":"Arg List: ",
        "resultKey":"argListString"
    }
];
FunctionComponent.transferMemberProperties = function(inputValues,propertyJson) {
    if(inputValues.argListString != undefined) { 
        if(!propertyJson.updateData) {
            propertyJson.updateData = {};
        }
        propertyJson.updateData.argList = util.parseStringArray(inputValues.argListString);
    }
}
