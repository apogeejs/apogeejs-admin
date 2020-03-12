 import apogeeutil from "/apogeeutil/apogeeUtilLib.js";
import { Messenger } from "/apogee/apogeeCoreLib.js";

import Component from "/apogeeapp/component/Component.js";
import AceTextEditor from "/apogeeview/datadisplay/AceTextEditor.js";
import HtmlJsDataDisplay from "/apogeeview/datadisplay/HtmlJsDataDisplay.js";
import dataDisplayHelper from "/apogeeview/datadisplay/dataDisplayHelper.js";
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
        modelManager.registerMember(dataMember,this,folder);

        let inputMember = folder.lookupChild("input");
        this.setField("member.input",inputMember);
        modelManager.registerMember(inputMember,this,folder);

        let isInputValidFunctionMember = folder.lookupChild("isInputValid");
        this.setField("member.isInputValid",isInputValidFunctionMember);
        modelManager.registerMember(isInputValidFunctionMember,this,folder);

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
    "type": "customDataComponentUpdateCommand",
    "targetType": "component",
    "event": "updated"
}

CommandManager.registerCommand(customDataComponentUpdateData);
