//import ManaualLoginComponentMember from "./ManaualLoginComponentMember.js";
import ReactElementCellConfig from "./ReactElementCell.js";
import ReactElementCellViewConfig from "./ReactElementCellView.js";

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

        //-------------------------------
        //register the parse csv component view
        //-------------------------------
        apogeeview.registerComponentView(ReactElementCellViewConfig);
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

        //-------------------------------
        //register the parse csv component view
        //-------------------------------
        apogeeview.unregisterComponentView(ReactElementCellViewConfig);
    }
}

export {ReactElementsModule as default};
