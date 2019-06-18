function proseMirrorSetup() {
    
    // Kludge to make requiring prosemirror core libraries possible. The
    // PM global is defined by http://prosemirror.net/examples/prosemirror.js,
    // which bundles all the core libraries.
    function require(name) {
      let id = /^prosemirror-(.*)/.exec(name), mod = id && PM[id[1].replace(/-/g, "_")]
      if (!mod) throw new Error(`Library basic isn't loaded`)
      return mod
    }

    //=======================
    // Create the test block schema
    //=======================

    const {Schema} = require("prosemirror-model")
    const {schema} = require("prosemirror-schema-basic")
    const {addListNodes} = require("prosemirror-schema-list")

    var NodeXXX;
    function NodeLoad() {
        const {Node} = require("prosemirror-model");
        NodeXXX = Node;
    }
    NodeLoad();


    const testBlockSpec = {
      group: "block",
      marks: "",
      draggable: true,

      attrs: {"state": {default: ""}},
      toDOM: node => {
          return ["div", {"data-state": JSON.stringify(node.attrs.state)}]
      },
      parseDOM: [{
            tag: "div[data-state]",
            getAttrs: (dom) => {
                let stateText = dom.getAttribute("data-state");
                let state;
                if(stateText !== undefined) {
                    state = JSON.parse(stateText);
                }
                else {
                    state = ""
                }
                return {state};
            }
        }]
    }
    
    const apogeeComponentSpec = {
      group: "block",
      marks: "",
      draggable: true,

      attrs: {"state": {default: ""}},
      toDOM: node => ["div", {"data-state": JSON.stringify(node.attrs.state)}],
      parseDOM: [{
            tag: "div[data-state]",
            getAttrs: (dom) => {
                let stateText = dom.getAttribute("data-state");
                let state;
                if(stateText !== undefined) {
                    state = JSON.parse(stateText);
                }
                else {
                    state = ""
                }
                return {state};
            }
        }]
    }

    //schema object
    const testBlockSchema = new Schema({
       nodes: addListNodes(schema.spec.nodes.addBefore("image", "testBlock", testBlockSpec).addBefore("image", "apogeeComponent", apogeeComponentSpec), "paragraph block*", "block"),
       marks: schema.spec.marks
    })

    //===================
    //add test block command
    //===================

    const {insertPoint} = require("prosemirror-transform")
    const {MenuItem} = require("prosemirror-menu")
    const {buildMenuItems} = require("prosemirror-example-setup")
    const {Fragment} = require("prosemirror-model")

    let menu = buildMenuItems(testBlockSchema)
    menu.insertMenu.content.push(new MenuItem({
      title: "Insert Test Block",
      label: "Test Block",
      select(state) {
        return insertPoint(state.doc, state.selection.from, testBlockSchema.nodes.testBlock) != null
      },
      run(state, dispatch) {
        let {empty, $from, $to} = state.selection, content = Fragment.empty
        if (!empty && $from.sameParent($to) && $from.parent.inlineContent)
          content = $from.parent.content.cut($from.parentOffset, $to.parentOffset)
        dispatch(state.tr.replaceSelectionWith(testBlockSchema.nodes.testBlock.create({"state":""})))
      }
    }))
    menu.insertMenu.content.push(new MenuItem({
        title: "Insert Apogee Component",
        label: "Apogee Component",
        select(state) {
            return insertPoint(state.doc, state.selection.from, testBlockSchema.nodes.apogeeComponent) != null
        },
        run(state, dispatch) {
        
            var name = prompt("Component name?");
            
            let {empty, $from, $to} = state.selection, content = Fragment.empty
            if (!empty && $from.sameParent($to) && $from.parent.inlineContent)
                content = $from.parent.content.cut($from.parentOffset, $to.parentOffset)
            dispatch(state.tr.replaceSelectionWith(testBlockSchema.nodes.apogeeComponent.create({"state":name})))
      }
    }))


    //==============================
    // Add a test block view class
    //==============================

    const {StepMap} = require("prosemirror-transform")
    const {keymap} = require("prosemirror-keymap")
    const {undo, redo} = require("prosemirror-history")

    class TestBlockView {
      constructor(node, view, getPos) {
        // We'll need these later
        this.node = node
        this.view = view
        this.getPos = getPos

        // The node's representation in the editor
        this.dom = document.createElement("div");

        this.saveButton = document.createElement("button");
        this.saveButton.innerHTML = "Save";
        this.saveButton.onclick = () => this.save();
        this.dom.appendChild(this.saveButton);

        this.cancelButton = document.createElement("button");
        this.cancelButton.innerHTML = "Cancel";
        this.cancelButton.onclick = () => this.cancel();
        this.dom.appendChild(this.cancelButton);

        this.dom.appendChild(document.createElement("br"));

        this.textArea = document.createElement("textarea");
        this.dom.appendChild(this.textArea);

        this.contentDiv = document.createElement("div");
        this.dom.appendChild(this.contentDiv);

        this.setViewDataFromNode();

      }

      ///////////////////////////////////////////////////////////////////
      //start my new functions

        save() {
            let targetText = this.textArea.value;
            let targetData;
            try {
              targetData = JSON.parse(targetText);
            }
            catch(error) {
              alert("Error parsing JSON input!");
              return;
            }
            let start = this.getPos();
            let end = this.getPos() + this.node.nodeSize;
            let newNode = testBlockSchema.nodes.testBlock.create({"state":targetData})

            let tr = this.view.state.tr.replaceWith(start, end, newNode);
            this.view.dispatch(tr);
        }


      cancel() {
          //replace value in text area
          this.textArea.value = this.node.textContent;
          var textData = this.getTextData();
          this.contentDiv.innerHTML = textData;
      }



      //end my new functions
      ////////////////////////////////////////////////////////////////////

      selectNode() {
        this.dom.classList.add("ProseMirror-selectednode")
        //if (!this.innerView) this.open()
      }

      deselectNode() {
        this.dom.classList.remove("ProseMirror-selectednode")
        //if (this.innerView) this.close()
      }  

        setViewDataFromNode() {  
            var textData = this.getTextData();
            this.textArea.value = textData
            this.contentDiv.innerHTML = textData;
        }

        getJsonData() {
    //get the attribute!!!!
            var stateJson = this.node.attrs["state"];
            if(stateJson === undefined) stateJson = "";
            return stateJson;
        }

        getTextData() {
    //get the json data and make to text
            var data = this.getJsonData();
            var textData;
            if(data == null) textData = "";
            else textData = JSON.stringify(data);
            return textData;
        }

      update(node) {
        if (!node.sameMarkup(this.node)) return false
        this.node = node;
        this.setViewDataFromNode();
        return true
      }

      destroy() {
    //    if (this.innerView) this.close()
      }

      stopEvent(event) {
          return true;
      }

      ignoreMutation() { return true }
    }
    
    //-------------------------------
    // Apogee component
    //-------------------------------

    class ApogeeComponentView {
      constructor(node, view, getPos, folderComponent, folderMember) {
        // We'll need these later
        this.node = node
        this.view = view
        this.getPos = getPos
        this.folderComponent = folderComponent;
        this.folderMember = folderMember;

        // The node's representation in the editor
        this.dom = document.createElement("div");
        this.dom.className = "page-apogee-comp";
        
        this.contentDiv = document.createElement("div");
        this.contentDiv.className = "page-apogee-comp-container"
        this.dom.appendChild(this.contentDiv);

        this.setViewDataFromNode();

      }

      ///////////////////////////////////////////////////////////////////
      //start my new functions

        save() {
//            let targetText = this.textArea.value;
//            let targetData;
//            try {
//              targetData = JSON.parse(targetText);
//            }
//            catch(error) {
//              alert("Error parsing JSON input!");
//              return;
//            }
//            let start = this.getPos();
//            let end = this.getPos() + this.node.nodeSize;
//            let newNode = testBlockSchema.nodes.testBlock.create({"state":targetData})
//
//            let tr = this.view.state.tr.replaceWith(start, end, newNode);
//            this.view.dispatch(tr);
        }


      cancel() {
//          //replace value in text area
//          this.textArea.value = this.node.textContent;
//          var textData = this.getTextData();
//          this.contentDiv.innerHTML = textData;
      }



      //end my new functions
      ////////////////////////////////////////////////////////////////////

      selectNode() {
        this.dom.classList.add("ProseMirror-selectednode")
        //if (!this.innerView) this.open()
      }

      deselectNode() {
        this.dom.classList.remove("ProseMirror-selectednode")
        //if (this.innerView) this.close()
      }  

        setViewDataFromNode() {  
            var jsonData = this.getJsonData();
            var name = jsonData;
            
            //lookup component
            var member = this.folderMember.lookupChild(name);
            
            if(member) {            
                var workspaceUI = this.folderComponent.getWorkspaceUI();
                var component = workspaceUI.getComponent(member);
                var componentDisplay = component.getComponentDisplay();
                if(!componentDisplay) {
                    //CLUDGE ALERT - fix this when I reorganize the code
                    var tabDisplay = this.folderComponent.getTabDisplay();
                    tabDisplay.addChildComponent(component);
                    componentDisplay = component.getComponentDisplay();
                }
                var displayElement = componentDisplay.getElement();
                this.contentDiv.appendChild(displayElement);
            }
            else {
                this.contentDiv.innerHTML = "Component not found: " + name;
            }
            
        }

        getJsonData() {
    //get the attribute!!!!
            var stateJson = this.node.attrs["state"];
            if(stateJson === undefined) stateJson = "";
            return stateJson;
        }

        getTextData() {
    //get the json data and make to text
            var data = this.getJsonData();
            var textData;
            if(data == null) textData = "";
            else textData = JSON.stringify(data);
            return textData;
        }

      update(node) {
        if (!node.sameMarkup(this.node)) return false
        this.node = node;
        this.setViewDataFromNode();
        return true
      }

      destroy() {
    //    if (this.innerView) this.close()
      }

      stopEvent(event) {
          return true;
      }

      ignoreMutation() { return true }
    }

    //==============================
    // Create the editor
    //==============================

    const {EditorState} = require("prosemirror-state")
    const {DOMParser} = require("prosemirror-model")
    const {EditorView} = require("prosemirror-view")
    const {exampleSetup} = require("prosemirror-example-setup")

    function saveState() {
        var stateJson = window.view.state.toJSON();
        console.log(JSON.stringify(stateJson));
    }

    function openState() {
        var stateText = prompt("Enter the state json:");
        var stateJson = JSON.parse(stateText);
        var doc = NodeXXX.fromJSON(testBlockSchema,stateJson.doc);
        var state = EditorState.create({
            doc: doc,
            plugins: exampleSetup({schema: testBlockSchema, menuContent: menu.fullMenu})
        });
        window.view.updateState(state);
    }

    function showSelection() {
        var selection = window.view.state.selection;
        console.log(JSON.stringify(selection));
    }
    
    //===============================
    //set up the export functions
    //===============================
    
    var proseMirror = {};
    
    proseMirror.createEditorState = function(docJson) {
        var doc;
        if(docJson) {
            doc = NodeXXX.fromJSON(testBlockSchema,docJson);
        }
        else {
            doc = DOMParser.fromSchema(testBlockSchema).parse("");
        }

        var state = EditorState.create({    
            doc: doc,
            plugins: exampleSetup({schema: testBlockSchema, menuContent: menu.fullMenu})
        })
        
        return state;
    }
    
    proseMirror.createEditorView = function(containerElement,folderComponent,folderMember,editorState) {

        var nodeViews = {};
        nodeViews.testBlock = (node, view, getPos) => new TestBlockView(node, view, getPos);
        nodeViews.apogeeComponent = (node, view, getPos) => new ApogeeComponentView(node, view, getPos, folderComponent, folderMember);

        var editorView = new EditorView(containerElement, {
          state: editorState,
          nodeViews: nodeViews
        })

        return editorView;

    }

    return proseMirror;
}

//for now I will ad an explicit delay to load this. I do need to do it a different way.
var proseMirror;
        
setTimeout(() => {proseMirror = proseMirrorSetup()},2000);




