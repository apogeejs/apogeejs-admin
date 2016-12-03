

haxapp.app.updatecomponent = {};

//=====================================
// UI Entry Point
//=====================================

/** This method gets a callback to update the properties of a component. */
haxapp.app.updatecomponent.getUpdateComponentCallback = function(component,generator) {
    
    var createCallback = function() {
        
        var workspaceUI = component.getWorkspaceUI();       
        var initialValues = component.getPropertyValues();
        
        //create the dialog layout - do on the fly because folder list changes
        var dialogLayout = haxapp.app.propdialog.getDialogLayout(workspaceUI,generator,false,initialValues);
        
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
            
            //need to test if fields are valid!

            //update
            var actionResponse = haxapp.app.updatecomponent.updatePropertyValues(component,generator,initialValues,newValues);
              
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
haxapp.app.updatecomponent.updatePropertyValues = function(component,generator,oldValues,newValues) {
    var actionResponse = new hax.ActionResponse();
    
    try {
        var completedActions = hax.action.createCompletedActionsObject();
        var member = component.getObject();
        var workspaceUI = component.getWorkspaceUI();
        
        if((oldValues.name !== newValues.name)||(oldValues.parentKey !== newValues.parentKey)) {
            var parent = workspaceUI.getObjectByKey(newValues.parentKey);
            hax.movemember.moveMember(member,newValues.name,parent,completedActions);
        }

        if(generator.updatePropHandler) {
            generator.updatePropHandler(member,oldValues,newValues,completedActions);
        }
        
        var workspace = member.getWorkspace();
        hax.action.finalizeAction(workspace,completedActions,actionResponse);
    }
    catch(error) {
        //unknown application error
        var actionError = hax.ActionError.processException(error,"AppException",true);
        actionResponse.addError(actionError);
    }
    
    return actionResponse;
}









