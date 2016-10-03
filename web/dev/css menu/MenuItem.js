hax.visiui.MenuItem = function(label,action) {
    this.element = hax.visiui.createElement("li");
    this.label = hax.visiui.createElement("span"/*,{"className":"menu-head"}*/);
    this.label.innerHTML = label;
    this.label.onclick = action;
    this.element.appendChild(this.label);
}

hax.visiui.MenuItem.prototype.getListEntry = function() {
    return this.element;
}
