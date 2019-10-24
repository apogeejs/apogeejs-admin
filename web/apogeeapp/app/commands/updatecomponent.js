import {doAction} from "/apogee/actions/action.js";

import CommandManager from "/apogeeapp/app/commands/CommandManager.js";

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

updatecomponent.createUndoCommand = function(workspaceUI,commandData) {
    var workspace = workspaceUI.getWorkspace();
    var member = workspace.getMemberByFullName(commandData.memberFullName);
    var component = workspaceUI.getComponent(member);
    
    var originalMemberProperties = (member.generator.readProperties) ? member.generator.readProperties(member,values) : {};
    var originalComponentProperties = {};
    component.readExtendedProperties(originalComponentProperties);
    
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
    undoCommandJson.type = updatecomponent.COMMAND_TYPE;
    undoCommandJson.memberFullName = commandData.memberFullName;
    if(undoMemberProperties) undoCommandJson.updatedMemberProperties = undoMemberProperties;
    if(undoComponentProperties) undoCommandJson.updatedComponentProperties = undoComponentProperties;
    
    return undoCommandJson;
}

/** This method is used for updating property values from the property dialog. 
 * If there are additional property lines, in the generator, this method should
 * be extended to edit the values of those properties too. */
updatecomponent.executeCommand = function(workspaceUI,commandData) {
    
    var workspace = workspaceUI.getWorkspace();
    //get the member
    var member = workspace.getMemberByFullName(commandData.memberFullName);   
    var component = workspaceUI.getComponent(member);
    
    var error = false;
    var errorMsg;
    
    //create an action to update an member additional properties
    var memberGenerator = member.generator;
    if(memberGenerator.getPropertyUpdateAction) {
        var actionData = memberGenerator.getPropertyUpdateAction(member,commandData.updatedMemberProperties);  
        var actionResult = doAction(workspace,actionData);
        
        if(!actionResult.actionDone) {
            error = true;
            errorMsg = actionResult.alertMsg;
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
    
    return commandResult;
}

updatecomponent.COMMAND_TYPE = "updateComponent";

CommandManager.registerCommand(updatecomponent);


