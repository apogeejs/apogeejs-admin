visicomp.app.visiui.FolderUI = {};

visicomp.app.visiui.FolderUI.populateFolderWindow = function(childUI,folder) {
    
    var window = childUI.getWindow();
    
//    //resize the editor on window size change
//    var resizeCallback = function() {
//        editor.resize();
//    }
//    window.addListener("resize", resizeCallback);
    
//    //create the edit button
//    var editButton = visicomp.visiui.createElement("button",{"innerHTML":"Edit"});
//    editButton.onclick = function() {
//        visicomp.app.visiui.FolderUI.createEditDialog(folder);
//    }
//    window.addTitleBarElement(editButton);
	
//	//create the delete button
//    var deleteButton = visicomp.visiui.createElement("button",{"innerHTML":"Delete"});
//    deleteButton.onclick = function() {
//        //we should get confirmation
//
//		childUI.deleteFolder();
//    }
//    window.addTitleBarElement(deleteButton);

    //dummy size
window.setSize(500,500);

}





    //workspace menu
     //add folder listener
    var addFolderListener = function() {
        if(!instance.workspaceUI) {
            alert("There is no workspace open");
            return;
        }
        
        var onCreate = function(parent,folderName) {
            var returnValue = visicomp.core.createfolder.createFolder(parent,folderName);
            if(returnValue.success) {
                var folder = returnValue.folder;
                var folderUiInit = visicomp.app.visiui.FolderUI.populateFolderWindow;
                instance.workspaceUI.objectAdded(folder,folderUiInit);
            }
            else {
                //no action for now
            }
            return returnValue;
        }
        visicomp.app.visiui.dialog.showCreateChildDialog("Folder",instance.workspaceUI.objectUIMap,instance.activeFolderName,onCreate);
    }
    this.addListener("workspaceAddFolder",addFolderListener);
