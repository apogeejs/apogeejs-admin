import JsonTableComponentView from "/apogeeview/componentviews/JsonTableComponentView.js";
import FolderComponentView from "/apogeeview/componentviews/FolderComponentView.js";
import FunctionComponentView from "/apogeeview/componentviews/FunctionComponentView.js";
import FolderFunctionComponentView from "/apogeeview/componentviews/FolderFunctionComponentView.js";
import DynamicFormView from "/apogeeview/componentviews/DynamicFormView.js";
import FormDataComponentView from "/apogeeview/componentviews/FormDataComponentView.js";
import CustomComponentView from "/apogeeview/componentviews/CustomComponentView.js";
import CustomDataComponentView from "/apogeeview/componentviews/CustomDataComponentView.js";
import ErrorComponentView from "/apogeeview/componentviews/ErrorComponentView.js";

/** This module initializes the default component view classes. */
let componentViewClassMap = {};

registerComponentView(JsonTableComponentView);
registerComponentView(FolderComponentView);
registerComponentView(FunctionComponentView);
registerComponentView(FolderFunctionComponentView);
registerComponentView(ErrorComponentView);
registerComponentView(DynamicFormView);
registerComponentView(FormDataComponentView);
registerComponentView(CustomComponentView);
registerComponentView(CustomDataComponentView);

/** This method is used to register a new component view class for the user interface. */
export function registerComponentView(viewClass) {
    componentViewClassMap[viewClass.componentName] = viewClass;
}

/** This method retrieves a component view class using the component unique name. */
export function getComponentViewClass(componentName) {
    return componentViewClassMap[componentName];
}

export let ERROR_COMPONENT_VIEW_CLASS = ErrorComponentView;
