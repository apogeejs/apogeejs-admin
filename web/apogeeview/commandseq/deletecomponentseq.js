



export function deleteComponent(component,componentView) {

    var doDelete = confirm("Are you sure you want to delete this object?");
    if(!doDelete) {
        return;
    }

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

    component.getModelManager().getApp().executeCommand(commandData);
}