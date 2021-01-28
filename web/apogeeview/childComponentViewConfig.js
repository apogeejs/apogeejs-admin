import JsonTableComponentView from "/apogeeview/componentviews/JsonTableComponentView.js";
import FunctionComponentView from "/apogeeview/componentviews/FunctionComponentView.js";
import DynamicFormView from "/apogeeview/componentviews/DynamicFormView.js";
import FormDataComponentView from "/apogeeview/componentviews/FormDataComponentView.js";
import CustomComponentView from "/apogeeview/componentviews/CustomComponentView.js";
import CustomDataComponentView from "/apogeeview/componentviews/CustomDataComponentView.js";
import ErrorComponentView from "/apogeeview/componentviews/ErrorComponentView.js";

import {registerComponentView,setErrorComponentView} from "/apogeeview/componentViewInfo.js";

//registration of the child component views

registerComponentView(JsonTableComponentView);
registerComponentView(FunctionComponentView);
registerComponentView(ErrorComponentView);
registerComponentView(DynamicFormView);
registerComponentView(FormDataComponentView);
registerComponentView(CustomComponentView);
registerComponentView(CustomDataComponentView);

setErrorComponentView(ErrorComponentView);

//JSON PLUS COMPONENT
import ActionFormComponentView from "/apogeeview/componentviews/ActionFormComponentView.js";
registerComponentView(ActionFormComponentView);
import DataFormComponentView from "/apogeeview/componentviews/DataFormComponentView.js";
registerComponentView(DataFormComponentView);

//JSON PLUS COMPONENT
import JsonPlusTableComponentView from "/apogeeview/componentviews/JsonPlusTableComponentView.js";
registerComponentView(JsonPlusTableComponentView);