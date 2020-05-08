import CommandManager from "/apogeeapp/commands/CommandManager.js";
import Apogee from "/apogeeapp/Apogee.js";
import WorkspaceManager from "/apogeeapp/WorkspaceManager.js";

/** Open Workspace Command
 *
 * Command JSON format:
 * {
 *   "type":"openWorkspace",
 *   "workspaceJson":(workspace JSON),
 *   "fileMetadata":(file metadata)
 * }
 */ 
let openworkspace = {};

//=====================================
// Action
//=====================================

//NO UNDO FOR OPEN Workspace
//openworkspace.createUndoCommand = function(workspaceManager,commandData) {

openworkspace.executeCommand = function(workspaceManager,commandData) {
    workspaceManager.load(commandData.workspaceJson,commandData.fileMetadata);
}

openworkspace.commandInfo = {
    "type": "openWorkspace",
    "targetType": "workspace",
    "event": "created"
}

CommandManager.registerCommand(openworkspace);



