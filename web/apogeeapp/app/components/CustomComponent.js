import apogeeutil from "/apogeeutil/apogeeUtilLib.js";

import Apogee from "/apogeeapp/app/Apogee.js";
import Component from "/apogeeapp/app/component/Component.js";
import EditComponent from "/apogeeapp/app/component/EditComponent.js";
import AceTextEditor from "/apogeeapp/app/datadisplay/AceTextEditor.js";
import HtmlJsDataDisplay from "/apogeeapp/app/datadisplay/HtmlJsDataDisplay.js";
import TextAreaEditor from "/apogeeapp/app/datadisplay/TextAreaEditor.js";
import dataDisplayHelper from "/apogeeapp/app/datadisplay/dataDisplayCallbackHelper.js";
import DATA_DISPLAY_CONSTANTS from "/apogeeapp/app/datadisplay/dataDisplayConstants.js";
import CommandManager from "/apogeeapp/app/commands/CommandManager.js";
import apogeeui from "/apogeeapp/ui/apogeeui.js";

/** This is a custom resource component. 
 * To implement it, the resource script must have the methods "run()" which will
 * be called when the component is updated. It also must have any methods that are
 * confugred with initialization data from the model. */
export default class CustomComponent extends EditComponent {

    constructor(workspaceUI,control) {
        //extend edit component
        super(workspaceUI,control,CustomComponent);
        
        this.uiCodeFields = {};
        this.currentCss = "";
        
        //keep alive or destroy on inactive
        this.destroyOnInactive = false;
        
        this.fieldUpdated("destroyOnInactive");
    };


    //==============================
    //Resource Accessors
    //==============================

    getUiCodeFields() {
        return this.uiCodeFields;
    }

    getUiCodeField(codeField) {
        var text = this.uiCodeFields[codeField];
        if((text === null)||(text === undefined)) text = "";
        return text;
    }

    getDestroyOnInactive() {
        return this.destroyOnInactive;
    }

    getDisplayDestroyFlags() {
        return this.destroyOnInactive ? DATA_DISPLAY_CONSTANTS.DISPLAY_DESTROY_FLAG_INACTIVE :
        DATA_DISPLAY_CONSTANTS.DISPLAY_DESTROY_FLAG_NEVER;
    }

    setDestroyOnInactive(destroyOnInactive) {
        if(destroyOnInactive != this.destroyOnInactive) {
            this.fieldUpdated("destroyOnInactive");
            this.destroyOnInactive = destroyOnInactive;

            if(this.activeOutputMode) {
                this.activeOutputMode.setDisplayDestroyFlags(this.getDisplayDestroyFlags());
            }
        }
    }

    //==============================
    // Protected and Private Instance Methods
    //==============================

    /**  This method retrieves the table edit settings for this component instance
     * @protected */
    getTableEditSettings() {
        return CustomComponent.TABLE_EDIT_SETTINGS;
    }

    /** This method should be implemented to retrieve a data display of the give type. 
     * @protected. */
    getDataDisplay(displayContainer,viewType) {
        
        var callbacks;
        
        //create the new view element;
        switch(viewType) {
            
            case CustomComponent.VIEW_OUTPUT:
                displayContainer.setDisplayDestroyFlags(this.getDisplayDestroyFlags());
                this.activeOutputMode = displayContainer;
                var callbacks = this.getOutputCallbacks();
                var html = this.getUiCodeField(CustomComponent.CODE_FIELD_HTML);
                var resource = this.createResource();
                var dataDisplay = new HtmlJsDataDisplay(displayContainer,callbacks,this.member,html,resource);
                return dataDisplay;
                
            case CustomComponent.VIEW_CODE:
                callbacks = dataDisplayHelper.getMemberFunctionBodyCallbacks(this.member);
                return new AceTextEditor(displayContainer,callbacks,"ace/mode/javascript");
                
            case CustomComponent.VIEW_SUPPLEMENTAL_CODE:
                callbacks = dataDisplayHelper.getMemberSupplementalCallbacks(this.member);
                return new AceTextEditor(displayContainer,callbacks,"ace/mode/javascript");
            
            case CustomComponent.VIEW_HTML:
                callbacks = this.getUiCallbacks(CustomComponent.CODE_FIELD_HTML);
                return new AceTextEditor(displayContainer,callbacks,"ace/mode/html");
        
            case CustomComponent.VIEW_CSS:
                callbacks = this.getUiCallbacks(CustomComponent.CODE_FIELD_CSS);
                return new AceTextEditor(displayContainer,callbacks,"ace/mode/css");
                
            case CustomComponent.VIEW_UI_CODE:
                callbacks = this.getUiCallbacks(CustomComponent.CODE_FIELD_UI_CODE);
                return new AceTextEditor(displayContainer,callbacks,"ace/mode/javascript");


            case CustomComponent.VIEW_DESCRIPTION:
                callbacks = dataDisplayHelper.getMemberDescriptionCallbacks(this.member);
                //return new AceTextEditor(displayContainer,callbacks,"ace/mode/text");
                return new TextAreaEditor(displayContainer,callbacks);
                
            default:
    //temporary error handling...
                alert("unrecognized view element!");
                return null;
        }
    }

