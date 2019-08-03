(function() {

/** This component represents a json table object. */
apogeeapp.app.FormDataComponent = class extends apogeeapp.app.EditComponent {
    
    constructor(workspaceUI,table) {
        super(workspaceUI,table,apogeeapp.app.FormDataComponent);

        //default view
        this.dataView = apogeeapp.app.FormDataComponent.DEFAULT_DATA_VIEW;
        
        this.layout = apogeeapp.app.FormDataComponent.DEFAULT_LAYOUT;
    };

    //==============================
    // Protected and Private Instance Methods
    //==============================

    /**  This method retrieves the table edit settings for this component instance
     * @protected */
    getTableEditSettings() {
        return apogeeapp.app.FormDataComponent.TABLE_EDIT_SETTINGS;
    }

    /** This method should be implemented to retrieve a data display of the give type. 
     * @protected. */
    getDataDisplay(viewMode,viewType) {

        var callbacks;

        //create the new view element;
        switch(viewType) {
            case apogeeapp.app.FormDataComponent.VIEW_FORM:
                this.activeFormViewMode = viewMode;
                callbacks = apogeeapp.app.dataDisplayCallbackHelper.getMemberDataJsonCallbacks(this.member);
                return new apogeeapp.app.ConfigurableFormEditor(viewMode,callbacks,this.layout);

            case apogeeapp.app.FormDataComponent.VIEW_LAYOUT:
                callbacks = this.getLayoutCallbacks();
                return new apogeeapp.app.AceTextEditor(viewMode,callbacks,"ace/mode/json");

            case apogeeapp.app.FormDataComponent.VIEW_DESCRIPTION:
                callbacks = apogeeapp.app.dataDisplayCallbackHelper.getMemberDescriptionCallbacks(this.member);
                //return new apogeeapp.app.AceTextEditor(viewMode,callbacks,"ace/mode/text");
                return new apogeeapp.app.TextAreaEditor(viewMode,callbacks);

            default:
    //temporary error handling...
                alert("unrecognized view element!");
                return null;
        }
    }
    
    setLayout(layout) {
        this.layout = layout;
        if(this.activeFormViewMode) {
            this.activeFormViewMode.forceClearDisplay();
        }
        return true;
    }
    
    getLayoutCallbacks() {
        return {
            getData: () => JSON.stringify(this.layout),
            getEditOk: () => true,
            saveData: (text) => {
                var layout;
                try {
                    layout = JSON.parse(text);
                }
                catch(error) {
                    //we need to handle the error better
                    alert("Invalid layout JSON");
                    return;
                }
                this.setLayout(layout);
                return true;
            }
        }
    }

    //=====================================
    // serialization
    //=====================================
    
    writeToJson(json) {
        json.layout = this.layout;
    }

    readFromJson(json) {
        if(json.layout !== undefined) {
            this.layout = json.layout;
        }
    }

    //======================================
    // Static methods
    //======================================

    static getCreateMemberPayload(userInputValues) {
        var json = {};
        json.name = userInputValues.name;
        json.type = "apogee.JsonTable";
        return json;
    }
}

//=======================================
// Static properties
//=======================================

apogeeapp.app.FormDataComponent.VIEW_FORM = "Form";
apogeeapp.app.FormDataComponent.VIEW_LAYOUT = "Layout";
apogeeapp.app.FormDataComponent.VIEW_DESCRIPTION = "Notes";

apogeeapp.app.FormDataComponent.VIEW_MODES = [
    apogeeapp.app.FormDataComponent.VIEW_FORM,
    apogeeapp.app.FormDataComponent.VIEW_LAYOUT,
    apogeeapp.app.FormDataComponent.VIEW_DESCRIPTION
];

apogeeapp.app.FormDataComponent.TABLE_EDIT_SETTINGS = {
    "viewModes": apogeeapp.app.FormDataComponent.VIEW_MODES,
    "defaultView": apogeeapp.app.FormDataComponent.VIEW_FORM,
    "emptyDataValue": {}
}

apogeeapp.app.FormDataComponent.DEFAULT_LAYOUT = [];


//======================================
// This is the component generator, to register the component
//======================================

apogeeapp.app.FormDataComponent.displayName = "Form Data Table";
apogeeapp.app.FormDataComponent.uniqueName = "apogeeapp.app.FormDataComponent";
apogeeapp.app.FormDataComponent.DEFAULT_WIDTH = 300;
apogeeapp.app.FormDataComponent.DEFAULT_HEIGHT = 300;
apogeeapp.app.FormDataComponent.ICON_RES_PATH = "/componentIcons/dataTable.png";


//-----------------
//auto registration
//-----------------
var app = apogeeapp.app.Apogee.getInstance();
if(app) {
    app.registerComponent(apogeeapp.app.FormDataComponent);
}
else {
    console.log("Component could not be registered because no Apogee app instance was available at component load time: apogeeapp.app.DynamicForm");
}

//end definition
})();
