
apogeeapp.ui.MenuBar = function() {
    this.element = apogeeapp.ui.createElement("div",{"className":"menu-bar"});
    this.list = apogeeapp.ui.createElement("ul");
    this.element.appendChild(this.list);
}

apogeeapp.ui.MenuBar.prototype.getElement = function() {
    return this.element;
}

apogeeapp.ui.MenuBar.prototype.addMenu = function(menu) {
    this.list.appendChild(menu.getListEntry());
}




