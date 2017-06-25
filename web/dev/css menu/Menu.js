apogeeapp.ui.Menu = function(label) {
    this.element = apogeeapp.ui.createElement("li");
    
    this.label = apogeeapp.ui.createElement("span"/*,{"className":"menu-head"}*/);
    this.label.innerHTML = label;
    this.element.appendChild(this.label);
    
    this.list = apogeeapp.ui.createElement("ul");
    this.element.appendChild(this.list);
}

apogeeapp.ui.Menu.prototype.getListEntry = function() {
    return this.element;
}

apogeeapp.ui.Menu.prototype.addMenuItem = function(menuItem) {
    this.list.appendChild(menuItem.getListEntry());
}