visicomp.app.visiui.CustomResourceProcessor = function() {
	this.window = null;
	
	this.html = "";
	this.customizeScript = "";
	this.supplementalCode = "";
	this.css = "";
}

visicomp.app.visiui.CustomResourceProcessor.prototype.setWindow = function(window) {
    this.window = window;
}

visicomp.app.visiui.CustomResourceProcessor.prototype.getWindow = function() {
    return this.window;
}

visicomp.app.visiui.CustomResourceProcessor.prototype.getContentElement = function() {
    return this.window.getContent();
}

visicomp.app.visiui.CustomResourceProcessor.prototype.getHtml = function() {
    return this.html;
}

visicomp.app.visiui.CustomResourceProcessor.prototype.getCustomizeScript = function() {
    return this.customizeScript;
}

visicomp.app.visiui.CustomResourceProcessor.prototype.getSupplementalCode = function() {
    return this.supplementalCode;
}

visicomp.app.visiui.CustomResourceProcessor.prototype.getCss = function(msg) {
    return this.css;
}

visicomp.app.visiui.CustomResourceProcessor.prototype.update = function(html,customizeScript,supplementalCode,css) {
    this.html = html;
	this.customizeScript = customizeScript;
	this.supplementalCode = supplementalCode;
	this.css = css;
	
	//update the processor with the given data
	this.updateProcessor();
}

visicomp.app.visiui.CustomResourceProcessor.prototype.toJson = function() {
    var json = {};
    json.html = this.html;
	json.customizeScript = this.customizeScript;
	json.supplementalCode = this.supplementalCode;
	json.css = this.css;
    return json;
}

visicomp.app.visiui.CustomResourceProcessor.prototype.updateFromJson = function(json) {
	this.update(json.html,json.customizeScript,json.supplementalCode,json.css);
}

//======================================
// Processor methods
//======================================

/** This method creates the member update javascript, which will be added to the
 * html page so the user easily can run it in the debugger if needed. 
 * @private */
visicomp.app.visiui.CustomResourceProcessor.prototype.updateProcessor = function() {
    
    //create the resource generator wrapped with its closure
    var generatorFunctionBody = visicomp.core.util.formatString(
        visicomp.app.visiui.CustomResourceProcessor.GENERATOR_FUNCTION_FORMAT_TEXT,
		this.customizeScript,
        this.supplementalCode
    );
	
	//create the function generator, with the aliased variables in the closure
	var generatorFunction = new Function(generatorFunctionBody);
	var updateFunction = generatorFunction();
	this.resourceProcessor = updateFunction(this);
}



/** This is the format string to create the code body for updateing the member
 * Input indices:
 * 0: customize script
 * 1: supplemental code text
 * @private
 */
visicomp.app.visiui.CustomResourceProcessor.GENERATOR_FUNCTION_FORMAT_TEXT = [
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


