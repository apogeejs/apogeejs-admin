 import apogeeutil from "/apogeeutil/apogeeUtilLib.js";
import { Messenger } from "/apogee/apogeeCoreLib.js";

import Component from "/apogeeapp/component/Component.js";
import AceTextEditor from "/apogeeview/datadisplay/AceTextEditor.js";
import HtmlJsDataDisplay from "/apogeeview/datadisplay/HtmlJsDataDisplay.js";
import dataDisplayHelper from "/apogeeview/datadisplay/dataDisplayCallbackHelper.js";
import DATA_DISPLAY_CONSTANTS from "/apogeeview/datadisplay/dataDisplayConstants.js";
import CommandManager from "/apogeeapp/commands/CommandManager.js";
import apogeeui from "/apogeeui/apogeeui.js";

/** This attempt has a single form edit page which returns an object. */
// To add - I should make it so it does not call set data until after it is initialized. I will cache it rather 
//than making the user do that.

/** This is a custom resource component. 
 * To implement it, the resource script must have the methods "run()" which will
 * be called when the component is updated. It also must have any methods that are
 * confugred with initialization data from the model. */
export default class CustomDataComponent extends Component {

    constructor(modelManager,folder) {
        //extend edit component
        super(modelManager,folder);
        
        //this should be present in the json that builds the folder, but in case it isn't (for one, because of a previous mistake)
        folder.setChildrenWriteable(false);

        //&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&
        //FIELDS
        //internal tables
        let dataMember = folder.lookupChild("data");
        this.setField("member.data",dataMember);
        modelManager.registerTable(dataMember,this,folder);

        let inputMember = folder.lookupChild("input");
        this.setField("member.input",inputMember);
        modelManager.registerTable(inputMember,this,folder);

        let isInputValidFunctionMember = folder.lookupChild("isInputValid");
        this.setField("member.isInputValid",isInputValidFunctionMember);
        modelManager.registerTable(isInputValidFunctionMember,this,folder);

        this.setField("destroyOnInactive",false); //default to keep alive
        this.setField("html","");
        this.setField("css","");
        this.setField("uiCode","");
        //&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&
    };

    //==============================
    //Resource Accessors
    //==============================

    getDestroyOnInactive() {
        return this.getField("destroyOnInactive");
    }

    getDisplayDestroyFlags() {
        return this.getDestroyOnInactive() ? DATA_DISPLAY_CONSTANTS.DISPLAY_DESTROY_FLAG_INACTIVE :
        DATA_DISPLAY_CONSTANTS.DISPLAY_DESTROY_FLAG_NEVER;
    }

