/** This is similar to the edit field except it is not editable.
 */
function FixedField(value,className) {
    this.value = value;
    this.element = document.createElement("div");
    this.element.className = className;
    this.element.innerHTML = value;
}

FixedField.prototype.getValue= function() {
    return this.value;
}

FixedField.prototype.setValue = function(value) {
    this.value = value;
    this.element.innerHTML = value;
}

FixedField.prototype.getElement = function() {
    return this.element;
}


