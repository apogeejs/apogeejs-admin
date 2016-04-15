/** This method shows a configurable dialog. The layout object
 * defines the form content for the dialog. The on submit
 * function is called when submit is pressed. The on submit function should
 * return true or false, indicating whether of not to close the dialog. */
visicomp.app.visiui.dialog.showConfigurableDialog = function(layout,onSubmitFunction) {

    var dialogParent = visicomp.visiui.getDialogParent();
    var dialog = new visicomp.visiui.WindowFrame(dialogParent,{"movable":true});
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
        dialog.hide();
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
    
    var content = visicomp.visiui.createElement("div",{"className":"dialogBody"});
    for(var i = 0; i < layout.lines.length; i++) {
        var lineDef = layout.lines[i];
        
        //create line
        var lineObject = visicomp.app.visiui.dialog.showConfigurableDialog.createLine(lineDef,formActions);
        lineObjects.push(lineObject);
        content.appendChild(lineObject.element);
    }
    
    //show dialog
    dialog.setContent(content);
    dialog.show();
    var coords = dialogParent.getCenterOnPagePosition(dialog);
    dialog.setPosition(coords[0],coords[1]);
}
    
    
    
visicomp.app.visiui.dialog.showConfigurableDialog.createLine = function(lineDef,formActions) {
    var lineFunction = visicomp.app.visiui.dialog.showConfigurableDialog.lineFunctions[lineDef.type];
    if(lineFunction) {
        return lineFunction(lineDef,formActions);
    }
    else {
        //print an error message
        alert("Error: Unknown for element type: " + lineDef.type);
        return null;
    }
}

visicomp.app.visiui.dialog.showConfigurableDialog.lineFunctions = {
    //linedef.type = "title"
    //linedef.title = title
    "title": function(lineDef,formActions) {
        var lineObject = {};
        //create the element
        var line = visicomp.visiui.createElement("div",{"className":"dialogLine"});
        line.appendChild(visicomp.visiui.createElement("div",{"className":"dialogTitle","innerHTML":lineDef.title}));
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
        var line = visicomp.visiui.createElement("div",{"className":"dialogLine"});
        if(lineDef.heading) {
            line.appendChild(document.createTextNode(lineDef.heading));
        }
        var select = visicomp.visiui.createElement("select");
        line.appendChild(select);
        for(var i = 0; i < lineDef.entries.length; i++) {
            var entry = lineDef.entries[i];
            select.add(visicomp.visiui.createElement("option",{"text":entry}));
            if(lineDef.initial === i) {
                select.value = entry;
            }
        }
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
        var line = visicomp.visiui.createElement("div",{"className":"dialogLine"});
        if(lineDef.heading) {
            line.appendChild(document.createTextNode(lineDef.heading));
        }
        var inputElement = visicomp.visiui.createElement("input",{"type":"text"});
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
        
    },
    
    //lineDef.type = "submit"
    //lineDef.submit = name of submit button (optional)
    //lineDef.cancel = name of cancel button (optional)
    "submit": function(lineDef,formActions) {
        var lineObject = {};
        //create the element
        var line = visicomp.visiui.createElement("div",{"className":"dialogLine"});
        if(lineDef.submit) {  
            line.appendChild(visicomp.visiui.createElement("button",
            {"className":"dialogButton","innerHTML":lineDef.submit,"onclick":formActions.onSubmit}));
        }
        if(lineDef.cancel) {
            line.appendChild(visicomp.visiui.createElement("button",
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
    }
    
}
    
    