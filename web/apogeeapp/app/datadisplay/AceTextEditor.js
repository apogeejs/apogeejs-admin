import apogeeutil from "/apogeeutil/apogeeUtilLib.js";

import DataDisplay from "/apogeeapp/app/datadisplay/DataDisplay.js";
import DATA_DISPLAY_CONSTANTS from "/apogeeapp/app/datadisplay/dataDisplayConstants.js";
import apogeeui from "/apogeeapp/ui/apogeeui.js";
import ace from "/ext/ace/ace_1.4.3/ace_to_es6.js";

/** Editor that uses the Ace text editor.
 * 
 * @param {type} displayContainer - the display container
 * @param {type} callbacks - {getData,getEditOk,setData}; format for data is text
 * @param {type} aceMode - the display format, such as "ace/mode/json"
 */
export default class AceTextEditor extends DataDisplay {
    
    constructor(displayContainer,callbacks,aceMode,options) {
        super(displayContainer,callbacks);

        this.editorDiv = apogeeui.createElement("div");

        this.aceMode = aceMode;

        this.storedData = null;

        //configure the options
        if(!options) options = {};

        this.editorOptions = {};
        this.showSomeMaxLines = DEFAULT_MAX_LINES;
        if(options.displayMax) {
            this.resizeMode = DataDisplay.RESIZE_MODE_MAX;
            this.editorOptions.maxLines = MAX_MAX_LINES;
        }
        else {
            this.resizeMode = DataDisplay.RESIZE_MODE_SOME;
            this.editorOptions.maxLines = this.showSomeMaxLines;
        }

        this.editorOptions.minLines = DEFAULT_MIN_LINES;

    }
    
    createEditor() {
        var editor = ace.edit(this.editorDiv);
        editor.setOptions(this.editorOptions);
        editor.renderer.setShowGutter(false);
        editor.setHighlightActiveLine(false);
        editor.setTheme("ace/theme/eclipse"); //good
        editor.getSession().setMode(this.aceMode); 
        
        editor.$blockScrolling = Infinity;
        editor.renderer.attachToShadowRoot();        
        
        this.editor = editor;
        
        if(this.storedData) {
            this.setData(this.storedData);
        }
        
        //enter edit mode on change to the data
        this.editor.addEventListener("input",() => this.checkStartEditMode());
    }
    
    getContent() {
        return this.editorDiv;
    }
    
    getContentType() {
        return apogeeui.RESIZABLE;
    }

    getData() {
        if(this.editor) {
            this.storedData = this.editor.getSession().getValue();
        }
        return this.storedData; 
    }
    
    setData(text) {
        //check data is valid
        if(apogeeutil.getObjectType(text) != "String") {
            var errorMsg = "ERROR: Data value is not text";
            //this.setError(errorMsg);
            text = errorMsg;
        }
            
        //store the data
        this.storedData = text;
        
        //place ineditor, if it is present
        if(this.editor) {
            this.editor.getSession().setValue(text);

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
        if(!this.editor) {
            this.createEditor();
        }
        this.editor.resize();
    }

    onResize() {
        if(this.editor) this.editor.resize();
    }

    destroy() {
        if(this.editor) {
            this.editor.destroy();
            this.editor = null;
        }
    }
    
    endEditMode() {
        super.endEditMode();
    }
    
    startEditMode() {
        super.startEditMode();
    }
    
    checkStartEditMode() {
        if((!this.displayContainer.isInEditMode())&&(this.editor)) {
            var activeData = this.editor.getSession().getValue();
            if(activeData != this.storedData) {
                this.onTriggerEditMode();
            }
        }
    }

    //----------------------------
    // This is the View resize API
    // The display has controls for the user to resize the display. These use the 
    // following API to interact with the display
    //----------------------------

    /** This method returns one of the following values to indicate support for resizing.
     * - DataDisplay.RESIZE_NO_SUPPORT - The UI should not resize the display
     * - DataDisplay.RESIZE_NO_INTERNAL_SUPPORT - The view shows a fixed size display. The UI is free to show a portion of it.
     * - DataDisplay.RESIZE_INTERNAL_SUPPORT - The view supports the API to resize itself internally.
     */
    getResizeSupport() {
        return DataDisplay.RESIZE_INTERNAL_SUPPORT;
    }

    /** This method gets the resize mode. Options:
     * - DataDisplay.RESIZE_MODE_SOME;
     * - DataDisplay.RESIZE_MODE_MAX;
     */
    getResizeMode() {
        return this.resizeMode;
    }

    /** This method sets the resize mode. Options:
     * - DataDisplay.RESIZE_MODE_SOME;
     * - DataDisplay.RESIZE_MODE_MAX;
     */
    setResizeMode(resizeMode) {
        if(resizeMode == DataDisplay.RESIZE_MODE_SOME) {
            this.resizeMode = DataDisplay.RESIZE_MODE_SOME;
            this.editorOptions.maxLines = this.showSomeMaxLines;
        }
        else if(resizeMode == DataDisplay.RESIZE_MODE_SOME) {
            this.resizeMode = DataDisplay.RESIZE_MODE_MAX;
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

    /** This method adjusts the size when the resize mode is DataDisplay.RESIZE_MODE_SOME. Options:
     * - DataDisplay.RESIZE_MORE;
     * - DataDisplay.RESIZE_LESS;
    */
    adjustSize(adjustment) {
        if(this.resizeMode == DataDisplay.RESIZE_MODE_SOME) {
            if(this.editor) {
                let newMaxLines;
                if(adjustment == DataDisplay.RESIZE_LESS) {
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
                else if(adjustment == DataDisplay.RESIZE_MORE) {
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

    /** This method returns the possible resize options, for use in the mode DataDisplay.RESIZE_MODE_SOME. Flags:
     * - DataDisplay.RESIZE_LESS = 1;
     * - DataDisplay.RESIZE_MORE = 2;
     * - DataDisplay.RESIZE_NONE = 0;
     * These flags should be or'ed togethder to give the allowed options.
    */
    getSizeAdjustFlags() {
        //We won't dynamically figufre out if we can add or remove lines based on current content. If
        //we add this we will have to track if it changes. 
        //So they user may push these buttons and nothing will happen.
        //We will set the flags based on our absolute limits.
        let flags = 0;
        if(this.showSomeMaxLines < MAX_MAX_LINES) {
            flags = flags | DataDisplay.RESIZE_MORE;
        }
        if(this.showSomeMaxLines > DEFAULT_MIN_LINES) {
            flags = flags | DataDisplay.RESIZE_LESS;
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
