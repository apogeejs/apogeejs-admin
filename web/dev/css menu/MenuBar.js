
visicomp.visiui.MenuBar = function() {
    this.element = visicomp.visiui.createElement("div",{"className":"menu-bar"});
    this.list = visicomp.visiui.createElement("ul");
    this.element.appendChild(this.list);
}

visicomp.visiui.MenuBar.prototype.getElement = function() {
    return this.element;
}

visicomp.visiui.MenuBar.prototype.addMenu = function(menu) {
    this.list.appendChild(menu.getListEntry());
}




