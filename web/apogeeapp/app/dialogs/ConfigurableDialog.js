/** This method shows a configurable dialog. The layout object
 * defines the form content for the dialog. The on submit
 * function is called when submit is pressed. The on submit function should
 * return true or false, indicating whether of not to close the dialog. */
apogeeapp.app.dialog.showConfigurableDialog = function(layout,onSubmitFunction) {

    var dialog = apogeeapp.ui.createDialog({"movable":true});
    var lineObjects = [];
    
    //this is the action for the form
    var formActions = {};
    //close form, in case actions needed
    formActions.onClose = function() {
        for(var i = 0; i < lineObjects.length; i++) {
            lineObject = lineObjects[i];
            if(lineObject.onClose) {
                lineObject.onClose();
            }
        }
        apogeeapp.ui.closeDialog(dialog);
    }
    //cancel
    formActions.onCancel = function() {
        formActions.onClose();
    }
    //submit
    formActions.onSubmit = function() {
        //load the form data
        var formData = {};
        var lineObject;
        for(var i = 0; i < lineObjects.length; i++) {
            lineObject = lineObjects[i];
            if(lineObject.addToResult) {
                lineObject.addToResult(formData);
            }
        }
        //submit data
        var closeDialog = onSubmitFunction(formData);
        if(closeDialog) {
            formActions.onClose();
        }
    }
    
    var content = apogeeapp.ui.createElement("div",{"className":"dialogBody"});
    for(var i = 0; i < layout.lines.length; i++) {
        var lineDef = layout.lines[i];
        
        //create line
        var lineObject = apogeeapp.app.dialog.showConfigurableDialog.createLine(lineDef,formActions);
        lineObjects.push(lineObject);
        if(lineObject.element) { //no element for "invisible" entry, which is used to pass values along
            content.appendChild(lineObject.element);
        }
    }
    
    //show dialog
    dialog.setContent(content);
    dialog.show();
    
    //size the dialog to the content
    dialog.fitToContent();
    dialog.centerInParent();
}
    
    
    
apogeeapp.app.dialog.showConfigurableDialog.createLine = function(lineDef,formActions) {
    var lineFunction = apogeeapp.app.dialog.showConfigurableDialog.lineFunctions[lineDef.type];
    if(lineFunction) {
        return lineFunction(lineDef,formActions);
    }
    else {
        //print an error message
        alert("Error: Unknown for element type: " + lineDef.type);
        return null;
    }
}

apogeeapp.app.dialog.showConfigurableDialog.lineFunctions = {
    //linedef.type = "title"
    //linedef.title = title
    "title": function(lineDef,formActions) {
        var lineObject = {};
        //create the element
        var line = apogeeapp.ui.createElement("div",{"className":"dialogLine"});
        line.appendChild(apogeeapp.ui.createElement("div",{"className":"dialogTitle","innerHTML":lineDef.title}));
        lineObject.element = line;
        
        //no addToResult or onClose
        
        return lineObject;
    },
    
    //lineDef.type = "dropdown"
    //lineDef.heading = dropdown heading (optional)
    //lineDef.entries = list of strings (or values) in dropdown
    //lineDef.initial = index of initial selection (optional)
    //lineDef.resultKey = name of result in result data
    "dropdown": function(lineDef,formActions) {
        var lineObject = {};
        //create the element
        var line = apogeeapp.ui.createElement("div",{"className":"dialogLine"});
        if(lineDef.heading) {
            line.appendChild(document.createTextNode(lineDef.heading));
        }
        var select = apogeeapp.ui.createElement("select");
        for(var i = 0; i < lineDef.entries.length; i++) {
            var entry = lineDef.entries[i];
            select.add(apogeeapp.ui.createElement("option",{"text":entry}));
        }
        if(lineDef.initial) {
            select.value = lineDef.initial;
        }
        if(lineDef.disabled) {
            select.disabled = true;
        }
        line.appendChild(select);
        lineObject.element = line;
        //get result
        lineObject.addToResult = function(formData) {
            var result = select.value;
            formData[lineDef.resultKey] = result;
        }
        //no on Close
        
        return lineObject;
    },
    
    //lineDef.type = "inputElement"
    //lineDef.heading = element heading (optional)
    //lineDef.resultKey = name of result in result data
    "inputElement": function(lineDef,formActions) {
        var lineObject = {};
        //create the element
        var line = apogeeapp.ui.createElement("div",{"className":"dialogLine"});
        if(lineDef.heading) {
            line.appendChild(document.createTextNode(lineDef.heading));
        }
        var inputElement = apogeeapp.ui.createElement("input",{"type":"text"});
        if(lineDef.initial) {
            inputElement.value = lineDef.initial;
        }
        if(lineDef.disabled) {
            inputElement.disabled = true;
        }
        line.appendChild(inputElement);
        lineObject.element = line;
        //get result
        lineObject.addToResult = function(formData) {
            var result = inputElement.value.trim();
            formData[lineDef.resultKey] = result;
        }
        //no on Close
        
        return lineObject;
    },
    
    "aceEditor": function(lineDef,formActions) {
        
    },
    
    "radioButton": function(lineDef,formActions) {
        //implement!
    },
    
    "checkbox": function(lineDef,formActions) {
        var lineObject = {};
        //create the element
        var line = apogeeapp.ui.createElement("div",{"className":"dialogLine"});
        if(lineDef.heading) {
            line.appendChild(document.createTextNode(lineDef.heading));
        }
        var checkbox = apogeeapp.ui.createElement("input");
        checkbox.type = "checkbox";
        if(lineDef.name) {
            checkbox.name = lineDef.name;
        }
        if(lineDef.value) {
            checkbox.value = lineDef.value;
        }
        if(lineDef.initial) {
            checkbox.checked = true;
        }
        line.appendChild(checkbox);
        lineObject.element = line;
        //get result
        lineObject.addToResult = function(formData) {
            var result = checkbox.checked;
            formData[lineDef.resultKey] = result;
        }
        //no on Close
        
        return lineObject;
    },
    
    //lineDef.type = "submit"
    //lineDef.submit = name of submit button (optional)
    //lineDef.cancel = name of cancel button (optional)
    "submit": function(lineDef,formActions) {
        var lineObject = {};
        //create the element
        var line = apogeeapp.ui.createElement("div",{"className":"dialogLine"});
        if(lineDef.submit) {  
            line.appendChild(apogeeapp.ui.createElement("button",
            {"className":"dialogButton","innerHTML":lineDef.submit,"onclick":formActions.onSubmit}));
        }
        if(lineDef.cancel) {
            line.appendChild(apogeeapp.ui.createElement("button",
            {"className":"dialogButton","innerHTML":lineDef.cancel,"onclick":formActions.onCancel}));
        }
        lineObject.element = line;
        //no add to result or on close
        return lineObject;
    },
    
    //This allows the user to input a custom element
    //lineDef.type = "custom"
    //lineDef.createLineObject(formActions) - returns lineObject
    "custom": function(lineDef,formActions) {
        return lineDef.createLineObject(formActions);
    },
    
    //lineDef.type = "invisible"
    //lineDef.intial = value for this element (optional)
    //lineDef.resultKey = name of result in result data
    "invisible": function(lineDef,formActions) {
        var lineObject = {};
        //create the empty element
        lineObject.element = null;
        //get result
        lineObject.addToResult = function(formData) {
            
            formData[lineDef.resultKey] = lineDef.initial;
        }
        //no on Close
        
        return lineObject;
    }
    
    
}
    
    