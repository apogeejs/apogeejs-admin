import WebRequestComponent from "./WebRequestComponent.js";
import WebRequestComponentView from "./WebRequestComponentView.js";

//These are in lieue of the import statements
let componentInfo = apogeeapp.componentInfo;
let registerComponentView = apogeeview.registerComponentView;

//-------------------------------
//register the button component
//-------------------------------
componentInfo.registerComponent(WebRequestComponent);

//-------------------------------
//register the button component view
//-------------------------------
registerComponentView(WebRequestComponentView);