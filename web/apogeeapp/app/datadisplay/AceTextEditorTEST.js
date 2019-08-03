import util from "/apogeeutil/util.js";

/** Editor that uses the Ace text editor.
 * 
 * @param {type} displayContainer - the display container
 * @param {type} callbacks - {getData,getEditOk,setData}; format for data is text
 * @param {type} aceMode - the display format, such as "ace/mode/json"
 */

/** This is a test version os AceEditor that destroys the editor when the form is unloaded.
 * I did this just to figure out why it wan't initializing properly. It might come in handy.
 */

apogeeapp.app.AceTextEditor = class extends apogeeapp.app.DataDisplay {
    
    constructor(displayContainer,callbacks,aceMode) {
        super(displayContainer,callbacks,apogeeapp.app.DataDisplay.NON_SCROLLING);
        
        this.aceMode = aceMode;

        this.editorDiv = apogeeapp.ui.createElement("div",null,{
            "position":"absolute",
            "top":"0px",
            "left":"0px",
            "bottom":"0px",
            "right":"0px",
            /*"overflow":"auto"*/
        });
        
        this.uneditedData = null;
        this.cachedData = null;
    }
    
//TEMP CODE====================================================================
    
    createEditor() {
         var editor = ace.edit(this.editorDiv);
//max lines will make editor fit content, min lines also settable        
//        var editor = ace.edit(this.editorDiv,{
//            minLines: 2,
//            maxLines: 100
//        });
        editor.renderer.setShowGutter(true);
        //editor.setReadOnly(true);
        editor.setTheme("ace/theme/eclipse"); //good
        editor.getSession().setMode(this.aceMode); 
        editor.$blockScrolling = Infinity;
        this.editor = editor;
        
        //enter edit mode on change to the data
        this.editor.addEventListener("input",() => this.checkStartEditMode());
        
        if(this.cachedData) {
            this.setData(this.cachedData);
            this.cachedData = null;
        }

        //old
        //add click handle to enter edit mode
        //this.editorDiv.addEventListener("click",() => this.onTriggerEditMode());
    }
//=============================================================================
    
    getContent() {
        return this.editorDiv;
    }
    
    getContentType() {
        return apogeeapp.ui.RESIZABLE;
    }

    getData() {
        if(this.editor) {
            return this.editor.getSession().getValue();
        }
        else {
            return cachedData;
        }
    }
    
    setData(text) {
        if(!this.editor) {
            this.cachedData = text;
            return;
        }
        
        if(util.getObjectType(text) != "String") {
            var errorMsg = "ERROR: Data value is not text";
            //this.setError(errorMsg);
            text = errorMsg;
        }
        
        //record the set value so we know if we need to NOT do edit mode
        this.uneditedValue = text;
        this.editor.getSession().setValue(text);

        //set the edit mode and background color
        if(this.editOk) {
            this.editorDiv.style.backgroundColor = "";
            this.editor.setReadOnly(false);
        }
        else {
            this.editorDiv.style.backgroundColor = apogeeapp.app.EditWindowComponentDisplay.NO_EDIT_BACKGROUND_COLOR;
            this.editor.setReadOnly(true);
        }
    }
    
    onLoad() {
        if(this.editor) {
            this.editor.resize();
        }
        else {
            this.createEditor();
        }
    }
    
    onUnload() {
        this.destroy();
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
        //this.editor.setReadOnly(true);
        super.endEditMode();
    }
    
    startEditMode() {
        super.startEditMode();
        //this.editor.setReadOnly(false);
    }
    
    checkStartEditMode() {
        if(!this.displayContainer.isInEditMode()) {
            if(this.getData() != this.uneditedValue) {
                this.onTriggerEditMode();
            }
        }
    }
}
