haxapp.app.CustomResource = function() {
	this.contentElement = null;
	
	this.html = "";
	this.customizeScript = "";
	this.supplementalCode = "";
	this.css = "";
}

haxapp.app.CustomResource.prototype.setComponent = function(component) {
    this.component = component;
}

haxapp.app.CustomResource.prototype.getContentElement = function() {
    return this.component.getOutputElement();
}

haxapp.app.CustomResource.prototype.getComponent = function() {
    return this.component;
}

haxapp.app.CustomResource.prototype.getHtml = function() {
    return this.html;
}

haxapp.app.CustomResource.prototype.getCustomizeScript = function() {
    return this.customizeScript;
}

haxapp.app.CustomResource.prototype.getSupplementalCode = function() {
    return this.supplementalCode;
}

haxapp.app.CustomResource.prototype.getCss = function(msg) {
    return this.css;
}

haxapp.app.CustomResource.prototype.update = function(html,customizeScript,supplementalCode,css) {
    this.html = html;
	this.customizeScript = customizeScript;
	this.supplementalCode = supplementalCode;
	this.css = css;
	
	//update the resource with the given data
	this.updateResource();
}

//======================================
// Resource methods
//======================================

/** This method creates the member update javascript, which will be added to the
 * html page so the user easily can run it in the debugger if needed. 
 * @private */
haxapp.app.CustomResource.prototype.updateResource = function() {
    
    //create the resource generator wrapped with its closure
    var generatorFunctionBody = hax.util.formatString(
        haxapp.app.CustomResource.GENERATOR_FUNCTION_FORMAT_TEXT,
		this.customizeScript,
        this.supplementalCode
    );
	
	//create the function generator, with the aliased variables in the closure
	var generatorFunction = new Function(generatorFunctionBody);
	var updateFunction = generatorFunction();
	
    var resource = updateFunction(this);
    var control = this.getObject();
    control.updateResource(resource);
}



/** This is the format string to create the code body for updateing the member
 * Input indices:
 * 0: customize script
 * 1: supplemental code text
 * @private
 */
haxapp.app.CustomResource.GENERATOR_FUNCTION_FORMAT_TEXT = [
"",
"//supplemental code",
"{1}",
"//end supplemental code",
"",
"//member function",
"var generator = function(component) {",
"{0}",
"}",
"//end member function",
"return generator;",
""
   ].join("\n");


