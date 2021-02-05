import {keydownHandler}  from "/prosemirror/dist/prosemirror-keymap.es.js";
import {NodeSelection}  from "/prosemirror/dist/prosemirror-state.es.js";
import {Plugin}  from "/prosemirror/dist/prosemirror-state.es.js";

const dummyFunction = () => true;

const PASSTHROUGH_KEYMAP = {
    "Enter": dummyFunction,
    "Delete": dummyFunction,
    "Mod-a": dummyFunction,
    "ArrowLeft": dummyFunction,
    "ArrowRight": dummyFunction,
    "ArrowUp": dummyFunction,
    "ArrowDown": dummyFunction,
    "Shift-ArrowLeft": dummyFunction,
    "Shift-ArrowRight": dummyFunction,
    "Shift-ArrowUp": dummyFunction,
    "Shift-ArrowDown": dummyFunction,
    "Mod-z": dummyFunction,
    "Mod-y": dummyFunction,
    "Mod-c": dummyFunction,
    "Mod-x": dummyFunction,
    "Mod-v": dummyFunction,
}

//key handler args: state, dispatch, view

let inverseKeydownHandler = keydownHandler(PASSTHROUGH_KEYMAP);

function interactiveNodeKeydownHandler(view,event) {

    if((view.state.selection instanceof NodeSelection)&&(view.state.selection.node.type.spec.hasInteractiveSelection)) {
        //interactive node selected
        let passThrough = inverseKeydownHandler(view,event);

        if(passThrough) return false;
        else {
            //pass these events along
            console.log("Event captured for selecte interactive node: " + event.key);

            return true;
        }
    }
    else {
        //interactive node is not selected
        return false;
    }
}


/** This creates a plugin to filter out keydown events and to forward when
/* thee is an interactive node selected. */ 
export const getInteractiveNodePlugin = function() {
    return new Plugin({
        props: {
            handleKeyDown: interactiveNodeKeydownHandler
        }
    })
}
