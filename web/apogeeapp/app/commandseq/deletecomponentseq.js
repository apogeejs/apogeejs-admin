



export function deleteComponent(component) {

    //get the active workspace
    var workspaceUI = component.getWorkspaceUI();
    if(!workspaceUI) {
        alert("There is no open workspace.");
        return;
    }     

    var doDelete = confirm("Are you sure you want to delete this object?");
    if(!doDelete) {
        return;
    }

    var member = component.getMember();
    var commands = [];

    ////////////////////////////////////
    //this is cumbersome - fix it up
    if(component.usesChildDisplay()) {
        var parentMember = member.getParent();
        let parentComponent = workspaceUI.getComponent(parentMember);

        let editorCommand = parentComponent.getRemoveApogeeNodeFromPageCommand(member.getName());
        commands.push(editorCommand);
    }
    /////////////////////////////////

    //model command
    var modelCommand = {};
    modelCommand.type = "deleteComponent";
    modelCommand.memberFullName = member.getFullName();
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

    workspaceUI.getApp().executeCommand(commandData);
}