/** This is a simple chart control using the libary Chart.js. The Chart.js libarry
 * must be loaded separately for this control. */

(function() {

//=================================
// Button Resource
//=================================

/** Constructor */
ButtonResource = function() {
    this.button = document.createElement("button");
    this.button.innerHTML = "---";
}


/** setFrame - required method for resource processor used in Basic Resource Control. */
ButtonResource.prototype.setComponent = function(component) {
    this.component = component;
    this.component.memberUpdated();
}

ButtonResource.prototype.init = function(title,callback) {
    this.button.innerHTML = title;
    this.button.onclick = callback;
}

/** This is the method users will call to initialize the chart. */
ButtonResource.prototype.show = function() {  
    var outputElement = this.component.getOutputElement();
    outputElement.appendChild(this.button);
}

ButtonResource.prototype.hide = function() {  
    //no action
}

ButtonResource.prototype.onDelete = function() {  
    //no action
}

//======================================
// Static methods
//======================================

var ButtonComponent = {};

/** This method creates the control. */
ButtonComponent.createComponent = function(workspaceUI,data,componentOptions) {
    var resource = new ButtonResource();
	return haxapp.app.BasicControlComponent.createBaseComponent(workspaceUI,data,resource,ButtonComponent.generator,componentOptions);
}

ButtonComponent.createComponentFromJson = function(workspaceUI,member,componentJson) {
    var resource = new ButtonResource();
	member.updateResource(resource);
    return haxapp.app.BasicControlComponent.createBaseComponentFromJson(workspaceUI,member,ButtonComponent.generator,componentJson);
}

//======================================
// This is the control generator, to register the control
//======================================

ButtonComponent.generator = {};
ButtonComponent.generator.displayName = "Simple Button Control";
ButtonComponent.generator.uniqueName = "hax.example.ButtonComponent";
ButtonComponent.generator.createComponent = ButtonComponent.createComponent;
ButtonComponent.generator.createComponentFromJson = ButtonComponent.createComponentFromJson;
ButtonComponent.generator.DEFAULT_WIDTH = 500;
ButtonComponent.generator.DEFAULT_HEIGHT = 500;

//auto registration
if(registerComponent) {
    registerComponent(ButtonComponent.generator);
}

}
)();