    setDestroyOnInactive(destroyOnInactive) {
        if(destroyOnInactive != this.getField("destroyOnInactive")) {
            this.setField("destroyOnInactive",destroyOnInactive);

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
        
        var dataDisplaySource;
        var app = this.getModelManager().getApp();
        
        //create the new view element;
        switch(viewType) {
            
            case CustomDataComponent.VIEW_FORM:
//##########################################################
//UPDATE THIS - the data source should include the input table, html and resource arguments!!!
//##########################################################
                displayContainer.setDisplayDestroyFlags(this.getDisplayDestroyFlags());
                this.activeOutputDisplayContainer = displayContainer;
                var dataDisplaySource = this.getOutputDataDisplaySource();
                var html = this.getField("html");
                var resource = this.createResource();
                var dataDisplay = new HtmlJsDataDisplay(displayContainer,dataDisplaySource,this.inputTable,html,resource);
                return dataDisplay;
                
            case CustomDataComponent.VIEW_VALUE:
                dataDisplaySource = dataDisplayHelper.getMemberDataTextCallbacks(app,this.dataTable);
                return new AceTextEditor(displayContainer,dataDisplaySource,"ace/mode/json",AceTextEditor.OPTION_SET_DISPLAY_SOME);
                
            case CustomDataComponent.VIEW_CODE:
                dataDisplaySource = dataDisplayHelper.getMemberFunctionBodyCallbacks(app,this.inputTable);
                return new AceTextEditor(displayContainer,dataDisplaySource,"ace/mode/javascript",AceTextEditor.OPTION_SET_DISPLAY_MAX);
                
            case CustomDataComponent.VIEW_SUPPLEMENTAL_CODE:
                dataDisplaySource = dataDisplayHelper.getMemberSupplementalCallbacks(app,this.inputTable);
                return new AceTextEditor(displayContainer,dataDisplaySource,"ace/mode/javascript",AceTextEditor.OPTION_SET_DISPLAY_MAX);
            
            case CustomDataComponent.VIEW_HTML:
                dataDisplaySource = this.getUiDataDisplaySource("html");
                return new AceTextEditor(displayContainer,dataDisplaySource,"ace/mode/html",AceTextEditor.OPTION_SET_DISPLAY_MAX);
        
            case CustomDataComponent.VIEW_CSS:
                dataDisplaySource = this.getUiDataDisplaySource("css");
                return new AceTextEditor(displayContainer,dataDisplaySource,"ace/mode/css",AceTextEditor.OPTION_SET_DISPLAY_MAX);
                
            case CustomDataComponent.VIEW_UI_CODE:
                dataDisplaySource = this.getUiDataDisplaySource("uiCode");
                return new AceTextEditor(displayContainer,dataDisplaySource,"ace/mode/javascript",AceTextEditor.OPTION_SET_DISPLAY_MAX);
                
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

    getOutputDataDisplaySource() {
        //this is the instance of the component that is active for the data source - it will be updated
        //as the component changes.
        let component = this;
        var messenger = new Messenger(component.inputTable);

        return {
            doUpdate: function(updatedComponent) {
                //set the component instance for this data source
                component = updatedComponent;
                //return value is whether or not the data display needs to be udpated
//FIX THIS - update depends on more maybe
                return component.isFieldUpdated("member");
            },

            getData: function() {
                component.getMember().getData()
            },

            saveData: function(formValue) {
                messenger.dataUpdate("data",formValue);
                return true;
            }


        };
    }

    /** This method returns the data dispklay data source for the code field data displays. */
    getUiDataDisplaySource(codeFieldName) {
        //this is the instance of the component that is active for the data source - it will be updated
        //as the component changes.
        let component = this;
        return {
            doUpdate: function(updatedComponent) {
                //set the component instance for this data source
                component = updatedComponent;
                //return value is whether or not the data display needs to be udpated
                return component.isFieldUpdated(codeFieldName);
            },

            getData: function() {
                let codeField = compoent.getField(codeFieldName);
                if((codeField === undefined)||(codeField === null)) codeField = "";
                return codeField;
            },

            getEditOk: function() {
                return true;
            },
            
            saveData: function(text) {
                component.doCodeFieldUpdate(codeField,text);
            }
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
            for(let fieldName in json.resource) {
                this.update(json.resource[fieldName]);
            }
        } 
    }

    createResource() {
        try {
            var uiGeneratorBody = this.getField("uiCode");
            
            var resource;
            if((uiGeneratorBody)&&(uiGeneratorBody.length > 0)) {
                try {

                    //create the resource generator wrapped with its closure
                    var generatorFunctionBody = apogeeutil.formatString(
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

    doCodeFieldUpdate(fieldName,targetValue) { 
        var initialValue = this.getFields(fieldName);
        var command = {};
        command.type = customDataComponentUpdateData.COMMAND_TYPE;
        command.memberFullName = this.getFullName();
        command.fieldName = fieldName;
        command.initialValue = initialValue;
        command.targetValue = targetValue;

        this.getModelManager().getApp().executeCommand(command);
        return true; 
    }

    update(fieldName,fieldValue) { 

        let oldFieldValue = this.getField(fieldName);
        if(fieldValue != oldFieldValue) {
            this.setField(fieldName,fieldValue);

            //if this is the css field, set it immediately
            if(fieldName == "css") {
                apogeeui.setMemberCssData(this.getId(),fieldValue);
            }
        }

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
        json["html"] = this.getField("html");
        json["css"] = this.getField("css");
        json["uiCode"] = this.getField("uiCode");
        json.destroyOnInactive = this.getField("destroyOnInactive");
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

CustomDataComponent.VIEW_FORM = "Form";
CustomDataComponent.VIEW_VALUE = "Data Value";
CustomDataComponent.VIEW_CODE = "Input Code";
CustomDataComponent.VIEW_SUPPLEMENTAL_CODE = "Input Private";
CustomDataComponent.VIEW_HTML = "HTML";
CustomDataComponent.VIEW_CSS = "CSS";
CustomDataComponent.VIEW_UI_CODE = "uiGenerator(mode)";

CustomDataComponent.VIEW_MODES = [
    CustomDataComponent.VIEW_FORM,
    CustomDataComponent.VIEW_VALUE,
    CustomDataComponent.VIEW_CODE,
    CustomDataComponent.VIEW_SUPPLEMENTAL_CODE,
    CustomDataComponent.VIEW_HTML,
    CustomDataComponent.VIEW_CSS,
    CustomDataComponent.VIEW_UI_CODE
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
 *   "fieldName": (the name of the field being updated),
 *   "initialValue":(original fields value)
 *   "targetValue": (desired fields value)
 * }
 */ 

let customDataComponentUpdateData = {};

customDataComponentUpdateData.createUndoCommand = function(workspaceManager,commandData) {
    let undoCommandData = {};
    undoCommandData.memberFullName = commandData.memberFullName;
    undoCommandData.fieldName = commandData.fieldName;
    undoCommandData.initialValue = commandData.targetValue;
    undoCommandData.targetValue = commandData.initialValue;
    return undoCommandData;
}

customDataComponentUpdateData.executeCommand = function(workspaceManager,commandData) {
    let modelManager = workspaceManager.getModelManager();
    let component = modelManager.getComponentByFullName(commandData.memberFullName);
    var commandResult = {};
    if(component) {
        try {
            component.update(commandData.fieldName,commmandData.targetValue);
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

customDataComponentUpdateData.commandInfo = {
    "type": "customComponentUpdateCommand",
    "targetType": "component",
    "event": "updated"
}

CommandManager.registerCommand(customDataComponentUpdateData);
