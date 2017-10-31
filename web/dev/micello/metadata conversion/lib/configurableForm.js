(function() {

/** This is a simple custom resource component example. */
apogeeapp.app.ConfigurableForm = function(workspaceUI,control,generator,componentJson) {
    apogeeapp.app.BasicControlComponent.call(this,workspaceUI,control,generator,componentJson);
};

apogeeapp.app.ConfigurableForm.prototype = Object.create(apogeeapp.app.BasicControlComponent.prototype);
apogeeapp.app.ConfigurableForm.prototype.constructor = apogeeapp.app.ConfigurableForm;

/** Implement the method to get the data display. JsDataDisplay is an 
 * easily configurable data display. */
apogeeapp.app.ConfigurableForm.prototype.getDataDisplay = function(viewMode) {
    return new apogeeapp.app.ConfigurableFormDisplay(viewMode);
}

/** Extend ths JsDataDisplay */
apogeeapp.app.ConfigurableFormDisplay = function(viewMode) {
    //extend edit component
    apogeeapp.app.JsDataDisplay.call(this,viewMode);
    
    //dummy initial view
    this.previousSetView = null;
}

apogeeapp.app.ConfigurableFormDisplay.prototype = Object.create(apogeeapp.app.JsDataDisplay.prototype);
apogeeapp.app.ConfigurableFormDisplay.prototype.constructor = apogeeapp.app.ConfigurableFormDisplay;


apogeeapp.app.ConfigurableFormDisplay.prototype.showData = function(data) {
    this.data = data;
    //load or reload form
    this.loadForm();
}
        
apogeeapp.app.ConfigurableFormDisplay.prototype.onLoad = function() {
    this.containerLoaded = true;
    if((this.data)&&(!this.form)) {
       this.loadForm(); 
    }
}

//-----------------
//create a component generator
//-----------------
apogeeapp.app.ConfigurableForm.generator = apogeeapp.app.BasicControlComponent.createGenerator(
        "ConfigurableForm",
        "apogeeapp.app.ConfigurableForm",
        apogeeapp.app.ConfigurableForm);

//-----------------
//auto registration
//-----------------
if(registerComponent) {
    registerComponent(apogeeapp.app.ConfigurableForm.generator);
}

//====================================================
// Form Generator Code
//====================================================


apogeeapp.app.ConfigurableFormDisplay.prototype.loadForm = function() {
    
    try {
        var layout = this.data.layout;

        //make sure valid data has been set
        if(!layout) return;

        var onSubmit = this.data.onSubmit;
        var onCancel = this.data.onCancel;

        var lineObjects = [];

        //this is the action for the form
        var formActions = {};

        //cancel
        formActions.onCancel = function() {
            try {
                onCancel();
            }
            catch(error) {
                var message = error.message ? error.message : "unknown error";
                alert("Error canceling form: " + message)
            }
        }
        //submit
        formActions.onSubmit = function() {
            try {
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
                onSubmit(formData);
            }
            catch(error) {
                var message = error.message ? error.message : "unknown error";
                alert("Error submitting form: " + message)
            }
        }

        var content = document.createElement("div");
        content.style.position = "absolute";
        content.style.top = "0px";
        content.style.left = "0px";
        content.style.bottom = "0px";
        content.style.right = "0px";

        for(var i = 0; i < layout.lines.length; i++) {
            var lineDef = layout.lines[i];

            //create line
            var lineObject = createLine(lineDef,formActions);
            lineObjects.push(lineObject);
            if(lineObject.element) { //no element for "invisible" entry, which is used to pass values along
                content.appendChild(lineObject.element);
            }
        }

        var outputElement = this.getElement();
        apogeeapp.ui.removeAllChildren(outputElement);
        outputElement.appendChild(content);

        this.form = formActions;
    }
    catch(error) {
        var message = error.message ? error.message : "unknown error";
        alert("Error loading form: " + message)
    }
}

//====================================================
// Form Code pulled from Apogee configurable dialog
//====================================================

var createLine = function(lineDef,formActions) {
    var lineFunction = lineFunctions[lineDef.type];
    if(lineFunction) {
        return lineFunction(lineDef,formActions);
    }
    else {
        //print an error message
        alert("Error: Unknown for element type: " + lineDef.type);
        return null;
    }
}

var lineFunctions = {
    //linedef.type = "title"
    //linedef.title = title
    "title": function(lineDef,formActions) {
        var lineObject = {};
        //create the element
        var line = apogeeapp.ui.createElement("div",{"className":"apogee_configurableFormLine"});
        line.appendChild(apogeeapp.ui.createElement("div",{"className":"apogee_configurableFormTitle","innerHTML":lineDef.title}));
        lineObject.element = line;
        
        //no addToResult or onClose
        
        return lineObject;
    },
    
    //lineDef.type = "radioButton"
    //lineDef.heading = radio button group heading (optional)
    //lineDef.groupName = the group name for the radio button group
    //lineDef.entries = list of either (a) string pairs [title,value] or (b) string title/value - for entries in radio button group
    //lineDef.initial = value of initial selection (optional)
    //lineDef.resultKey = name of result in result data 
    "radioButton": function(lineDef,formActions) {
        var lineObject = {};
        //create the element
        var line = apogeeapp.ui.createElement("div",{"className":"apogee_configurableFormLine"});
        if(lineDef.heading) {
            line.appendChild(document.createTextNode(lineDef.heading));
            line.appendChild(document.createElement("br"));
        }
        var groupName = lineDef.groupName;
        var buttonList = [];
        var addButton = buttonInfo => {
            var radio = apogeeapp.ui.createElement("input");
            radio.type = "radio";
            radio.name = groupName;
            
            var label;
            var value;
            if(apogee.util.getObjectType(buttonInfo) == "Array") {
                label = buttonInfo[0]
                value = buttonInfo[1];
            }
            else {
                label = buttonInfo;
                value = buttonInfo;   
            }
            radio.value = value
            if(lineDef.initial == buttonInfo[0]) radio.checked = true;
            buttonList.push(radio);
            line.appendChild(radio);
            line.appendChild(document.createTextNode(label));
            line.appendChild(document.createElement("br"));
            
            if(lineDef.disabled) radio.disabled = true;
        };
        lineDef.entries.forEach(addButton);
        lineObject.element = line;
        //get result
        lineObject.addToResult = function(formData) {
            var checkedRadio = buttonList.find(radio => radio.checked);
            if(checkedRadio) {
                formData[lineDef.resultKey] = checkedRadio.value;
            }
        }
        //no on Close
        
        return lineObject;
    },
    
    //lineDef.type = "dropdown"
    //lineDef.heading = dropdown heading (optional)
    //lineDef.entries = list of strings (or values) in dropdown
    //lineDef.entries = list of either (a) string pairs [title,value] or (b) string title/value - for entries in dropdown
    //lineDef.initial = value of initial selection (optional)
    //lineDef.resultKey = name of result in result data
    "dropdown": function(lineDef,formActions) {
        var lineObject = {};
        //create the element
        var line = apogeeapp.ui.createElement("div",{"className":"apogee_configurableFormLine"});
        if(lineDef.heading) {
            line.appendChild(document.createTextNode(lineDef.heading));
        }
        var select = apogeeapp.ui.createElement("select");
        var addEntry = entryInfo => {
            var label;
            var value;
            if(apogee.util.getObjectType(entryInfo) == "Array") {
                label = entryInfo[0]
                value = entryInfo[1];
            }
            else {
                label = entryInfo;
                value = entryInfo;   
            }
            var entry = document.createElement("option");
            entry.text = label;
            entry.value = value;
            select.appendChild(entry);
        }
        lineDef.entries.forEach(addEntry);
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
        var line = apogeeapp.ui.createElement("div",{"className":"apogee_configurableFormLine"});
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
    
    //lineDef.type = "textarea",
    //lineDef.cols = (optional)
    //lineDef.rows = (optional)
    //lineDef.heading = element heading (optional)
    //lineDef.resultKey = name of result in result data
    "textarea": function(lineDef,formActions) {
        var lineObject = {};
        //create the element
        var line = apogeeapp.ui.createElement("div",{"className":"apogee_configurableFormLine"});
        if(lineDef.heading) {
            line.appendChild(document.createTextNode(lineDef.heading));
            line.appendChild(document.createElement("br"));
        }
        var textarea = apogeeapp.ui.createElement("textarea");
        if(lineDef.initial) {
            textarea.value = lineDef.initial;
        }
        if(lineDef.disabled) {
            textarea.disabled = true;
        }
        if(lineDef.rows) {
            textarea.rows = lineDef.rows;
        }
        if(lineDef.cols) {
            textarea.cols = lineDef.cols;
        }
        line.appendChild(textarea);
        lineObject.element = line;
        //get result
        lineObject.addToResult = function(formData) {
            var result = textarea.value.trim();
            formData[lineDef.resultKey] = result;
        }
        //no on Close
        
        return lineObject;
    },
    
    "aceEditor": function(lineDef,formActions) {
        
    },
    
    "checkbox": function(lineDef,formActions) {
        var lineObject = {};
        //create the element
        var line = apogeeapp.ui.createElement("div",{"className":"apogee_configurableFormLine"});
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
        var line = apogeeapp.ui.createElement("div",{"className":"apogee_configurableFormLine"});
        if(lineDef.submit) {  
            line.appendChild(apogeeapp.ui.createElement("button",
            {"className":"apogee_configurableFormButton","innerHTML":lineDef.submit,"onclick":formActions.onSubmit}));
        }
        if(lineDef.cancel) {
            line.appendChild(apogeeapp.ui.createElement("button",
            {"className":"apogee_configurableFormButton","innerHTML":lineDef.cancel,"onclick":formActions.onCancel}));
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
}
)();
