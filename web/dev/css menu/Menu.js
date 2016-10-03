hax.visiui.Menu = function(label) {
    this.element = hax.visiui.createElement("li");
    
    this.label = hax.visiui.createElement("span"/*,{"className":"menu-head"}*/);
    this.label.innerHTML = label;
    this.element.appendChild(this.label);
    
    this.list = hax.visiui.createElement("ul");
    this.element.appendChild(this.list);
}

hax.visiui.Menu.prototype.getListEntry = function() {
    return this.element;
}

hax.visiui.Menu.prototype.addMenuItem = function(menuItem) {
    this.list.appendChild(menuItem.getListEntry());
}