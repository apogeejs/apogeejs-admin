//import ManaualLoginComponentMember from "./ManaualLoginComponentMember.js";
import ReactElementCellConfig from "./ReactElementCell.js";

const ReactElementsModule = {
    initApogeeModule: function() {
        //------------------------------
        // register the custom member
        //------------------------------
        //ManaualLoginComponentMember.defineMember();

        //-------------------------------
        //register the parse csv component
        //-------------------------------
        apogeeapp.componentInfo.registerComponent(ReactElementCellConfig);

    },

    removeApogeeModule: function() {
        //------------------------------
        // unregister the custom member
        //------------------------------
        //ManaualLoginComponentMember.undefineMember();

        //-------------------------------
        //register the parse csv component
        //-------------------------------
        apogeeapp.componentInfo.unregisterComponent(ReactElementCellConfig);

    }
}

export {ReactElementsModule as default};
