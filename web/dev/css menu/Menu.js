visicomp.visiui.Menu = function(label) {
    this.element = visicomp.visiui.createElement("li");
    
    this.label = visicomp.visiui.createElement("span"/*,{"className":"menu-head"}*/);
    this.label.innerHTML = label;
    this.element.appendChild(this.label);
    
    this.list = visicomp.visiui.createElement("ul");
    this.element.appendChild(this.list);
}

visicomp.visiui.Menu.prototype.getListEntry = function() {
    return this.element;
}

visicomp.visiui.Menu.prototype.addMenuItem = function(menuItem) {
    this.list.appendChild(menuItem.getListEntry());
}