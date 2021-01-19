import Component from "/apogeeapp/component/Component.js";
import CommandManager from "/apogeeapp/commands/CommandManager.js";

/** This is a custom resource component. 
 * To implement it, the resource script must have the methods "run()" which will
 * be called when the component is updated. It also must have any methods that are
 * confugred with initialization data from the model. */
export default class DataFormComponent extends Component {

    constructor(member,modelManager,instanceToCopy,keepUpdatedFixed) {
        super(member,modelManager,instanceToCopy,keepUpdatedFixed);

        //this should be present in the json that builds the folder, but in case it isn't (for one, because of a previous mistake)
        member.setChildrenWriteable(false);
        
        let model = modelManager.getModel();
        //==============
        //Fields
        //==============
        //Initailize these if this is a new instance
        if(!instanceToCopy) {
            this.setField("layoutCode","return []");
            this.setField("validatorCode","return true");

            //internal tables
            let valueMember = member.lookupChild(model,"value");
            this.registerMember(modelManager,valueMember,"member.value",false);

            let inputMember = member.lookupChild(model,"input");
            this.registerMember(modelManager,inputMember,"member.input",false);
        }
    };

    //==============================
    //Resource Accessors
    //==============================

    /** This method compiles the layout function entered by the user. It returns
     * the fields  {formLayoutFunction,validatorFunction,errorMessage}. */
    createFormFunctions() {
        var layoutCodeText = this.getField("layoutCode");
        var validatorCodeText = this.getField("validatorCode");
        var layoutFunction, validatorFunction, errorMessage;

        if((layoutCodeText !== undefined)&&(layoutCodeText !== null)) {
            try {
                //create the layout function
                layoutFunction = new Function("commandMessenger","inputData",layoutCodeText);
            }
            catch(error) {
                errorMessage = "Error parsing layout function code: " + error.toString()
                if(error.stack) console.error(error.stack);
            }
        }
        else {
            layoutFunction = () => [];
        }

        if((validatorCodeText !== undefined)&&(validatorCodeText !== null))  {
            try {
                //create the validator function
                validatorFunction = new Function("formValue","inputData",validatorCodeText);
            }
            catch(error) {
                errorMessage = "Error parsing validator function code: " + error.toString()
                if(error.stack) console.error(error.stack);
            }
        }
        else {
            validatorFunction = () => true;
        }

        return { layoutFunction, validatorFunction, errorMessage};
    }

    //=============================
    // Action
    //=============================

    updateLayoutCode(layoutCodeText) { 
        let oldLayoutCodeText = this.getField("layoutCode");
        if(layoutCodeText != oldLayoutCodeText) {
            this.setField("layoutCode",layoutCodeText);
        }
    }

    updateValidatorCode(validatorCodeText) { 
        let oldValidatorCodeText = this.getField("validatorCode");
        if(validatorCodeText != oldValidatorCodeText) {
            this.setField("validatorCode",validatorCodeText);
        }
    }

    //==============================
    // serialization
    //==============================

    readPropsFromJson(json) {
        if(!json) return;
        
        //load the resource
        if(json.layoutCode) { 
            this.updateLayoutCode(json.layoutCode); 
        }

        if(json.validatorCode) {
            this.updateValidatorCode(json.validatorCode)
        }
    }

    /** This serializes the table component. */
    writeToJson(json,modelManager) {
        //store the for code text
        json.layoutCode = this.getField("layoutCode");
        json.validatorCode = this.getField("validatorCode");
    }

}

//======================================
// This is the control generator, to register the control
//======================================

DataFormComponent.displayName = "New Data Form Cell";
DataFormComponent.uniqueName = "apogeeapp.NewDataFormCell";
DataFormComponent.DEFAULT_MEMBER_JSON = {
    "type": "apogee.Folder",
    "childrenNotWriteable": true,
    "children": {
        "input": {
            "name": "input",
            "type": "apogee.JsonMember",
            "updateData": {
                "data": "",
            }
        },
        "value": {
            "name": "value",
            "type": "apogee.JsonMember",
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
 *   "type":"actionFormComponentUpdateCommand",
 *   "memberId":(main member ID),
 *   "field": (field to update, "layout" or "validator")
 *   "initialValue":(original fields value)
 *   "targetValue": (desired fields value)
 * }
 */ 
let dataFormUpdateCommand = {};

dataFormUpdateCommand.createUndoCommand = function(workspaceManager,commandData) {
    let undoCommandData = {};
    undoCommandData.type = dataFormUpdateCommand.commandInfo.type;
    undoCommandData.memberId = commandData.memberId;
    undoCommandData.field = commandData.field;
    undoCommandData.initialValue = commandData.targetValue;
    undoCommandData.targetValue = commandData.initialValue;
    return undoCommandData;
}

dataFormUpdateCommand.executeCommand = function(workspaceManager,commandData) {
    let modelManager = workspaceManager.getMutableModelManager();
    let componentId = modelManager.getComponentIdByMemberId(commandData.memberId);
    let component = modelManager.getMutableComponentByComponentId(componentId);
    var commandResult = {};
    if(component) {
        try {
            if(commandData.field == "layout") {
                component.updateLayoutCode(commandData.targetValue);
            }
            else if(commandData.field == "validator") {
                component.updateValidatorCode(commandData.targetValue);
            }
            else {
                throw new Error("Internal error: unknown update field: " + commandData.field);
            }

            commandResult.cmdDone = true;
            commandResult.target = component;
            commandResult.eventAction = "updated";
        }
        catch(error) {
            if(error.stack) console.error(error.stack);
            let msg = error.message ? error.message : error;
            commandResult.cmdDone = false;
            commandResult.alertMsg = "Exception on custom component update: " + msg;
        }
    }
    else {
        commandResult.cmdDone = false;
        commandResult.alertMsg = "Component not found: " + commandData.memberId;
    }
    
    return commandResult;
}

dataFormUpdateCommand.commandInfo = {
    "type": "dataFormUpdateCommand",
    "targetType": "component",
    "event": "updated"
}


CommandManager.registerCommand(dataFormUpdateCommand);







