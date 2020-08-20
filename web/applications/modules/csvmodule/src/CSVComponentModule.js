import CSVComponent from "./CSVComponent.js";
import CSVComponentView from "./CSVComponentView.js";

//These are in lieue of the import statements
let componentInfo = apogeeapp.componentInfo;
let registerComponentView = apogeeview.registerComponentView;

//-------------------------------
//register the button component
//-------------------------------
componentInfo.registerComponent(CSVComponent);

//-------------------------------
//register the button component view
//-------------------------------
registerComponentView(CSVComponentView);