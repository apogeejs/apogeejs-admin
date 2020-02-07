import apogeeutil from "/apogeeutil/apogeeUtilLib.js";

import Component from "/apogeeapp/component/Component.js";
import AceTextEditor from "/apogeeview/datadisplay/AceTextEditor.js";
import dataDisplayHelper from "/apogeeview/datadisplay/dataDisplayCallbackHelper.js";

/** This component represents a table object. */
export default class FunctionComponent extends Component {

    constructor(modelManager, functionObject) {
        //extend edit component
        super(modelManager,functionObject,FunctionComponent);
    };

    /** This overrides the get title method of member to return the function declaration. */
    getDisplayName(useFullPath) {
        var name = useFullPath ? this.getFullName() : this.getName();
        var argList = this.member.getArgList();
        var argListString = argList.join(",");
        return name + "(" + argListString + ")";
    }

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
        var app = this.getModelManager().getApp();
        
        //create the new view element;
        switch(viewType) {
                
            case FunctionComponent.VIEW_CODE:
                callbacks = dataDisplayHelper.getMemberFunctionBodyCallbacks(app,this.member);
                return new AceTextEditor(displayContainer,callbacks,"ace/mode/javascript",AceTextEditor.OPTION_SET_DISPLAY_MAX);
                
            case FunctionComponent.VIEW_SUPPLEMENTAL_CODE:
                callbacks = dataDisplayHelper.getMemberSupplementalCallbacks(app,this.member);
                return new AceTextEditor(displayContainer,callbacks,"ace/mode/javascript",AceTextEditor.OPTION_SET_DISPLAY_MAX);
                
            default:
    //temporary error handling...
                alert("unrecognized view element!");
                return null;
        }
    }

}


FunctionComponent.VIEW_CODE = "Code";
FunctionComponent.VIEW_SUPPLEMENTAL_CODE = "Private";

FunctionComponent.VIEW_MODES = [
    FunctionComponent.VIEW_CODE,
    FunctionComponent.VIEW_SUPPLEMENTAL_CODE
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
FunctionComponent.hasTabEntry = false;
FunctionComponent.hasChildEntry = true;
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
        if(!propertyJson.updateData) propertyJson.updateData = {};
        propertyJson.updateData.argList = apogeeutil.parseStringArray(inputValues.argListString);
    }
}
