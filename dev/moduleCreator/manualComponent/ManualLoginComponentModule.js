//import ManaualLoginComponentMember from "./ManaualLoginComponentMember.js";
import ManualLoginComponent from "./ManualLoginComponent.js";
import ManualLoginComponentView from "./ManualLoginComponentView.js";

const ManualLoginComponentModule = {
    initApogeeModule: function() {
        //------------------------------
        // register the custom member
        //------------------------------
        //ManaualLoginComponentMember.defineMember();

        //-------------------------------
        //register the parse csv component
        //-------------------------------
        apogeeapp.componentInfo.registerComponent(ManualLoginComponent);

        //-------------------------------
        //register the parse csv component view
        //-------------------------------
        apogeeview.registerComponentView(ManualLoginComponentView);
    },

    removeApogeeModule: function() {
        //------------------------------
        // unregister the custom member
        //------------------------------
        //ManaualLoginComponentMember.undefineMember();

        //-------------------------------
        //register the parse csv component
        //-------------------------------
        apogeeapp.componentInfo.unregisterComponent(ManualLoginComponent);

        //-------------------------------
        //register the parse csv component view
        //-------------------------------
        apogeeview.unregisterComponentView(ManualLoginComponentView);
    }
}

export {ManualLoginComponentModule as default};
