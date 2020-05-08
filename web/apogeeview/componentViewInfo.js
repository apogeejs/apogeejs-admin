/** This module initializes the default component view classes. */
let componentViewClassMap = {};

export let ERROR_COMPONENT_VIEW_CLASS;

/** This method is used to register a new component view class for the user interface. */
export function registerComponentView(viewClass) {
    componentViewClassMap[viewClass.componentName] = viewClass;
}

/** This method retrieves a component view class using the component unique name. */
export function getComponentViewClass(componentName) {
    return componentViewClassMap[componentName];
}

export function setErrorComponentView(errorComponentViewClass) {
    ERROR_COMPONENT_VIEW_CLASS = errorComponentViewClass;
}
