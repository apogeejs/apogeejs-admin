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
    
    //This method returns the content type for the content. The choices of values are REQUIRED
    //apogeeapp.ui.RESIZABLE - content can be resized to fit window - scrolling, if necessary is managed within the content element.
    //apogeeapp.ui.FIXED_SIZE - the content is fixed size. The window will decide how to display the complete object.*/
    //getContentType() {}


    //=============================
    // protected, package and private Methods
    //=============================

}

apogeeapp.app.NonEditorDataDisplay.NON_SCROLLING = "apogee_datadisplay_container_fixed";
apogeeapp.app.NonEditorDataDisplay.SCROLLING = "apogee_datadisplay_container_scrolling";

apogeeapp.app.NonEditorDataDisplay.FIT_CONTENT = "apogee_datadisplay_container_fit_content";
