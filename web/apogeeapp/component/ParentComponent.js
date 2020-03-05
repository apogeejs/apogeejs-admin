import apogeeutil from "/apogeeutil/apogeeUtilLib.js";
import Component from "/apogeeapp/component/Component.js";

import "/apogeeapp/commands/literatepagetransaction.js";
import { createProseMirrorManager } from "/apogeeview/componentdisplay/literatepage/proseMirrorSetup.js";

/** This is the base class for a parent component (an object that has children),
 * It extends the component class. */
export default class ParentComponent extends Component {

    constructor(modelManager,member) {
        //base constructor
        super(modelManager,member);

        //create an empty edit state to start
        this.editorManager = createProseMirrorManager(this);
        this.editorData = this.editorManager.createEditorState();
    }

    getEditorData() {
        return this.editorData;
    }

    setEditorData(editorData) {
        this.editorData = editorData;
        //for now set dummy data to show a change
        this.setField("document",Date.now());
    }

    getEditorManager() {
        return this.editorManager;
    }

}

/** This is used to flag this as an edit component. */
ParentComponent.isParentComponent = true;