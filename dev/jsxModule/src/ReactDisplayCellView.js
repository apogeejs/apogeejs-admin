import ComponentView from "/apogeejs-view-lib/src/componentdisplay/ComponentView.js";
import HtmlJsDataDisplay from "/apogeejs-view-lib/src/datadisplay/HtmlJsDataDisplay.js";
import dataDisplayHelper from "/apogeejs-view-lib/src/datadisplay/dataDisplayHelper.js";
import {getErrorViewModeEntry,getAppCodeViewModeEntry,getFormulaViewModeEntry,getPrivateViewModeEntry} from "/apogeejs-view-lib/src/datasource/standardDataDisplay.js";


function getOutputDataDisplay(componentView,displayContainer) {
    displayContainer.setDestroyViewOnInactive(componentView.getComponent().getField("destroyOnInactive"));
    var dataDisplaySource = getOutputDataDisplaySource(componentView);
    return new HtmlJsDataDisplay(displayContainer,dataDisplaySource);
}

function getOutputDataDisplaySource(componentView) {

    return {

        //This method reloads the component and checks if there is a DATA update. UI update is checked later.
        doUpdate: () => {
            //return value is whether or not the data display needs to be udpated
            let reloadData = componentView.getComponent().isMemberDataUpdated("member.props");
            let reloadDataDisplay = componentView.getComponent().isMemberDataUpdated("member.jsx");
            return {reloadData,reloadDataDisplay};
        },

        getData: () => dataDisplayHelper.getWrappedMemberData(componentView,"member.props"),

        //below - custom methods for HtmlJsDataDisplay

        //returns the HTML for the data display
        getHtml: () => {
            return "";
        },

        //returns the resource for the data display
        getResource: () => {
            return {
                setData: function(props,outputElement,admin) {
                    let elementMember = componentView.getComponent().getField("member.jsx");
                    if(elementMember.getState() == apogeeutil.STATE_NORMAL) {
                        let Element = elementMember.getData();
                        ReactDOM.render(React.createElement(Element,props),outputElement);
                    }
                    else {
                        apogeeUserAlert("error in jsx code")
                    }
                }
            }
        },

        //gets the mebmer used as a refernce for the UI manager passed to the resource functions 
        getScopeMember: () => {
            let inputMember = componentView.getComponent().getField("member.props");
            return inputMember;
        }
    }
}


//======================================
// This is the control config, to register the control
//======================================

const ReactDisplayCellViewConfig = {
    componentType: "apogeeapp.ReactDisplayCell",
    viewClass: ComponentView,
    viewModes: [
        getErrorViewModeEntry(),
        {
            name: "Display", 
            label: "Display", 
            isActive: true,
            getDataDisplay: (componentView,displayContainer) => getOutputDataDisplay(componentView,displayContainer)
        },
        getAppCodeViewModeEntry("jsxCode",null,"jsxCode","JSX Code",{sourceType: "code", argList:"props", isActive: true /*,textDisplayMode: "ace/mode/js"*/}),
        getFormulaViewModeEntry("member.jsx",{name: "convertedCode", label:"Converted Code"}),
        getFormulaViewModeEntry("member.props","inputProperties","Input Properties"),
        getPrivateViewModeEntry("member.props","inputPrivate","Input Private"),
    ],
    iconResPath: "/icons3/genericCellIcon.png"
}
export default ReactDisplayCellViewConfig;






