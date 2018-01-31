/** Editor that uses the Ace text editor.
 * 
 * @param {type} viewMode - the apogee view mode
 * @param {type} callbacks - the callbacks for the editor {getData,getEditOk,saveData}
 * @param {type} containerClass - the is the css class for the container element OPTIONAL
 */
apogeeapp.app.NonEditorDataDisplay = class {
    constructor(viewMode,containerClass = apogeeapp.app.NonEditorDataDisplay.NON_SCROLLING) {
        
        this.outsideDiv = apogeeapp.ui.createElementWithClass("div",containerClass);
	
        this.viewMode = viewMode;
    }

    //=============================
    // Implemement in extending class
    //=============================
    
    //this sets the data into the editor display. REQUIRED
    //showData() {}
    
    //this methodis called on loading the display. OPTIONAL
    //onLoad() {}
    
    //this methodis called on loading the display. OPTIONAL
    //onUnLoad() {}

    //this methodis called on loading the display. OPTIONAL
    //onResize() { }

    //this methodis called on loading the display. OPTIONAL
    //destroy() {}


    //=============================
    // protected, package and private Methods
    //=============================

    getElement() {
        return this.outsideDiv;
    }

}

apogeeapp.app.NonEditorDataDisplay.NON_SCROLLING = "apogee_datadisplay_container_fixed";
apogeeapp.app.NonEditorDataDisplay.SCROLLING = "apogee_datadisplay_container_scrolling";


