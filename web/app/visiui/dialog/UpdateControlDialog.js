/** This method shows an update control dialog. The argument onSaveData si the same
 * arguments as the updateFunction event handler data. */
visicomp.app.visiui.dialog.showUpdateControlDialog = function(controlObject,onSaveFunction) {
    
    var dialog = new visicomp.visiui.Dialog("Dialog",
            {"minimizable":true,"maximizable":true,"movable":true,"resizable":true});
            
    //create body
    var content = visicomp.visiui.createElement("div",{"className":"dialogBody"}); 
    
    var line;
    
    //title
    line = visicomp.visiui.createElement("div",{"className":"dialogLine"});
    line.appendChild(visicomp.visiui.createElement("div",{"className":"dialogTitle","innerHTML":"Update Control"}));
    content.appendChild(line);
        
    //editor selector
    line = visicomp.visiui.createElement("div",{"className":"dialogLine"}); 
    var formulaRadio = visicomp.visiui.createElement("input",{"type":"radio","name":"dataFormula","value":"formula"});
    line.appendChild(formulaRadio);
    line.appendChild(document.createTextNode("Formula"));
    var supplementalRadio = visicomp.visiui.createElement("input",{"type":"radio","name":"dataFormula","value":"supplemental"});
    line.appendChild(supplementalRadio);
    line.appendChild(document.createTextNode("Supplemental Code"));
    content.appendChild(line);
    
    //editors
    line = visicomp.visiui.createElement("div",{"className":"dialogLine"});
    var editorDiv = visicomp.visiui.createElement("div",null,
        {
            "position":"relative",
            "width":"500px",
            "height":"300px",
            "border":"1px solid darkgray"
        });
    line.appendChild(editorDiv);
    content.appendChild(line);
        
    //create editor containers - will be hiddedn and shown
    var formulaEditorDiv = visicomp.visiui.createElement("div",null,{
        "position":"absolute",
        "top":"0px",
        "bottom":"0px",
        "right":"0px",
        "left":"0px"
    });
    var formulaEditor = null;
    editorDiv.appendChild(formulaEditorDiv);
    
    var supplementalEditorDiv = visicomp.visiui.createElement("div",null,{
        "position":"absolute",
        "top":"0px",
        "bottom":"0px",
        "right":"0px",
        "left":"0px"
    });
    var supplementalEditor = null;
    editorDiv.appendChild(supplementalEditorDiv);
    
    //save and cancel buttons
    //buttons and handler
    line = visicomp.visiui.createElement("div",{"className":"dialogLine"});
    var onCancel = function() {
        dialog.hide();
    }
    
    var onSave = function() {
		var functionBody;
		var supplementalCode;
			
        if(formulaEditor) {
            functionBody = formulaEditor.getSession().getValue().trim();
		}
		else {
			functionBody = controlObject.getFunctionBody();
		}
		
		if(supplementalEditor) {
            supplementalCode = supplementalEditor.getSession().getValue().trim();
		}
		else {
			supplementalCode = controlObject.getSupplementalCode();
		}
        
        var result = onSaveFunction(controlObject,functionBody,supplementalCode);
        
        if(result.success) {
			dialog.hide();
        }
        else {
            alert("There was an error updating the function: " + result.msg);
		}
    }
    
    line.appendChild(visicomp.visiui.createElement("button",{"className":"dialogButton","innerHTML":"Cancel","onclick":onCancel}));
    line.appendChild(visicomp.visiui.createElement("button",{"className":"dialogButton","innerHTML":"Save","onclick":onSave}));
    content.appendChild(line);
    
    //show the dialog
    dialog.setContent(content);
    dialog.setZIndex(100);
    dialog.show();
    dialog.centerOnPage(); 
    
    //populate data and add handlers for radio buttons
    //populate dialog    
    var showFormulaFunction = function() {
        //hide the data div and show the formula dive
        formulaEditorDiv.style.display = "";
        supplementalEditorDiv.style.display = "none";
        
        //create formula editor if needed
        if(!formulaEditor) {
            //initialize editor
            formulaEditor = ace.edit(formulaEditorDiv);
            formulaEditor.setTheme("ace/theme/eclipse");
            formulaEditor.getSession().setMode("ace/mode/javascript");
            //set the formula
            var functionBody = controlObject.getFunctionBody();
            if(functionBody) {
                formulaEditor.getSession().setValue(functionBody);
            }
        }
    }
    
    var showSupplementalFunction = function() {
        //hide the data div and show the formula dive
        formulaEditorDiv.style.display = "none";
        supplementalEditorDiv.style.display = "";
        
        //create formula editor if needed
        if(!supplementalEditor) {
            //initialize editor
            supplementalEditor = ace.edit(supplementalEditorDiv);
            supplementalEditor.setTheme("ace/theme/eclipse");
            supplementalEditor.getSession().setMode("ace/mode/javascript");
            //set the formula
            var supplementalCode = controlObject.getSupplementalCode();
            if(supplementalCode) {
                supplementalEditor.getSession().setValue(supplementalCode);
            }
        }
    }
    
    //initilialize radio buttons
    formulaRadio.checked = true;
    showFormulaFunction();
    
    //radio change handler
    var onRadioChange = function() {
        if(formulaRadio.checked) {
            showFormulaFunction();
        }
        else if(supplementalRadio.checked) {
            showSupplementalFunction();
        }
    }
    
    formulaRadio.onchange = onRadioChange;
    supplementalRadio.onchange = onRadioChange;
    
    //set the resize handler
    //resize the editor on window size change
    var resizeCallback = function() {
        //this needs to be fixed
        var container = content.parentElement;
        //this is kind of cludgy, I am using this as the last line and assuming it has even margins
        var margin = line.offsetLeft;
        var endPosition = line.offsetTop + line.offsetHeight + margin;
        var totalWidth = container.clientWidth - 2 * margin;
        var extraHeight = container.clientHeight - endPosition;
        //size the editor, with some arbitrary padding
        editorDiv.style.width = (totalWidth - 5) + "px";
        editorDiv.style.height = (editorDiv.offsetHeight + extraHeight - 5) + "px";
        
        if(formulaEditor) formulaEditor.resize();
        if(supplementalEditor) supplementalEditor.resize();
    }
    dialog.addListener("resize", resizeCallback);
}


