import apogeeutil from "/apogeeutil/apogeeUtilLib.js";

import Component from "/apogeeapp/component/Component.js";
import DATA_DISPLAY_CONSTANTS from "/apogeeview/datadisplay/dataDisplayConstants.js";
import CommandManager from "/apogeeapp/commands/CommandManager.js";
import apogeeui from "/apogeeui/apogeeui.js";

/** This is a custom resource component. 
 * To implement it, the resource script must have the methods "run()" which will
 * be called when the component is updated. It also must have any methods that are
 * confugred with initialization data from the model. */
export default class CustomComponent extends Component {

    constructor(modelManager,member) {
        super(modelManager,member);
        
        //&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&
        //FIELDS
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
        return this.getField("destroyOnInactive") ? DATA_DISPLAY_CONSTANTS.DISPLAY_DESTROY_FLAG_INACTIVE :
        DATA_DISPLAY_CONSTANTS.DISPLAY_DESTROY_FLAG_NEVER;
    }

    setDestroyOnInactive(destroyOnInactive) {
        if(destroyOnInactive != this.destroyOnInactive) {
            this.setField("destroyOnInactive",destroyOnInactive);

            if(this.activeOutputMode) {
                this.activeOutputMode.setDisplayDestroyFlags(this.getDisplayDestroyFlags());
            }
        }
    }

    /** This method deseriliazes data for the custom resource component. */
    // updateFromJson(json) {  
    //     this.loadResourceFromJson(json);
    // }

    /** This method deseriliazes data for the custom resource component. This will
     * work is no json is passed in. */
    loadResourceFromJson(json) { 
        if((json)&&(json.resource)) {  
            for(let fieldName in json.resource) {
                this.update(fieldName,json.resource[fieldName]);
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

    doCodeFieldUpdate(codeFieldName,targetValue) { 
        let initialValue = this.getField(codeFieldName);

        var command = {};
        command.type = customComponentUpdateData.commandInfo.type;
        command.memberFullName = this.getFullName();
        command.fieldName = codeFieldName;
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
        json.resource = {};
        json.resource["html"] = this.getField("html");
        json.resource["css"] = this.getField("css");
        json.resource["uiCode"] = this.getField("uiCode");
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
CustomComponent.DEFAULT_MEMBER_JSON = {
    "type": "apogee.JsonTable"
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
let customComponentUpdateData = {};

customComponentUpdateData.createUndoCommand = function(workspaceManager,commandData) {
    let undoCommandData = {};
    undoCommandData.memberFullName = commandData.memberFullName;
    undoCommandData.fieldName = commandData.fieldName;
    undoCommandData.initialValue = commandData.targetValue;
    undoCommandData.targetValue = commandData.initialValue;
    return undoCommandData;
}

customComponentUpdateData.executeCommand = function(workspaceManager,commandData) {
    let modelManager = workspaceManager.getModelManager();
    let component = modelManager.getComponentByFullName(commandData.memberFullName);
    var commandResult = {};
    if(component) {
        try {
            component.update(commandData.fieldName,commandData.targetValue);

            commandResult.cmdDone = true;
            commandResult.target = component;
            commandResult.dispatcher = modelManager;
            commandResult.action = "updated";
        }
        catch(error) {
            let msg = error.message ? error.message : error;
            commandResult.cmdDone = false;
            commandResult.alertMsg = "Exception on custom component update: " + msg;
        }
    }
    else {
        commandResult.cmdDone = false;
        commandResult.alertMsg = "Component not found: " + command.memberFullName;
    }
    
    return commandResult;
}

customComponentUpdateData.commandInfo = {
    "type": "customComponentUpdateCommand",
    "targetType": "component",
    "event": "updated"
}

CommandManager.registerCommand(customComponentUpdateData);







