

apogeeapp.app.addcomponentseq = {};

//=====================================
// UI Entry Point
//=====================================

/** This functions initiates the add component action. It will create a dialog for the user to enter the relevent 
 * properties, with the values optionalInitialProperties preset. The created componenent will also use the 
 * property values in optionalBaseComponentValues, overridden by the user input properties where applicable. The member
 * created will be made using the optionalBaseMemberValues, agagin overidden by any user input values.  */   
apogeeapp.app.addcomponentseq.addComponent = function(app,componentGenerator,optionalInitialProperties,optionalBaseMemberValues,optionalBaseComponentValues,optionalOnSuccess) {

        //get the active workspace
        var workspaceUI = app.getWorkspaceUI();
        if(!workspaceUI) {
            alert("There is no open workspace.");
            return;
        }     
        
        var displayName = componentGenerator.displayName
        var additionalLines = apogee.util.jsonCopy(componentGenerator.propertyDialogLines); 
        
        //get the folder list
        var folderMap = workspaceUI.getFolders();
        var folderList = [];
        for(var folderName in folderMap) {
            folderList.push(folderName);
        }
        
        //create the dialog layout - do on the fly because folder list changes
        var dialogLayout = apogeeapp.app.updatecomponentseq.getPropertiesDialogLayout(displayName,folderList,additionalLines,true,optionalInitialProperties);
        
        //create on submit callback
        var onSubmitFunction = function(userInputProperties) {
            
            //validate name
            var nameResult = apogee.codeCompiler.validateTableName(userInputProperties.name);
            if(!nameResult.valid) {
                alert(nameResult.errorMessage);
                return false;
            }
            
            //get the parent object
            var parent = folderMap[userInputProperties.parentName]; 
            
            //add the component
            var command = apogeeapp.app.addcomponent.createAddComponentCommand(workspaceUI,parent,componentGenerator,userInputProperties,optionalBaseMemberValues,optionalBaseComponentValues,optionalOnSuccess);
            workspaceUI.getApp().executeCommand(command);
            
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
