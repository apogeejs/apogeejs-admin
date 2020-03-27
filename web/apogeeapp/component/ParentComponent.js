import apogeeutil from "/apogeeutil/apogeeUtilLib.js";
import Component from "/apogeeapp/component/Component.js";

import "/apogeeapp/commands/literatepagetransaction.js";
import { createFolderSchema } from "/apogeeapp/document/apogeeSchema.js";
import { DOMParser, Node as ProseMirrorNode }  from "/prosemirror/lib/prosemirror-model/src/index.js";

/** This is the base class for a parent component (an object that has children),
 * It extends the component class. */
export default class ParentComponent extends Component {

    constructor(member,modelManager,instanceToCopy,keepUpdatedFixed) {
        //base constructor
        super(member,modelManager,instanceToCopy,keepUpdatedFixed);

        //==============
        //Fields
        //==============
        //Initailize these if this is a new instance
        //the schema should only be created once
        if(!instanceToCopy) {
            let schema = createFolderSchema(modelManager.getApp(),member.getId());
            this.setField("schema",schema);
            //initialize with an empty document
            let document = this._createEmptyDocument(schema);
            this.setField("document",document);
        }

        //==============
        //Working variables
        //==============
        this.tempEditorStateInfo = null;
 
    }

    getSchema() {
        return this.getField("schema");
    }

    /** This method sets the document. It also allows for temporarily storing some editor info 
     * to accompany a set document */
    setDocument(document,editorStateInfo) {
        //for now set dummy data to show a change
        this.setField("document",document);

        //set the temporary editor state, to be used with the new document
        if(editorStateInfo) this.tempEditorStateInfo = editorStateInfo;
    }

    getDocument() {
        return this.getField("document");
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
    writeToJson(json,modelManager) {
        //save the editor state
        let document = this.getField("document");
        if(document) {
            json.data = {};
            json.data.doc = document.toJSON();
        }
        
        //save the children
        var folder = this.getParentFolderForChildren();
        var childrenPresent = false;
        var children = {};
        var childIdMap = folder.getChildIdMap();
        for(var key in childIdMap) {
            var childId = childIdMap[key];
            var childComponent = modelManager.getComponentByMemberId(childId);
            var name = childComponent.getName();
            children[name] = childComponent.toJson(modelManager);
            childrenPresent = true;
        }
        if(childrenPresent) {
            json.children = children;
        }

        return json;
    }

    readFromJson(json) {
        let document;
        let schema = this.getField("schema");

        //read the editor state
        if((json.data)&&(json.data.doc)) {
            //parse the saved document
            document = ProseMirrorNode.fromJSON(schema,json.data.doc);
        }
        else {
            //no document stored - create an empty document
            document = this._createEmptyDocument(schema);
        }
        this.setField("document",document);
    }

    /** This method loads the children for this component */
    loadChildrenFromJson(modelManager,componentJson) {
        let childCommandResults = [];
        if(componentJson.children) {
            let parentMember = this.getParentFolderForChildren();
            
            for(let childName in componentJson.children) {
                let childMember = parentMember.lookupChild(modelManager.getModel(),childName);
                if(childMember) {
                    let childComponentJson = componentJson.children[childName];
                    var childCommandResult = modelManager.createComponentFromMember(childMember,childComponentJson);
                    childCommandResults.push(childCommandResult);
                }
            };

        }
        return childCommandResults;
    }

    /** This method makes an empty document */
    _createEmptyDocument(schema) {
        return DOMParser.fromSchema(schema).parse("");
    }

}

/** This is used to flag this as an edit component. */
ParentComponent.isParentComponent = true;