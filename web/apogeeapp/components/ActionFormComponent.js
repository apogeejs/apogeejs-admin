import Component from "/apogeeapp/component/Component.js";
import CommandManager from "/apogeeapp/commands/CommandManager.js";

/** This is a custom resource component. 
 * To implement it, the resource script must have the methods "run()" which will
 * be called when the component is updated. It also must have any methods that are
 * confugred with initialization data from the model. */
export default class ActionFormComponent extends Component {

    constructor(member,modelManager,instanceToCopy,keepUpdatedFixed) {
        super(member,modelManager,instanceToCopy,keepUpdatedFixed);
        
        //==============
        //Fields
        //==============
        //Initailize these if this is a new instance
        if(!instanceToCopy) {
            this.setField("formCode","return []");
        }
    };

    //==============================
    //Resource Accessors
    //==============================


    createFormLayoutFunction() {
        var formCodeText = this.getField("formCode");
        
        var formLayoutFunction;
        if((formCodeText !== undefined)&&(formCodeText !== null)) {
            try {
                //create the resource generator wrapped with its closure
                formLayoutFunction = new Function("admin",formCodeText);
            }
            catch(error) {
                if(error.stack) console.error(error.stack);
                console.log("bad form function code");
            }
        }
            
        //create a dummy
        if(!formLayoutFunction) {
            formLayoutFunction = () => [];
        }

        return formLayoutFunction;
    }


    //=============================
    // Action
    //=============================

    updateFormCode(formCodeText) { 
        let oldFormCodeText = this.getField("formCode");
        if(formCodeText != oldFormCodeText) {
            this.setField("formCode",formCodeText);
        }

    }

    //==============================
    // serialization
    //==============================

    readPropsFromJson(json) {
        if(!json) return;
        
        //load the resource
        if(json.formCode) { 
            this.updateFormCode(json.formCode); 
        }
    }

    /** This serializes the table component. */
    writeToJson(json,modelManager) {
        //store the for code text
        json.formCode = this.getField("formCode");
    }

}

//======================================
// This is the control generator, to register the control
//======================================

ActionFormComponent.displayName = "New Action Form Cell";
ActionFormComponent.uniqueName = "apogeeapp.NewActionFormCell";
ActionFormComponent.DEFAULT_MEMBER_JSON = {
    "type": "apogee.JsonMember"
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
 *   "initialValue":(original fields value)
 *   "targetValue": (desired fields value)
 * }
 */ 
let actionFormComponentUpdateData = {};

actionFormComponentUpdateData.createUndoCommand = function(workspaceManager,commandData) {
    let undoCommandData = {};
    undoCommandData.type = actionFormComponentUpdateData.commandInfo.type;
    undoCommandData.memberId = commandData.memberId;
    undoCommandData.fieldName = commandData.fieldName;
    undoCommandData.initialValue = commandData.targetValue;
    undoCommandData.targetValue = commandData.initialValue;
    return undoCommandData;
}

actionFormComponentUpdateData.executeCommand = function(workspaceManager,commandData) {
    let modelManager = workspaceManager.getMutableModelManager();
    let componentId = modelManager.getComponentIdByMemberId(commandData.memberId);
    let component = modelManager.getMutableComponentByComponentId(componentId);
    var commandResult = {};
    if(component) {
        try {
            component.updateFormCode(commandData.targetValue);

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

actionFormComponentUpdateData.commandInfo = {
    "type": "actionFormComponentUpdateCommand",
    "targetType": "component",
    "event": "updated"
}

CommandManager.registerCommand(actionFormComponentUpdateData);







