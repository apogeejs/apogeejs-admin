

apogeeapp.app.addcomponent = {};

//=====================================
// UI Entry Point
//=====================================

/** This gets a callback to add a component. */
apogeeapp.app.addcomponent.getAddComponentCallback = function(app,generator,optionalInitialValues,optionalComponentOptions) {
    
    var createCallback = function() {
        //get the active workspace
        var workspaceUI = app.getWorkspaceUI();
        if(!workspaceUI) {
            alert("There is no open workspace.");
            return;
        }     
        
        var displayName = generator.displayName
        var additionalLines = apogee.util.jsonCopy(generator.propertyDialogLines); 
        
        //get the folder list
        var folderMap = workspaceUI.getFolders();
        var folderList = [];
        for(var folderName in folderMap) {
            folderList.push(folderName);
        }
        
        //create the dialog layout - do on the fly because folder list changes
        var dialogLayout = apogeeapp.app.propdialog.getDialogLayout(displayName,folderList,additionalLines,true,optionalInitialValues);
        
        //create on submit callback
        var onSubmitFunction = function(result) {
            
            //validate name
            var nameResult = apogee.codeCompiler.validateTableName(result.name);
            if(!nameResult.valid) {
                alert(nameResult.errorMessage);
                return false;
            }
            
            result.parent = folderMap[result.parentName];

            var actionResponse =  generator.createComponent(workspaceUI,result,optionalComponentOptions);   
            if(!actionResponse.getSuccess()) {
                alert(actionResponse.getErrorMsg())
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
apogeeapp.app.addcomponent.getAddAdditionalComponentCallback = function(app,optionalInitialValues,optionalComponentOptions) {
    return function() {
    
        var onSelect = function(componentType) {
            var generator = app.getComponentGenerator(componentType);
            if(generator) {
                var doAddComponent = apogeeapp.app.addcomponent.getAddComponentCallback(app,generator,optionalInitialValues,optionalComponentOptions);
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


