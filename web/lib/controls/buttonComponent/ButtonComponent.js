(function() {

/** This is a simple custom resource component example. */
apogeeapp.app.ButtonComponent = function(workspaceUI,control) {
    //extend edit component
    apogeeapp.app.BasicControlComponent.call(this,workspaceUI,control,apogeeapp.app.ButtonComponent);
};

apogeeapp.app.ButtonComponent.prototype = Object.create(apogeeapp.app.BasicControlComponent.prototype);
apogeeapp.app.ButtonComponent.prototype.constructor = apogeeapp.app.ButtonComponent;

//attach the standard static values to the static object (this can also be done manually)
apogeeapp.app.BasicControlComponent.attachStandardStaticProperties(apogeeapp.app.ButtonComponent,
        "ButtonComponent",
        "apogeeapp.app.ButtonComponent");

/** Implement the method to get the data display. JsDataDisplay is an 
 * easily configurable data display. */
apogeeapp.app.ButtonComponent.prototype.getDataDisplay = function(viewMode) {
    return new apogeeapp.app.ButtonDisplay(viewMode);
}

/** TO use JsDataDisplay, implement a class with the following methods, all optional:
 * init(outputElement,outputMode);
 * setData(data,outputElement,outputMode);
 * requestInactive(outputElement,outputMode);
 * onHide(outputElement,outputMode);
 * destroy(outputElement,outputMode);
 */
apogeeapp.app.ButtonDisplay = function(viewMode) {
    //extend edit component
    apogeeapp.app.JsDataDisplay.call(this,viewMode);
    
    var button = document.createElement("button");
    button.innerHTML = "Click me!";
    var instance = this;
    button.onclick = function() {
        instance.buttonClicked();      
    }  
    
    var outputElement = this.getElement();
    outputElement.appendChild(button);
}

apogeeapp.app.ButtonDisplay.prototype = Object.create(apogeeapp.app.JsDataDisplay.prototype);
apogeeapp.app.ButtonDisplay.prototype.constructor = apogeeapp.app.ButtonDisplay;


apogeeapp.app.ButtonDisplay.prototype.buttonClicked = function() {
    alert("The current value is: " + this.data);
}

apogeeapp.app.ButtonDisplay.prototype.showData = function(data) {
    console.log("NewButtonControl.setData");
    this.data = data;
}

apogeeapp.app.ButtonDisplay.prototype.isCloseOk = function() {
    console.log("NewButtonControl.isCloseOk");
    return apogeeapp.app.ViewMode.CLOSE_OK;
}

apogeeapp.app.ButtonDisplay.prototype.onLoad = function() {
    console.log("NewButtonControl.onHide");
}

apogeeapp.app.ButtonDisplay.prototype.onUnload = function() {
    console.log("NewButtonControl.onHide");
}

apogeeapp.app.ButtonDisplay.prototype.onResize = function() {
    console.log("NewButtonControl.onHide");
}

apogeeapp.app.ButtonDisplay.prototype.destroy = function() {
    console.log("NewButtonControl.destroyed");
}

//-----------------
//auto registration
//-----------------
if(registerComponent) {
    registerComponent(apogeeapp.app.ButtonComponent);
}

}
)();
