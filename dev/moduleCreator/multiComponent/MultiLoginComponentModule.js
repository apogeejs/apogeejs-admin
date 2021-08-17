//import ManaualLoginComponentMember from "./ManaualLoginComponentMember.js";
import MultiLoginComponentConfig from "./MultiLoginComponent.js";
import MultiLoginComponentViewConfig from "./MultiLoginComponentView.js";

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
        apogeeview.registerComponentView(MultiLoginComponentViewConfig);
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
        apogeeview.unregisterComponentView(MultiLoginComponentViewConfig);
    }
}

export {MultiLoginComponentModule as default};
