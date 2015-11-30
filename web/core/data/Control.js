/** This is a control. */
visicomp.core.Control = function(workspace,name) {
    //base init
    visicomp.core.Child.init.call(this,workspace,name,"control");
    
    this.html = "";
    this.onLoadBody = "";
    this.supplementalCode = "";
}

//add components to this class
visicomp.core.util.mixin(visicomp.core.Control,visicomp.core.Child);

visicomp.core.Control.prototype.setContent = function(html,onLoadBody,supplementalCode,css,jsLink) {
    this.html = html;
    this.onLoadBody = onLoadBody;
    this.supplementalCode = supplementalCode;
    this.css = css;
    this.jsLink = jsLink;
    
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
    
    //add the script
    this.addJsLinks(jsLink);
    
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

visicomp.core.Control.prototype.getJsLink = function() {
    return this.jsLink;
}

/** @private */
visicomp.core.Control.prototype.addJsLinks = function(linkText) {
    if(!linkText) {
        this.linkArray = [];
        return;
    }
    
    //add the links
    this.linkArray = linkText.split(/\s/);
    for(var i = 0; i < this.linkArray.length; i++) {
        //create the link
        var link = this.linkArray[i];
        if(link.length > 0) {
            this.setLink(link);
        }
    }

    //for now I don't remove links - add that later? (must be global!)
}

/** @private */
visicomp.core.Control.prototype.setLink = function(link) {
    //set the link as the element id
    var element = document.getElementById(link);
    if(!element) {
        element = visicomp.visiui.createElement("script",{"id":link});
        document.head.appendChild(element);
    }
    element.src = link;
}

