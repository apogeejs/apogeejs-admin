import JsonTableComponent from "/apogeeapp/components/JsonTableComponent.js";
import FunctionComponent from "/apogeeapp/components/FunctionComponent.js";
import FolderComponent from "/apogeeapp/components/FolderComponent.js";
import FolderFunctionComponent from "/apogeeapp/components/FolderFunctionComponent.js";
import DynamicForm from "/apogeeapp/components/DynamicForm.js";
import FormDataComponent from "/apogeeapp/components/FormDataComponent.js";
import CustomComponent from "/apogeeapp/components/CustomComponent.js";
import CustomDataComponent from "/apogeeapp/components/CustomDataComponent.js";
import ErrorComponent from "/apogeeapp/components/ErrorComponent.js";

import Apogee from "/apogeeapp/Apogee.js";

/** This module initializes the default component classes. */

let standardComponents = [
    JsonTableComponent,
    FunctionComponent,
    FolderComponent,
    FolderFunctionComponent,
    DynamicForm,
    FormDataComponent
];
let additionalComponents = [
    CustomComponent,
    CustomDataComponent
]; 

Apogee.setBaseClassLists(standardComponents, additionalComponents,ErrorComponent);
