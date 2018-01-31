/** Editor that uses the Ace text editor.
 * 
 * @param {type} viewMode - the apogee view mode
 * @param {type} callbacks - {getData,getEditOk,setData}; format for data is text
 * @param {type} formLayout - the layout for the configurable panel
 */
apogeeapp.app.ConfigurableFormEditor = class extends apogeeapp.app.EditorDataDisplay {
    
    constructor(viewMode,callbacks,formLayout) {
        super(viewMode,callbacks,apogeeapp.app.EditorDataDisplay.SCROLLING);
        
        var containerDiv = this.getElement();
        
        this.panel = new apogeeapp.ui.ConfigurablePanel(formLayout);    
        var mainDiv = document.getElementById("mainDiv");
        containerDiv.appendChild(this.panel.getElement());
        
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
