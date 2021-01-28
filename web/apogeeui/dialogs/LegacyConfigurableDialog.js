import apogeeutil from "/apogeeutil/apogeeUtilLib.js";
import {uiutil,dialogMgr} from "/apogeeui/apogeeUiLib.js";

/** This method shows a configurable dialog. The layout object
 * defines the form content for the dialog. The on submit
 * function is called when submit is pressed. The on submit function should
 * return true or false, indicating whether of not to close the dialog. */
export function showLegacyConfigurableDialog(layout,onSubmitFunction,optionalOnCancelFunction) {

    var dialog = dialogMgr.createDialog({"movable":true});
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
        dialogMgr.closeDialog(dialog);
    }
    //cancel
    formActions.onCancel = function() {
        if(optionalOnCancelFunction) optionalOnCancelFunction();
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
    
    //this will be used if we want to set the initial focus
    var initialFocusElement;

    var content = uiutil.createElement("div",{"className":"dialogBody"});
    for(var i = 0; i < layout.lines.length; i++) {
        var lineDef = layout.lines[i];
        
        //create line
        var lineObject = createLine(lineDef,formActions);
        lineObjects.push(lineObject);
        if(lineObject.element) { //no element for "invisible" entry, which is used to pass values along
            content.appendChild(lineObject.element);
        }
        if((lineDef.focus)&&(lineObject.focusElement)) {
            initialFocusElement = lineObject.focusElement;
        }
    }
    
    //show dialog
    dialog.setContent(content,uiutil.SIZE_WINDOW_TO_CONTENT);
    dialogMgr.showDialog(dialog);
    if(initialFocusElement) {
        initialFocusElement.focus();
    }
}
    
    
    
function createLine(lineDef,formActions) {
    var lineFunction = lineFunctions[lineDef.type];
    if(lineFunction) {
        return lineFunction(lineDef,formActions);
    }
    else {
        //print an error message
        apogeeUserAlert("Error: Unknown for element type: " + lineDef.type);
        return null;
    }
}

let lineFunctions = {
    //linedef.type = "title"
    //linedef.title = title
    "title": function(lineDef,formActions) {
        var lineObject = {};
        //create the element
        var line = uiutil.createElement("div",{"className":"dialogLine"});
        line.appendChild(uiutil.createElement("div",{"className":"dialogTitle","innerHTML":lineDef.title}));
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
        var line = uiutil.createElement("div",{"className":"dialogLine"});
        if(lineDef.heading) {
            line.appendChild(document.createTextNode(lineDef.heading));
        }
        var select = uiutil.createElement("select");
        lineObject.focusElement = select;
        for(var i = 0; i < lineDef.entries.length; i++) {
            var entry = lineDef.entries[i];
            let label, value;
            if(Array.isArray(entry)) {
                value = entry[0]
                label = entry[1];
            }
            else {
                value = entry;
                label = entry;   
            }
            select.add(uiutil.createElement("option",{"text":label, "value":value}));
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
        var line = uiutil.createElement("div",{"className":"dialogLine"});
        if(lineDef.heading) {
            line.appendChild(document.createTextNode(lineDef.heading));
        }
        var inputElement = uiutil.createElement("input",{"type":"text"});
        lineObject.focusElement = inputElement;
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
        var line = uiutil.createElement("div",{"className":"dialogLine"});
        if(lineDef.heading) {
            line.appendChild(document.createTextNode(lineDef.heading));
        }
        var checkbox = uiutil.createElement("input");
        checkbox.type = "checkbox";
        lineObject.focusElement = checkbox;
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
        var line = uiutil.createElement("div",{"className":"dialogLine"});
        if(lineDef.submit) {  
            line.appendChild(uiutil.createElement("button",
            {"className":"dialogButton","innerHTML":lineDef.submit,"onclick":formActions.onSubmit}));
        }
        if(lineDef.cancel) {
            line.appendChild(uiutil.createElement("button",
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
    
    