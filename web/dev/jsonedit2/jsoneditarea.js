
apogeeapp.jsonedit.JsonEditArea = function(divElement,initialValue,isEditable) {
    this.body = divElement;
	this.isEditable = isEditable;
	
	//undefined is not a valid json value and will screw things up
	if(initialValue === undefined) {
		initialValue = "";
	}
    
	this.valueEntry = new apogeeapp.jsonedit.ValueEntry(this,this,initialValue,this.isEditable);
    this.valueEntry.setExpanded(true);
 
	this.formatBody();
}

apogeeapp.jsonedit.JsonEditArea.prototype.setEditCallback = function(editCallback) {
	this.editCallback = editCallback;
}

apogeeapp.jsonedit.JsonEditArea.prototype.getCurrentValue = function() {
	return this.valueEntry.getCurrentValue();
}

apogeeapp.jsonedit.JsonEditArea.prototype.getElement = function() {
	return this.body;
}

apogeeapp.jsonedit.JsonEditArea.prototype.getParentValueObject = function() {
	return undefined;
}

apogeeapp.jsonedit.JsonEditArea.prototype.getIndentLevel = function() {
	return 0;
}

apogeeapp.jsonedit.JsonEditArea.prototype.formatBody = function() {
var test2 = document.createElement("div");
var mouseMenu = apogeeapp.ui.Menu.createMenuFromImage("http://localhost:8383/resources/hamburgerGray.png");
mouseMenu.setAsOnTheFlyMenu(() => this.getMenuItems());
test2.className = "indentCell";
test2.appendChild(mouseMenu.getElement());
this.body.appendChild(test2);  
    
    var elementList = this.valueEntry.getElementList();
    for(var i = 0; i < elementList.length; i++) {
        this.body.appendChild(elementList[i]);
    }
    
    this.loadContextMenu();
}


apogeeapp.jsonedit.JsonEditArea.prototype.loadContextMenu = function() {

    var element = this.body;
    var instance = this;
    
    element.oncontextmenu = function(event) {
        event.preventDefault();
        event.stopPropagation();
        
        var contextMenu = new apogeeapp.ui.MenuBody();
        var menuItems = instance.getMenuItems();
        contextMenu.setMenuItems(menuItems);
        apogeeapp.ui.Menu.showContextMenu(contextMenu,event);
    }
  
}

apogeeapp.jsonedit.JsonEditArea.prototype.getMenuItems = function() {
    
    var valueEntry = this.valueEntry;
    var valueType = valueEntry.getType();
    
    var menuItems = [];
    var addItem = (title,callback) => menuItems.push({"title":title,"callback":callback});
    
    addItem("Get Value",function() {alert(JSON.stringify(valueEntry.getCurrentValue()));});

    if(this.isEditable) {
        if(valueType == "value") {
            addItem("Convert To Object",function() {valueEntry.valueToObject()});
            addItem("Convert To Array",function() {valueEntry.valueToArray()});

              if(valueEntry.convertibleToNumber()) {
                addItem("Convert To Number",function() {valueEntry.valueToNonString()});
            }

            if(valueEntry.convertibleToBool()) {
                addItem("Convert To Boolean",function() {valueEntry.valueToNonString()});
            }

            if(valueEntry.convertibleToNull()) {
                addItem("Convert To Null",function() {valueEntry.valueToNonString()});
            }

            if(valueEntry.convertibleToString()) {
                addItem("Convert To String",function() {valueEntry.valueToString()});
            }
        }
        else if(valueType == "object") {
            addItem("Convert To Value",function() {valueEntry.convertToValue()});
            addItem("Convert To Array",function() {valueEntry.objectToArray()});
        }
        else if(valueType == "array") {
            addItem("Convert To Value",function() {valueEntry.convertToValue()});
            addItem("Convert To Object",function() {valueEntry.arrayToObject()});
        }
    }
    
    return menuItems;

}

apogeeapp.jsonedit.JsonEditArea.prototype.updateValueElements = function() {
    //remove all from element
	apogeeapp.ui.removeAllChildren(this.body);
    //recreate
    this.formatBody();
}

/** This methd is called internally when an edit takes place in the edit are. 
 * @private */
apogeeapp.jsonedit.JsonEditArea.prototype.valueEdited = function() {
    if(this.editCallback) {
        this.editCallback();
    }
}




