import OneDriveFileSystem from "./OneDriveFileSystem.js";
import RemoteFileSource from "/apogeeview/fileaccess/RemoteFileSource.js";

/** This source generator creates a One Drive file source to be used with CombinedFileAccess */
let OneDriveFileSourceGenerator = {
    getSourceId: function() {
        return OneDriveFileSystem.SOURCE_ID;
    },

    getDisplayName: function() {
        return OneDriveFileSystem.DISPLAY_NAME;
    },

    directSaveOk: function(fileMetadata) {
        return OneDriveFileSystem.directSaveOk(fileMetadata);
    },

    getInstance(action,fileMetadata,fileData,onComplete) {
        let fileSystemInstance = new OneDriveFileSystem()
        return new RemoteFileSource(OneDriveFileSourceGenerator,fileSystemInstance,action,fileMetadata,fileData,onComplete)
    }
}

export {OneDriveFileSourceGenerator as default};

