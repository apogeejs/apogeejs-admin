(function() {

/** This is a simple custom resource component example. */
haxapp.app.NewButtonComponent = function(workspaceUI,control,generator,componentJson) {
    //extend edit component
    haxapp.app.NewBasicControlComponent.call(this,workspaceUI,control,generator,componentJson);
};

haxapp.app.NewButtonComponent.prototype = Object.create(haxapp.app.NewBasicControlComponent.prototype);
haxapp.app.NewButtonComponent.prototype.constructor = haxapp.app.NewButtonComponent;

/** Implement the method to get the data display. JsDataDisplay is an 
 * easily configurable data display. */
haxapp.app.NewButtonComponent.prototype.getDataDisplay = function(viewMode) {
    var resource = new haxapp.app.NewButtonResource();
    return new haxapp.app.JsDataDisplay(resource,viewMode);
}

/** TO use JsDataDisplay, implement a class with the following methods, all optional:
 * init(outputElement,outputMode);
 * setData(data,outputElement,outputMode);
 * requestHide(outputElement,outputMode);
 * onHide(outputElement,outputMode);
 * destroy(outputElement,outputMode);
 */
haxapp.app.NewButtonResource = function() {
    
}

haxapp.app.NewButtonResource.prototype.init = function(outputElement,outputMode) {
    var button = document.createElement("button");
    button.innerHTML = "Click me!";
    var instance = this;
    button.onclick = function() {
        instance.buttonClicked();      
    }  
    outputElement.appendChild(button);
}

haxapp.app.NewButtonResource.prototype.buttonClicked = function() {
    alert("The current value is: " + this.data);
}

haxapp.app.NewButtonResource.prototype.setData = function(data,outputElement,outputMode) {
    console.log("NewButtonControl.setData");
    this.data = data;
}

haxapp.app.NewButtonResource.prototype.requestHide = function(outputElement,outputMode) {
    console.log("NewButtonControl.requestHide");
}

haxapp.app.NewButtonResource.prototype.onHide = function(outputElement,outputMode) {
    console.log("NewButtonControl.onHide");
}

haxapp.app.NewButtonResource.prototype.destroy = function(outputElement,outputMode) {
    console.log("NewButtonControl.destroyed");
}

//-----------------
//create a component generator
//-----------------
haxapp.app.NewButtonResource.generator = haxapp.app.NewBasicControlComponent.createGenerator(
        "NewButtonComponent",
        "haxapp.app.NewButtonComponent",
        haxapp.app.NewButtonComponent);

//-----------------
//auto registration
//-----------------
if(registerComponent) {
    registerComponent(haxapp.app.NewButtonResource.generator);
}

}
)();
