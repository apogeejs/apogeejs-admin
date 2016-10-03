
hax.visiui.MenuBar = function() {
    this.element = hax.visiui.createElement("div",{"className":"menu-bar"});
    this.list = hax.visiui.createElement("ul");
    this.element.appendChild(this.list);
}

hax.visiui.MenuBar.prototype.getElement = function() {
    return this.element;
}

hax.visiui.MenuBar.prototype.addMenu = function(menu) {
    this.list.appendChild(menu.getListEntry());
}




