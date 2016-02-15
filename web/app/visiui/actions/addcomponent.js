

visicomp.app.visiui.addcomponent = {};

//=====================================
// UI Entry Point
//=====================================

visicomp.app.visiui.addcomponent.getAddComponentCallback = function(app,generator) {
    
    var createCallback = function(workspaceUI,parent,name) {
        var actionResponse =  generator.createComponent(workspaceUI,parent,name);   
        if(!actionResponse.getSuccess()) {
            alert(actionResponse.getErrorMsg())
        }
        //return true to close the dialog
        return true;
    }

    return function() {
        visicomp.app.visiui.dialog.showCreateChildDialog(generator.displayName,
            app,
            createCallback
        );
    }
}

//=====================================
// Action
//=====================================

//action is in the component generator






