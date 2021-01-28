import JsonTableComponent from "/apogeeapp/components/JsonTableComponent.js";
import FunctionComponent from "/apogeeapp/components/FunctionComponent.js";
import FolderComponent from "/apogeeapp/components/FolderComponent.js";
import FolderFunctionComponent from "/apogeeapp/components/FolderFunctionComponent.js";
import DynamicForm from "/apogeeapp/components/DynamicForm.js";
import FormDataComponent from "/apogeeapp/components/FormDataComponent.js";
import CustomComponent from "/apogeeapp/components/CustomComponent.js";
import CustomDataComponent from "/apogeeapp/components/CustomDataComponent.js";
import ErrorComponent from "/apogeeapp/components/ErrorComponent.js";

import ActionFormComponent from "/apogeeapp/components/ActionFormComponent.js";
import DataFormComponent from "/apogeeapp/components/DataFormComponent.js";

//JSON PLUS COMPONENT
import JsonPlusTableComponent from "/apogeeapp/components/JsonPlusTableComponent.js";

/** This module initializes the default component classes. */

let componentInfo = {};
export {componentInfo as default};

let componentClasses = {};
let standardComponents = [];
let additionalComponents = [];
let pageComponents = [];

//==========================
// Functions
//==========================

/** This method registers a new component. It will be exposed when the user
 * requests to create a new component */
componentInfo.registerComponent = function(componentClass) {
    var name = componentClass.uniqueName;

    //we should maybe warn if another component bundle is being overwritten
    componentClasses[name] = componentClass;
    if(additionalComponents.indexOf(name) < 0) {
        additionalComponents.push(name);
    }
}

/** This method registers a component. */
componentInfo.registerStandardComponent = function(componentClass) {
    var name = componentClass.uniqueName;

    //we should maybe warn if another component bundle is being overwritten 
    componentClasses[name] = componentClass;
    if(standardComponents.indexOf(name) < 0) {
        standardComponents.push(name);
    }
}

/** This method registers a new component. It will be exposed when the user
 * requests to create a new component */
componentInfo.registerPageComponent = function(componentClass) {
    var name = componentClass.uniqueName;

    //we should maybe warn if another component bundle is being overwritten
    componentClasses[name] = componentClass;
    if(pageComponents.indexOf(name) < 0) {
        pageComponents.push(name);
    }
}

/** This method registers a new component. It will be exposed when the user
 * requests to create a new component */
componentInfo.unregisterComponent = function(componentClass) {
    //implement this
}

/** This method returns a component generator of a given name. */
componentInfo.getComponentClass = function(name) {
    return componentClasses[name];
}

componentInfo.getStandardComponentNames = function() {
    return standardComponents;
}

componentInfo.getAdditionalComponentNames = function() {
    return additionalComponents;
}

componentInfo.getPageComponentNames = function() {
    return pageComponents;
}

//===============================
//initialization
//===============================

//register standard child components
componentInfo.registerStandardComponent(JsonTableComponent);
componentInfo.registerStandardComponent(FunctionComponent);
componentInfo.registerStandardComponent(FolderFunctionComponent);
componentInfo.registerStandardComponent(DynamicForm);
componentInfo.registerStandardComponent(FormDataComponent);

//additional child components
componentInfo.registerComponent(CustomComponent);
componentInfo.registerComponent(CustomDataComponent);

componentInfo.registerPageComponent(FolderComponent);
componentInfo.registerPageComponent(FolderFunctionComponent);

//other components
componentInfo.FOLDER_COMPONENT_CLASS = FolderComponent;
componentInfo.ERROR_COMPONENT_CLASS = ErrorComponent;

//test for new formS
componentInfo.registerComponent(ActionFormComponent);
componentInfo.registerComponent(DataFormComponent);

//JSON PLUS COMPONENT
componentInfo.registerComponent(JsonPlusTableComponent);




