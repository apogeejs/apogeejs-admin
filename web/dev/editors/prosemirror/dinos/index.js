//=======================
//create the dino schema (here with added lists)
//======================

const dinos = ["brontosaurus", "stegosaurus", "triceratops",
               "tyrannosaurus", "pterodactyl"]
           
const dinoNodeSpec = {
  // Dinosaurs have one attribute, their type, which must be one of
  // the types defined above.
  // Brontosaurs are still the default dino.
  attrs: {type: {default: "brontosaurus"}},
  inline: true,
  group: "inline",
  draggable: true,

  // These nodes are rendered as images with a `dino-type` attribute.
  // There are pictures for all dino types under /img/dino/.
  toDOM: node => ["img", {"dino-type": node.attrs.type,
                          src: "/img/dino/" + node.attrs.type + ".png",
                          title: node.attrs.type,
                          class: "dinosaur"}],
  // When parsing, such an image, if its type matches one of the known
  // types, is converted to a dino node.
  parseDOM: [{
    tag: "img[dino-type]",
    getAttrs: dom => {
      let type = dom.getAttribute("dino-type")
      return dinos.indexOf(type) > -1 ? {type} : false
    }
  }]
}

//add the dino nodes to the baseic example nodes

const {Schema, DOMParser} = require("prosemirror-model")
const {schema} = require("prosemirror-schema-basic")
const {addListNodes} = require("prosemirror-schema-list")

let nodes = addListNodes(schema.spec.nodes, "paragraph block*", "block");
nodes = nodes.addBefore("image", "dino", dinoNodeSpec);

const dinoSchema = new Schema({
  nodes: nodes,
  marks: schema.spec.marks
})

//===================
//add dino command
//===================

//define a dino insertion command
let dinoType = dinoSchema.nodes.dino

function insertDino(type) {
  return function(state, dispatch) {
    let {$from} = state.selection, index = $from.index()
    if (!$from.parent.canReplaceWith(index, index, dinoType))
      return false
    if (dispatch)
      dispatch(state.tr.replaceSelectionWith(dinoType.create({type})))
    return true
  }
}

//creat a menu item for the dino
const {MenuItem} = require("prosemirror-menu")
const {buildMenuItems} = require("prosemirror-example-setup")

// Ask example-setup to build its basic menu
let menu = buildMenuItems(dinoSchema)

// Add a dino-inserting item for each type of dino
dinos.forEach(name => menu.insertMenu.content.push(new MenuItem({
  title: "Insert " + name,
  label: name.charAt(0).toUpperCase() + name.slice(1),
  enable(state) { return insertDino(name)(state) },
  run: insertDino(name)
})))

//====================
// create and initialize editor 
// ===================

const {EditorState} = require("prosemirror-state")
const {EditorView} = require("prosemirror-view")
const {exampleSetup} = require("prosemirror-example-setup")

//load the start document
let content = document.querySelector("#content")
let startDoc = DOMParser.fromSchema(dinoSchema).parse(content)

//create the editor
window.view = new EditorView(document.querySelector("#editor"), {
  state: EditorState.create({
    doc: startDoc,
    plugins: exampleSetup({schema: dinoSchema, menuContent: menu.fullMenu})
  })
})