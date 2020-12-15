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

        this.editor = ace.edit(this.editorDiv);
        this.editor.setOptions(this.editorOptions);
        this.editor.setHighlightActiveLine(false);
        this.editor.setAutoScrollEditorIntoView(true);
        this.editor.setTheme("ace/theme/eclipse");
        this.editor.getSession().setMode(this.aceMode); 
        this.editor.$blockScrolling = Infinity;
        this.editor.renderer.attachToShadowRoot(); 
        
        this.editor.commands.addCommand({
            name: "Save",
            exec: () => this.save(),
            bindKey: {mac: "cmd-s", win: "ctrl-s"}
        })

        this.editor.commands.addCommand({
            name: "Revert",
            exec: () => this.cancel(),
            bindKey: {mac: "esc", win: "esc"}
        })
        

        //handle focus change
        this.editor.on("blur",() => this.onEditorBlur());
        this.editor.on("focus",() => this.onEditorFocus());
        if(this.editor.isFocused()) {
            this.onEditorFocus();
        }
        else {
            this.onEditorBlur();
        }
        
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

    onEditorBlur() {
        if(this.editor) {
            this.editor.renderer.$cursorLayer.element.style.display = "none";
            this.editor.renderer.$markerBack.element.style.display = "none";
        }
    }

    onEditorFocus() {
        if(this.editor) {
            this.editor.renderer.$cursorLayer.element.style.display = "";
            this.editor.renderer.$markerBack.element.style.display = "";
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

    /** This is called if the show less button is pressed */
    showLess() {
        if((this.destroyed)||(!this.editor)) return;

        let newMaxLines;
        if(this.resizeHeightMode == DATA_DISPLAY_CONSTANTS.RESIZE_HEIGHT_MODE_SOME) {
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
        else {
            //set lines to the most recent "some" mode size
            this.resizeHeightMode = DATA_DISPLAY_CONSTANTS.RESIZE_HEIGHT_MODE_SOME;
            newMaxLines = this.showSomeMaxLines;
        }

        this._setSomeMaxLines(newMaxLines);

    }

    /** This is called if the show more button is pressed */
    showMore() {
        if((this.destroyed)||(!this.editor)) return;

        let newMaxLines;
        if(this.resizeHeightMode == DATA_DISPLAY_CONSTANTS.RESIZE_HEIGHT_MODE_SOME) {
            //just grow size by 1 line
            newMaxLines = this.showSomeMaxLines + 1;
            if(newMaxLines >  MAX_MAX_LINES) {
                newMaxLines = MAX_MAX_LINES;
            }
        }
        else {
            //put in some mode and keep max lines the same (the UI probably won't allow this command though)
            this.resizeHeightMode = DATA_DISPLAY_CONSTANTS.RESIZE_HEIGHT_MODE_SOME;
            newMaxLines = MAX_MAX_LINES;
        }

        this._setSomeMaxLines(newMaxLines);
    }

    /** This is called if the show max button is pressed */
    showMax() {
        if((this.destroyed)||(!this.editor)) return;

        if(this.resizeHeightMode == DATA_DISPLAY_CONSTANTS.RESIZE_HEIGHT_MODE_SOME) {
            //set the max number of lines
            this.resizeHeightMode = DATA_DISPLAY_CONSTANTS.RESIZE_HEIGHT_MODE_MAX;
            this.editorOptions.maxLines = MAX_MAX_LINES;
            this.editor.setOptions(this.editorOptions);
        }

    }

    /** This sets the number of lines to display (if the display is this big) */
    _setSomeMaxLines(maxLines) {
        //update the lines options
        this.showSomeMaxLines = maxLines;
        this.editorOptions.maxLines = this.showSomeMaxLines;
        this.editor.setOptions(this.editorOptions);
    }

    /** This method controlsthe visibility options for the resize buttons. These will only work if 
     * resize is enabled for this data display. */
    getHeightAdjustFlags() {
        let flags = 0;
        flags |= DATA_DISPLAY_CONSTANTS.RESIZE_SHOW_FLAG;
        if(this.resizeHeightMode == DATA_DISPLAY_CONSTANTS.RESIZE_HEIGHT_MODE_MAX) {
            flags |= DATA_DISPLAY_CONSTANTS.RESIZE_MODE_MAX_FLAG;
        }

        //for now we won't disable any buttons - pressing them will just do nothing
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
