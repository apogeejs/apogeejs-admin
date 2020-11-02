import apogeeutil from "/apogeeutil/apogeeUtilLib.js";
import DataDisplay from "/apogeeview/datadisplay/DataDisplay.js";
import DATA_DISPLAY_CONSTANTS from "/apogeeview/datadisplay/dataDisplayConstants.js";
import {uiutil} from "/apogeeui/apogeeUiLib.js";
import ace from "/ext/ace/ace_1.4.3/ace.es.js";

/** Editor that uses the Ace text editor.
 * 
 * @param {type} displayContainer - the display container
 * @param {type} dataSource - {updateComponent,getData,getEditOk,setData}; format for data is text
 * @param {type} aceMode - the display format, such as "ace/mode/json"
 */
export default class AceTextEditor extends DataDisplay {
    
    constructor(displayContainer,dataSource,aceMode,options) {
        super(displayContainer,dataSource);

        this.destroyed = false;

        this.editorDiv = uiutil.createElement("div");

        //========================
        //this is for consistency of lines to pixels
        this.editorDiv.style.fontSize = "12px";
        this.editorDiv.style.lineHeight = "1.2";
        this.pixelsPerLine = 14;
        //=========================

        this.aceMode = aceMode;

        this.inputData = null;
        this.cachedDisplayData = null;
        this.dataError = false;

        //configure the options
        if(!options) options = {};

        this.editorOptions = {};
        this.showSomeMaxLines = DEFAULT_MAX_LINES;
        if(options.displayMax) {
            this.resizeHeightMode = DATA_DISPLAY_CONSTANTS.RESIZE_HEIGHT_MODE_MAX;
            this.editorOptions.maxLines = MAX_MAX_LINES;
        }
        else {
            this.resizeHeightMode = DATA_DISPLAY_CONSTANTS.RESIZE_HEIGHT_MODE_SOME;
            this.editorOptions.maxLines = this.showSomeMaxLines;
        }

        this.editorOptions.minLines = DEFAULT_MIN_LINES;

        //set variables for internal display view sizing
        this.setUseContainerHeightUi(true)
    }
    
    createEditor() {
        if(this.destroyed) return;

        var editor = ace.edit(this.editorDiv);
        editor.setOptions(this.editorOptions);
        editor.setHighlightActiveLine(false);
        editor.setAutoScrollEditorIntoView(true);
        editor.setTheme("ace/theme/eclipse");
        editor.getSession().setMode(this.aceMode); 
        editor.$blockScrolling = Infinity;
        editor.renderer.attachToShadowRoot(); 
        
        editor.commands.addCommand({
            name: "Save",
            exec: () => this.save(),
            bindKey: {mac: "cmd-s", win: "ctrl-s"}
        })

        editor.commands.addCommand({
            name: "Revert",
            exec: () => this.cancel(),
            bindKey: {mac: "esc", win: "esc"}
        })
        
        this.editor = editor;
        
        if(this.cachedDisplayData) {
            this.setData(this.cachedDisplayData);
        }
        
        //enter edit mode on change to the data
        this.editor.addEventListener("input",() => this.checkStartEditMode());
    }
    
    getContent() {
        return this.editorDiv;
    }

    /** We override the save function to clear any error if there was one and the
     * user saves - meaning we want to keep the editor data. */
    save() {
        if(this.destroyed) return;

        //clear error flag since the user wants to save what is displayed
        if(this.dataError) this.dataError = false;

        super.save();
    }

    getData() {
        if(this.destroyed) return null;

        if((this.editor)&&(!this.dataError)) {
            this.cachedDisplayData = this.editor.getSession().getValue();
            this.inputData = this.cachedDisplayData;
        }
        return this.inputData; 
    }
    
