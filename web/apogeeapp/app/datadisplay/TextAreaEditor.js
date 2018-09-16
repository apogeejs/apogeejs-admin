/** Editor that uses the basic text editor */
apogeeapp.app.TextAreaEditor = class extends  apogeeapp.app.DataDisplay {
    
    constructor(viewMode,callbacks) {
        super(viewMode,callbacks,apogeeapp.app.DataDisplay.SCROLLING);

        var textArea = apogeeapp.ui.createElement("TEXTAREA",null,{
            "position":"absolute",
            "top":"0px",
            "left":"0px",
            "width":"100%",
            "height":"100%",
            "overflow":"auto"
        });
        this.textArea = textArea;
        this.textArea.readOnly = true;

        this.workingData = null;

        //add click handle to enter edit mode
        this.textArea.addEventListener("click",() => this.onTriggerEditMode());
    }
    
    getContent() {
        return this.textArea;
    }
    
    getContentType() {
        return apogeeapp.ui.RESIZABLE;
    }

    getData() {
        return this.textArea.value;
    }
    
    setData(text) {
        this.textArea.value = text;

        //set the background color
        if(this.editOk) {
            this.textArea.style.backgroundColor = "";
        }
        else {
            this.textArea.style.backgroundColor = apogeeapp.app.EditWindowComponentDisplay.NO_EDIT_BACKGROUND_COLOR;
        }
    }
 
    endEditMode() {
        this.textArea.readOnly = true;
        super.endEditMode();
    }
    
    startEditMode() {
        super.startEditMode();
        this.textArea.readOnly = false;
    }
}


