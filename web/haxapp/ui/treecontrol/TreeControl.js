
if(!haxapp.ui.treecontrol) haxapp.ui.treecontrol = {};

haxapp.ui.treecontrol.TreeControl = function() {
    this.element = haxapp.ui.createElementWithClass("span", "visiui-tc-entry");
    this.list = haxapp.ui.createElementWithClass("ul","visiui-tc-child-list",this.element);
}

/** The outer DOM element */
haxapp.ui.treecontrol.TreeControl.prototype.getElement = function() {
    return this.element;
}

haxapp.ui.treecontrol.TreeControl.prototype.setRootEntry = function(treeEntry) {
    haxapp.ui.removeAllChildren(this.list);
    var listEntry = haxapp.ui.createElementWithClass("li","visiui-tc-child",this.list);
    listEntry.appendChild(treeEntry);
}

haxapp.ui.treecontrol.TreeControl.prototype.clearRootEntry = function() {
    haxapp.ui.removeAllChildren(this.list);
}




