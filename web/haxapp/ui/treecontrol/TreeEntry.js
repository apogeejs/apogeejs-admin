
if(!haxapp.ui.treecontrol) haxapp.ui.treecontrol = {};

haxapp.ui.treecontrol.TreeEntry = function(labelText,iconSrc,dblClickCallback,contextMenuCallback,isRoot) {
    
    this.contractUrl = haxapp.ui.getResourcePath("/contractPlus2.png");
    this.expandUrl = haxapp.ui.getResourcePath("/expandPlus2.png");
    this.noControlUrl = haxapp.ui.getResourcePath("/nothingPlus2.png");
    
    var baseCssClass;
    if(isRoot) {
        baseCssClass = "visiui-tc-root";
    }
    else {
        baseCssClass = "visiui-tc-child";
    }
    
    this.element = haxapp.ui.createElementWithClass("li", baseCssClass);
    this.control = haxapp.ui.createElementWithClass("img", "visiui-tc-control",this.element);
    this.icon = haxapp.ui.createElementWithClass("img", "visiui-tc-icon",this.element);
    this.label = haxapp.ui.createElementWithClass("div", "visiui-tc-label",this.element);
    this.childList = null;
    this.childMap = {};
    
    this.state = haxapp.ui.treecontrol.NO_CONTROL;
    
    if(labelText) {
        this.setLabel(labelText);
    }
    
    if(iconSrc) {
       this.icon.src = iconSrc; 
    }
    
   this.setState(haxapp.ui.treecontrol.NO_CONTROL);
    
    this.label.oncontextmenu = contextMenuCallback;
    if(dblClickCallback) {
        this.label.ondblclick = dblClickCallback
    }
}

haxapp.ui.treecontrol.NO_CONTROL = 0;
haxapp.ui.treecontrol.EXPANDED = 1;
haxapp.ui.treecontrol.COLLAPSED = -1;

haxapp.ui.treecontrol.DEFAULT_STATE = haxapp.ui.treecontrol.COLLAPSED;

/** The outer DOM element */
haxapp.ui.treecontrol.TreeEntry.prototype.getElement = function() {
    return this.element;
}

/** The label for the entry. */
haxapp.ui.treecontrol.TreeEntry.prototype.setLabel = function(labelText) {
    this.label.innerHTML = labelText;
}

haxapp.ui.treecontrol.TreeEntry.prototype.addChild = function(identifier,childTreeEntry) {
    if(!this.childList) {
        //add the child list if it does not exist
        this.childList = haxapp.ui.createElementWithClass("ul","visiui-tc-child-list",this.element); 
        this.setState(haxapp.ui.treecontrol.DEFAULT_STATE);
    }
    this.childMap[identifier] = childTreeEntry;
    this.childList.appendChild(childTreeEntry.getElement());
}

haxapp.ui.treecontrol.TreeEntry.prototype.removeChild = function(identifier) {
    if(this.childList) {
        var listEntry = this.childMap[identifier];
        if(listEntry) {
            delete this.childMap[identifier];
            this.childList.removeChild(listEntry.getElement()); 
            //remove the child list if there are no children
            if(this.childList.childElementCount === 0) {
                this.element.removeChild(this.childList);
                this.childList = null;
                this.setState(haxapp.ui.treecontrol.NO_CONTROL); 
            }
        }
    }
}

haxapp.ui.treecontrol.TreeEntry.prototype.setState = function(state) {
    this.state = state;
    if(this.state == haxapp.ui.treecontrol.NO_CONTROL) {
        this.control.src = this.noControlUrl;
    }
    else if(this.state == haxapp.ui.treecontrol.EXPANDED) {
        this.control.src = this.contractUrl;
        
        if(!this.collapse) {
            var instance = this;
            this.collapse = function() {
                instance.setState(haxapp.ui.treecontrol.COLLAPSED);
            }
        }
        
        this.control.onclick = this.collapse
        this.childList.style.display = "";
    }
    else if(this.state == haxapp.ui.treecontrol.COLLAPSED) {
        this.control.src = this.expandUrl;
        
        if(!this.expand) {
            var instance = this;
            this.expand = function() {
                instance.setState(haxapp.ui.treecontrol.EXPANDED);
            }
        }
        
        this.control.onclick = this.expand;
        this.childList.style.display = "none";
    }
}








