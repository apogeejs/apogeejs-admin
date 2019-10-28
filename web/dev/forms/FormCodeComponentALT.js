import AceTextEditor from "/apogeeapp/app/datadisplay/AceTextEditor.js";
import ConfigurableFormEditor from "/apogeeapp/app/datadisplay/ConfigurableFormEditor.js";
import TextAreaEditor from "/apogeeapp/app/datadisplay/TextAreaEditor.js";

(function() {

/** This component represents a json table object. */
apogeeapp.app.FormCodeComponent = class extends apogeeapp.app.EditComponent {
    
    constructor(workspaceUI,table) {
        super(workspaceUI,table,apogeeapp.app.FormCodeComponent);

        //default view
        this.dataView = apogeeapp.app.FormCodeComponent.DEFAULT_DATA_VIEW;
        
        this.layoutCode = apogeeapp.app.FormCodeComponent.DEFAULT_LAYOUT_CODE;
        this.layout = apogeeapp.app.FormCodeComponent.DEFAULT_LAYOUT;
        this.formData = apogeeapp.app.FormCodeComponent.DEFAULT_FORM_DATA;
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
                callbacks = dataDisplayHelper.getMemberDataTextCallbacks(this.member);
                return new AceTextEditor(viewMode,callbacks,"ace/mode/json");
                    
            case apogeeapp.app.FormCodeComponent.VIEW_INPUT:
                this.activeFormViewMode = viewMode;
                callbacks = this.getInputCallbacks();
                return new ConfigurableFormEditor(viewMode,callbacks,this.layout);

            case apogeeapp.app.FormCodeComponent.VIEW_LAYOUT_CODE:
                callbacks = this.getLayoutCallbacks();
                return new AceTextEditor(viewMode,callbacks,"ace/mode/javascript");
                
             case apogeeapp.app.FormCodeComponent.VIEW_ENCODING:
                callbacks = this.getEncodingCallbacks();
                return new AceTextEditor(viewMode,callbacks,"ace/mode/jsvascript");

            case apogeeapp.app.FormCodeComponent.VIEW_DESCRIPTION:
                callbacks = dataDisplayHelper.getMemberDescriptionCallbacks(this.member);
                //return new AceTextEditor(viewMode,callbacks,"ace/mode/text");
                return new TextAreaEditor(viewMode,callbacks);

            default:
    //temporary error handling...
                alert("unrecognized view element!");
                return null;
        }
    }
    
    getLayoutCallbacks() {
        return {
            getData: () => this.layoutCode,
            getEditOk: () => true,
            saveData: (text) => this.setLayoutCode(text)
        }
    }
    
    getInputCallbacks() {
        return {
            getData: () => this.formData,
            getEditOk: () => true,
            saveData: (formData) => this.setFormData(formData)
        }
    }
    
    getEncodingCallbacks() {
        return {
            getData: () => this.encodingFunctionText,
            getEditOk: () => true,
            saveData: (encodingFunctionText) => this.setEncodingCode(encodingFunctionText)
        }
    }
    
    setLayoutCode(layoutCode) {
        this.layoutCode = layoutCode;
        try {
            var layoutGenerator = new Function(this.layoutCode);
            this.layout = layoutGenerator();
        }
        catch(error) {
            alert("Error compiling layout code");
            this.layout = apogeeapp.app.FormCodeComponent.DEFAULT_LAYOUT_OBJECT;
        }
        
        if(this.activeFormViewMode) {
            this.activeFormViewMode.forceClearDisplay();
        }
        
        return true;
    }
    
    setFormData(formData) {
        this.formData = formData;
        return this.updateMemberCode();
    }
    
    setEncodingCode(encodingFunctionText) {
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
    
    updateMemberCode() {
        try {
            var code = this.encodingFunction(this.formData);
        }
        catch(error) {
            alert("Error converting form data: " + error.message);
            console.error(error.stack);
            code = apogeeapp.app.FormCodeComponent.DEFAULT_MEMBER_CODE;
        }
        return dataDisplayHelper.setCode(this.member,[],code,"",undefined); 
    }
    
    //=====================================
    // serialization
    //=====================================
    
    static writeToJson(json) {
        json.layoutCode = this.layoutCode;
        json.formData = this.formData;
        json.encodingFunctionText = this.encodingFunctionText;
    }

    static readFromJson(json) {
        if(json.layoutCode !== undefined) {
            this.layoutCode = json.layoutCode;
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
apogeeapp.app.FormCodeComponent.VIEW_LAYOUT_CODE = "layoutGenerator()";
apogeeapp.app.FormCodeComponent.VIEW_ENCODING = "encoding(formData)";
apogeeapp.app.FormCodeComponent.VIEW_DESCRIPTION = "Notes";

apogeeapp.app.FormCodeComponent.VIEW_MODES = [
    apogeeapp.app.FormCodeComponent.VIEW_DATA,
    apogeeapp.app.FormCodeComponent.VIEW_INPUT,
    apogeeapp.app.FormCodeComponent.VIEW_LAYOUT_CODE,
    apogeeapp.app.FormCodeComponent.VIEW_ENCODING,
    apogeeapp.app.FormCodeComponent.VIEW_DESCRIPTION
];

apogeeapp.app.FormCodeComponent.TABLE_EDIT_SETTINGS = {
    "viewModes": apogeeapp.app.FormCodeComponent.VIEW_MODES,
    "defaultView": apogeeapp.app.FormCodeComponent.VIEW_FORM,
    "emptyDataValue": {}
}

apogeeapp.app.FormCodeComponent.DEFAULT_LAYOUT_CODE = "return []";
apogeeapp.app.FormCodeComponent.DEFAULT_LAYOUT = new Function(apogeeapp.app.FormCodeComponent.DEFAULT_LAYOUT_CODE);
apogeeapp.app.FormCodeComponent.DEFAULT_ENCODING_FUNCTION_TEXT = "return null";
apogeeapp.app.FormCodeComponent.DEFAULT_ENCODING_FUNCTION = new Function("formData",apogeeapp.app.FormCodeComponent.DEFAULT_ENCODING_FUNCTION_TEXT);
apogeeapp.app.FormCodeComponent.DEFAULT_MEMBER_CODE = "return null";
apogeeapp.app.FormCodeComponent.DEFAULT_FORM_DATA = {};
        
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
