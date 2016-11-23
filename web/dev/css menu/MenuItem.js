haxapp.ui.MenuItem = function(label,action) {
    this.element = haxapp.ui.createElement("li");
    this.label = haxapp.ui.createElement("span"/*,{"className":"menu-head"}*/);
    this.label.innerHTML = label;
    this.label.onclick = action;
    this.element.appendChild(this.label);
}

haxapp.ui.MenuItem.prototype.getListEntry = function() {
    return this.element;
}
