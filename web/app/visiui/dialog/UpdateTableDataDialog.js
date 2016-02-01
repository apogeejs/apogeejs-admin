/** This method shows an update table dialog. The argument onSaveData si the same
 * arguments as the updateTable event handler data. */
visicomp.app.visiui.dialog.showUpdateTableDataDialog = function(table,onSaveFunction) {
    
    var dialogParent = visicomp.app.visiui.VisiComp.getDialogParent();
    var dialog = new visicomp.visiui.WindowFrame(dialogParent,{"minimizable":true,"maximizable":true,"movable":true,"resizable":true});
            
    //create body
    var content = visicomp.visiui.createElement("div",{"className":"dialogBody"}); 
    
    var line;
    
    //title
    line = visicomp.visiui.createElement("div",{"className":"dialogLine"});
    line.appendChild(visicomp.visiui.createElement("div",{"className":"dialogTitle","innerHTML":"Update Table Data"}));
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
        
    //create editor container
    var dataEditorDiv = visicomp.visiui.createElement("div",null,{
        "position":"absolute",
        "top":"0px",
        "bottom":"0px",
        "right":"0px",
        "left":"0px"
    });
    var dataEditor = ace.edit(dataEditorDiv);
//this stops an error message
dataEditor.$blockScrolling = Infinity;
	dataEditor.setTheme("ace/theme/eclipse");
	dataEditor.getSession().setMode("ace/mode/json");
	//set the value
	var data = table.getData();
	dataEditor.getSession().setValue(JSON.stringify(data,null,visicomp.app.visiui.TableControl.formatString));
	
	
    editorDiv.appendChild(dataEditorDiv);
    
    //save and cancel buttons
    //buttons and handler
    line = visicomp.visiui.createElement("div",{"className":"dialogLine"});
    var onCancel = function() {
        closeDialog();
    }
    
    var onSave = function() {
		var data;

		var dataText = dataEditor.getSession().getValue();
		if(dataText.length > 0) {
            try {
                data = JSON.parse(dataText);
            }
            catch(error) {
                //parsing error
                alert("There was an error parsing the JSON input: " +  error.message);
                return;
            }
        }
		else {
            data = "";
        }
		
        var editComplete = undefined;
        try {
            editComplete = onSaveFunction(data);

            if(editComplete) {
                closeDialog();
            }
        }
        finally {
            if(editComplete === undefined) {
                //this catches exceptions thrown in update. This should be user
                //code errors that we want to capture in the debugger for now
                alert("There was an error calculating the result. It will be captured in the debugger.");
                closeDialog();
            }

        }
    }
    
    var closeDialog = function() {
        dialog.hide();
        if(dataEditor) { 
            dataEditor.destroy();
            dataEditor = null;
        }
    }
    
    line.appendChild(visicomp.visiui.createElement("button",{"className":"dialogButton","innerHTML":"Save","onclick":onSave}));
    line.appendChild(visicomp.visiui.createElement("button",{"className":"dialogButton","innerHTML":"Cancel","onclick":onCancel}));
    content.appendChild(line);
    
    //show the dialog
    dialog.setContent(content);
    dialog.setZIndex(100);
    dialog.show();
    dialog.centerOnPage(); 
    
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
    }
    dialog.addListener("resize", resizeCallback);
}
