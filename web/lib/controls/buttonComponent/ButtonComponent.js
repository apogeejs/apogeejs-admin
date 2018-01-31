(function() {

/** This is a simple custom resource component example. */
apogeeapp.app.ButtonComponent = class extends apogeeapp.app.BasicControlComponent {
    constructor(workspaceUI,control) {
        super(workspaceUI,control,apogeeapp.app.ButtonComponent);
    }

    /** Implement the method to get the output data display. This should typically 
     * extend NonEditorDataDisplay. */
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
apogeeapp.app.ButtonDisplay = class extends apogeeapp.app.NonEditorDataDisplay {
    
    constructor(viewMode,member) {
        //extend edit component
        super(viewMode);
    
        this.member = member;
        
        //populate the UI element
        this.button = document.createElement("button");
        this.button.innerHTML = "Click me!";
        this.button.onclick = () => this.buttonClicked();      
    
        var outputElement = this.getElement();
        outputElement.appendChild(this.button);
    }
    
    buttonClicked() {
        alert("The current value is: " + this.msg);
    }
    
    /** This is called when the control object updates. */
    showData() {
        console.log("NewButtonControl.setData");
        var data = this.member.getData();
        
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
