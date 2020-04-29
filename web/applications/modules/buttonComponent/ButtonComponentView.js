import BasicComponentView from "/apogeeview/componentviews/BasicComponentView.js";
import DataDisplay from "/apogeeview/datadisplay/DataDisplay.js";


/** This is the component view implementation for the ButtonComponent. */
export default class ButtonComponentView extends BasicComponentView {

    /** Implement the method to get the output data display. This should typically 
     * extend DataDisplay. */
    getOutputDisplay(displayContainer) {

        //==================================================
        // DESTROY VIEW ON INACTIVE - OPTIONAL
        // -----------------------------------
        //decide if we want to tear down the output view when the component is inactive
        //By default this value is true. Whenever the output display is hidden, the ui elements will be discarded and
        //they are recreated when the view is opened again. 
        //Alternatively, if you want to keep it around (not destroy it) then the line below should be uncommented. In this 
        //case once the output view is opened the data display will not be destroyed as long as the parent page is opened.

        //displayContainer.setDestroyViewOnInactive(false);

        // DESTROY VIEW ON INACTIVE end
        //==================================================

        //==================================================
        // CREATE OUTPUT DATA DISPLAY - REQUIRED
        // -------------------------------------
        //Create an instance of a display object for the output display.
        //There are monay possibilites for this. The most simple is shown for a non-editing data display
        //We will assume out component is backed by a single JsonTable member.

        //data source - In out case, the most simple data source will return the JSON value of our underlying member
        //and not allow editing. 
        let dataSource = {
    
            doUpdate: () => {
                //return value is whether or not the data display needs to be udpated
                let component = this.getComponent();
                let reloadData = component.isMemberDataUpdated("member"); //we need to reload data if the member data is updated
                let reloadDataDisplay = false; //ouf display does not need to be reloaded after construction
                return {reloadData,reloadDataDisplay};
            },
    
            getData: () => {
                let member = this.getComponent().getMember();
                return member.getData();
            }
        }

        return new ButtonDisplay(displayContainer,dataSource);
        // CREATE OUTPUT DATA DISPLAY end
        //===================================================
    }
    
}

/** This is the component name with which this view is associated. */
ButtonComponentView.componentName = "apogeeapp.app.ButtonComponent";

/** This is the icon url for the component. 
 * This is the default value. It can be overwritten with an alternate icon url. */
//ButtonComponentView.ICON_RES_PATH = "/componentIcons/genericControl.png";



/** 
 * This is an implementation of a DataDisplay
 */
 class ButtonDisplay extends DataDisplay {
    
    constructor(viewMode,dataSource) {
        
        //extend edit component
        super(viewMode,dataSource);

        this.msg = "NO MESSAGE SET";
        
        //populate the UI element
        this.button = document.createElement("button");
        this.button.innerHTML = "Click me!";
        this.button.onclick = () => this.buttonClicked();      
    
        this.outputElement = document.createElement("div");
        this.outputElement.appendChild(document.createTextNode("For a good time press this button:"));
        this.outputElement.appendChild(document.createElement("br"));
        this.outputElement.appendChild(this.button);
    }
    
    buttonClicked() {
        alert("The current value is: " + this.msg);
    }

    //======================================
    // methods to implment
    
    /** This method returns the content element for the data display REQUIRED */
    getContent() {
        return this.outputElement;
    }
    
    /** This sets the data into the editor display. REQUIRED */
    setData(data) {
        if(data) {
            this.msg = data.msg;
            var label = data.label;
            if(label !== undefined) {
                this.button.innerHTML = label;
            }
        }
    }

    //This method gets the data from the editor. REQUIRED  if edit mode or save is used
    //getData() {}

    /** This method is called to check if the view can be closed. OPTIONAL */
    isCloseOk() {
        console.log("NewButtonControl.isCloseOk");
        return apogeeapp.app.ViewMode.CLOSE_OK;
    }

    /** This method is called on loading the display. OPTIONAL */
    onLoad() {
        console.log("NewButtonControl.onHide");
    }

    /** This method is called on unloading the display. OPTIONAL */
    onUnload() {
        console.log("NewButtonControl.onHide");
    }

    /** This method is called when the display will be destroyed. OPTIONAL */
    destroy() {
        console.log("NewButtonControl.destroyed");
    }
}

