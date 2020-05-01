import ButtonComponent from "./ButtonComponent.js";
import ButtonComponentView from "./ButtonComponentView.js";
import Apogee from "/apogeeapp/Apogee.js";
import ApogeeView from "/apogeeview/ApogeeView.js";

//-------------------------------
//register the button component
//-------------------------------
var app = Apogee.getInstance();
if(app) {
    componentInfo.registerComponent(ButtonComponent);
}
else {
    console.log("Component could not be registered because no Apogee app instance was available at component load time: apogeeapp.app.ButtonComponent");
}

//-------------------------------
//register the button component view
//-------------------------------
componentViewConfig.registerComponentView(ButtonComponentView);