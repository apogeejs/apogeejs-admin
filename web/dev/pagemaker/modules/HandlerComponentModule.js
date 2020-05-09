import HandlerComponent from "./HandlerComponent.js";
import HandlerComponentView from "./HandlerComponentView.js";

//These are in lieue of the import statements
let componentInfo = apogeeapp.componentInfo;
let registerComponentView = apogeeview.registerComponentView;

//-------------------------------
//register the button component
//-------------------------------
componentInfo.registerComponent(HandlerComponent);

//-------------------------------
//register the button component view
//-------------------------------
registerComponentView(HandlerComponentView);