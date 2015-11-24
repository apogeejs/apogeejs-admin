/** This method shows an update table dialog. The argument onSaveData si the same
 * arguments as the updateTable event handler data. */
visicomp.app.visiui.dialog.showUpdateTableDialog = function(table,onSaveFunction) {
    
    var dialog = new visicomp.visiui.Dialog("Dialog",
            {"minimizable":true,"maximizable":true,"movable":true,"resizable":true});
            
    //create body
    var content = visicomp.visiui.createElement("div",{"className":"dialogBody"}); 
    
    var line;
    
    //title
    line = visicomp.visiui.createElement("div",{"className":"dialogLine"});
    line.appendChild(visicomp.visiui.createElement("div",{"className":"dialogTitle","innerHTML":"Update Package"}));
    content.appendChild(line);
        
    //editor selector
    line = visicomp.visiui.createElement("div",{"className":"dialogLine"}); 
    var dataRadio = visicomp.visiui.createElement("input",{"type":"radio","name":"dataFormula","value":"data"});
    line.appendChild(dataRadio);
    line.appendChild(document.createTextNode("Data"));
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
    var dataEditorDiv = visicomp.visiui.createElement("div",null,{
        "position":"absolute",
        "top":"0px",
        "bottom":"0px",
        "right":"0px",
        "left":"0px"
    });
    var dataEditor = null;
    editorDiv.appendChild(dataEditorDiv);
    
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
		var data;
		var formula;
		var supplementalCode;
        
		if(dataEditor) {
            var dataText = dataEditor.getSession().getValue();
			if(dataText.length > 0) data = JSON.parse(dataText);
			else data = null;
        }
		else {
			data = null;
		}
			
        if(formulaEditor) {
            formula = formulaEditor.getSession().getValue().trim();
			if(formula.length === 0) formula = null;
		}
		else {
			formula = null;
		}
		
		if(supplementalEditor) {
            supplementalCode = supplementalEditor.getSession().getValue().trim();
			if(supplementalCode.length === 0) supplementalCode = null;
		}
		else {
			supplementalCode = null;
		}
        
        var result = onSaveFunction(data,formula,supplementalCode);
        
        if(result.success) {
			dialog.hide();
        }
        else {
            alert("There was an error updating the table: " + result.msg);
            
            //if this was a code error, rethrow it so the standard browser debug handler can handle it
            var error = result.error;
            if((error)&&(error.type == "CalculationError")) {
                var baseError = error.baseError;
                if(baseError) throw baseError;
            }
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
    var showDataFunction = function() {
        //hide the formula div and show the data dive
        formulaEditorDiv.style.display = "none";
        dataEditorDiv.style.display = "";
        supplementalEditorDiv.style.display = "none";
        
        //create data editor if needed
        if(!dataEditor) {
            dataEditor = ace.edit(dataEditorDiv);
            dataEditor.setTheme("ace/theme/eclipse");
            dataEditor.getSession().setMode("ace/mode/json");
            //set the value
            var data = table.getData();
            dataEditor.getSession().setValue(JSON.stringify(data,null,visicomp.app.visiui.TableUI.formatString));
        }
    }
    
    var showFormulaFunction = function() {
        //hide the data div and show the formula dive
        dataEditorDiv.style.display = "none";
        formulaEditorDiv.style.display = "";
        supplementalEditorDiv.style.display = "none";
        
        //create formula editor if needed
        if(!formulaEditor) {
            //initialize editor
            formulaEditor = ace.edit(formulaEditorDiv);
            formulaEditor.setTheme("ace/theme/eclipse");
            formulaEditor.getSession().setMode("ace/mode/javascript");
            //set the formula
            var formula = table.getEditorInfo();
            if(formula) {
                formulaEditor.getSession().setValue(formula);
            }
        }
    }
    
    var showSupplementalFunction = function() {
        //hide the data div and show the formula dive
        dataEditorDiv.style.display = "none";
        formulaEditorDiv.style.display = "none";
        supplementalEditorDiv.style.display = "";
        
        //create formula editor if needed
        if(!supplementalEditor) {
            //initialize editor
            supplementalEditor = ace.edit(supplementalEditorDiv);
            supplementalEditor.setTheme("ace/theme/eclipse");
            supplementalEditor.getSession().setMode("ace/mode/javascript");
            //set the formula
            var codeInfo = table.getCodeInfo();
            if((codeInfo)&&(codeInfo.supplementalCode)) {
                supplementalEditor.getSession().setValue(codeInfo.supplementalCode);
            }
        }
    }
    
    //initilialize radio buttons
    if(table.hasCode()) {
        formulaRadio.checked = true;
        showFormulaFunction();
    }
    else {
        dataRadio.checked = true;
        showDataFunction();
    }
    
    //radio change handler
    var onRadioChange = function() {
        if(formulaRadio.checked) {
            showFormulaFunction();
        }
        else if(dataRadio.checked) {
            showDataFunction();
        }
        else if(supplementalRadio.checked) {
            showSupplementalFunction();
        }
    }
    
    formulaRadio.onchange = onRadioChange;
    dataRadio.onchange = onRadioChange;
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
        
        if(dataEditor) dataEditor.resize();
        if(formulaEditor) formulaEditor.resize();
        if(supplementalEditor) supplementalEditor.resize();
    }
    dialog.getEventManager().addListener("resize", resizeCallback);
}


