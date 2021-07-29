//import ManaualLoginComponentMember from "./ManaualLoginComponentMember.js";
import MultiLoginComponent from "./MultiLoginComponent.js";
import MultiLoginComponentView from "./MultiLoginComponentView.js";

const MultiLoginComponentModule = {
    initApogeeModule: function() {
        //------------------------------
        // register the custom member
        //------------------------------
        //ManaualLoginComponentMember.defineMember();

        //-------------------------------
        //register the parse csv component
        //-------------------------------
        apogeeapp.componentInfo.registerComponent(MultiLoginComponent);

        //-------------------------------
        //register the parse csv component view
        //-------------------------------
        apogeeview.registerComponentView(MultiLoginComponentView);
    },

    removeApogeeModule: function() {
        //------------------------------
        // unregister the custom member
        //------------------------------
        //ManaualLoginComponentMember.undefineMember();

        //-------------------------------
        //register the parse csv component
        //-------------------------------
        apogeeapp.componentInfo.unregisterComponent(MultiLoginComponent);

        //-------------------------------
        //register the parse csv component view
        //-------------------------------
        apogeeview.unregisterComponentView(MultiLoginComponentView);
    }
}

export {MultiLoginComponentModule as default};
