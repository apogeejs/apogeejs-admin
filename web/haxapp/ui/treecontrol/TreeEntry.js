
if(!haxapp.ui.treecontrol) haxapp.ui.treecontrol = {};

haxapp.ui.treecontrol.TreeEntry = function(labelText,dblClickCallback,contextMenuCallback) {
    
    this.element = haxapp.ui.createElementWithClass("span", "visiui-tc-entry");
    this.label = haxapp.ui.createElementWithClass("div", "visiui-tc-label",this.element);
    this.childList = null;
    this.childMap = {};
    
    if(labelText) {
        this.setLabel(labelText);
    }
    
    this.label.oncontextmenu = contextMenuCallback;
    this.label.ondblclick = dblClickCallback
}

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
    }
    var listEntry = haxapp.ui.createElementWithClass("li", "visiui-tc-child");
    listEntry.appendChild(childTreeEntry.getElement());
    this.childMap[identifier] = listEntry;
    this.childList.appendChild(listEntry);
}

haxapp.ui.treecontrol.TreeEntry.prototype.removeChild = function(identifier) {
    if(this.childList) {
        var listEntry = this.childMap[identifier];
        if(listEntry) {
            delete this.childMap[identifier];
            this.childList.removeChild(listEntry); 
            //remove the child list if there are no children
            if(this.childList.childElementCount === 0) {
                this.element.removeChild(this.childList);
                this.childList = null;
            }
        }
    }
}








