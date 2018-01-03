

apogeeapp.app.addcomponent = {};

//=====================================
// UI Entry Point
//=====================================

/** This gets a callback to add a component. */
apogeeapp.app.addcomponent.getAddComponentCallback = function(app,componentGenerator,optionalInitialValues,optionalComponentJson) {
    
    var createCallback = function() {
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
        var dialogLayout = apogeeapp.app.propdialog.getDialogLayout(displayName,folderList,additionalLines,true,optionalInitialValues);
        
        //create on submit callback
        var onSubmitFunction = function(userInputValues) {
            
            //validate name
            var nameResult = apogee.codeCompiler.validateTableName(userInputValues.name);
            if(!nameResult.valid) {
                alert(nameResult.errorMessage);
                return false;
            }
            
            //get the parent object
            userInputValues.parent = folderMap[userInputValues.parentName];
            
            //create the member
            var createAction = componentGenerator.getMemberCreateAction(userInputValues);
            var actionResponse = apogee.action.doAction(createAction,true);
            var member = createAction.member;
            
            if(member) {
                var component;
                
                try {
                    //create the component
                    component = apogeeapp.app.Component.createComponentFromMember(componentGenerator,workspaceUI,member,userInputValues,optionalComponentJson);
                    
                    //unknown failure
                    if(!component) {
                        var message = "Unknown error creating component";
                        var actionError = new apogee.ActionError(message,apogee.ActionError.ERROR_TYPE_APP);
                        actionResponse.addError(actionError);
                    }
                }
                catch(error) {
                    //exception creating component
                    var message = "Failed to created UI component: " + error.message;
                    var actionError = new apogee.ActionError(message,apogee.ActionError.ERROR_TYPE_APP);
                    actionResponse.addError(actionError);
                }
                
                if(!component) {
                    //delete the already created member
                    var json = {};
                    json.action = "deleteMember";
                    json.member = member;
                    //if this fails, we will just ignore it for now
                    apogee.action.doAction(json,true);
                }
                
                
            }
            
            if(!actionResponse.getSuccess()) {
                apogeeapp.app.errorHandling.handleActionError(actionResponse);
            }
            
            //return true to close the dialog
            return true;
        }
        
        //show dialog
        apogeeapp.app.dialog.showConfigurableDialog(dialogLayout,onSubmitFunction);
    }
    
    return createCallback;
    
}

/** This gets a callback to add an "additional" component, menaing one that is not
 * in the main component menu. */
apogeeapp.app.addcomponent.getAddAdditionalComponentCallback = function(app,optionalInitialValues,optionalComponentJson) {
    return function() {
    
        var onSelect = function(componentType) {
            var componentGenerator = app.getComponentGenerator(componentType);
            if(componentGenerator) {
                var doAddComponent = apogeeapp.app.addcomponent.getAddComponentCallback(app,componentGenerator,optionalInitialValues,optionalComponentJson);
                doAddComponent();
            }
            else {
                alert("Unknown component type: " + componentType);
            }
        }
        //open select component dialog
        apogeeapp.app.dialog.showSelectComponentDialog(app.additionalComponents,onSelect);
    }
}

//=====================================
// Action
//=====================================


