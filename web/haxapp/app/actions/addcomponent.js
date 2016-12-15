

haxapp.app.addcomponent = {};

//=====================================
// UI Entry Point
//=====================================

/** This gets a callback to add a component. */
haxapp.app.addcomponent.getAddComponentCallback = function(app,generator,optionalInitialValues,optionalComponentOptions) {
    
    var createCallback = function() {
        //get the active workspace
        var workspaceUI = app.getActiveWorkspaceUI();
        if(!workspaceUI) {
            alert("There is no open workspace.");
            return;
        }     
        
        //get the folder list
        var folderMap = workspaceUI.getFolders();
        var folderList = [];
        for(var folderName in folderMap) {
            folderList.push(folderName);
        }
        
        //create the dialog layout - do on the fly because folder list changes
        var dialogLayout = haxapp.app.propdialog.getDialogLayout(folderList,generator,true,optionalInitialValues);
        
        //create on submit callback
        var onSubmitFunction = function(result) {
            
            //need to test if fields are valid!
            
            result.parent = folderMap[result.parentName];

            var actionResponse =  generator.createComponent(workspaceUI,result,optionalComponentOptions);   
            if(!actionResponse.getSuccess()) {
                alert(actionResponse.getErrorMsg())
            }
            //return true to close the dialog
            return true;
        }
        
        //show dialog
        haxapp.app.dialog.showConfigurableDialog(dialogLayout,onSubmitFunction);
    }
    
    return createCallback;
    
}

/** This gets a callback to add an "additional" component, menaing one that is not
 * in the main component menu. */
haxapp.app.addcomponent.getAddAdditionalComponentCallback = function(app,optionalInitialValues,optionalComponentOptions) {
    return function() {
    
        var onSelect = function(componentType) {
            var generator = app.getComponentGenerator(componentType);
            if(generator) {
                var doAddComponent = haxapp.app.addcomponent.getAddComponentCallback(app,generator,optionalInitialValues,optionalComponentOptions);
                doAddComponent();
            }
            else {
                alert("Unknown component type: " + componentType);
            }
        }
        //open select component dialog
        haxapp.app.dialog.showSelectComponentDialog(app.additionalComponents,onSelect);
    }
}

//=====================================
// Action
//=====================================


