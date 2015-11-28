visicomp.app.visiui.PackageUI = {};

visicomp.app.visiui.PackageUI.populatePackageWindow = function(childUI,package) {
    
    //subscribe to table update event
    var packageUpdatedCallback = function(packageObject) {
        if(packageObject === package) {
            visicomp.app.visiui.TableUI.tableUpdated(childUI,package);
        }
    }
    
    var workspace = package.getWorkspace();
    
    workspace.addListener(visicomp.core.updatemember.MEMEBER_UPDATED_EVENT, packageUpdatedCallback);
    
    var window = childUI.getWindow();
    
//    //resize the editor on window size change
//    var resizeCallback = function() {
//        editor.resize();
//    }
//    window.addListener("resize", resizeCallback);
    
//    //create the edit button
//    var editButton = visicomp.visiui.createElement("button",{"innerHTML":"Edit"});
//    editButton.onclick = function() {
//        visicomp.app.visiui.PackageUI.createEditDialog(package);
//    }
//    window.addTitleBarElement(editButton);
	
//	//create the delete button
//    var deleteButton = visicomp.visiui.createElement("button",{"innerHTML":"Delete"});
//    deleteButton.onclick = function() {
//        //we should get confirmation
//
//		childUI.deletePackage();
//    }
//    window.addTitleBarElement(deleteButton);

    //dummy size
window.setSize(500,500);

}
