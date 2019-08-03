(function() {

/** This component represents a json table object. */
apogeeapp.app.FormCodeComponent = class extends apogeeapp.app.EditComponent {
    
    constructor(workspaceUI,table) {
        super(workspaceUI,table,apogeeapp.app.FormCodeComponent);

        //default view
        this.dataView = apogeeapp.app.FormCodeComponent.DEFAULT_DATA_VIEW;
        
        this.layout = apogeeapp.app.FormCodeComponent.DEFAULT_LAYOUT;
        this.formData = {};
        this.encodingFunctionText = apogeeapp.app.FormCodeComponent.DEFAULT_ENCODING_FUNCTION_TEXT
        this.encodingFunction = apogeeapp.app.FormCodeComponent.DEFAULT_ENCODING_FUNCTION;
    };

    //==============================
    // Protected and Private Instance Methods
    //==============================

    /**  This method retrieves the table edit settings for this component instance
     * @protected */
    getTableEditSettings() {
        return apogeeapp.app.FormCodeComponent.TABLE_EDIT_SETTINGS;
    }

    /** This method should be implemented to retrieve a data display of the give type. 
     * @protected. */
    getDataDisplay(viewMode,viewType) {

        var callbacks;

        //create the new view element;
        switch(viewType) {
            
            case apogeeapp.app.FormCodeComponent.VIEW_DATA:
                callbacks = apogeeapp.app.dataDisplayCallbackHelper.getMemberDataTextCallbacks(this.member);
                return new apogeeapp.app.AceTextEditor(viewMode,callbacks,"ace/mode/json");
                    
            case apogeeapp.app.FormCodeComponent.VIEW_INPUT:
                this.activeFormViewMode = viewMode;
                callbacks = this.getInputCallbacks();
                return new apogeeapp.app.ConfigurableFormEditor(viewMode,callbacks,this.layout);

            case apogeeapp.app.FormCodeComponent.VIEW_LAYOUT:
                callbacks = this.getLayoutCallbacks();
                return new apogeeapp.app.AceTextEditor(viewMode,callbacks,"ace/mode/json");
                
             case apogeeapp.app.FormCodeComponent.VIEW_ENCODING:
                callbacks = this.getEncodingCallbacks();
                return new apogeeapp.app.AceTextEditor(viewMode,callbacks,"ace/mode/jsvascript");

            case apogeeapp.app.FormCodeComponent.VIEW_DESCRIPTION:
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
    
    getInputCallbacks() {
        return {
            getData: () => JSON.stringify(this.formData),
            getEditOk: () => true,
            saveData: (formData) => {
                this.formData = formData;
                return this.updateMemberCode();
            }
        }
    }
    
    getEncodingCallbacks() {
        return {
            getData: () => this.encodingFunctionText,
            getEditOk: () => true,
            saveData: (encodingFunctionText) => {
                this.encodingFunctionText = encodingFunctionText;
                try {
                    this.encodingFunction = new Function("formData",encodingFunctionText);
                }
                catch(error) {
                    //we need to handle the error better
                    alert("Error compiling encoder function");
                    this.encodingFunction = apogeeapp.app.FormCodeComponent.DEFAULT_ENCODING_FUNCTION;
                }
                return this.updateMemberCode();
            }
        }
    }
    
    updateMemberCode() {
        try {
            var code = this.encodingFunction(this.formData);
        }
        catch(error) {
            alert("Error converting form data: " + error.message);
            console.error(error.stack);
            code = apogeeapp.app.FormCodeComponent.DEFAULT_MEMBER_CODE;
        }
        return apogeeapp.app.dataDisplayCallbackHelper.setCode(this.member,[],code,"",undefined); 
    }

    //=====================================
    // serialization
    //=====================================
    
    static writeToJson(json) {
        json.layout = this.layout;
        json.formData = this.formData;
        json.encodingFunctionText = this.encodingFunctionText;
    }

    static readFromJson(json) {
        if(json.layout !== undefined) {
            this.layout = json.layout;
        }
        if(json.formData !== undefined) {
            this.formData = json.formData;
        }
        if(json.encodingFunctionText !== undefined) {
            this.encodingFunctionText = json.encodingFunctionText;
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

apogeeapp.app.FormCodeComponent.VIEW_DATA = "Data";
apogeeapp.app.FormCodeComponent.VIEW_INPUT = "Input";
apogeeapp.app.FormCodeComponent.VIEW_LAYOUT = "Layout";
apogeeapp.app.FormCodeComponent.VIEW_ENCODING = "Encoding";
apogeeapp.app.FormCodeComponent.VIEW_DESCRIPTION = "Notes";

apogeeapp.app.FormCodeComponent.VIEW_MODES = [
    apogeeapp.app.FormCodeComponent.VIEW_DATA,
    apogeeapp.app.FormCodeComponent.VIEW_INPUT,
    apogeeapp.app.FormCodeComponent.VIEW_LAYOUT,
    apogeeapp.app.FormCodeComponent.VIEW_ENCODING,
    apogeeapp.app.FormCodeComponent.VIEW_DESCRIPTION
];

apogeeapp.app.FormCodeComponent.TABLE_EDIT_SETTINGS = {
    "viewModes": apogeeapp.app.FormCodeComponent.VIEW_MODES,
    "defaultView": apogeeapp.app.FormCodeComponent.VIEW_FORM,
    "emptyDataValue": {}
}

apogeeapp.app.FormCodeComponent.DEFAULT_LAYOUT = [];

apogeeapp.app.FormCodeComponent.DEFAULT_ENCODING_FUNCTION_TEXT = "return null";
apogeeapp.app.FormCodeComponent.DEFAULT_ENCODING_FUNCTION = new Function("formData",apogeeapp.app.FormCodeComponent.DEFAULT_ENCODING_FUNCTION_TEXT);
apogeeapp.app.FormCodeComponent.DEFAULT_MEMBER_CODE = "return null";

//======================================
// This is the component generator, to register the component
//======================================

apogeeapp.app.FormCodeComponent.displayName = "Form Code Table";
apogeeapp.app.FormCodeComponent.uniqueName = "apogeeapp.app.FormCodeComponent";
apogeeapp.app.FormCodeComponent.DEFAULT_WIDTH = 300;
apogeeapp.app.FormCodeComponent.DEFAULT_HEIGHT = 300;
apogeeapp.app.FormCodeComponent.ICON_RES_PATH = "/componentIcons/dataTable.png";


//-----------------
//auto registration
//-----------------
var app = apogeeapp.app.Apogee.getInstance();
if(app) {
    app.registerComponent(apogeeapp.app.FormCodeComponent);
}
else {
    console.log("Component could not be registered because no Apogee app instance was available at component load time: apogeeapp.app.DynamicForm");
}

//end definition
})();
