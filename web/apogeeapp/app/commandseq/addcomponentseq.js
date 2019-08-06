import util from "/apogeeutil/util.js";
import {validateTableName} from "/apogee/lib/codeCompiler.js"; 

import {getPropertiesDialogLayout} from "/apogeeapp/app/commandseq/updatecomponentseq.js";
import Component from "/apogeeapp/app/component/Component.js";

//=====================================
// UI Entry Point
//=====================================

/** This functions initiates the add component action. It will create a dialog for the user to enter the relevent 
 * properties, with the values optionalInitialProperties preset. The created componenent will also use the 
 * property values in optionalBaseComponentValues, overridden by the user input properties where applicable. The member
 * created will be made using the optionalBaseMemberValues, agagin overidden by any user input values.  */   
//piggybackCommand is a temporary test!!!
export function addComponent(app,componentGenerator,optionalInitialProperties,optionalBaseMemberValues,optionalBaseComponentValues,piggybackCommandGenerator) {

        //get the active workspace
        var workspaceUI = app.getWorkspaceUI();
        if(!workspaceUI) {
            alert("There is no open workspace.");
            return;
        }     
        
        //get the tyep display name
        var displayName = componentGenerator.displayName
        
        //get any additional property content for dialog beyond basic properties
        var additionalLines = util.jsonCopy(componentGenerator.propertyDialogLines); 
        
        //get the folder list
        var folderList = workspaceUI.getFolders();
        
        //create the dialog layout - do on the fly because folder list changes
        var dialogLayout = getPropertiesDialogLayout(displayName,folderList,additionalLines,true,optionalInitialProperties);
        
        //create on submit callback
        var onSubmitFunction = function(userInputProperties) {
            
            //validate the name
            var nameResult = validateTableName(userInputProperties.name);
            if(!nameResult.valid) {
                alert(nameResult.errorMessage);
                return false;
            }

            //other validation of inputs?
            
            //create the command
            var commandData = {};
            commandData.type = "addComponent";
            commandData.parentFullName = userInputProperties.parentName;
            commandData.memberJson = Component.createMemberJson(componentGenerator,userInputProperties,optionalBaseMemberValues);
            commandData.componentJson = Component.createComponentJson(componentGenerator,userInputProperties,optionalBaseComponentValues);
            
            //#################################################
            //temporary TESTING
            if(piggybackCommandGenerator) {
                
                var piggybackCommand = piggybackCommandGenerator(userInputProperties.name);
                
                var parentCommandData = {};
                parentCommandData.type = "compoundCommand";
                parentCommandData.childCommands = [];
                parentCommandData.childCommands.push(commandData);
                parentCommandData.childCommands.push(piggybackCommand);
                
                commandData = parentCommandData;
            }
            
            //#################################################
            
            //execute command
            workspaceUI.getApp().executeCommand(commandData);

            //return true to close the dialog
            return true;
        }
        
        //show dialog
        apogeeapp.app.dialog.showConfigurableDialog(dialogLayout,onSubmitFunction);
}

/** This gets a callback to add an "additional" component, menaing one that is not
 * in the main component menu. */
//piggybackCommand is a temporary test!!!
export function addAdditionalComponent(app,optionalInitialProperties,optionalBaseMemberValues,optionalBaseComponentValues,piggybackCommandGenerator) {
        
    var onSelect = function(componentType) {
        var componentGenerator = app.getComponentGenerator(componentType);
        if(componentGenerator) {
            addComponent(app,componentGenerator,optionalInitialProperties,optionalBaseMemberValues,optionalBaseComponentValues,piggybackCommandGenerator);
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