    setData(text) {
        if(this.destroyed) return;

        this.inputData = text;
        this.cachedDisplayData = text;
        this.dataError = false;

        //The data source should give a text value "" if the data in invalid rather than sending
        //in a json, but we will do this check anyway.
        if(text == apogeeutil.INVALID_VALUE) {
            var errorMsg = "ERROR: Data value is not valid"
            this.cachedDisplayData = "";
            this.dataError = true;
        }

        //check data is valid
        if(!apogeeutil.isString(text)) {
            var errorMsg = "ERROR: Data value is not text";
            this.cachedDisplayData = errorMsg;
            this.dataError = true;
        }
        
        //place ineditor, if it is present
        if(this.editor) {
            this.editor.getSession().setValue(this.cachedDisplayData);

            //set the edit mode and background color
            if(this.editOk) {
                this.editorDiv.style.backgroundColor = "";
                this.editor.setReadOnly(false);
            }
            else {
                this.editorDiv.style.backgroundColor = DATA_DISPLAY_CONSTANTS.NO_EDIT_BACKGROUND_COLOR;
                this.editor.setReadOnly(true);
            }
        }
    }
    
    onLoad() {
        if(this.destroyed) return;

        if(!this.editor) {
            this.createEditor();
        }
        this.editor.resize();
    }

    destroy() {
        this.destroyed = true;

        if(this.editor) {
            this.editor.destroy();
            this.editor = null;
        }
        this.editorDiv = null;
        this.inputData = null;
        this.cachedDisplayData = null;
        this.editorOptions = null;
    }
    
    checkStartEditMode() {
        if(this.destroyed) return;

        if((!this.displayContainer.isInEditMode())&&(this.editor)) {
            var activeData = this.editor.getSession().getValue();
            if(activeData != this.cachedDisplayData) {
                this.onTriggerEditMode();
            }
        }
    }

    //---------------------------
    // UI State Management
    //---------------------------
    
    /** This method adds any data display state info to the view state json. 
     * By default there is none. Note that this modifies the json state of the view,
     * rather than providing a data object that will by added to it.. */
    addUiStateData(json) {
        if(this.destroyed) return;

        if(this.editorOptions.maxLines) {
            json.height = this.editorOptions.maxLines * this.pixelsPerLine;
        }
    }

    /** This method reads an data display state info from the view state json. */
    readUiStateData(json) {
        if(this.destroyed) return;

        if(json.height) {
            let maxLines = Math.round(json.height / this.pixelsPerLine);
            if(maxLines >= MAX_MAX_LINES) {
                this.resizeHeightMode = DATA_DISPLAY_CONSTANTS.RESIZE_HEIGHT_MODE_MAX;
                maxLines = MAX_MAX_LINES;
            }
            else {
                this.resizeHeightMode = DATA_DISPLAY_CONSTANTS.RESIZE_HEIGHT_MODE_SOME;
                if(maxLines < DEFAULT_MIN_LINES) {
                    maxLines = DEFAULT_MIN_LINES;
                }
                this.showSomeMaxLines = maxLines;
            }

            this.editorOptions.maxLines = maxLines;

            if(this.editor) {
                this.editor.setOptions(this.editorOptions);
            }
        }
    }

    //----------------------------
    // This is the View resize API
    // The display has controls for the user to resize the display. These use the 
    // following API to interact with the display
    //----------------------------

    /** This method gets the resize mode. Options:
     * - DATA_DISPLAY_CONSTANTS.RESIZE_HEIGHT_MODE_SOME;
     * - DATA_DISPLAY_CONSTANTS.RESIZE_HEIGHT_MODE_MAX;
     */
    getResizeHeightMode() {
        return this.resizeHeightMode;
    }

    /** This method sets the resize mode. Options:
     * - DATA_DISPLAY_CONSTANTS.RESIZE_HEIGHT_MODE_SOME;
     * - DATA_DISPLAY_CONSTANTS.RESIZE_HEIGHT_MODE_MAX;
     */
    setResizeHeightMode(resizeHeightMode) {
        if(this.destroyed) return;

        if(resizeHeightMode == DATA_DISPLAY_CONSTANTS.RESIZE_HEIGHT_MODE_SOME) {
            this.resizeHeightMode = DATA_DISPLAY_CONSTANTS.RESIZE_HEIGHT_MODE_SOME;
            this.editorOptions.maxLines = this.showSomeMaxLines;
        }
        else if(resizeHeightMode == DATA_DISPLAY_CONSTANTS.RESIZE_HEIGHT_MODE_MAX) {
            this.resizeHeightMode = DATA_DISPLAY_CONSTANTS.RESIZE_HEIGHT_MODE_MAX;
            this.editorOptions.maxLines = MAX_MAX_LINES;
        }
        else {
            //ignore unknown value
            return;
        }

        if(this.editor) {
            this.editor.setOptions(this.editorOptions);
        }
    }

