import DataDisplay from "/apogeeapp/app/datadisplay/DataDisplay.js";

(function() {

/** This is a simple custom resource component example. */
apogeeapp.app.ButtonComponent = class extends apogeeapp.app.BasicControlComponent {
    constructor(workspaceUI,control) {
        super(workspaceUI,control,apogeeapp.app.ButtonComponent);
    }

    /** Implement the method to get the output data display. This should typically 
     * extend DataDisplay. */
    getOutputDisplay(viewMode) {
        return new apogeeapp.app.ButtonDisplay(viewMode,this.getMember());
    }
    
}

//attach the standard static values to the static object (this can also be done manually)
apogeeapp.app.BasicControlComponent.attachStandardStaticProperties(apogeeapp.app.ButtonComponent,
        "ButtonComponent",
        "apogeeapp.app.ButtonComponent");
        
//-----------------
//auto registration
//-----------------
var app = apogeeapp.app.Apogee.getInstance();
if(app) {
    app.registerComponent(apogeeapp.app.ButtonComponent);
}
else {
    console.log("Component could not be registered because no Apogee app instance was available at component load time: apogeeapp.app.ButtonComponent");
}


/** TO use JsDataDisplay, implement a class with the following methods, all optional:
 * init(outputElement,outputMode);
 * setData(data,outputElement,outputMode);
 * requestInactive(outputElement,outputMode);
 * onHide(outputElement,outputMode);
 * destroy(outputElement,outputMode);
 */
apogeeapp.app.ButtonDisplay = class extends DataDisplay {
    
    constructor(viewMode,member) {
        
        var callbacks = {
            getData: () => this.member.getData()
        }
        
        //extend edit component
        super(viewMode,callbacks);
    
        this.member = member;
        
        //populate the UI element
        this.button = document.createElement("button");
        this.button.innerHTML = "Click me!";
        this.button.onclick = () => this.buttonClicked();      
    
        this.outputElement = apogeeui.createElement("div");
        this.outputElement.appendChild(document.createTextNode("This is a stupid component because you can't set the action."));
        this.outputElement.appendChild(document.createElement("br"));
        this.outputElement.appendChild(this.button);
    }
    
    buttonClicked() {
        alert("The current value is: " + this.msg);
    }
    
    getContent() {
        return this.outputElement;
    }
    
    //this method tells the window the type of content:
    //apogeeui.RESIZABLE - if the window can freely resize it
    //apogeeui.FIXED_SIZE - if the content is fixed size
    getContentType() {
        return apogeeui.FIXED_SIZE;
    }
    
    /** This is called when the control object updates. */
    setData(data) {
        if(data) {
            this.msg = data.msg;
            var label = data.label;
            if(label !== undefined) {
                this.button.innerHTML = label;
            }
        }
    }

    isCloseOk() {
        console.log("NewButtonControl.isCloseOk");
        return apogeeapp.app.ViewMode.CLOSE_OK;
    }

    onLoad() {
        console.log("NewButtonControl.onHide");
    }

    onUnload() {
        console.log("NewButtonControl.onHide");
    }

    onResize() {
        console.log("NewButtonControl.onHide");
    }

    destroy() {
        console.log("NewButtonControl.destroyed");
    }
}



//end definition
})();