//
//
//
///** This method shows an update control dialog. The argument onSaveData si the same
// * arguments as the updateControl event handler html. */
//visicomp.app.visiui.dialog.showUpdateControlDialog = function(control,onSaveFunction) {
//    
//    var dialog = new visicomp.visiui.Dialog("Dialog",
//            {"minimizable":true,"maximizable":true,"movable":true,"resizable":true});
//            
//    //create body
//    var content = visicomp.visiui.createElement("div",{"className":"dialogBody"}); 
//    
//    var line;
//    
//    //title
//    line = visicomp.visiui.createElement("div",{"className":"dialogLine"});
//    line.appendChild(visicomp.visiui.createElement("div",{"className":"dialogTitle","innerHTML":"Update Control"}));
//    content.appendChild(line);
//        
//    //editor selector
//    line = visicomp.visiui.createElement("div",{"className":"dialogLine"}); 
//    var htmlRadio = visicomp.visiui.createElement("input",{"type":"radio","name":"controlContent","value":"html"});
//    line.appendChild(htmlRadio);
//    line.appendChild(document.createTextNode("HTML"));
//    var onLoadRadio = visicomp.visiui.createElement("input",{"type":"radio","name":"controlContent","value":"onLoad"});
//    line.appendChild(onLoadRadio);
//    line.appendChild(document.createTextNode("OnLoad"));
//    var supplementalRadio = visicomp.visiui.createElement("input",{"type":"radio","name":"controlContent","value":"supplemental"});
//    line.appendChild(supplementalRadio);
//    line.appendChild(document.createTextNode("Supplemental Code"));
//    var cssRadio = visicomp.visiui.createElement("input",{"type":"radio","name":"controlContent","value":"css"});
//    line.appendChild(cssRadio);
//    line.appendChild(document.createTextNode("CSS"));
//    content.appendChild(line);
//    
//    //editors
//    line = visicomp.visiui.createElement("div",{"className":"dialogLine"});
//    var editorDiv = visicomp.visiui.createElement("div",null,
//        {
//            "position":"relative",
//            "width":"500px",
//            "height":"300px",
//            "border":"1px solid darkgray"
//        });
//    line.appendChild(editorDiv);
//    content.appendChild(line);
//        
//    //create editor containers - will be hiddedn and shown
//    var htmlEditorDiv = visicomp.visiui.createElement("div",null,{
//        "position":"absolute",
//        "top":"0px",
//        "bottom":"0px",
//        "right":"0px",
//        "left":"0px"
//    });
//    var htmlEditor = null;
//    editorDiv.appendChild(htmlEditorDiv);
//    
//    var onLoadEditorDiv = visicomp.visiui.createElement("div",null,{
//        "position":"absolute",
//        "top":"0px",
//        "bottom":"0px",
//        "right":"0px",
//        "left":"0px"
//    });
//    var onLoadEditor = null;
//    editorDiv.appendChild(onLoadEditorDiv);
//    
//    var supplementalEditorDiv = visicomp.visiui.createElement("div",null,{
//        "position":"absolute",
//        "top":"0px",
//        "bottom":"0px",
//        "right":"0px",
//        "left":"0px"
//    });
//    var supplementalEditor = null;
//    editorDiv.appendChild(supplementalEditorDiv);
//    
//    var cssEditorDiv = visicomp.visiui.createElement("div",null,{
//        "position":"absolute",
//        "top":"0px",
//        "bottom":"0px",
//        "right":"0px",
//        "left":"0px"
//    });
//    var cssEditor = null;
//    editorDiv.appendChild(cssEditorDiv);
//    
//    //save and cancel buttons
//    //buttons and handler
//    line = visicomp.visiui.createElement("div",{"className":"dialogLine"});
//    var onCancel = function() {
//        dialog.hide();
//    }
//    
//    var onSave = function() {
//		var controlHtml;
//		var controlOnLoad;
//		var supplementalCode;
//        var css;
//        
//		if(htmlEditor) {
//            controlHtml = htmlEditor.getSession().getValue();
//        }
//		else {
//			controlHtml = control.getHtml();
//		}
//			
//        if(onLoadEditor) {
//            controlOnLoad = onLoadEditor.getSession().getValue().trim();
//		}
//		else {
//			controlOnLoad = control.getOnLoadBody();
//		}
//		
//		if(supplementalEditor) {
//            supplementalCode = supplementalEditor.getSession().getValue().trim();
//		}
//		else {
//			supplementalCode = control.getSupplementalCode();
//		}
//        
//        if(cssEditor) {
//            css = cssEditor.getSession().getValue().trim();
//		}
//		else {
//			css = control.getCss();
//		}
//        
//        var result = onSaveFunction(control,controlHtml,controlOnLoad,supplementalCode,css);
//        
//        if(result.success) {
//			dialog.hide();
//        }
//        else {
//            alert("There was an error updating the control: " + result.msg);
//            
//            //if this was a code error, rethrow it so the standard browser debug handler can handle it
//            var error = result.error;
//            if((error)&&(error.type == "CalculationError")) {
//                var baseError = error.baseError;
//                if(baseError) throw baseError;
//            }
//        }
//    }
//    
//    line.appendChild(visicomp.visiui.createElement("button",{"className":"dialogButton","innerHTML":"Cancel","onclick":onCancel}));
//    line.appendChild(visicomp.visiui.createElement("button",{"className":"dialogButton","innerHTML":"Save","onclick":onSave}));
//    content.appendChild(line);
//    
//    //show the dialog
//    dialog.setContent(content);
//    dialog.setZIndex(100);
//    dialog.show();
//    dialog.centerOnPage(); 
//    
//    //populate html and add handlers for radio buttons
//    //populate dialog
//    var showHtmlFunction = function() {
//        //hide the onLoad div and show the html dive
//        htmlEditorDiv.style.display = "";
//        onLoadEditorDiv.style.display = "none";
//        supplementalEditorDiv.style.display = "none";
//        cssEditorDiv.style.display = "none";
//        
//        //create html editor if needed
//        if(!htmlEditor) {
//            htmlEditor = ace.edit(htmlEditorDiv);
//            htmlEditor.setTheme("ace/theme/eclipse");
//            htmlEditor.getSession().setMode("ace/mode/html");
//            //set the value
//            var html = control.getHtml();
//            htmlEditor.getSession().setValue(html);
//        }
//    }
//    
//    var showOnLoadFunction = function() {
//        //hide the html div and show the onLoad dive
//        htmlEditorDiv.style.display = "none";
//        onLoadEditorDiv.style.display = "";
//        supplementalEditorDiv.style.display = "none";
//        cssEditorDiv.style.display = "none";
//        
//        //create onLoad editor if needed
//        if(!onLoadEditor) {
//            //initialize editor
//            onLoadEditor = ace.edit(onLoadEditorDiv);
//            onLoadEditor.setTheme("ace/theme/eclipse");
//            onLoadEditor.getSession().setMode("ace/mode/javascript");
//            //set the onLoad
//            var onLoadBody = control.getOnLoadBody();
//            if(onLoadBody) {
//                onLoadEditor.getSession().setValue(onLoadBody);
//            }
//        }
//    }
//    
//    var showSupplementalFunction = function() {
//        //hide the html div and show the onLoad dive
//        htmlEditorDiv.style.display = "none";
//        onLoadEditorDiv.style.display = "none";
//        supplementalEditorDiv.style.display = "";
//        cssEditorDiv.style.display = "none";
//        
//        //create onLoad editor if needed
//        if(!supplementalEditor) {
//            //initialize editor
//            supplementalEditor = ace.edit(supplementalEditorDiv);
//            supplementalEditor.setTheme("ace/theme/eclipse");
//            supplementalEditor.getSession().setMode("ace/mode/javascript");
//            //set the onLoad
//            var supplementalCode = control.getSupplementalCode();
//            if(supplementalCode) {
//                supplementalEditor.getSession().setValue(supplementalCode);
//            }
//        }
//    }
//    
//    var showCssFunction = function() {
//        //hide the onLoad div and show the html dive
//        htmlEditorDiv.style.display = "none";
//        onLoadEditorDiv.style.display = "none";
//        supplementalEditorDiv.style.display = "none";
//        cssEditorDiv.style.display = "";
//        
//        //create html editor if needed
//        if(!cssEditor) {
//            cssEditor = ace.edit(cssEditorDiv);
//            cssEditor.setTheme("ace/theme/eclipse");
//            cssEditor.getSession().setMode("ace/mode/css");
//            //set the value
//            var css = control.getCss();
//            if(css) {
//                cssEditor.getSession().setValue(css);
//            }
//        }
//    }
//    
//    //show html first
//    htmlRadio.checked = true;
//    showHtmlFunction();
//    
//    //radio change handler
//    var onRadioChange = function() {
//        if(onLoadRadio.checked) {
//            showOnLoadFunction();
//        }
//        else if(htmlRadio.checked) {
//            showHtmlFunction();
//        }
//        else if(supplementalRadio.checked) {
//            showSupplementalFunction();
//        }
//        else if(cssRadio.checked) {
//            showCssFunction();
//        }
//    }
//    
//    onLoadRadio.onchange = onRadioChange;
//    htmlRadio.onchange = onRadioChange;
//    supplementalRadio.onchange = onRadioChange;
//    cssRadio.onchange = onRadioChange;
//    
//    //set the resize handler
//    //resize the editor on window size change
//    var resizeCallback = function() {
//        //this needs to be fixed
//        var container = content.parentElement;
//        //this is kind of cludgy, I am using this as the last line and assuming it has even margins
//        var margin = line.offsetLeft;
//        var endPosition = line.offsetTop + line.offsetHeight + margin;
//        var totalWidth = container.clientWidth - 2 * margin;
//        var extraHeight = container.clientHeight - endPosition;
//        //size the editor, with some arbitrary padding
//        editorDiv.style.width = (totalWidth - 5) + "px";
//        editorDiv.style.height = (editorDiv.offsetHeight + extraHeight - 5) + "px";
//        
//        if(htmlEditor) htmlEditor.resize();
//        if(onLoadEditor) onLoadEditor.resize();
//        if(supplementalEditor) supplementalEditor.resize();
//        if(cssEditor) cssEditor.resize();
//    }
//    dialog.addListener("resize", resizeCallback);
//}
//
//
