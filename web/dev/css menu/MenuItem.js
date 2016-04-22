visicomp.visiui.MenuItem = function(label,action) {
    this.element = visicomp.visiui.createElement("li");
    this.label = visicomp.visiui.createElement("span"/*,{"className":"menu-head"}*/);
    this.label.innerHTML = label;
    this.label.onclick = action;
    this.element.appendChild(this.label);
}

visicomp.visiui.MenuItem.prototype.getListEntry = function() {
    return this.element;
}
