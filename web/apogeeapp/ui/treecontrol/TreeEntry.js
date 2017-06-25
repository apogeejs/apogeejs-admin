
if(!apogeeapp.ui.treecontrol) apogeeapp.ui.treecontrol = {};

apogeeapp.ui.treecontrol.TreeEntry = function(labelText,iconSrc,dblClickCallback,contextMenuCallback,isRoot) {
    
    this.contractUrl = apogeeapp.ui.getResourcePath("/contractPlus2.png");
    this.expandUrl = apogeeapp.ui.getResourcePath("/expandPlus2.png");
    this.noControlUrl = apogeeapp.ui.getResourcePath("/nothingPlus2.png");
    
    var baseCssClass;
    if(isRoot) {
        baseCssClass = "visiui-tc-root";
    }
    else {
        baseCssClass = "visiui-tc-child";
    }
    
    this.element = apogeeapp.ui.createElementWithClass("li", baseCssClass);
    this.control = apogeeapp.ui.createElementWithClass("img", "visiui-tc-control",this.element);
    this.icon = apogeeapp.ui.createElementWithClass("img", "visiui-tc-icon",this.element);
    this.label = apogeeapp.ui.createElementWithClass("div", "visiui-tc-label",this.element);
    this.childList = null;
    this.childMap = {};
    
    this.state = apogeeapp.ui.treecontrol.NO_CONTROL;
    
    if(labelText) {
        this.setLabel(labelText);
    }
    
    if(iconSrc) {
       this.icon.src = iconSrc; 
    }
    
   this.setState(apogeeapp.ui.treecontrol.NO_CONTROL);
    
    this.label.oncontextmenu = contextMenuCallback;
    if(dblClickCallback) {
        this.label.ondblclick = dblClickCallback
    }
}

apogeeapp.ui.treecontrol.NO_CONTROL = 0;
apogeeapp.ui.treecontrol.EXPANDED = 1;
apogeeapp.ui.treecontrol.COLLAPSED = -1;

apogeeapp.ui.treecontrol.DEFAULT_STATE = apogeeapp.ui.treecontrol.COLLAPSED;

/** The outer DOM element */
apogeeapp.ui.treecontrol.TreeEntry.prototype.getElement = function() {
    return this.element;
}

/** The label for the entry. */
apogeeapp.ui.treecontrol.TreeEntry.prototype.setLabel = function(labelText) {
    this.label.innerHTML = labelText;
}

apogeeapp.ui.treecontrol.TreeEntry.prototype.addChild = function(identifier,childTreeEntry) {
    if(!this.childList) {
        //add the child list if it does not exist
        this.childList = apogeeapp.ui.createElementWithClass("ul","visiui-tc-child-list",this.element); 
        this.setState(apogeeapp.ui.treecontrol.DEFAULT_STATE);
    }
    this.childMap[identifier] = childTreeEntry;
    this.childList.appendChild(childTreeEntry.getElement());
}

apogeeapp.ui.treecontrol.TreeEntry.prototype.removeChild = function(identifier) {
    if(this.childList) {
        var listEntry = this.childMap[identifier];
        if(listEntry) {
            delete this.childMap[identifier];
            this.childList.removeChild(listEntry.getElement()); 
            //remove the child list if there are no children
            if(this.childList.childElementCount === 0) {
                this.element.removeChild(this.childList);
                this.childList = null;
                this.setState(apogeeapp.ui.treecontrol.NO_CONTROL); 
            }
        }
    }
}

apogeeapp.ui.treecontrol.TreeEntry.prototype.setState = function(state) {
    this.state = state;
    if(this.state == apogeeapp.ui.treecontrol.NO_CONTROL) {
        this.control.src = this.noControlUrl;
    }
    else if(this.state == apogeeapp.ui.treecontrol.EXPANDED) {
        this.control.src = this.contractUrl;
        
        if(!this.collapse) {
            var instance = this;
            this.collapse = function() {
                instance.setState(apogeeapp.ui.treecontrol.COLLAPSED);
            }
        }
        
        this.control.onclick = this.collapse
        this.childList.style.display = "";
    }
    else if(this.state == apogeeapp.ui.treecontrol.COLLAPSED) {
        this.control.src = this.expandUrl;
        
        if(!this.expand) {
            var instance = this;
            this.expand = function() {
                instance.setState(apogeeapp.ui.treecontrol.EXPANDED);
            }
        }
        
        this.control.onclick = this.expand;
        this.childList.style.display = "none";
    }
}