    /** This method adjusts the size when the resize mode is DATA_DISPLAY_CONSTANTS.RESIZE_HEIGHT_MODE_SOME. Options:
     * - DATA_DISPLAY_CONSTANTS.RESIZE_HEIGHT_MORE;
     * - DATA_DISPLAY_CONSTANTS.RESIZE_HEIGHT_LESS;
    */
    adjustHeight(adjustment) {
        if(this.destroyed) return;

        if(this.resizeHeightMode == DATA_DISPLAY_CONSTANTS.RESIZE_HEIGHT_MODE_SOME) {
            if(this.editor) {
                let newMaxLines;
                if(adjustment == DATA_DISPLAY_CONSTANTS.RESIZE_HEIGHT_LESS) {
                    //decrease size by 1 line - except if our size is 
                    //larger than the current doc, then shrink it to 
                    //one line smaller than current doc.
                    let docLines = this.editor.getSession().getLength();
                    if(docLines < this.showSomeMaxLines) {
                        this.showSomeMaxLines = docLines;
                    }
                    newMaxLines = this.showSomeMaxLines - 1;
                    if(newMaxLines <  DEFAULT_MIN_LINES) {
                        newMaxLines = DEFAULT_MIN_LINES;
                    }
                }
                else if(adjustment == DATA_DISPLAY_CONSTANTS.RESIZE_HEIGHT_MORE) {
                    //just grow size by 1 line
                    newMaxLines = this.showSomeMaxLines + 1;
                    if(newMaxLines >  MAX_MAX_LINES) {
                        newMaxLines = MAX_MAX_LINES;
                    }
                }
                else {
                    //ignore an unknown command
                    return;
                }

                //update the lines options
                this.showSomeMaxLines = newMaxLines;
                this.editorOptions.maxLines = this.showSomeMaxLines;
                this.editor.setOptions(this.editorOptions);
            }
        }
    }

    /** This method returns the possible resize options, for use in the mode DATA_DISPLAY_CONSTANTS.RESIZE_HEIGHT_MODE_SOME. Flags:
     * - DATA_DISPLAY_CONSTANTS.RESIZE_HEIGHT_LESS = 1;
     * - DATA_DISPLAY_CONSTANTS.RESIZE_HEIGHT_MORE = 2;
     * - DATA_DISPLAY_CONSTANTS.RESIZE_HEIGHT_NONE = 0;
     * These flags should be or'ed togethder to give the allowed options.
    */
    getHeightAdjustFlags() {
        //We won't dynamically figufre out if we can add or remove lines based on current content. If
        //we add this we will have to track if it changes. 
        //So they user may push these buttons and nothing will happen.
        //We will set the flags based on our absolute limits.
        let flags = 0;
        if(this.showSomeMaxLines < MAX_MAX_LINES) {
            flags = flags | DATA_DISPLAY_CONSTANTS.RESIZE_HEIGHT_MORE;
        }
        if(this.showSomeMaxLines > DEFAULT_MIN_LINES) {
            flags = flags | DATA_DISPLAY_CONSTANTS.RESIZE_HEIGHT_LESS;
        }
        return flags;
    }
}

//options for displaying all or some lines
AceTextEditor.OPTION_SET_DISPLAY_MAX = { "displayMax":true};
AceTextEditor.OPTION_SET_DISPLAY_SOME = { "displayMax":false};

//configuration constants
let MAX_MAX_LINES = 500;
let DEFAULT_MAX_LINES = 20;
let DEFAULT_MIN_LINES = 2;
