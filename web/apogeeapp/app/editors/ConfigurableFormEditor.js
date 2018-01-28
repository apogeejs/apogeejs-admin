/** Editor that uses the Ace text editor.
 * 
 * @param {type} viewMode - the apogee view mode
 * @param {type} callbacks - {getData,getEditOk,setData}; format for data is text
 * @param {type} formLayout - the layout for the configurable panel
 */
apogeeapp.app.ConfigurableFormEditor = class extends apogeeapp.app.NonEditorDataDisplay {
    
    constructor(viewMode,getFormData,formLayout) {
        super(viewMode,apogeeapp.app.EditorDataDisplay.SCROLLING);
        
        this.getFormData = getFormData;
        
        var containerDiv = this.getElement();
        
        this.panel = new apogeeapp.ui.ConfigurablePanel(formLayout);    
        var mainDiv = document.getElementById("mainDiv");
        containerDiv.appendChild(this.panel.getElement());
    }
    
    getPanel() {
        return this.panel;
    }

    getEditorData() {
        return this.panel.getValue();
    }
    
    showData() {
        this.panel.setValue(this.getFormData());
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
