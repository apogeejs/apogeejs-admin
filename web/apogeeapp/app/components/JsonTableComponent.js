/** This component represents a json table object. */
apogeeapp.app.JsonTableComponent = function(workspaceUI,table,componentJson) {
    //extend edit component
    apogeeapp.app.EditComponent.call(this,workspaceUI,table,apogeeapp.app.JsonTableComponent.generator,componentJson);

    //to do:
    //need to ave this and read if from component json, during create or read
    //need to refresh a display if we change it when data view active
    //need to refresh the view from the cache (whereit is happening...)
    this.dataView = (componentJson.dataView !== undefined ) ? componentJson.dataView : apogeeapp.app.JsonTableComponent.PLAIN_DATA_VEW;
   
    this.memberUpdated();
    
    //add a cleanup and save actions
    this.addSaveAction(apogeeapp.app.JsonTableComponent.writeToJson);
};

apogeeapp.app.JsonTableComponent.prototype = Object.create(apogeeapp.app.EditComponent.prototype);
apogeeapp.app.JsonTableComponent.prototype.constructor = apogeeapp.app.JsonTableComponent;

apogeeapp.app.JsonTableComponent.prototype.getDataView = function() {
    if(!this.dataView) this.dataView = "Plain";
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
        
        var tableComponent = new apogeeapp.app.JsonTableComponent(workspaceUI,table,componentJson);
        actionResponse.component = tableComponent;
    }
    return actionResponse;
}


apogeeapp.app.JsonTableComponent.createComponentFromJson = function(workspaceUI,member,componentJson) {
    var tableComponent = new apogeeapp.app.JsonTableComponent(workspaceUI,member,componentJson);
    return tableComponent;
}

apogeeapp.app.JsonTableComponent.writeToJson = function(json) {
    json.dataView = this.dataView;
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
apogeeapp.app.JsonTableComponent.generator.createComponentFromJson = apogeeapp.app.JsonTableComponent.createComponentFromJson;
apogeeapp.app.JsonTableComponent.generator.DEFAULT_WIDTH = 300;
apogeeapp.app.JsonTableComponent.generator.DEFAULT_HEIGHT = 300;
apogeeapp.app.JsonTableComponent.generator.ICON_RES_PATH = "/dataIcon.png";

apogeeapp.app.JsonTableComponent.generator.propertyDialogLines = [
    {
        "type":"dropdown",
        "heading":"Data View: ",
        "entries":[
            "Plain",
            "JSON",
            "Form"
        ],
        "resultKey":"dataView"
    }
];

apogeeapp.app.JsonTableComponent.generator.addPropFunction = apogeeapp.app.JsonTableComponent.addPropFunction;
apogeeapp.app.JsonTableComponent.generator.updateProperties = apogeeapp.app.JsonTableComponent.updateProperties;

