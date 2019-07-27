const {EditorState} = require("prosemirror-state")
const {EditorView} = require("prosemirror-view")
const {Schema, DOMParser} = require("prosemirror-model")
const {schema} = require("prosemirror-schema-basic")
const {addListNodes} = require("prosemirror-schema-list")
const {exampleSetup} = require("prosemirror-example-setup")


//============================
// debug plugin
//============================

const {Plugin} = require("prosemirror-state")

//This is a test to measure the state of the editor. I want to use this to 
//configure my menu bar (as to what is active)
class StateCheck {
    constructor(editorView) {
        this.editorView = editorView
    }

    update() {
        this._showSelectionInfo();
    }
    
    
    _showSelectionInfo() {

        var {empty,$cursor,ranges} = this.editorView.state.selection;
        var doc = this.editorView.state.doc;
        
        var nodeTypes = [];
        var markTypes = [];
        
        console.log("================");
                
        console.log("Empty: " + empty);

        //cursor
        if($cursor) {
            if($cursor.parent) {
                console.log("Cursor Parent: " + $cursor.parent.type.name);
            }
            
            let ancestor;
            for(let i = 0; (ancestor = $cursor.node(i)); i++) {
                console.log("Cursor ancestor " + i + ": " + ancestor.type.name);
            }
            let cursorMarks = $cursor.marks().map(mark => mark.type.name);
            console.log("Cursor Marks: " + cursorMarks)
        }

        //selection
        for (let rangeIndex = 0; rangeIndex < ranges.length; rangeIndex++) {
            let {$from, $to} = ranges[rangeIndex]
            doc.nodesBetween($from.pos, $to.pos, node => {

                //get the base node and mark info
                nodeTypes.push(node.type.name);

                let nodeMarks = [];
                node.marks.forEach(mark => {
                    nodeMarks.push(mark.type.name);
                });
                markTypes.push(nodeMarks);
            })
        }
        
        console.log("Nodes: " + JSON.stringify(nodeTypes));
        console.log("Marks: " + JSON.stringify(markTypes));
        
        console.log("================");
    }
}

let stateCheck = new Plugin({
    view(editorView) {
        let stateCheck = new StateCheck(editorView)
        return stateCheck
    }
})



// Mix the nodes from prosemirror-schema-list into the basic schema to
// create a schema with list support.
const mySchema = new Schema({
  nodes: addListNodes(schema.spec.nodes, "paragraph block*", "block"),
  marks: schema.spec.marks
})

var plugins = exampleSetup({schema: mySchema});
plugins.push(stateCheck);

window.view = new EditorView(document.querySelector("#editor"), {
  state: EditorState.create({
    doc: DOMParser.fromSchema(mySchema).parse(document.querySelector("#content")),
    plugins: plugins
  })
})