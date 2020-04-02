import {doAction} from "/apogee/apogeeCoreLib.js";

import CommandManager from "/apogeeapp/commands/CommandManager.js";

/** Update Component Command
 *
 * Command JSON format:
 * {
 *   "type":"updateComponent",
 *   "memberId":(main member ID),
 *   "updatedMemberProperties":(member property json),
 *   "updatedComponentProperties":(component property json)
 * }
 */ 
let updatecomponent = {};

//=====================================
// Command Object
//=====================================

updatecomponent.createUndoCommand = function(workspaceManager,commandData) {
    let modelManager = workspaceManager.getModelManager();
    let model = modelManager.getModel();
    var member = model.lookupMemberById(commandData.memberId);
    var componentId = modelManager.getComponentIdByMemberId(commandData.memberId);
    var component = modelManager.getComponentByComponentId(componentId);

    var originalMemberProperties = {};
    if(member.constructor.generator.readProperties) member.constructor.generator.readProperties(member,originalMemberProperties);
    var originalComponentProperties = {};
    if(component.readExtendedProperties) component.readExtendedProperties(originalComponentProperties);
    
    var undoMemberProperties;
    var undoComponentProperties;
    
    if(commandData.updatedMemberProperties) {
        undoMemberProperties = {};
        for(var propKey in commandData.updatedMemberProperties) {
            undoMemberProperties = originalMemberProperties[propKey];
        }
    }
    
    if(commandData.updatedComponentProperties) {
        undoComponentProperties = {};
        for(var propKey in commandData.updatedComponentProperties) {
            undoComponentProperties = originalComponentProperties[propKey];
        }
    }
    
    var undoCommandJson = {};
    undoCommandJson.type = updatecomponent.commandInfo.type;
    undoCommandJson.memberId = commandData.memberId;
    if(undoMemberProperties) undoCommandJson.updatedMemberProperties = undoMemberProperties;
    if(undoComponentProperties) undoCommandJson.updatedComponentProperties = undoComponentProperties;
    
    return undoCommandJson;
}

/** This method is used for updating property values from the property dialog. 
 * If there are additional property lines, in the generator, this method should
 * be extended to edit the values of those properties too. */
updatecomponent.executeCommand = function(workspaceManager,commandData) {
    
    let modelManager = workspaceManager.getMutableModelManager();
    let model = modelManager.getMutableModel();
    var member = model.getMemberById(commandData.memberId);
    var componentId = modelManager.getComponentIdByMemberId(commandData.memberId);
    var component = modelManager.getMutableComponentByComponentId(componentId);
    
    //create an action to update an member additional properties
    var memberGenerator = member.constructor.generator;
    let actionResult;
    if(memberGenerator.getPropertyUpdateAction) {
        var actionData = memberGenerator.getPropertyUpdateAction(member,commandData.updatedMemberProperties);  
        if(actionData) {
            actionResult = doAction(model,actionData);
            if(!actionResult.actionDone) {
                throw new Error("Error updating member properties: " + actionResult.errorMsg);
            }
        }
    }
 
    //update an component additional properties
    component.loadPropertyValues(commandData.updatedComponentProperties);
}

updatecomponent.commandInfo = {
    "type": "updateComponent",
    "targetType": "component",
    "event": "updated"
}

CommandManager.registerCommand(updatecomponent);


