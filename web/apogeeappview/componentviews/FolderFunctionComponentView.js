import ParentComponentView from "/apogeeappview/componentdisplay/ParentComponentView.js";
import LiteratePageComponentDisplay from "/apogeeappview/componentdisplay/LiteratePageComponentDisplay.js";

/** This component represents a folderFunction, which is a function that is programmed using
 *apogee tables rather than writing code. */
export default class FolderFunctionComponentView extends ParentComponentView {
        
    constructor(appViewInterface,component) {
        //extend parent component
        super(appViewInterface,component);
    }

    instantiateTabDisplay() {
        return new LiteratePageComponentDisplay(this); 
    }

    //==============================
    // Child Display
    //==============================

    /**  This method retrieves the table edit settings for this component instance
     * @protected */
    getTableEditSettings() {
        return FolderFunctionComponentView.TABLE_EDIT_SETTINGS;
    }

}

//=======================
// Child View SEttings
//=======================

FolderFunctionComponentView.VIEW_MODES = [
];

FolderFunctionComponentView.TABLE_EDIT_SETTINGS = {
    "viewModes": FolderFunctionComponentView.VIEW_MODES,
}


//======================================
// This is the component generator, to register the component
//======================================

FolderFunctionComponentView.componentName = "apogeeapp.PageFunctionComponent";
FolderFunctionComponentView.hasTabEntry = true;
FolderFunctionComponentView.hasChildEntry = true;
FolderFunctionComponentView.ICON_RES_PATH = "/icons3/pageFunctionIcon.png";
FolderFunctionComponentView.TREE_ENTRY_SORT_ORDER = ParentComponentView.FOLDER_COMPONENT_TYPE_SORT_ORDER;


FolderFunctionComponentView.propertyDialogLines = [
    {
        "type":"textField",
        "label":"Arg List: ",
        "size": 80,
        "key":"argListString"
    },
    {
        "type":"textField",
        "label":"Return Val: ",
        "size": 40,
        "key":"returnValueString"
    }
];
