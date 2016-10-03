/** This is a code editor. It expects the body of the object function. Optionally
 * a code wrapper can be passed in to wrap and unwrap the code text before and
 * after editing. There is also an option to pass in an instruction for setting data
 * when the code is the empty string. This can be used to set the data value rather than the
 * code, such as on a data object. The data will be set asn optionalOnBlankData.value if the
 * code is set to the empty string. If no action is desired, false or any value that evaluates to
 * false can be sent in.
 */
hax.app.visiui.AceCodeMode = function(component,optionalOnBlankData,optionalEditorCodeWrapper) {
	//base constructor
	hax.app.visiui.AceCodeModeBase.call(this,component,"ace/mode/javascript");
	
	this.onBlankData = optionalOnBlankData;
	this.editorCodeWrapper = optionalEditorCodeWrapper;
}

hax.app.visiui.AceCodeMode.prototype = Object.create(hax.app.visiui.AceCodeModeBase.prototype);
hax.app.visiui.AceCodeMode.prototype.constructor = hax.app.visiui.AceCodeMode;
	
hax.app.visiui.AceCodeMode.prototype.showData = function(editOk) {
		
	var table = this.component.getObject();
	var functionBody = table.getFunctionBody();
	
	var codeText;
	if(this.editorCodeWrapper) {
		codeText = this.editorCodeWrapper.unwrapCode(functionBody);
	}
	else {
		codeText = functionBody;
	}
	
	this.editor.showData(codeText,editOk);
}

hax.app.visiui.AceCodeMode.prototype.onSave = function(text) {	
	
	var table = this.component.getObject();
	
	if((this.onBlankData)&&(text === "")) {
		//special case - clear code
		var data = this.onBlankData.dataValue; 
		hax.core.updatemember.updateData(table,data);
	}
	else {
		//standard case - edit code
	
		var functionBody;
		if(this.editorCodeWrapper) {
			functionBody = this.editorCodeWrapper.wrapCode(text);
		}
		else {
			functionBody = text;
		}

		var supplementalCode = table.getSupplementalCode();
		var argList = table.getArgList();
		var actionResponse =  hax.core.updatemember.updateCode(table,argList,functionBody,supplementalCode);
		if(!actionResponse.getSuccess()) {
			//show an error message
			var msg = actionResponse.getErrorMsg();
			alert(msg);
		}
	}
        
	return true;  
}
