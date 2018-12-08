//
//
//apogeeapp.app.saveworkspace = {};
//
////=====================================
//// UI Entry Point
////=====================================
//
//apogeeapp.app.saveworkspace.getSaveCallback = function(app,doDirectSave) {
//    return function() {
//        
//        var activeWorkspaceUI = app.getWorkspaceUI();
//        var workspaceText;
//        var fileMetadata;
//        if(activeWorkspaceUI) {
//            var workspaceJson = activeWorkspaceUI.toJson();
//            workspaceText = JSON.stringify(workspaceJson);
//            fileMetadata = activeWorkspaceUI.getFileMetadata();
//        }
//        else {
//            alert("There is no workspace open.");
//            return;
//        }
//
//        //clear workspace dirty flag on completion of save
//        var onSaveSuccess = (updatedFileMetadata) => {
//            var workspaceUI = app.getWorkspaceUI();
//            workspaceUI.setFileMetadata(updatedFileMetadata);
//            app.clearWorkspaceIsDirty();
//        }
//        
//        if((!doDirectSave)||(!fileMetadata)||(!fileMetadata.directSaveOk)) {
//            apogeeapp.app.saveworkspace.showSaveDialog(fileMetadata,workspaceText,onSaveSuccess);
//        }
//        else {
//            apogeeapp.app.saveworkspace.saveFile(fileMetadata,workspaceText,onSaveSuccess);
//        }
//    }
//}
//  
////THIS METHOD MUST BE IMPLEMTED!  
////apogeeapp.app.saveworkspace.showSaveDialog = function(data);
//
////=====================================
//// Action
////=====================================
//
////THIS METHOD MUST BE IMPLEMTED!
////apogeeapp.app.saveworkspace.saveFile = function(filename,data);
