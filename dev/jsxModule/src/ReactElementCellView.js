import ComponentView from "/apogeejs-view-lib/src/componentdisplay/ComponentView.js";
//import HtmlJsDataDisplay from "/apogeejs-view-lib/src/datadisplay/HtmlJsDataDisplay.js";
//import dataDisplayHelper from "/apogeejs-view-lib/src/datadisplay/dataDisplayHelper.js";
import {getErrorViewModeEntry,getAppCodeViewModeEntry,getFormulaViewModeEntry} from "/apogeejs-view-lib/src/datasource/standardDataDisplay.js";


// class ReactElementCellView extends ComponentView {

//     //==============================
//     // Protected and Private Instance Methods
//     //==============================



//     getOutputDataDisplay(displayContainer) {
//         displayContainer.setDestroyViewOnInactive(this.getComponent().getField("destroyOnInactive"));
//         var dataDisplaySource = this.getOutputDataDisplaySource();
//         return new HtmlJsDataDisplay(displayContainer,dataDisplaySource);
//     }

//     getOutputDataDisplaySource() {

//         return {

//             //This method reloads the component and checks if there is a DATA update. UI update is checked later.
//             doUpdate: () => {
//                 //return value is whether or not the data display needs to be udpated
//                 let reloadData = this.getComponent().isMemberDataUpdated("member");
//                 let reloadDataDisplay = this.getComponent().areAnyFieldsUpdated(["html","resource"]);
//                 return {reloadData,reloadDataDisplay};
//             },

//             getData: () => dataDisplayHelper.getWrappedMemberData(this,"member"),

//             //below - custom methods for HtmlJsDataDisplay

//             //returns the HTML for the data display
//             getHtml: () => {
//                 return this.getComponent().getField("html");
//             },

//             //returns the resource for the data display
//             getResource: () => {
//                 return this.getComponent().getField("resource");
//             },

//             //gets the mebmer used as a refernce for the UI manager passed to the resource functions 
//             getScopeMember: () => {
//                 return this.getComponent().getMember();
//             }
//         }
//     }
// }



//======================================
// This is the control config, to register the control
//======================================

const ReactElementCellViewConfig = {
    componentType: "apogeeapp.ReactElementCell",
    viewClass: ComponentView,
    viewModes: [
        getErrorViewModeEntry(),
        // {
        //     name: "Display", 
        //     label: "Display", 
        //     isActive: true,
        //     getDataDisplay: (componentView,displayContainer) => componentView.getOutputDataDisplay(displayContainer)
        // },
        getAppCodeViewModeEntry("jsxCode",null,"jsxCode","JSX Code",{sourceType: "code", argList:"props", isActive: true /*,textDisplayMode: "ace/mode/js"*/}),
        getFormulaViewModeEntry("member",{name: "convertedCode", label:"Converted Code"})
    ],
    iconResPath: "/icons3/genericCellIcon.png"
}
export default ReactElementCellViewConfig;






