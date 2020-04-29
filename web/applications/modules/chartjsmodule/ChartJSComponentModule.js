import ChartJSComponent from "./ChartJSComponent.js";
import ChartJSComponentView from "./ChartJSComponentView.js";
//import {Apogee} from "/apogeeapp/apogeeAppLib.js";
//import {ApogeeView} from "/apogeeview/apogeeViewLib.js";
import {Apogee} from "/lib/v0.9.1/assets/apogeeAppLib.js";
import {ApogeeView} from "/lib/v0.9.1/assets/apogeeViewLib.js";

//-------------------------------
//register the button component
//-------------------------------
var app = Apogee.getInstance();
if(app) {
    app.registerComponent(ChartJSComponent);
}
else {
    console.log("Component could not be registered because no Apogee app instance was available at component load time: apogeeapp.app.ButtonComponent");
}

//-------------------------------
//register the button component view
//-------------------------------
ApogeeView.registerComponentView(ChartJSComponentView);