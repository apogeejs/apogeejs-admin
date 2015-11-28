visicomp.app.visiui.FolderUI = {};

visicomp.app.visiui.FolderUI.populateFolderWindow = function(childUI,folder) {
    
    //subscribe to table update event
    var folderUpdatedCallback = function(folderObject) {
        if(folderObject === folder) {
            visicomp.app.visiui.TableUI.tableUpdated(childUI,folder);
        }
    }
    
    var workspace = folder.getWorkspace();
    
    workspace.addListener(visicomp.core.updatemember.MEMEBER_UPDATED_EVENT, folderUpdatedCallback);
    
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
