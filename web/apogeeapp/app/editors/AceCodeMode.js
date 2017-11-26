/** This is a code editor. It expects the body of the object function. Optionally
 * a code wrapper can be passed in to wrap and unwrap the code text before and
 * after editing. There is also an option to pass in an instruction for setting data
 * when the code is the empty string. This can be used to set the data value rather than the
 * code, such as on a data object. The data will be set asn optionalOnBlankData.value if the
 * code is set to the empty string. If no action is desired, false or any value that evaluates to
 * false can be sent in.
 */
apogeeapp.app.AceCodeMode = function(componentDisplay) {
    apogeeapp.app.ViewMode.call(this,componentDisplay,apogeeapp.app.ViewMode.DISPLAY_DESTROY_FLAG_INACTIVE_AND_MINIMIZED);
}

apogeeapp.app.AceCodeMode.prototype = Object.create(apogeeapp.app.ViewMode.prototype);
apogeeapp.app.AceCodeMode.prototype.constructor = apogeeapp.app.AceCodeMode;

apogeeapp.app.AceCodeMode.prototype.createDisplay = function() {
    return new apogeeapp.app.AceTextEditor(this,"ace/mode/javascript");
}

apogeeapp.app.AceCodeMode.prototype.getDisplayData = function() {
    return this.member.getFunctionBody();
}

apogeeapp.app.AceCodeMode.prototype.getIsDataEditable = function() {
    return true;
}

apogeeapp.app.AceCodeMode.prototype.onSave = function(text) {	
	
    var actionData = {};
	
	if((this.onBlankData)&&(text === "")) {
		//special case - clear code
        actionData.action = "updateData";
        actionData.member = this.member;
        actionData.data = this.onBlankData.dataValue;
		
	}
	else {
		//standard case - edit code
        actionData.action = "updateCode";
        actionData.member = this.member;
        actionData.argList = this.member.getArgList();
		actionData.functionBody = text;

        actionData.supplementalCode = this.member.getSupplementalCode();  
	}
    
    var actionResponse =  apogee.action.doAction(actionData,true);
        
	return true;  
}
