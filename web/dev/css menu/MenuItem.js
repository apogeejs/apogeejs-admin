apogeeapp.ui.MenuItem = function(label,action) {
    this.element = apogeeapp.ui.createElement("li");
    this.label = apogeeapp.ui.createElement("span"/*,{"className":"menu-head"}*/);
    this.label.innerHTML = label;
    this.label.onclick = action;
    this.element.appendChild(this.label);
}

apogeeapp.ui.MenuItem.prototype.getListEntry = function() {
    return this.element;
}
