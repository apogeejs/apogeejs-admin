if(visicomp.app.visiui.control === undefined) visicomp.app.visiui.control = {};

visicomp.app.visiui.control.CustomResourceProcessor = function() {
    this.contentLoaded = false;
}

visicomp.app.visiui.control.CustomResourceProcessor.prototype.setWindow = function(window) {
    this.window = window;
	if(this.contentLoaded) {
		this.setContent();
	}
}

visicomp.app.visiui.control.CustomResourceProcessor.prototype.getHtml = function() {
    return this.html;
}

visicomp.app.visiui.control.CustomResourceProcessor.prototype.getCustomizeScript = function() {
    return this.customizeScript;
}

visicomp.app.visiui.control.CustomResourceProcessor.prototype.getSupplementalCode = function(msg) {
    return this.supplementalCode;
}

visicomp.app.visiui.control.CustomResourceProcessor.prototype.getCss = function(msg) {
    return this.css;
}

visicomp.app.visiui.control.CustomResourceProcessor.prototype.update = function(html,customizeScript,supplementalCode,css) {
    this.html = html;
	this.customizeScript = customizeScript;
	this.supplementalCode = supplementalCode;
	this.css = css;
	this.contentLoaded = true;
	
	//dummy update
	if(this.window) {
		this.setContent();
	}
}

visicomp.app.visiui.control.CustomResourceProcessor.prototype.setContent = function() {
	//TEMP
	if(this.window) {
		var element = this.window.getContent();
		element.innerHTML = this.html;
	}
}

visicomp.app.visiui.control.CustomResourceProcessor.prototype.updateToJson = function() {
    var json = {};
    json.html = this.html;
	json.customizeScript = this.customizeScript;
	json.supplementalCode = this.supplementalCode;
	json.css = this.css;
    return json;
}

visicomp.app.visiui.control.CustomResourceProcessor.prototype.updateFromJson = function(json) {
    this.html = json.html;
	this.customizeScript = json.customizeScript;
	this.supplementalCode = json.supplementalCode;
	this.css = json.css;
}

