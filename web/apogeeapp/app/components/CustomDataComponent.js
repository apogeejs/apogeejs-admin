 import util from "/apogeeutil/util.js";
import { Messenger } from "/apogee/apogeeCoreLib.js";

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

/** This attempt has a single form edit page which returns an object. */
// To add - I should make it so it does not call set data until after it is initialized. I will cache it rather 
//than making the user do that.

/** This is a custom resource component. 
 * To implement it, the resource script must have the methods "run()" which will
 * be called when the component is updated. It also must have any methods that are
 * confugred with initialization data from the model. */
export default class CustomDataComponent extends EditComponent {

    constructor(workspaceUI,folder) {
        //extend edit component
        super(workspaceUI,folder,CustomDataComponent);
        
        //this should be present in the json that builds the folder, but in case it isn't (for one, because of a previous mistake)
        folder.setChildrenWriteable(false);
        
        //load these!
        this.dataTable = folder.lookupChildFromPathArray(["data"]);
        this.inputTable = folder.lookupChildFromPathArray(["input"]);
        this.isInputValidFunctionTable = folder.lookupChildFromPathArray(["isInputValid"]);
        
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

            if(this.activeOutputDisplayContainer) {
                this.activeOutputDisplayContainer.setDisplayDestroyFlags(this.getDisplayDestroyFlags());
            }
        }
    }

    //==============================
    // Protected and Private Instance Methods
    //==============================


    /**  This method retrieves the table edit settings for this component instance
     * @protected */
    getTableEditSettings() {
        return CustomDataComponent.TABLE_EDIT_SETTINGS;
    }

    /** This method should be implemented to retrieve a data display of the give type. 
     * @protected. */
    getDataDisplay(displayContainer,viewType) {
        
        var callbacks;
        
        //create the new view element;
        switch(viewType) {
            
            case CustomDataComponent.VIEW_FORM:
                displayContainer.setDisplayDestroyFlags(this.getDisplayDestroyFlags());
                this.activeOutputDisplayContainer = displayContainer;
                var callbacks = this.getFormCallbacks();
                var html = this.getUiCodeField(CustomDataComponent.CODE_FIELD_HTML);
                var resource = this.createResource();
                var dataDisplay = new HtmlJsDataDisplay(displayContainer,callbacks,this.inputTable,html,resource);
                return dataDisplay;
                
            case CustomDataComponent.VIEW_VALUE:
                callbacks = dataDisplayHelper.getMemberDataTextCallbacks(this.dataTable);
                return new AceTextEditor(displayContainer,callbacks,"ace/mode/json");
                
            case CustomDataComponent.VIEW_CODE:
                callbacks = dataDisplayHelper.getMemberFunctionBodyCallbacks(this.inputTable);
                return new AceTextEditor(displayContainer,callbacks,"ace/mode/javascript");
                
            case CustomDataComponent.VIEW_SUPPLEMENTAL_CODE:
                callbacks = dataDisplayHelper.getMemberSupplementalCallbacks(this.inputTable);
                return new AceTextEditor(displayContainer,callbacks,"ace/mode/javascript");
            
            case CustomDataComponent.VIEW_HTML:
                callbacks = this.getUiCallbacks(CustomDataComponent.CODE_FIELD_HTML);
                return new AceTextEditor(displayContainer,callbacks,"ace/mode/html");
        
            case CustomDataComponent.VIEW_CSS:
                callbacks = this.getUiCallbacks(CustomDataComponent.CODE_FIELD_CSS);
                return new AceTextEditor(displayContainer,callbacks,"ace/mode/css");
                
            case CustomDataComponent.VIEW_UI_CODE:
                callbacks = this.getUiCallbacks(CustomDataComponent.CODE_FIELD_UI_CODE);
                return new AceTextEditor(displayContainer,callbacks,"ace/mode/javascript");

            case CustomDataComponent.VIEW_DESCRIPTION:
                callbacks = dataDisplayHelper.getMemberDescriptionCallbacks(this.inputTable);
                //return new AceTextEditor(displayContainer,callbacks,"ace/mode/text");
                return new TextAreaEditor(displayContainer,callbacks);
                
            default:
    //temporary error handling...
                alert("unrecognized view element!");
                return null;
        }
    }

    getFormCallbacks() {
        var callbacks = {};
        
        //return desired form value
        callbacks.getData = () => this.getMember().getData();
        
        //edit ok - always true
        callbacks.getEditOk = () => true;
        
        //save data - just form value here
        var messenger = new Messenger(this.inputTable);
        callbacks.saveData = (formValue) => {
            messenger.dataUpdate("data",formValue);
            return true;
        }
        
        return callbacks;
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

            var uiGeneratorBody = uiCodeFields[CustomDataComponent.CODE_FIELD_UI_CODE];
            
            var resource;
            if((uiGeneratorBody)&&(uiGeneratorBody.length > 0)) {
                try {

                    //create the resource generator wrapped with its closure
                    var generatorFunctionBody = util.formatString(
                        CustomDataComponent.GENERATOR_FUNCTION_FORMAT_TEXT,
                        uiGeneratorBody
                    );

                    //create the function generator, with the aliased variables in the closure
                    var generatorFunction = new Function(generatorFunctionBody);
                    var resourceFunction = generatorFunction();
                    
                    resource = resourceFunction();
                }
                catch(err) {
                    if(err.stack) console.error(err.stack);
                    
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
        var targetCodeFields = util.jsonCopy(initialCodeFields);
        targetCodeFields[uiCodeField] = fieldValue;

        var command = {};
        command.type = customDataComponentUpdateData.COMMAND_TYPE;
        command.memberFullName = this.getFullName();
        command.initialFields = initialCodeFields;
        command.targetFields = targetCodeFields;

        Apogee.getInstance().executeCommand(command);
        return true; 
    }

    update(uiCodeFields) { 

        //record the updates
        if(uiCodeFields[CustomDataComponent.CODE_FIELD_CSS] != this.uiCodeFields[CustomDataComponent.CODE_FIELD_CSS]) {
            this.fieldUpdated(CustomDataComponent.CODE_FIELD_CSS);
            
            //update css now
            let cssInfo = uiCodeFields[CustomDataComponent.CODE_FIELD_CSS];
            apogeeui.setMemberCssData(this.getMember().getId(),cssInfo);
        }
        if(uiCodeFields[CustomDataComponent.CODE_FIELD_HTML] != this.uiCodeFields[CustomDataComponent.CODE_FIELD_HTML]) {
            this.fieldUpdated(CustomDataComponent.CODE_FIELD_HTML);
        }
        if(uiCodeFields[CustomDataComponent.CODE_FIELD_UI_CODE] != this.uiCodeFields[CustomDataComponent.CODE_FIELD_UI_CODE]) {
            this.fieldUpdated(CustomDataComponent.CODE_FIELD_UI_CODE);
        }
        
        this.uiCodeFields = uiCodeFields;

        //make sure we get rid of the old display
        if(this.activeOutputDisplayContainer) {
            this.activeOutputDisplayContainer.forceClearDisplay();
        }
        
        return true;
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

/** This is the format string to create the code body for updateing the member
 * Input indices:
 * 0: resouce methods code
 * 1: uiPrivate
 * @private
 */
CustomDataComponent.GENERATOR_FUNCTION_FORMAT_TEXT = [
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

CustomDataComponent.displayName = "Custom Data Component";
CustomDataComponent.uniqueName = "apogeeapp.app.CustomDataComponent";
CustomDataComponent.hasTabEntry = false;
CustomDataComponent.hasChildEntry = true;
CustomDataComponent.DEFAULT_WIDTH = 500;
CustomDataComponent.DEFAULT_HEIGHT = 500;
CustomDataComponent.ICON_RES_PATH = "/componentIcons/formControl.png";
CustomDataComponent.DEFAULT_MEMBER_JSON = {
        "type": "apogee.Folder",
        "childrenNotWriteable": true,
        "children": {
            "input": {
                "name": "input",
                "type": "apogee.JsonTable",
                "updateData": {
                    "data":"",
                }
            },
            "data": {
                "name": "data",
                "type": "apogee.JsonTable",
                "updateData": {
                    "data": "",
                }
            }
        }
    };
CustomDataComponent.propertyDialogLines = [
    {
        "type":"checkbox",
        "heading":"Destroy on Hide: ",
        "resultKey":"destroyOnInactive"
    }
];


CustomDataComponent.CODE_FIELD_HTML = "html";
CustomDataComponent.CODE_FIELD_CSS = "css";
CustomDataComponent.CODE_FIELD_UI_CODE = "uiCode";
CustomDataComponent.VIEW_FORM = "Form";
CustomDataComponent.VIEW_VALUE = "Data Value";
CustomDataComponent.VIEW_CODE = "Input Code";
CustomDataComponent.VIEW_SUPPLEMENTAL_CODE = "Input Private";
CustomDataComponent.VIEW_HTML = "HTML";
CustomDataComponent.VIEW_CSS = "CSS";
CustomDataComponent.VIEW_UI_CODE = "uiGenerator(mode)";
CustomDataComponent.VIEW_DESCRIPTION = "Notes";

CustomDataComponent.VIEW_MODES = [
    CustomDataComponent.VIEW_FORM,
    CustomDataComponent.VIEW_VALUE,
    CustomDataComponent.VIEW_CODE,
    CustomDataComponent.VIEW_SUPPLEMENTAL_CODE,
    CustomDataComponent.VIEW_HTML,
    CustomDataComponent.VIEW_CSS,
    CustomDataComponent.VIEW_UI_CODE,
    CustomDataComponent.VIEW_DESCRIPTION
];

CustomDataComponent.TABLE_EDIT_SETTINGS = {
    "viewModes": CustomDataComponent.VIEW_MODES,
    "defaultView": CustomDataComponent.VIEW_FORM
}


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
let customDataComponentUpdateData = {};

customDataComponentUpdateData.createUndoCommand = function(workspaceUI,commandData) {
   let undoCommandData = {};
   undoCommandData.memberFullName = commandData.memberFullName;
   undoCommandData.targetFields = commandData.initialFields;
   undoCommandData.initialFields = commandData.targetFields;
   return undoCommandData;
}

customDataComponentUpdateData.executeCommand = function(workspaceUI,commandData,asynchOnComplete) {
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

customDataComponentUpdateData.COMMAND_TYPE = "customDataComponentUpdateCommand";

CommandManager.registerCommand(customDataComponentUpdateData);




