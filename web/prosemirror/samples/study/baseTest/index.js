//============================================
// Menu Plugin
// This menu plugin comes from the custom menu example. I will use it to
// understand adding to/making the schema
//============================================

class MenuView {
    constructor(items, editorView) {
        this.items = items
        this.editorView = editorView

        this.dom = document.createElement("div")
        this.dom.className = "menubar"
        items.forEach(({dom}) => this.dom.appendChild(dom))
        this.update()

        this.dom.addEventListener("mousedown", e => {
            e.preventDefault()
            editorView.focus()
            items.forEach(({command, dom}) => {
                if(dom.contains(e.target))
                    command(editorView.state, editorView.dispatch, editorView)
            })
        })
    }

    update() {
        this.items.forEach(({command, dom}) => {
            let active = command(this.editorView.state, null, this.editorView)
            dom.style.display = active ? "" : "none"
        })
    }

    destroy() { 
        this.dom.remove() 
    }
}

const {Plugin} = require("prosemirror-state")

function menuPlugin(items) {
    return new Plugin({
        view(editorView) {
            let menuView = new MenuView(items, editorView)
            editorView.dom.parentNode.insertBefore(menuView.dom, editorView.dom)
            return menuView
        }
    })
}

//===================================
// Menu Items
// Our menu plugn lets us toggle marks, set block type and wrap in (which I won't use for starters)
//===================================

const {toggleMark, setBlockType, wrapIn} = require("prosemirror-commands")
const {schema} = require("prosemirror-schema-basic")

// Helper function to create menu icons
function icon(text, name) {
    let span = document.createElement("span")
    span.className = "menuicon " + name
    span.title = name
    span.textContent = text
    return span
}

// Create an icon for a heading at the given level
function heading(level) {
    return {
        command: setBlockType(schema.nodes.heading, {level}),
        dom: icon("H" + level, "heading")
    }
}

let menu = menuPlugin([
    {command: toggleMark(schema.marks.strong), dom: icon("B", "strong")},
    {command: toggleMark(schema.marks.em), dom: icon("i", "em")},
    {command: setBlockType(schema.nodes.paragraph), dom: icon("p", "paragraph")},
    heading(1), heading(2), heading(3),
    {command: wrapIn(schema.nodes.blockquote), dom: icon(">", "blockquote")}
])

//===================================
// Menu Items
//===================================

const {EditorState} = require("prosemirror-state")
const {EditorView} = require("prosemirror-view")
const {undo, redo, history} = require("prosemirror-history")
const {keymap} = require("prosemirror-keymap")
const {baseKeymap} = require("prosemirror-commands")

var element = document.getElementById("editor");

let state = EditorState.create({
  schema,
  plugins: [
    history(),
    keymap({"Mod-z": undo, "Mod-y": redo}),
    keymap(baseKeymap),
    menu
  ]
})
let view = new EditorView(element, {state});


