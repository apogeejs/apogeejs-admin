/** This method shows an update dialog for the code in a codeable object.
 * The argument editorCodeWrapper is optional and can be left off. It allows the
 * function body code to be wrapped and unwraped so the code the user enters does
 * not include the complete function body. This is used on Table so the user can 
 * set the value to a variable names "value" rather then writing a function with 
 * a return statement. This was just a UI choice. */
visicomp.app.visiui.dialog.showUpdateCodeableDialog = function(codeableObject,onSaveFunction,title,editorCodeWrapper) {
    
    var dialogParent = visicomp.visiui.getDialogParent();
    var dialog = new visicomp.visiui.WindowFrame(dialogParent,{"minimizable":true,"maximizable":true,"movable":true,"resizable":true});
            
    //create body
    var content = visicomp.visiui.createElement("div",{"className":"dialogBody"}); 
    
    var line;
    
    //title
    line = visicomp.visiui.createElement("div",{"className":"dialogLine"});
    line.appendChild(visicomp.visiui.createElement("div",{"className":"dialogTitle","innerHTML":title}));
    content.appendChild(line);
        
    //editor selector
    line = visicomp.visiui.createElement("div",{"className":"dialogLine"}); 
    var formulaRadio = visicomp.visiui.createElement("input",{"type":"radio","name":"dataFormula","value":"formula"});
    line.appendChild(formulaRadio);
	//-------------------------------
	//this code added to allow customization of name and content for the main code - used by table
	var formulaName;
	if(editorCodeWrapper) {
		formulaName = editorCodeWrapper.displayName;
	}
	else {
		formulaName = "Function Body"
	}
	//--------------------------------
    line.appendChild(document.createTextNode(formulaName));
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
        closeDialog();
    }
    
    var onSave = function() {
		var mainCode;
		var supplementalCode;
			
        if(formulaEditor) {
            mainCode = formulaEditor.getSession().getValue().trim();
			//--------------------------
			//this code added to allow customization of name and content for the main code - used by table
			if(editorCodeWrapper) {
				mainCode = editorCodeWrapper.wrapCode(mainCode);
			}
			//--------------------------
		}
		else {
			mainCode = codeableObject.getFunctionBody();
		}
		
		if(supplementalEditor) {
            supplementalCode = supplementalEditor.getSession().getValue().trim();
		}
		else {
			supplementalCode = codeableObject.getSupplementalCode();
		}
        
        var complete = onSaveFunction(mainCode,supplementalCode);
        if(complete) {
            closeDialog();
        }
    }
    
    var closeDialog = function() {
        dialog.hide();
        
        //clean up the editor
        if(formulaEditor) { 
            formulaEditor.destroy();
            formulaEditor = null;
        }
        if(supplementalEditor) { 
            supplementalEditor.destroy();
            supplementalEditor = null;
        }
    }
    
    line.appendChild(visicomp.visiui.createElement("button",{"className":"dialogButton","innerHTML":"Save","onclick":onSave}));
    line.appendChild(visicomp.visiui.createElement("button",{"className":"dialogButton","innerHTML":"Cancel","onclick":onCancel}));
    content.appendChild(line);
    
    //show the dialog
    dialog.setContent(content);
    dialog.show();
    var coords = dialogParent.getCenterOnPagePosition(dialog);
    dialog.setPosition(coords[0],coords[1]);
    
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
//this stops an error message
formulaEditor.$blockScrolling = Infinity;
            formulaEditor.setTheme("ace/theme/eclipse");
            formulaEditor.getSession().setMode("ace/mode/javascript");
            //set the formula
            var mainCode = codeableObject.getFunctionBody();
            if(mainCode) {
			
				//--------------------------
				//this code added to allow customization of name and content for the main code - used by table
				if(editorCodeWrapper) {
					mainCode = editorCodeWrapper.unwrapCode(mainCode);
				}
				//--------------------------
                formulaEditor.getSession().setValue(mainCode);
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
//this stops an error message
supplementalEditor.$blockScrolling = Infinity;
            supplementalEditor.setTheme("ace/theme/eclipse");
            supplementalEditor.getSession().setMode("ace/mode/javascript");
            //set the formula
            var supplementalCode = codeableObject.getSupplementalCode();
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
    dialog.addListener(visicomp.visiui.WindowFrame.RESIZED, resizeCallback);
}