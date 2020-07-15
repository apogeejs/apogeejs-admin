import JsonTableComponentView from "/apogeeview/componentviews/JsonTableComponentView.js";
import FolderComponentView from "/apogeeview/componentviews/FolderComponentView.js";
import FunctionComponentView from "/apogeeview/componentviews/FunctionComponentView.js";
import FolderFunctionComponentView from "/apogeeview/componentviews/FolderFunctionComponentView.js";
import DynamicFormView from "/apogeeview/componentviews/DynamicFormView.js";
import FormDataComponentView from "/apogeeview/componentviews/FormDataComponentView.js";
import CustomComponentView from "/apogeeview/componentviews/CustomComponentView.js";
import CustomDataComponentView from "/apogeeview/componentviews/CustomDataComponentView.js";
import ErrorComponentView from "/apogeeview/componentviews/ErrorComponentView.js";

import {registerComponentView,setErrorComponentView} from "/apogeeview/componentViewInfo.js";

registerComponentView(JsonTableComponentView);
registerComponentView(FolderComponentView);
registerComponentView(FunctionComponentView);
registerComponentView(FolderFunctionComponentView);
registerComponentView(ErrorComponentView);
registerComponentView(DynamicFormView);
registerComponentView(FormDataComponentView);
registerComponentView(CustomComponentView);
registerComponentView(CustomDataComponentView);

setErrorComponentView(ErrorComponentView);


//JSON PLUS COMPONENT
import JsonPlusTableComponentView from "/apogeeview/componentviews/JsonPlusTableComponentView.js";
registerComponentView(JsonPlusTableComponentView);