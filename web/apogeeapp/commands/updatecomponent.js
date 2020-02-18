import {doAction} from "/apogee/apogeeCoreLib.js";

import CommandManager from "/apogeeapp/commands/CommandManager.js";

/** Update Component Command
 *
 * Command JSON format:
 * {
 *   "type":"updateComponent",
 *   "memberFullName":(main member full name),
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
    var member = model.getMemberByFullName(commandData.memberFullName);
    var component = memberManager.getComponent(member);
    

    var originalMemberProperties = {};
    if(member.generator.readProperties) member.generator.readProperties(member,originalMemberProperties);
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
    undoCommandJson.memberFullName = commandData.memberFullName;
    if(undoMemberProperties) undoCommandJson.updatedMemberProperties = undoMemberProperties;
    if(undoComponentProperties) undoCommandJson.updatedComponentProperties = undoComponentProperties;
    
    return undoCommandJson;
}

/** This method is used for updating property values from the property dialog. 
 * If there are additional property lines, in the generator, this method should
 * be extended to edit the values of those properties too. */
updatecomponent.executeCommand = function(workspaceManager,commandData) {
    
    let modelManager = workspaceManager.getModelManager();
    let model = modelManager.getModel();
    //get the member
    var member = model.getMemberByFullName(commandData.memberFullName);   
    var component = modelManager.getComponent(member);

    var error = false;
    var errorMsg;
    
    //create an action to update an member additional properties
    var memberGenerator = member.generator;
    if(memberGenerator.getPropertyUpdateAction) {
        var actionData = memberGenerator.getPropertyUpdateAction(member,commandData.updatedMemberProperties);  
        if(actionData) {
            let actionResult = doAction(model,actionData);
            
            if(!actionResult.actionDone) {
                error = true;
                errorMsg = actionResult.alertMsg;
            }
        }
    }
 
    //update an component additional properties
    //NEED ERROR HANDLING HERE!!!
    if(!error) {
        component.loadPropertyValues(commandData.updatedComponentProperties);
    }
    
    var commandResult = {};
    commandResult.cmdDone = !error;
    if(errorMsg) commandResult.alertMsg = errorMsg;

    if(commandResult.cmdDone) {
        commandResult.target = component;
        commandResult.action = "updated";
    }
    
    return commandResult;
}

updatecomponent.commandInfo = {
    "type": "updateComponent",
    "targetType": "component",
    "event": "updated"
}

CommandManager.registerCommand(updatecomponent);


