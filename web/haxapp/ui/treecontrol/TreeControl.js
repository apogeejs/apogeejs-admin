
if(!haxapp.ui.treecontrol) haxapp.ui.treecontrol = {};

haxapp.ui.treecontrol.TreeControl = function() {
    this.list = haxapp.ui.createElementWithClass("ul","visiui-tc-child-list",this.element); 
}

/** The outer DOM element */
haxapp.ui.treecontrol.TreeControl.prototype.getElement = function() {
    return this.list;
}

haxapp.ui.treecontrol.TreeControl.prototype.setRootEntry = function(treeEntry) {
    this.clearRootEntry();
    this.list.appendChild(treeEntry.getElement());
}

haxapp.ui.treecontrol.TreeControl.prototype.clearRootEntry = function() {
    haxapp.ui.removeAllChildren(this.list);
}




