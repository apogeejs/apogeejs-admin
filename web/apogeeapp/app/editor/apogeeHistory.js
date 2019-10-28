/** This file connects prose mirror to the apogee history. */
import Apogee from "/apogeeapp/app/Apogee.js";

export function undo() {
    let apogee = Apogee.getInstance();
    if(apogee) {
        let commandManager = apogee.getCommandManager();
        let commandHistory = commandManager.getCommandHistory();
        commandHistory.undo();
    }
}

export function redo() {
    let apogee = Apogee.getInstance();
    if(apogee) {
        let commandManager = apogee.getCommandManager();
        let commandHistory = commandManager.getCommandHistory();
        commandHistory.redo();
    }
}