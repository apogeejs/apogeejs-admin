/** This component represents a table object. */
apogeeapp.app.FolderComponent = function(workspaceUI,folder) {
    //extend parent component
    apogeeapp.app.ParentComponent.call(this,workspaceUI,folder,apogeeapp.app.FolderComponent);
    
    //create an empty edit state to start
    this.editorData = proseMirror.createEditorState();
};

apogeeapp.app.FolderComponent.prototype = Object.create(apogeeapp.app.ParentComponent.prototype);
apogeeapp.app.FolderComponent.prototype.constructor = apogeeapp.app.FolderComponent;

apogeeapp.app.FolderComponent.prototype.getEditorData = function() {
    return this.editorData;
}

apogeeapp.app.FolderComponent.prototype.applyTransaction = function(transaction) {
    
    //================================
    //start test code
    

    
    console.log("New Transaction:");
    console.log("Doc changed: " + transaction.docChanged);

    if(transaction.docChanged) {
        var stepsJson = [];
        var inverseStepsJson = [];

        for(var i = 0; i < transaction.steps.length; i++) {
            var step = transaction.steps[i];
            stepsJson.push(step.toJSON());
            var stepDoc = transaction.docs[i];
            var inverseStep = step.invert(stepDoc);
            inverseStepsJson.push(inverseStep.toJSON()); 
        }
        
        var doChange = stepsJson => {
            var newEditorData = proseMirror.getNewEditorData(this.editorData, stepsJson);

            if(newEditorData) {
                this.editorData = newEditorData;
                //this should be in an event for the change
                var tabDisplay = this.getTabDisplay();
                if(tabDisplay) {
                    tabDisplay.updateDocumentData(this.editorData);
                }
                return true;
            }
            else {
                return false;
            }
        }
        
        var command = {};
        command.cmd = () => doChange(stepsJson);
        command.undoCmd = () => doChange(inverseStepsJson);
        command.desc = "Document update: " + this.getMember().getFullName();
        
        this.getWorkspaceUI().getApp().executeCommand(command);
    }
    else {
        //this is a editor state change that doesn't change the data
        this.editorData = this.editorData.apply(transaction);
        this.fieldUpdated("document");
        
        if(this.tabDisplay) {
            this.tabDisplay.updateDocumentData(this.editorData);
        }
    }
        
        
    
    //end test code
    //================================

    
    
}

apogeeapp.app.FolderComponent.prototype.instantiateTabDisplay = function() {
    var folder = this.getMember();
    return new apogeeapp.app.LiteratePageComponentDisplay(this,folder,folder); 
}

//==============================
// serialization
//==============================

/** This serializes the table component. */
apogeeapp.app.FolderComponent.prototype.writeToJson = function(json) {
    //save the editor state
    if(this.editorData) {
        json.data = this.editorData.toJSON();
    }
    
    //save the children
    var folder = this.getMember();
    var workspaceUI = this.getWorkspaceUI();
    json.children = workspaceUI.getFolderComponentContentJson(folder);

    return json;
}

apogeeapp.app.FolderComponent.prototype.readFromJson = function(json) {
    //read the editor state
    if((json.data)&&(json.data.doc)) {
        this.editorData = proseMirror.createEditorState(json.data.doc);
        this.fieldUpdated("document");
    }
}

/** This method is used to load the child components from a json */
apogeeapp.app.FolderComponent.prototype.readChildrenFromJson = function(workspaceUI,childActionResults,json) {
    if(json.children) {
        workspaceUI.loadFolderComponentContentFromJson(childActionResults,json.children);
    }
    return true;  
}

//======================================
// Static methods
//======================================

//this is a method to help construct an emtpy folder component
apogeeapp.app.FolderComponent.EMPTY_FOLDER_COMPONENT_JSON  = {
    "type":"apogeeapp.app.FolderComponent"
};

apogeeapp.app.FolderComponent.createMemberJson = function(userInputValues,optionalBaseJson) {
    var json = apogeeapp.app.Component.createMemberJson(apogeeapp.app.FolderComponent,userInputValues,optionalBaseJson);
    return json;
}

//======================================
// This is the component generator, to register the component
//======================================

apogeeapp.app.FolderComponent.displayName = "Folder";
apogeeapp.app.FolderComponent.uniqueName = "apogeeapp.app.FolderComponent";
apogeeapp.app.FolderComponent.DEFAULT_WIDTH = 500;
apogeeapp.app.FolderComponent.DEFAULT_HEIGHT = 500;
apogeeapp.app.FolderComponent.ICON_RES_PATH = "/componentIcons/folder.png";
apogeeapp.app.FolderComponent.TREE_ENTRY_SORT_ORDER = apogeeapp.app.Component.FOLDER_COMPONENT_TYPE_SORT_ORDER;
apogeeapp.app.FolderComponent.DEFAULT_MEMBER_JSON = {
    "type": apogee.Folder.generator.type
};

//if we want to allow importing a workspace as this object, we must add this method to the generator
apogeeapp.app.FolderComponent.appendWorkspaceChildren = function(optionsJson,childrenJson) {
    optionsJson.children = childrenJson;
}
