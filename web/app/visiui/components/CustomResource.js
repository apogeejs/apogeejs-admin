hax.app.visiui.CustomResource = function() {
	this.contentElement = null;
	
	this.html = "";
	this.customizeScript = "";
	this.supplementalCode = "";
	this.css = "";
}

hax.app.visiui.CustomResource.prototype.setComponent = function(component) {
    this.component = component;
}

hax.app.visiui.CustomResource.prototype.getContentElement = function() {
    return this.component.getOutputElement();
}

hax.app.visiui.CustomResource.prototype.getComponent = function() {
    return this.component;
}

hax.app.visiui.CustomResource.prototype.getHtml = function() {
    return this.html;
}

hax.app.visiui.CustomResource.prototype.getCustomizeScript = function() {
    return this.customizeScript;
}

hax.app.visiui.CustomResource.prototype.getSupplementalCode = function() {
    return this.supplementalCode;
}

hax.app.visiui.CustomResource.prototype.getCss = function(msg) {
    return this.css;
}

hax.app.visiui.CustomResource.prototype.update = function(html,customizeScript,supplementalCode,css) {
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
hax.app.visiui.CustomResource.prototype.updateResource = function() {
    
    //create the resource generator wrapped with its closure
    var generatorFunctionBody = hax.core.util.formatString(
        hax.app.visiui.CustomResource.GENERATOR_FUNCTION_FORMAT_TEXT,
		this.customizeScript,
        this.supplementalCode
    );
	
	//create the function generator, with the aliased variables in the closure
	var generatorFunction = new Function(generatorFunctionBody);
	var updateFunction = generatorFunction();
	this.resource = updateFunction(this);
}



/** This is the format string to create the code body for updateing the member
 * Input indices:
 * 0: customize script
 * 1: supplemental code text
 * @private
 */
hax.app.visiui.CustomResource.GENERATOR_FUNCTION_FORMAT_TEXT = [
"",
"//supplemental code",
"{1}",
"//end supplemental code",
"",
"//member function",
"var generator = function(resource) {",
"{0}",
"}",
"//end member function",
"return generator;",
""
   ].join("\n");


