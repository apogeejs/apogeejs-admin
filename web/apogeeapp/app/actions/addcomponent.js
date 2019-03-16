

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
        var dialogLayout = apogeeapp.app.updatecomponent.getPropertiesDialogLayout(displayName,folderList,additionalLines,true,optionalInitialValues);
        
        //create on submit callback
        var onSubmitFunction = function(userInputValues) {
            
            //validate name
            var nameResult = apogee.codeCompiler.validateTableName(userInputValues.name);
            if(!nameResult.valid) {
                alert(nameResult.errorMessage);
                return false;
            }
            
            //get the parent object
            var parent = folderMap[userInputValues.parentName];        
            
            //create the member
            var createAction = {};
            createAction.action = "createMember";
            createAction.owner = parent;
            createAction.workspace = parent.getWorkspace();
            createAction.createData = componentGenerator.getCreateMemberPayload(userInputValues);
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
//TEMP---------------------------------------------------------
                    else {
                        
if(component.isEditComponent) {
    var parentComponent = workspaceUI.getComponent(parent);
    var tabDisplay = parentComponent.getTabDisplay();
    if(!tabDisplay) {
        tabDisplay = parentComponent.createTabDisplay();
    }
    tabDisplay.insertChildIntoDisplay(member.getName());                      
}               
                    }
//--------------------------------------------------------------
                }
                catch(error) {
                    //exception creating component
                    var message = "Failed to create UI component: " + error.message;
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
}

//=====================================
// Action
//=====================================


