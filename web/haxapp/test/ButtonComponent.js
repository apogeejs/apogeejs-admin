(function() {

/** This is a simple custom resource component example. */
haxapp.app.ButtonComponent = function(workspaceUI,control,generator,componentJson) {
    //extend edit component
    haxapp.app.BasicControlComponent.call(this,workspaceUI,control,generator,componentJson);
};

haxapp.app.ButtonComponent.prototype = Object.create(haxapp.app.BasicControlComponent.prototype);
haxapp.app.ButtonComponent.prototype.constructor = haxapp.app.ButtonComponent;

/** Implement the method to get the data display. JsDataDisplay is an 
 * easily configurable data display. */
haxapp.app.ButtonComponent.prototype.getDataDisplay = function(viewMode) {
    return new haxapp.app.ButtonDisplay(viewMode);
}

/** TO use JsDataDisplay, implement a class with the following methods, all optional:
 * init(outputElement,outputMode);
 * setData(data,outputElement,outputMode);
 * requestHide(outputElement,outputMode);
 * onHide(outputElement,outputMode);
 * destroy(outputElement,outputMode);
 */
haxapp.app.ButtonDisplay = function(viewMode) {
    //extend edit component
    haxapp.app.JsDataDisplay.call(this,viewMode);
    
    var button = document.createElement("button");
    button.innerHTML = "Click me!";
    var instance = this;
    button.onclick = function() {
        instance.buttonClicked();      
    }  
    
    var outputElement = this.getElement();
    outputElement.appendChild(button);
}

haxapp.app.ButtonDisplay.prototype = Object.create(haxapp.app.JsDataDisplay.prototype);
haxapp.app.ButtonDisplay.prototype.constructor = haxapp.app.ButtonDisplay;


haxapp.app.ButtonDisplay.prototype.buttonClicked = function() {
    alert("The current value is: " + this.data);
}

haxapp.app.ButtonDisplay.prototype.showData = function(data) {
    console.log("NewButtonControl.setData");
    this.data = data;
}

haxapp.app.ButtonDisplay.prototype.requestHide = function() {
    console.log("NewButtonControl.requestHide");
    return haxapp.app.ViewMode.CLOSE_OK;
}

haxapp.app.ButtonDisplay.prototype.onHide = function() {
    console.log("NewButtonControl.onHide");
}

haxapp.app.ButtonDisplay.prototype.destroy = function() {
    console.log("NewButtonControl.destroyed");
}

//-----------------
//create a component generator
//-----------------
haxapp.app.ButtonComponent.generator = haxapp.app.BasicControlComponent.createGenerator(
        "ButtonComponent",
        "haxapp.app.ButtonComponent",
        haxapp.app.ButtonComponent);

//-----------------
//auto registration
//-----------------
if(registerComponent) {
    registerComponent(haxapp.app.ButtonComponent.generator);
}

}
)();
