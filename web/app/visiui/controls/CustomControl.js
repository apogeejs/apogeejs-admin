if(visicomp.app.visiui.control === undefined) visicomp.app.visiui.control = {};

visicomp.app.visiui.control.CustomControl = function() {
    
}

visicomp.app.visiui.control.CustomControl.prototype.isCustomControl = true;

visicomp.app.visiui.control.CustomControl.prototype.setWindow = function(window) {
    this.window = window;
}

visicomp.app.visiui.control.CustomControl.prototype.getHtml = function() {
    return this.html;
}

visicomp.app.visiui.control.CustomControl.prototype.getOnLoadBody = function() {
    return this.onLoadBody;
}

visicomp.app.visiui.control.CustomControl.prototype.getSupplementalCode = function(msg) {
    return this.supplementalCode;
}

visicomp.app.visiui.control.CustomControl.prototype.getCss = function(msg) {
    return this.css;
}

visicomp.app.visiui.control.CustomControl.prototype.update = function(html,onLoadBody,supplementalCode,css) {
    this.html = html;
	this.onLoadbody = onLoadBody;
	this.supplementalCode = supplementalCode;
	this.css = css;
	
	//dummy update
	var contentElement = this.window.getContent();
    contentElement.innerHTML = html;
}

