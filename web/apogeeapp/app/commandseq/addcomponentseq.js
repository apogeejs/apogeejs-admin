

apogeeapp.app.addcomponentseq = {};

//=====================================
// UI Entry Point
//=====================================

/** This functions initiates the add component action. It will create a dialog for the user to enter the relevent 
 * properties, with the values optionalInitialProperties preset. The created componenent will also use the 
 * property values in optionalBaseComponentValues, overridden by the user input properties where applicable. The member
 * created will be made using the optionalBaseMemberValues, agagin overidden by any user input values.  */   
apogeeapp.app.addcomponentseq.addComponent = function(app,componentGenerator,optionalInitialProperties,optionalBaseMemberValues,optionalBaseComponentValues) {

        //get the active workspace
        var workspaceUI = app.getWorkspaceUI();
        if(!workspaceUI) {
            alert("There is no open workspace.");
            return;
        }     
        
        //get the tyep display name
        var displayName = componentGenerator.displayName
        
        //get any additional property content for dialog beyond basic properties
        var additionalLines = apogee.util.jsonCopy(componentGenerator.propertyDialogLines); 
        
        //get the folder list
        var folderList = workspaceUI.getFolders();
        
        //create the dialog layout - do on the fly because folder list changes
        var dialogLayout = apogeeapp.app.updatecomponentseq.getPropertiesDialogLayout(displayName,folderList,additionalLines,true,optionalInitialProperties);
        
        //create on submit callback
        var onSubmitFunction = function(userInputProperties) {
            
            //validate the name
            var nameResult = apogee.codeCompiler.validateTableName(userInputProperties.name);
            if(!nameResult.valid) {
                alert(nameResult.errorMessage);
                return false;
            }

            //other validation of inputs?
            
            //create the command
            var commandJson = {};
            commandJson.type = apogeeapp.app.addcomponent.COMMAND_TYPE;
            commandJson.parentFullName = userInputProperties.parentName;
            commandJson.memberJson = apogeeapp.app.Component.createMemberJson(componentGenerator,userInputProperties,optionalBaseMemberValues);
            commandJson.componentJson = apogeeapp.app.Component.createComponentJson(componentGenerator,userInputProperties,optionalBaseComponentValues);
            
            //execute command
            workspaceUI.getApp().executeCommand(commandJson);

            //return true to close the dialog
            return true;
        }
        
        //show dialog
        apogeeapp.app.dialog.showConfigurableDialog(dialogLayout,onSubmitFunction);
}

/** This gets a callback to add an "additional" component, menaing one that is not
 * in the main component menu. */
apogeeapp.app.addcomponentseq.addAdditionalComponent = function(app,optionalInitialProperties,optionalBaseMemberValues,optionalBaseComponentValues) {
        
    var onSelect = function(componentType) {
        var componentGenerator = app.getComponentGenerator(componentType);
        if(componentGenerator) {
            apogeeapp.app.addcomponentseq.addComponent(app,componentGenerator,optionalInitialProperties,optionalBaseMemberValues,optionalBaseComponentValues);
        }
        else {
            alert("Unknown component type: " + componentType);
        }
    }
    //get the display names
    var componentNames = app.additionalComponents.map(componentClassName => {
        var generator = app.getComponentGenerator(componentClassName);
        if(generator) {
            return generator.displayName;
        }
        else {
            return componentClassName + " (ERROR - not found!)";
        }
    })
    //open select component dialog
    apogeeapp.app.dialog.showSelectComponentDialog(componentNames,app.additionalComponents,onSelect);
}
