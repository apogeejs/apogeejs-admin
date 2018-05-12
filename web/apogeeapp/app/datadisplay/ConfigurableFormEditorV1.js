/** Editor that uses the Ace text editor.
 * 
 * @param {type} viewMode - the apogee view mode
 * @param {type} callbacks - {getData,getEditOk,setData}; format for data is text
 * @param {type} formLayout - the layout for the configurable panel
 */
apogeeapp.app.ConfigurableFormEditor = class extends apogeeapp.app.EditorDataDisplay {
    
    constructor(viewMode,callbacks,formLayout) {
        super(viewMode,callbacks,apogeeapp.app.EditorDataDisplay.SCROLLING);
        
        this.panel = new apogeeapp.ui.ConfigurablePanel();   
        this.panel.configureForm(formLayout);
        var mainDiv = document.getElementById("mainDiv");
        
        var onChange = (form,value) => {
            if(!this.inEditMode()) {
                this.onTriggerEditMode();
            }
        } 
        this.panel.addOnChange(onChange);
    }
    
    getPanel() {
        return this.panel;
    }
    
    /** This method will return undefined until showData is called. */
    getContent() {
        return this.panel.getElement();
    }
    
    getContentType() {
        return apogeeapp.ui.FIXED_SIZE;
    }
    
    getEditorData() {
        return this.panel.getValue();
    }
    
    setEditorData(data) {
        this.panel.setValue(data);
    }
    
//    endEditMode() {
//        this.editor.setReadOnly(true);
//        super.endEditMode();
//    }
//    
//    startEditMode() {
//        super.startEditMode();
//        this.editor.setReadOnly(false);
//    }
}
