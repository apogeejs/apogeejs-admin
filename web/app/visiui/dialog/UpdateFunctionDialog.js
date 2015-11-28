/** This method shows an update function dialog. The argument onSaveData si the same
 * arguments as the updateFunction event handler data. */
visicomp.app.visiui.dialog.showUpdateFunctionDialog = function(functionObject,onSaveFunction) {
    
    var dialog = new visicomp.visiui.Dialog("Dialog",
            {"minimizable":true,"maximizable":true,"movable":true,"resizable":true});
            
    //create body
    var content = visicomp.visiui.createElement("div",{"className":"dialogBody"}); 
    
    var line;
    
    //title
    line = visicomp.visiui.createElement("div",{"className":"dialogLine"});
    line.appendChild(visicomp.visiui.createElement("div",{"className":"dialogTitle","innerHTML":"Update Folder"}));
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
			functionBody = "";
		}
		
		if(supplementalEditor) {
            supplementalCode = supplementalEditor.getSession().getValue().trim();
			if(supplementalCode.length === 0) supplementalCode = null;
		}
		else {
			supplementalCode = null;
		}
        
        var result = onSaveFunction(functionObject,functionBody,supplementalCode);
        
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
            var functionBody = functionObject.getEditorInfo();
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
            var codeInfo = functionObject.getCodeInfo();
            if((codeInfo)&&(codeInfo.supplementalCode)) {
                supplementalEditor.getSession().setValue(codeInfo.supplementalCode);
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