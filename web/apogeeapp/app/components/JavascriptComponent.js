/** JAVASCRIPT TABLE
 * This is similar to a JSON TABLE except:
 * - The data allows for FUNCTIONS, in addition to plain data as in a json.
 * - IT STILL DOES NOT ALLOW CYCLES! That will crash the program! (detect this, or at least make it not crash.)
 * - It is also dangerous in that it can freeze the wrong thing and crash the program again.
 * - It does not show the DATA, only the code. That is because there is not a pretty way to serialize it. But I could add something.
 * 
 * I am undecided how to include this. It is just too dangerous as is. Maybe I can add some big checks, even though performance will suffer for large objects.
 * */
apogeeapp.app.JavascriptComponent = function(workspaceUI, javascriptObject) {
    //extend edit component
    apogeeapp.app.EditComponent.call(this,workspaceUI,javascriptObject,apogeeapp.app.JavascriptComponent);
};

apogeeapp.app.JavascriptComponent.prototype = Object.create(apogeeapp.app.EditComponent.prototype);
apogeeapp.app.JavascriptComponent.prototype.constructor = apogeeapp.app.JavascriptComponent;

//==============================
// Protected and Private Instance Methods
//==============================

apogeeapp.app.JavascriptComponent.VIEW_CODE = "Code";
apogeeapp.app.JavascriptComponent.VIEW_SUPPLEMENTAL_CODE = "Private";
apogeeapp.app.JavascriptComponent.VIEW_DESCRIPTION = "Notes";

apogeeapp.app.JavascriptComponent.VIEW_MODES = [
    apogeeapp.app.JavascriptComponent.VIEW_CODE,
    apogeeapp.app.JavascriptComponent.VIEW_SUPPLEMENTAL_CODE,
    apogeeapp.app.JavascriptComponent.VIEW_DESCRIPTION
];

apogeeapp.app.JavascriptComponent.TABLE_EDIT_SETTINGS = {
    "viewModes": apogeeapp.app.JavascriptComponent.VIEW_MODES,
    "defaultView": apogeeapp.app.JavascriptComponent.VIEW_CODE
}

/**  This method retrieves the table edit settings for this component instance
 * @protected */
apogeeapp.app.JavascriptComponent.prototype.getTableEditSettings = function() {
    return apogeeapp.app.JavascriptComponent.TABLE_EDIT_SETTINGS;
}

/** This method should be implemented to retrieve a data display of the give type. 
 * @protected. */
apogeeapp.app.JavascriptComponent.prototype.getDataDisplay = function(displayContainer,viewType) {
	
    var callbacks;
	
	//create the new view element;
	switch(viewType) {
			
		case apogeeapp.app.JavascriptComponent.VIEW_CODE:
            callbacks = apogeeapp.app.dataDisplayCallbackHelper.getMemberFunctionBodyCallbacks(this.member);
			return new apogeeapp.app.AceTextEditor(displayContainer,callbacks,"ace/mode/javascript");
			
		case apogeeapp.app.JavascriptComponent.VIEW_SUPPLEMENTAL_CODE:
			callbacks = apogeeapp.app.dataDisplayCallbackHelper.getMemberSupplementalCallbacks(this.member);
            return new apogeeapp.app.AceTextEditor(displayContainer,callbacks,"ace/mode/javascript");
            
        case apogeeapp.app.JavascriptComponent.VIEW_DESCRIPTION:
			callbacks = apogeeapp.app.dataDisplayCallbackHelper.getMemberDescriptionCallbacks(this.member);
            //return new apogeeapp.app.AceTextEditor(displayContainer,callbacks,"ace/mode/text");
            return new apogeeapp.app.TextAreaEditor(displayContainer,callbacks);
			
		default:
//temporary error handling...
			alert("unrecognized view element!");
			return null;
	}
}

//======================================
// Static methods
//======================================

apogeeapp.app.JavascriptComponent.getCreateMemberPayload = function(userInputValues) {
    var json = {};
    json.name = userInputValues.name;
    var argList = [];
    json.updateData = {};
    json.updateData.argList = argList;
    json.type = apogee.JavascriptTable.generator.type;
    return json;
}

//======================================
// This is the component generator, to register the component
//======================================

apogeeapp.app.JavascriptComponent.displayName = "Javascript Object (TEMPORARY!)";
apogeeapp.app.JavascriptComponent.uniqueName = "apogeeapp.app.JavascriptComponent";
apogeeapp.app.JavascriptComponent.DEFAULT_WIDTH = 400;
apogeeapp.app.JavascriptComponent.DEFAULT_HEIGHT = 400;
apogeeapp.app.JavascriptComponent.ICON_RES_PATH = "/componentIcons/javascriptTable.png";
