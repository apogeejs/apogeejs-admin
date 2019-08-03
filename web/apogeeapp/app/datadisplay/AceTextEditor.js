import util from "/apogeeutil/util.js";

/** Editor that uses the Ace text editor.
 * 
 * @param {type} displayContainer - the display container
 * @param {type} callbacks - {getData,getEditOk,setData}; format for data is text
 * @param {type} aceMode - the display format, such as "ace/mode/json"
 */
apogeeapp.app.AceTextEditor = class extends apogeeapp.app.DataDisplay {
    
    constructor(displayContainer,callbacks,aceMode) {
        super(displayContainer,callbacks,apogeeapp.app.DataDisplay.NON_SCROLLING);

        //#################################################
        //use this for literate page - also add line options below
        this.editorDiv = apogeeapp.ui.createElement("div");
        //##################################################
        
//        //###################################################
//        //use this for canvas folder
//        this.editorDiv = apogeeapp.ui.createElement("div",null,{
//            "position":"absolute",
//            "top":"0px",
//            "left":"0px",
//            "bottom":"0px",
//            "right":"0px",
//            "overflow":"auto"
//        });
//        //#######################################################
        
        this.aceMode = aceMode;

        this.storedData = null;
    }
    
    createEditor() {
        var editor = ace.edit(this.editorDiv);
        //##########################################################
        //use this for literate page
        editor.setOptions({
            minLines: 2,
            maxLines: 20
        })
        //############################################################
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
        return apogeeapp.ui.RESIZABLE;
    }

    getData() {
        if(this.editor) {
            this.storedData = this.editor.getSession().getValue();
        }
        return this.storedData; 
    }
    
    setData(text) {
        //check data is valid
        if(util.getObjectType(text) != "String") {
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
                this.editorDiv.style.backgroundColor = apogeeapp.app.EditWindowComponentDisplay.NO_EDIT_BACKGROUND_COLOR;
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
        if(!this.displayContainer.isInEditMode()) {
            var activeData = this.editor.getSession().getValue();
            if(activeData != this.storedData) {
                this.onTriggerEditMode();
            }
        }
    }
}
