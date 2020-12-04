import ace from "/ext/ace/ace_1.4.3/ace.es.js";
import {uiutil}  from "/apogeeui/apogeeUiLib.js";
import * as fileAccessConstants from "/apogeeview/fileAccess/fileAccessConstants.js";

let ClipboardFileSourceGenerator = {
    getSourceId: function() {
        return CLIPBOARD_SOURCE_ID;
    },

    getDisplayName: function() {
        return CLIPBOARD_DISPLAY_NAME;
    },

    directSaveOk: function(fileMetadata) {
        return false;
    },

    getInstance(action,initialFileMetadata,fileData,onComplete) {
        return new ClipboardFileSource(action,initialFileMetadata,fileData,onComplete)
    }

}

export {ClipboardFileSourceGenerator as default};

class ClipboardFileSource {
    /** constructor */
    constructor(action,initialFileMetadata,fileData,onComplete) {
        this.action = action;
        this.initialFileMetadata = initialFileMetadata;
        this.fileData = fileData;
        this.onComplete = onComplete;
    }

    //============================
    // Public Methods
    //============================

    getGenerator() {
        return ClipboardFileSourceGenerator;
    }

    //-----------------------------
    // File Actions
    //-----------------------------

    /** This should not be called */
    updateFile() {
        if(this.onComplete) this.onComplete("Illegal save call",false,null);    
    }

    saveFile(fileMetadata,data) {
        if(this.onComplete) this.onComplete(null,true,fileMetadata);    
    }

    openFile(fileMetadata,data) {
        if(this.onComplete) this.onComplete(null,data,fileMetadata);
    }

    cancelAction() {
        if(this.onComplete) this.onComplete(null,false,null);
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

        if(this.action == fileAccessConstants.OPEN_ACTION) {
            instructions = "Paste saved workspace data in the space below.";
            initialText = "";
            submitLabel = "Open";
            doSave = false;
            badAction = false;
        }
        else if(this.action == fileAccessConstants.SAVE_ACTION) {
            instructions = "Copy the data below and save it in a file to open later.";
            initialText = ((this.fileData !== undefined)&&(this.fileData !== null)) ? this.fileData : "";
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
const CLIPBOARD_SOURCE_ID = "clipboard";

//this is the identifier name for the source
const CLIPBOARD_DISPLAY_NAME = "Clipboard"

const CLIPBOARD_NEW_FILE_METADATA = {
    sourceId: CLIPBOARD_SOURCE_ID
}
