import {showSimpleActionDialog} from "/apogeeview/dialogs/SimpleActionDialog.js";


export function deleteComponent(componentView) {

    let doDelete = () => {
        deleteComponentImpl(componentView);
        returnToEditor(componentView);
    }

    let doCancel = () => {
        returnToEditor(componentView);
    };
    showSimpleActionDialog("Are you sure you want to delete this object:" + componentView.getName() + "?",null,["OK","Cancel"],[doDelete,doCancel]);
}

function returnToEditor(componentView) {
    let parentComponentView = componentView.getParentComponentView();
    if(parentComponentView) {
        parentComponentView.giveEditorFocusIfShowing();
    }
}

function deleteComponentImpl(componentView) {

    var modelManager = componentView.getModelView().getModelManager(); 
    var component = componentView.getComponent();

    var member = component.getMember();
    var commands = [];

    if(componentView.constructor.hasChildEntry) {
        let parentComponentView = componentView.getParentComponentView();

        let editorCommand = parentComponentView.getRemoveApogeeNodeFromPageCommand(component.getName());
        commands.push(editorCommand);
    }

    //model command
    var modelCommand = {};
    modelCommand.type = "deleteComponent";
    modelCommand.memberId = member.getId();
    commands.push(modelCommand);
    
    //combined command
    let commandData;
    if(commands.length > 1) {
        commandData = {};
        commandData.type = "compoundCommand";
        commandData.childCommands = commands;
    }
    else if(commands.length === 1) {
        commandData = commands[0];
    }
    else {
        return;
    }

    modelManager.getApp().executeCommand(commandData);
}