    getOutputCallbacks(codeField) {
        return {
            getData: () => this.getMember().getData()
        };
    }

    getUiCallbacks(codeField) {
        return {
            getData: () => {
                var uiCodeFields = this.getUiCodeFields();
                var data = uiCodeFields[codeField];
                if((data === undefined)||(data === null)) data = "";
                return data;
            },
            
            getEditOk: () => true,
            
            saveData: (text) => this.doCodeFieldUpdate(codeField,text)
        }
    }

    /** This method deseriliazes data for the custom resource component. */
    updateFromJson(json) {  
        this.loadResourceFromJson(json);
    }

    /** This method deseriliazes data for the custom resource component. This will
     * work is no json is passed in. */
    loadResourceFromJson(json) {   
        if((json)&&(json.resource)) {
            this.update(json.resource);
        }  
    }


    createResource() {
        try {
            var uiCodeFields = this.getUiCodeFields();

            var uiGeneratorBody = uiCodeFields[CustomComponent.CODE_FIELD_UI_CODE];
            
            var resource;
            if((uiGeneratorBody)&&(uiGeneratorBody.length > 0)) {
                try {

                    //create the resource generator wrapped with its closure
                    var generatorFunctionBody = apogeeutil.formatString(
                        CustomComponent.GENERATOR_FUNCTION_FORMAT_TEXT,
                        uiGeneratorBody
                    );

                    //create the function generator, with the aliased variables in the closure
                    var generatorFunction = new Function(generatorFunctionBody);
                    var resourceFunction = generatorFunction();
                    
                    resource = resourceFunction();
                }
                catch(err) {
                    console.log("bad ui generator function");
                }
            }
                
            //create a dummy
            if(!resource) {
                resource = {};
            }

            return resource;
        }
        catch(error) {
            if(error.stack) console.error(error.stack);
            
            alert("Error creating custom control: " + error.message);
        }
    }


    //=============================
    // Action
    //=============================

    doCodeFieldUpdate(uiCodeField,fieldValue) { 
        var initialCodeFields = this.getUiCodeFields();
        var targetCodeFields = apogeeutil.jsonCopy(initialCodeFields);
        targetCodeFields[uiCodeField] = fieldValue;

        var command = {};
        command.type = customComponentUpdateData.COMMAND_TYPE;
        command.memberFullName = this.getFullName();
        command.initialFields = initialCodeFields;
        command.targetFields = targetCodeFields;

        Apogee.getInstance().executeCommand(command);
        return true;  
    }

    update(uiCodeFields) { 

        //record the updates
        if(uiCodeFields[CustomComponent.CODE_FIELD_CSS] != this.uiCodeFields[CustomComponent.CODE_FIELD_CSS]) {
            this.fieldUpdated(CustomComponent.CODE_FIELD_CSS);
            
            //update css now
            let cssInfo = uiCodeFields[CustomComponent.CODE_FIELD_CSS];
            apogeeui.setMemberCssData(this.getMember().getId(),cssInfo);
        }
        if(uiCodeFields[CustomComponent.CODE_FIELD_HTML] != this.uiCodeFields[CustomComponent.CODE_FIELD_HTML]) {
            this.fieldUpdated(CustomComponent.CODE_FIELD_HTML);
        }
        if(uiCodeFields[CustomComponent.CODE_FIELD_UI_CODE] != this.uiCodeFields[CustomComponent.CODE_FIELD_UI_CODE]) {
            this.fieldUpdated(CustomComponent.CODE_FIELD_UI_CODE);
        }
        
        this.uiCodeFields = uiCodeFields;

        //make sure we get rid of the old display
        if(this.activeOutputMode) {
            this.activeOutputMode.forceClearDisplay();
        }
    }

    //==============================
    // serialization
    //==============================

