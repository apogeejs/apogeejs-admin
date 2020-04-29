import JsonTableComponentView from "/apogeeview/componentviews/JsonTableComponentView.js";
import FolderComponentView from "/apogeeview/componentviews/FolderComponentView.js";
import FunctionComponentView from "/apogeeview/componentviews/FunctionComponentView.js";
import FolderFunctionComponentView from "/apogeeview/componentviews/FolderFunctionComponentView.js";
import DynamicFormView from "/apogeeview/componentviews/DynamicFormView.js";
import FormDataComponentView from "/apogeeview/componentviews/FormDataComponentView.js";
import CustomComponentView from "/apogeeview/componentviews/CustomComponentView.js";
import CustomDataComponentView from "/apogeeview/componentviews/CustomDataComponentView.js";
import ErrorComponentView from "/apogeeview/componentviews/ErrorComponentView.js";

import ApogeeView from "/apogeeview/ApogeeView.js";

/** This module initializes the default component view classes. */
ApogeeView.registerComponentView(JsonTableComponentView);
ApogeeView.registerComponentView(FolderComponentView);
ApogeeView.registerComponentView(FunctionComponentView);
ApogeeView.registerComponentView(FolderFunctionComponentView);
ApogeeView.registerComponentView(ErrorComponentView);
ApogeeView.registerComponentView(DynamicFormView);
ApogeeView.registerComponentView(FormDataComponentView);
ApogeeView.registerComponentView(CustomComponentView);
ApogeeView.registerComponentView(CustomDataComponentView);
