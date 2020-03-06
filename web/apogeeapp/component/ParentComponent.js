import apogeeutil from "/apogeeutil/apogeeUtilLib.js";
import Component from "/apogeeapp/component/Component.js";

import "/apogeeapp/commands/literatepagetransaction.js";
import { createFolderSchema } from "/apogeeview/editor/apogeeSchema.js";
import { DOMParser, Node as ProseMirrorNode }  from "/prosemirror/lib/prosemirror-model/src/index.js";

/** This is the base class for a parent component (an object that has children),
 * It extends the component class. */
export default class ParentComponent extends Component {

    constructor(modelManager,member) {
        //base constructor
        super(modelManager,member);

        this.schema = createFolderSchema(this);

        //fields in the parent component
        this.document = null;

        //temporar fields in the parent component
        this.tempEditorStateInfo = null;
    }

    getSchema() {
        return this.schema;
    }

    /** This method sets the document. It also allows for temporarily storing some editor info 
     * to accompany a set document */
    setDocument(document,editorStateInfo) {
        this.document = document;
        //for now set dummy data to show a change
        this.setField("document",Date.now());

        //set the temporary editor state, to be used with the new document
        if(editorStateInfo) this.tempEditorStateInfo = editorStateInfo;
    }

    getDocument() {
        return this.document;
    }

    /** This method retrieves the editor state info that acompanies the set document.
     * The argument doClearInfo, if true, will trigger the stored state info to be cleared.
     * This field is meant purely as a temporary storage and should be cleared once it is read. */
    getEditorStateInfo(doClearInfo) {
        let tempEditorStateInfo = this.tempEditorStateInfo;
        if(doClearInfo) {
            this.tempEditorStateInfo = null;
        }
        return tempEditorStateInfo;
    }

    instantiateTabDisplay() {
        let member = this.getMember();
        let folder = this.getParentFolderForChildren();
        return new LiteratePageComponentDisplay(this,member,folder); 
    }

    //==============================
    // serialization
    //==============================

    /** This serializes the table component. */
    writeToJson(json) {
        //save the editor state
        if(this.document) {
            json.data = {};
            json.data.doc = this.document.toJSON();
        }
        
        //save the children
        var folder = this.getParentFolderForChildren();
        var modelManager = this.getModelManager();
        json.children = modelManager.getFolderComponentContentJson(folder);

        return json;
    }

    readFromJson(json) {
        //read the editor state
        if((json.data)&&(json.data.doc)) {
            //parse the saved document
            this.document = ProseMirrorNode.fromJSON(this.schema,json.data.doc);
            
        }
        else {
            //no document stored - create an empty document
            this.document = DOMParser.fromSchema(this.schema).parse("");
        }

        //this is just temporary, before we add the document named field
        this.setField("document",Date.now());
    }

}

/** This is used to flag this as an edit component. */
ParentComponent.isParentComponent = true;