    readFromJson(json) {
        if(!json) return;
        
        //set destroy flag
        if(json.destroyOnInactive !== undefined) {
            var destroyOnInactive = json.destroyOnInactive;
            this.setDestroyOnInactive(destroyOnInactive);
        }
        
        //load the resource
        this.loadResourceFromJson(json);
    }

    /** This serializes the table component. */
    writeToJson(json) {
        //store the resource info
        json.resource = this.uiCodeFields;
        json.destroyOnInactive = this.destroyOnInactive;
    }

    //======================================
    // properties
    //======================================

    readExtendedProperties(values) {
        values.destroyOnInactive = this.getDestroyOnInactive();
    }

    //======================================
    // Static methods
    //======================================

    static transferComponentProperties(inputValues,propertyJson) {
        if(inputValues.destroyOnInactive !== undefined) {
            propertyJson.destroyOnInactive = inputValues.destroyOnInactive;
        }
    }

}


CustomComponent.CODE_FIELD_HTML = "html";
CustomComponent.CODE_FIELD_CSS = "css";
CustomComponent.CODE_FIELD_UI_CODE = "uiCode";

CustomComponent.VIEW_OUTPUT = "Display";
CustomComponent.VIEW_CODE = "Input Code";
CustomComponent.VIEW_SUPPLEMENTAL_CODE = "Input Private";
CustomComponent.VIEW_HTML = "HTML";
CustomComponent.VIEW_CSS = "CSS";
CustomComponent.VIEW_UI_CODE = "uiGenerator()";
CustomComponent.VIEW_DESCRIPTION = "Notes";

CustomComponent.VIEW_MODES = [
    CustomComponent.VIEW_OUTPUT,
    CustomComponent.VIEW_CODE,
    CustomComponent.VIEW_SUPPLEMENTAL_CODE,
    CustomComponent.VIEW_HTML,
    CustomComponent.VIEW_CSS,
    CustomComponent.VIEW_UI_CODE,
    CustomComponent.VIEW_DESCRIPTION
];

CustomComponent.TABLE_EDIT_SETTINGS = {
    "viewModes": CustomComponent.VIEW_MODES,
    "defaultView": CustomComponent.VIEW_OUTPUT
}

/** This is the format string to create the code body for updateing the member
 * Input indices:
 * 0: resouce methods code
 * 1: uiPrivate
 * @private
 */
CustomComponent.GENERATOR_FUNCTION_FORMAT_TEXT = [
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

CustomComponent.displayName = "Custom Component";
CustomComponent.uniqueName = "apogeeapp.app.CustomComponent";
CustomComponent.hasTabEntry = false;
CustomComponent.hasChildEntry = true;
CustomComponent.ICON_RES_PATH = "/componentIcons/chartControl.png";
CustomComponent.DEFAULT_MEMBER_JSON = {
    "type": "apogee.JsonTable"
};
CustomComponent.propertyDialogLines = [
    {
        "type":"checkbox",
        "heading":"Destroy on Hide: ",
        "resultKey":"destroyOnInactive"
    }
];

//=====================================
// Update Data Command
//=====================================

/*
 *
 * Command JSON format:
 * {
 *   "type":"customComponentUpdateCommand",
 *   "memberFullName":(main member full name),
 *   "initialFields":(original fields value)
 *   "targetFields": (desired fields value)
 * }
 */ 
let customComponentUpdateData = {};

customComponentUpdateData.createUndoCommand = function(workspaceUI,commandData) {
    let undoCommandData = {};
    undoCommandData.memberFullName = commandData.memberFullName;
    undoCommandData.targetFields = commandData.initialFields;
    undoCommandData.initialFields = commandData.targetFields;
    return undoCommandData;
}

customComponentUpdateData.executeCommand = function(workspaceUI,commandData,asynchOnComplete) {
    let component = workspaceUI.getComponentByFullName(commandData.memberFullName);
    var commandResult = {};
    if(component) {
        try {
            component.update(commandData.targetFields);
        }
        catch(error) {
            let msg = error.message ? error.message : error;
            commandResult.alertMsg = "Exception on custom component update: " + msg;
        }
    }
    else {
        commandResult.alertMsg = "Component not found: " + command.memberFullName;
    }

    if(!commandResult.alertMsg) commandResult.actionDone = true;
    
    return commandResult;
}

customComponentUpdateData.COMMAND_TYPE = "customComponentUpdateCommand";

CommandManager.registerCommand(customComponentUpdateData);







