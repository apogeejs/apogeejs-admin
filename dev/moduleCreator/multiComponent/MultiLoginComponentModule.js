//import ManaualLoginComponentMember from "./ManaualLoginComponentMember.js";
import MultiLoginComponentConfig from "./MultiLoginComponent.js";
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
        apogeeapp.componentInfo.registerComponent(MultiLoginComponentConfig);

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
        apogeeapp.componentInfo.unregisterComponent(MultiLoginComponentConfig);

        //-------------------------------
        //register the parse csv component view
        //-------------------------------
        apogeeview.unregisterComponentView(MultiLoginComponentView);
    }
}

export {MultiLoginComponentModule as default};
