
haxapp.ui.MenuBar = function() {
    this.element = haxapp.ui.createElement("div",{"className":"menu-bar"});
    this.list = haxapp.ui.createElement("ul");
    this.element.appendChild(this.list);
}

haxapp.ui.MenuBar.prototype.getElement = function() {
    return this.element;
}

haxapp.ui.MenuBar.prototype.addMenu = function(menu) {
    this.list.appendChild(menu.getListEntry());
}




