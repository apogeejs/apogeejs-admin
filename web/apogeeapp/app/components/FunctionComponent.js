import util from "/apogeeutil/util.js";

import EditComponent from "/apogeeapp/app/component/EditComponent.js";
import AceTextEditor from "/apogeeapp/app/datadisplay/AceTextEditor.js";
import TextAreaEditor from "/apogeeapp/app/datadisplay/TextAreaEditor.js";
import dataDisplayHelper from "/apogeeapp/app/datadisplay/dataDisplayCallbackHelper.js";

/** This component represents a table object. */
export default class FunctionComponent extends EditComponent {

    constructor(workspaceUI, functionObject) {
        //extend edit component
        super(workspaceUI,functionObject,FunctionComponent);
    };

    /** This overrides the get title method of member to return the function declaration. */
    getDisplayName(useFullPath) {
        var name = useFullPath ? this.getFullName() : this.getName();
        var argList = this.getArgList();
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

        //temporary?
        let codeEditorOptions = {
            minLines: 2,
            maxLines: 1000
        }
        
        //create the new view element;
        switch(viewType) {
                
            case FunctionComponent.VIEW_CODE:
                callbacks = dataDisplayHelper.getMemberFunctionBodyCallbacks(this.member);
                return new AceTextEditor(displayContainer,callbacks,"ace/mode/javascript",codeEditorOptions);
                
            case FunctionComponent.VIEW_SUPPLEMENTAL_CODE:
                callbacks = dataDisplayHelper.getMemberSupplementalCallbacks(this.member);
                return new AceTextEditor(displayContainer,callbacks,"ace/mode/javascript",codeEditorOptions);
                
            case FunctionComponent.VIEW_DESCRIPTION:
                callbacks = dataDisplayHelper.getMemberDescriptionCallbacks(this.member);
                //return new AceTextEditor(displayContainer,callbacks,"ace/mode/text");
                return new TextAreaEditor(displayContainer,callbacks);
                
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
FunctionComponent.hasTabEntry = false;
FunctionComponent.hasChildEntry = true;
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
        if(!propertyJson.updateData) propertyJson.updateData = {};
        propertyJson.updateData.argList = util.parseStringArray(inputValues.argListString);
    }
}
