



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

    ////////////////////////////////////
    //this is cumbersome - fix it up
    var parentMember = member.getParent();
    let parentComponent = workspaceUI.getComponent(parentMember);
    let editorCommand = parentComponent.removeComponentFromPage(member.getName());
    /////////////////////////////////

    //model command
    var modelCommand = {};
    modelCommand.type = "deleteComponent";
    modelCommand.memberFullName = member.getFullName();
    
    //combined command
    var commandData = {};
    commandData.type = "compoundCommand";
    commandData.childCommands = [];
    if(editorCommand) commandData.childCommands.push(editorCommand);
    commandData.childCommands.push(modelCommand);

    workspaceUI.getApp().executeCommand(commandData);
}