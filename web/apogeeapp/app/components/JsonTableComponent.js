/** This component represents a json table object. */
apogeeapp.app.JsonTableComponent = function(workspaceUI,table,options) {
    //extend edit component
    apogeeapp.app.EditComponent.call(this,workspaceUI,table,apogeeapp.app.JsonTableComponent.generator);

    //default view
    this.dataView = apogeeapp.app.JsonTableComponent.JSON_DATA_VEW;
    
    //add a cleanup and save actions
    this.addOpenAction(apogeeapp.app.JsonTableComponent.readFromJson);
    this.addSaveAction(apogeeapp.app.JsonTableComponent.writeToJson);
    
    this.setOptions(options);
    this.memberUpdated();
};

apogeeapp.app.JsonTableComponent.prototype = Object.create(apogeeapp.app.EditComponent.prototype);
apogeeapp.app.JsonTableComponent.prototype.constructor = apogeeapp.app.JsonTableComponent;

apogeeapp.app.JsonTableComponent.prototype.getDataView = function() {
    if(!this.dataView) this.dataView = "JSON";
    return this.dataView;
}

apogeeapp.app.JsonTableComponent.prototype.setDataView = function(dataView) {
    this.dataView = dataView;
    //update the window display if needed
    var windowDisplay = this.getWindowDisplay();
    if(windowDisplay) {
        windowDisplay.updateViewModeElement(apogeeapp.app.JsonTableComponent.VIEW_DATA);
    }
}

//==============================
// Protected and Private Instance Methods
//==============================

apogeeapp.app.JsonTableComponent.VIEW_DATA = "Data";
apogeeapp.app.JsonTableComponent.VIEW_CODE = "Formula";
apogeeapp.app.JsonTableComponent.VIEW_SUPPLEMENTAL_CODE = "Private";
apogeeapp.app.JsonTableComponent.VIEW_DESCRIPTION = "Notes";

apogeeapp.app.JsonTableComponent.VIEW_MODES = [
    apogeeapp.app.JsonTableComponent.VIEW_DATA,
    apogeeapp.app.JsonTableComponent.VIEW_CODE,
    apogeeapp.app.JsonTableComponent.VIEW_SUPPLEMENTAL_CODE,
    apogeeapp.app.JsonTableComponent.VIEW_DESCRIPTION
];

apogeeapp.app.JsonTableComponent.TABLE_EDIT_SETTINGS = {
    "viewModes": apogeeapp.app.JsonTableComponent.VIEW_MODES,
    "defaultView": apogeeapp.app.JsonTableComponent.VIEW_DATA,
    "clearFunctionMenuText": "Clear Formula",
    "emptyDataValue": ""
}

apogeeapp.app.JsonTableComponent.PLAIN_DATA_VEW = "Plain";
apogeeapp.app.JsonTableComponent.JSON_DATA_VEW = "JSON";
apogeeapp.app.JsonTableComponent.FORM_DATA_VIEW = "Form";


/**  This method retrieves the table edit settings for this component instance
 * @protected */
apogeeapp.app.JsonTableComponent.prototype.getTableEditSettings = function() {
    return apogeeapp.app.JsonTableComponent.TABLE_EDIT_SETTINGS;
}

/** This method should be implemented to retrieve a view mode of the give type. 
 * @protected. */
