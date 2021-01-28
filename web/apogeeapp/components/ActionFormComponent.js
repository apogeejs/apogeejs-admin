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
            this.setField("layoutCode","return []");
        }
    };

    //==============================
    //Resource Accessors
    //==============================

    /** This method compiles the layout function entered by the user. It returns
     * the fields  {formLayoutFunction,errorMessage}. */
    createFormLayoutFunction() {
        var formCodeText = this.getField("layoutCode");
        
        var formLayoutFunction;
        var errorMessage;
        if((formCodeText !== undefined)&&(formCodeText !== null)) {
            try {
                //create the layout function
                formLayoutFunction = new Function("commandMessenger","inputData",formCodeText);
            }
            catch(error) {
                errorMessage = "Error parsing uiGenerator code: " + error.toString()
                if(error.stack) console.error(error.stack);
            }
        }
        else {
            formLayoutFunction = () => [];
        }
        
        return {formLayoutFunction,errorMessage}
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

    //==============================
    // serialization
    //==============================

    readPropsFromJson(json) {
        if(!json) return;
        
        //load the resource
        if(json.layoutCode) { 
            this.updateLayoutCode(json.layoutCode); 
        }
    }

    /** This serializes the table component. */
    writeToJson(json,modelManager) {
        //store the for code text
        json.layoutCode = this.getField("layoutCode");
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
let actionFormUpdateCommand = {};

actionFormUpdateCommand.createUndoCommand = function(workspaceManager,commandData) {
    let undoCommandData = {};
    undoCommandData.type = actionFormUpdateCommand.commandInfo.type;
    undoCommandData.memberId = commandData.memberId;
    undoCommandData.initialValue = commandData.targetValue;
    undoCommandData.targetValue = commandData.initialValue;
    return undoCommandData;
}

actionFormUpdateCommand.executeCommand = function(workspaceManager,commandData) {
    let modelManager = workspaceManager.getMutableModelManager();
    let componentId = modelManager.getComponentIdByMemberId(commandData.memberId);
    let component = modelManager.getMutableComponentByComponentId(componentId);
    var commandResult = {};
    if(component) {
        try {
            component.updateLayoutCode(commandData.targetValue);

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

actionFormUpdateCommand.commandInfo = {
    "type": "actionFormUpdateCommand",
    "targetType": "component",
    "event": "updated"
}

CommandManager.registerCommand(actionFormUpdateCommand);







