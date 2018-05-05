/** Editor that uses the Ace text editor.
 * 
 * @param {type} viewMode - the apogee view mode
 * @param {type} callbacks - {getData,getEditOk,setData}; format for data is text
 * @param {type} aceMode - the display format, such as "ace/mode/json"
 */
apogeeapp.app.AceTextEditor = class extends apogeeapp.app.EditorDataDisplay {
    
    constructor(viewMode,callbacks,aceMode) {
        super(viewMode,callbacks,apogeeapp.app.EditorDataDisplay.NON_SCROLLING);

        this.editorDiv = apogeeapp.ui.createElement("div",null,{
            "position":"absolute",
            "top":"0px",
            "left":"0px",
            "bottom":"0px",
            "right":"0px",
            "overflow":"auto"
        });

        this.workingData = null;

        var editor = ace.edit(this.editorDiv);
        editor.renderer.setShowGutter(true);
        editor.setReadOnly(true);
        editor.setTheme("ace/theme/eclipse"); //good
        editor.getSession().setMode(aceMode); 
        editor.$blockScrolling = Infinity;
        this.editor = editor;

        //add click handle to enter edit mode
        this.editorDiv.addEventListener("click",() => this.onTriggerEditMode());
    }
    
    getContent() {
        return this.editorDiv;
    }
    
    getContentType() {
        return apogeeapp.ui.RESIZABLE;
    }

    getEditorData() {
        return this.editor.getSession().getValue();
    }
    
    setEditorData(text) {
        if(apogee.util.getObjectType(text) != "String") {
            var errorMsg = "ERROR: Data value is not text";
            //this.setError(errorMsg);
            text = errorMsg;
        }
        this.editor.getSession().setValue(text);
//figure out how to handle this error

        //set the background color
        if(this.editOk) {
            this.editorDiv.style.backgroundColor = "";
        }
        else {
            this.editorDiv.style.backgroundColor = apogeeapp.app.EditWindowComponentDisplay.NO_EDIT_BACKGROUND_COLOR;
        }
    }
    
    onLoad() {
        if(this.editor) this.editor.resize();
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
        this.editor.setReadOnly(true);
        super.endEditMode();
    }
    
    startEditMode() {
        super.startEditMode();
        this.editor.setReadOnly(false);
    }
}
