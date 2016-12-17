

haxapp.app.updatecomponent = {};

//=====================================
// UI Entry Point
//=====================================

/** This method gets a callback to update the properties of a component. */
haxapp.app.updatecomponent.getUpdateComponentCallback = function(component,generator) {
    
    var createCallback = function() {
        
        var workspaceUI = component.getWorkspaceUI();       
        var initialValues = component.getPropertyValues();
        
        //get the folder list
        var folderMap = workspaceUI.getFolders();
        var folderList = [];
        for(var folderName in folderMap) {
            folderList.push(folderName);
        }
        
        //create the dialog layout - do on the fly because folder list changes
        var dialogLayout = haxapp.app.propdialog.getDialogLayout(folderList,generator,false,initialValues);
        
        //create on submit callback
        var onSubmitFunction = function(newValues) {
            
            //see if there were no changes
            var change = false;
            for(var key in newValues) {
                if(newValues[key] !== initialValues[key]) change = true;
            }
            if(!change) {
                return true;
            }
            
            //validate the name, if it changed
            if(newValues.name !== initialValues.name) {
                //validate name
                var nameResult = hax.codeCompiler.validateTableName(newValues.name);
                if(!nameResult.valid) {
                    alert(nameResult.errorMessage);
                    return false;
                }
            }
            
            //get the parent value
            newValues.parent = folderMap[newValues.parentName];
            
            //need to test if fields are valid!

            //update
            var actionResponse = haxapp.app.updatecomponent.updatePropertyValues(component,initialValues,newValues);
              
            //print an error message if there was an error
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

//=====================================
// Action
//=====================================


/** This method is used for updating property values from the property dialog. 
 * If there are additional property lines, in the generator, this method should
 * be extended to edit the values of those properties too. */
haxapp.app.updatecomponent.updatePropertyValues = function(component,oldValues,newValues) {

    var actionResponse = new hax.ActionResponse();

    var member = component.getObject();
    var workspace = component.getWorkspace();
    var actionList = [];
    var actionData;

    //check if a move action is needed
    if((oldValues.name !== newValues.name)||(oldValues.parentName !== newValues.parentName)) {
        actionData = {};
        actionData.action = "moveMember";
        actionData.member = member;
        actionData.name = newValues.name;
        actionData.folder = newValues.parent;
        actionList.push(actionData);
    }

    //check if additional properties are needed
    var memberGenerator = member.generator;
    if(memberGenerator.getPropertyUpdateAction) {
        actionData = memberGenerator.getPropertyUpdateAction(member,oldValues,newValues);
        if(actionData) {
           actionList.push(actionData); 
        }
    }

    if(actionList.length > 0) {
        actionData = {};
        actionData.action = "compoundAction";
        actionData.actions = actionList;

        actionResponse = hax.action.doAction(workspace,actionData,actionResponse);
    }
        
    return actionResponse;
}









