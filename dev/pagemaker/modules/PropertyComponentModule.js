import PropertyComponent from "./PropertyComponent.js";
import PropertyComponentView from "./PropertyComponentView.js";

//These are in lieue of the import statements
let componentInfo = apogeeapp.componentInfo;
let registerComponentView = apogeeview.registerComponentView;

//-------------------------------
//register the button component
//-------------------------------
componentInfo.registerComponent(PropertyComponent);

//-------------------------------
//register the button component view
//-------------------------------
registerComponentView(PropertyComponentView);