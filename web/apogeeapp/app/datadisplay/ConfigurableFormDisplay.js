/* This is a form display. It is meant for taking a submit action. If you want a form
 * tied to a data value, the ConfigurableFormEditor can be used.
 * 
 * @param {type} displayContainer - the display container
 * @param {type} getLayout - this callback retrieves the form layout
 */
apogeeapp.app.ConfigurableFormDisplay = class extends apogeeapp.app.DataDisplay {
    
    constructor(displayContainer,callbacks,getLayoutInfo) {
        super(displayContainer,callbacks,apogeeapp.app.DataDisplay.SCROLLING);  
        
        this.panel = this.panel = new apogeeapp.ui.ConfigurablePanel();
    }
    
    /** This method will return undefined until showData is called. */
    getContent() {
        return this.panel.getElement();
    }
    
    getContentType() {
        return apogeeapp.ui.FIXED_SIZE;
    }
    
    
    //this sets the data into the editor display. REQUIRED
    setData(layoutData) {
        this.panel.configureForm(layoutData);
    }
}
