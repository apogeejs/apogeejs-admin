haxapp.ui.Menu = function(label) {
    this.element = haxapp.ui.createElement("li");
    
    this.label = haxapp.ui.createElement("span"/*,{"className":"menu-head"}*/);
    this.label.innerHTML = label;
    this.element.appendChild(this.label);
    
    this.list = haxapp.ui.createElement("ul");
    this.element.appendChild(this.list);
}

haxapp.ui.Menu.prototype.getListEntry = function() {
    return this.element;
}

haxapp.ui.Menu.prototype.addMenuItem = function(menuItem) {
    this.list.appendChild(menuItem.getListEntry());
}