apogeeapp.app.JsonTableComponent.prototype.getViewModeElement = function(editComponentDisplay,viewType) {
	
	//create the new view element;
	switch(viewType) {
        case apogeeapp.app.JsonTableComponent.VIEW_DATA:
            switch(this.dataView) {
                case apogeeapp.app.JsonTableComponent.JSON_DATA_VEW:
                    return new apogeeapp.app.AceDataMode(editComponentDisplay,true);

                case apogeeapp.app.JsonTableComponent.FORM_DATA_VIEW:
                    return new apogeeapp.app.FormDataMode(editComponentDisplay);
                    
                case apogeeapp.app.JsonTableComponent.PLAIN_DATA_VEW:
                default:
                    return new apogeeapp.app.AceDataMode(editComponentDisplay,false);
            }
			
		case apogeeapp.app.JsonTableComponent.VIEW_CODE:
			return new apogeeapp.app.AceCodeMode(editComponentDisplay);
			
		case apogeeapp.app.JsonTableComponent.VIEW_SUPPLEMENTAL_CODE:
			return new apogeeapp.app.AceSupplementalMode(editComponentDisplay);
            
        case apogeeapp.app.JsonTableComponent.VIEW_DESCRIPTION:
			return new apogeeapp.app.AceDescriptionMode(editComponentDisplay);
			
		default:
//temporary error handling...
			alert("unrecognized view element!");
			return null;
	}
}

//======================================
// Static methods
//======================================


apogeeapp.app.JsonTableComponent.createComponent = function(workspaceUI,data,componentOptions) {
    
    //create the member using a create function and a type, argument is propValues.
    //create functions: member, function, folder, folderFunction
    
    var json = {};
    json.action = "createMember";
    json.owner = data.parent;
    json.workspace = data.parent.getWorkspace();
    json.name = data.name;
    json.type = apogee.JsonTable.generator.type;
    var actionResponse = apogee.action.doAction(json,true);
    
    var table = json.member;
    if(table) {
        
        //need to add data view to component options
        var componentJson;
        if(componentOptions) {
            componentJson = apogee.util.jsonCopy(componentOptions);
        }
        else {
            componentJson = {};
        }
        
        if(data.dataView) {
            componentJson.dataView = data.dataView;
        }
        
        var tableComponent = apogeeapp.app.JsonTableComponent.createComponentFromMember(workspaceUI,table,componentJson);
        actionResponse.component = tableComponent;
    }
    return actionResponse;
}


apogeeapp.app.JsonTableComponent.createComponentFromMember = function(workspaceUI,member,componentJson) {
    return new apogeeapp.app.JsonTableComponent(workspaceUI,member,componentJson);
}

apogeeapp.app.JsonTableComponent.writeToJson = function(json) {
    json.dataView = this.dataView;
}

apogeeapp.app.JsonTableComponent.readFromJson = function(json) {
    if(json.dataView !== undefined) {
        this.dataView = json.dataView;
    }
}
    

apogeeapp.app.JsonTableComponent.addPropFunction = function(component,values) {
    values.dataView = component.getDataView();
}

apogeeapp.app.JsonTableComponent.updateProperties = function(component,oldValues,newValues,actionResponse) {
    component.setDataView(newValues.dataView);
}

//======================================
// This is the component generator, to register the component
//======================================

apogeeapp.app.JsonTableComponent.generator = {};
apogeeapp.app.JsonTableComponent.generator.displayName = "Data Table";
apogeeapp.app.JsonTableComponent.generator.uniqueName = "apogeeapp.app.JsonTableComponent";
apogeeapp.app.JsonTableComponent.generator.createComponent = apogeeapp.app.JsonTableComponent.createComponent;
apogeeapp.app.JsonTableComponent.generator.createComponentFromMember = apogeeapp.app.JsonTableComponent.createComponentFromMember;
apogeeapp.app.JsonTableComponent.generator.DEFAULT_WIDTH = 300;
apogeeapp.app.JsonTableComponent.generator.DEFAULT_HEIGHT = 300;
apogeeapp.app.JsonTableComponent.generator.ICON_RES_PATH = "/dataIcon.png";

apogeeapp.app.JsonTableComponent.generator.propertyDialogLines = [
    {
        "type":"dropdown",
        "heading":"Data View: ",
        "entries":[
            "JSON",
            "Plain",
            "Form"
        ],
        "resultKey":"dataView"
    }
];

apogeeapp.app.JsonTableComponent.generator.addPropFunction = apogeeapp.app.JsonTableComponent.addPropFunction;
apogeeapp.app.JsonTableComponent.generator.updateProperties = apogeeapp.app.JsonTableComponent.updateProperties;

