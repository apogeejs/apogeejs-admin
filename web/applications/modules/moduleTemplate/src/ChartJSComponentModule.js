import ChartJSComponent from "./ChartJSComponent.js";
import ChartJSComponentView from "./ChartJSComponentView.js";

//These are in lieue of the import statements
let componentInfo = apogeeapp.componentInfo;
let registerComponentView = apogeeview.registerComponentView;

//-------------------------------
//register the button component
//-------------------------------
componentInfo.registerComponent(ChartJSComponent);

//-------------------------------
//register the button component view
//-------------------------------
registerComponentView(ChartJSComponentView);