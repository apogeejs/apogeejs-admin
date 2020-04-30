import JsonTableComponentView from "/apogeeview/componentviews/JsonTableComponentView.js";
import FolderComponentView from "/apogeeview/componentviews/FolderComponentView.js";
import FunctionComponentView from "/apogeeview/componentviews/FunctionComponentView.js";
import FolderFunctionComponentView from "/apogeeview/componentviews/FolderFunctionComponentView.js";
import DynamicFormView from "/apogeeview/componentviews/DynamicFormView.js";
import FormDataComponentView from "/apogeeview/componentviews/FormDataComponentView.js";
import CustomComponentView from "/apogeeview/componentviews/CustomComponentView.js";
import CustomDataComponentView from "/apogeeview/componentviews/CustomDataComponentView.js";
import ErrorComponentView from "/apogeeview/componentviews/ErrorComponentView.js";

import ApogeeWebView from "/apogeeview/ApogeeWebView.js";

/** This module initializes the default component view classes. */
ApogeeWebView.registerComponentView(JsonTableComponentView);
ApogeeWebView.registerComponentView(FolderComponentView);
ApogeeWebView.registerComponentView(FunctionComponentView);
ApogeeWebView.registerComponentView(FolderFunctionComponentView);
ApogeeWebView.registerComponentView(ErrorComponentView);
ApogeeWebView.registerComponentView(DynamicFormView);
ApogeeWebView.registerComponentView(FormDataComponentView);
ApogeeWebView.registerComponentView(CustomComponentView);
ApogeeWebView.registerComponentView(CustomDataComponentView);
