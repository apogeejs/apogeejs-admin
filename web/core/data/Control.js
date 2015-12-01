/** This is a control. */
visicomp.core.Control = function(workspace,name) {
    //base init
    visicomp.core.Child.init.call(this,workspace,name,"control");
    
    this.html = "";
    this.onLoadBody = "";
    this.supplementalCode = "";
    this.css = "";
}

//add components to this class
visicomp.core.util.mixin(visicomp.core.Control,visicomp.core.Child);

visicomp.core.Control.prototype.setContent = function(html,onLoadBody,supplementalCode,css) {
    this.html = html;
    this.onLoadBody = onLoadBody;
    this.supplementalCode = supplementalCode;
    this.css = css;
    
    //add the css
    if((css)&&(css.length > 0)) {
        if(!this.cssElement) {
            this.cssElement = visicomp.visiui.createElement("style");
            document.head.appendChild(this.cssElement);
        }
        this.cssElement.innerHTML = this.css;
    }
    else {
        if(this.cssElement) {
            this.cssElement.innerHTML = "";
        }
    }
    
    //create the on load function
    if(onLoadBody) {
        this.onLoad = new Function(onLoadBody);
    }
    else {
        this.onLoad = null;
    }
    
    //add the script to the page
    if(supplementalCode) {
        eval(supplementalCode);
    }
}

visicomp.core.Control.prototype.getHtml = function() {
    return this.html;
}

visicomp.core.Control.prototype.getOnLoadBody = function() {
    return this.onLoadBody;
}

visicomp.core.Control.prototype.getOnLoad = function() {
    return this.onLoad;
}

visicomp.core.Control.prototype.getSupplementalCode = function() {
    return this.supplementalCode;
}

visicomp.core.Control.prototype.getCss = function() {
    return this.css;
}

