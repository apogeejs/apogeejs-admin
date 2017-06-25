
if(!apogeeapp.ui.treecontrol) apogeeapp.ui.treecontrol = {};

apogeeapp.ui.treecontrol.TreeControl = function() {
    this.list = apogeeapp.ui.createElementWithClass("ul","visiui-tc-child-list",this.element); 
}

/** The outer DOM element */
apogeeapp.ui.treecontrol.TreeControl.prototype.getElement = function() {
    return this.list;
}

apogeeapp.ui.treecontrol.TreeControl.prototype.setRootEntry = function(treeEntry) {
    this.clearRootEntry();
    this.list.appendChild(treeEntry.getElement());
}

apogeeapp.ui.treecontrol.TreeControl.prototype.clearRootEntry = function() {
    apogeeapp.ui.removeAllChildren(this.list);
}




