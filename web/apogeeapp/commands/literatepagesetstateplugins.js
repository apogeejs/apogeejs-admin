import CommandManager from "/apogeeapp/commands/CommandManager.js";
import { attachPluginsToEditorState } from "/apogeeapp/document/apogeeSchema.js";

/** Set plugins
 * This command is needed because of a small philosophy difference between apogee and prosemirror
 * We need to set the editor view "plugins" on our editor state. The editor state itself is part of
 * the philosophy difference. Preferbly we woul donly store the doc in the component/app layer. But
 * we are doing this because it gives the best mapping between prosemirror transactions and 
 * apogee commands, which overall seems to be the best path to take, for now. 
 *
 * Command JSON format:
 * {
 *   "type":"literatePagePlugins",
 *   "componentId":(component id),
 *   "plugins":(plugins object (not a json))
 * }
 */ 
let literatepagesetstateplugins = {};

//=====================================
// Command Object
//=====================================

//no undo command here
//literatepagesetstatePlugins.createUndoCommand = function(workspaceManager,commandData) {}


literatepagesetstateplugins.executeCommand = function(workspaceManager,commandData) {
    let modelManager = workspaceManager.getMutableModelManager();
    let component = modelManager.getMutableComponentByComponentId(commandData.componentId);

    let oldEditorState = component.getEditorState();
    let plugins = commandData.plugins;

    let newEditorState = attachPluginsToEditorState(oldEditorState,plugins);

    component.setEditorState(newEditorState);
}

literatepagesetstateplugins.commandInfo = {
    "type": "literatePagePlugins",
    "targetType": "component",
    "event": "updated"
}

CommandManager.registerCommand(literatepagesetstateplugins);


