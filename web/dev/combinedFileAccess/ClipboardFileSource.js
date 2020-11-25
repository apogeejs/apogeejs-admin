import ace from "/ext/ace/ace_1.4.3/ace.es.js";
import {uiutil}  from "/apogeeui/apogeeUiLib.js";

export class ClipboardFileSource {
    /** constructor */
    constructor(metadata,data,action,onActionComplete) {
        this.data = data;
        this.action = action;
        this.metadata = metadata;
        //this is a callback to signify the save/open is successful/failed/canceled
        this.onActionComplete = onActionComplete;
        //this is a callback to notify the dialog the action is complete
        this.onDialogComplete = null;
    }

    //============================
    // Public Methods
    //============================

    getName() {
        return ClipboardFileSource.NAME;
    }

    getDisplayName() {
        return ClipboardFileSource.DISPLAY_NAME;
    }

    //-----------------------------
    // File Actions
    //-----------------------------

    saveFile(fileMetadata,data) {
        if(this.action !== "save")  this.onComplete("Unknown Error in action",false,null);

        //automatic success
        if(this.onActionComplete) this.onActionComplete(null,true,fileMetadata); 
        //close dialog
        if(this.onDialogComplete) this.onDialogComplete(true);    
    }

    openFile(fileMetadata,data) {
        if(this.action !== "open")  this.onComplete("Unknown Error in action",false,null);

        //automatic success
        if(this.onActionComplete) this.onActionComplete(null,data,fileMetadata);
        //close dialog
        if(this.onDialogComplete) this.onDialogComplete(true);
    }

    cancelAction() {
        if(this.onActionComplete) this.onActionComplete(null,false,null);
        //close dialog
        if(this.onDialogComplete) this.onDialogComplete(true);
    }

    /** This method is called externally after the dialog box using the soruce closes. */
    close() {
        if(this.textEditor) { 
            this.textEditor.destroy();
            this.textEditor = null;
        }
        if(this.actionElement) {
            this.actionElement = null;
        }
    }

    //-----------------------------
    // UI Interface
    //-----------------------------

    makeActive() {

    }

    getIconUrl() {
        return null;
    }

    getConfigElement() {
        return null;
    }

    setOnDialogComplete(onDialogComplete) {
        this.onDialogComplete = onDialogComplete
    }

    getActionElement() {
        if(!this.actionElement) {
            this.actionElement = this._createActionElement();
        }
        return this.actionElement;
    }


    //===================================
    // Private Methods
    //===================================

    
    _createActionElement() {
        //action element
        let content = uiutil.createElement("div",null,
			{
				"display":"table",
				"overflow":"hidden"
            });
            
        let line;

        let instructions, initialText, submitLabel;
        let doSave, badAction;

        if(this.action == "open") {
            instructions = "Paste saved workspace data in the space below.";
            initialText = "";
            submitLabel = "Open";
            doSave = false;
            badAction = false;
        }
        else if(this.action == "save") {
            instructions = "Copy the data below and save it in a file to open later.";
            initialText = this.data;
            submitLabel = "Save";
            doSave = true;
            badAction = false;
        }
        else {
            //error!
            instructions = "Unknown error! Click button to close dialog box";
            initialText = "";
            badAction = true;
            
        }
    
        //instructions
        line = uiutil.createElement("div",{"className":"dialogLine"});
        line.appendChild(uiutil.createElement("div",/*{"className":"xxx"}*/));
        line.innerHTML = instructions;
        content.appendChild(line);

        //text area
        var textEditor
        if(!badAction) {
            line = uiutil.createElement("div",{"className":"dialogLine"});
            var editorDiv = uiutil.createElement("div",null,
                {
                    "position":"relative",
                    "width":"500px",
                    "height":"300px",
                    "border":"1px solid darkgray"
                });
            line.appendChild(editorDiv);
            content.appendChild(line);
            
            //add an ace text area (a normal text area is too slow)
            textEditor = ace.edit(editorDiv);
            textEditor.$blockScrolling = Infinity;
            textEditor.setTheme("ace/theme/eclipse");
            textEditor.getSession().setMode("ace/mode/text");
            textEditor.getSession().setValue(initialText);
            this.textEditor = textEditor;
            
            //save and cancel buttons
            //buttons and handler
            line = uiutil.createElement("div",{"className":"dialogLine"});
        }

        var onCancel = () => {
            this.cancelAction();
        }
        
        var onAction;
        if(!badAction) {
            if(doSave) {
                onAction = () => {
                    var outputText = textEditor.getSession().getValue();
                    this.saveFile(ClipboardFileSource.NEW_FILE_METADATA,outputText);
                }
            }
            else {
                onAction = () => {
                    var outputText = textEditor.getSession().getValue();
                    this.openFile(ClipboardFileSource.NEW_FILE_METADATA,outputText);
                }
            }

            line.appendChild(uiutil.createElement("button",{"className":"dialogButton","innerHTML":submitLabel,"onclick":onAction}));
        }
        
        line.appendChild(uiutil.createElement("button",{"className":"dialogButton","innerHTML":"Cancel","onclick":onCancel}));
        content.appendChild(line);

        return content;
    }



}

//this is the identifier name for the source
ClipboardFileSource.NAME = "clipboard";

//this is the identifier name for the source
ClipboardFileSource.DISPLAY_NAME = "Clipboard"

//this is metadata for a new file. Name is blank and there is not additional data besides source name.
ClipboardFileSource.NEW_FILE_METADATA = {
    source: ClipboardFileSource.NAME
}

ClipboardFileSource.directSaveOk = function(fileMetadata) {
    return false;
}