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
// Custom Schema
//===================================

const {Schema} = require("prosemirror-model")

const pDOM = ["p", 0], blockquoteDOM = ["blockquote", 0], hrDOM = ["hr"],
      preDOM = ["pre", ["code", 0]], brDOM = ["br"]

// :: Object
// [Specs](#model.NodeSpec) for the nodes defined in this schema.
const nodes = {
  // :: NodeSpec The top level document node.
  doc: {
    content: "block+"
  },

  // :: NodeSpec A plain paragraph textblock. Represented in the DOM
  // as a `<p>` element.
  paragraph: {
    content: "inline*",
    group: "block",
    parseDOM: [{tag: "p"}],
    toDOM() { return pDOM }
  },

  // :: NodeSpec A blockquote (`<blockquote>`) wrapping one or more blocks.
  blockquote: {
    content: "block+",
    group: "block",
    defining: true,
    parseDOM: [{tag: "blockquote"}],
    toDOM() { return blockquoteDOM }
  },

  // :: NodeSpec A horizontal rule (`<hr>`).
  horizontal_rule: {
    group: "block",
    parseDOM: [{tag: "hr"}],
    toDOM() { return hrDOM }
  },

  // :: NodeSpec A heading textblock, with a `level` attribute that
  // should hold the number 1 to 6. Parsed and serialized as `<h1>` to
  // `<h6>` elements.
  heading: {
    attrs: {level: {default: 1}},
    content: "inline*",
    group: "block",
    defining: true,
    parseDOM: [{tag: "h1", attrs: {level: 1}},
               {tag: "h2", attrs: {level: 2}},
               {tag: "h3", attrs: {level: 3}},
               {tag: "h4", attrs: {level: 4}},
               {tag: "h5", attrs: {level: 5}},
               {tag: "h6", attrs: {level: 6}}],
    toDOM(node) { return ["h" + node.attrs.level, 0] }
  },

  // :: NodeSpec A code listing. Disallows marks or non-text inline
  // nodes by default. Represented as a `<pre>` element with a
  // `<code>` element inside of it.
  code_block: {
    content: "text*",
    marks: "",
    group: "block",
    code: true,
    defining: true,
    parseDOM: [{tag: "pre", preserveWhitespace: "full"}],
    toDOM() { return preDOM }
  },

  // :: NodeSpec The text node.
  text: {
    group: "inline"
  },

  // :: NodeSpec An inline image (`<img>`) node. Supports `src`,
  // `alt`, and `href` attributes. The latter two default to the empty
  // string.
  image: {
    inline: true,
    attrs: {
      src: {},
      alt: {default: null},
      title: {default: null}
    },
    group: "inline",
    draggable: true,
    parseDOM: [{tag: "img[src]", getAttrs(dom) {
      return {
        src: dom.getAttribute("src"),
        title: dom.getAttribute("title"),
        alt: dom.getAttribute("alt")
      }
    }}],
    toDOM(node) { let {src, alt, title} = node.attrs; return ["img", {src, alt, title}] }
  },

  // :: NodeSpec A hard line break, represented in the DOM as `<br>`.
  hard_break: {
    inline: true,
    group: "inline",
    selectable: false,
    parseDOM: [{tag: "br"}],
    toDOM() { return brDOM }
  }
}

const emDOM = ["em", 0], strongDOM = ["strong", 0], codeDOM = ["code", 0]

// :: Object [Specs](#model.MarkSpec) for the marks in the schema.
const marks = {
  // :: MarkSpec A link. Has `href` and `title` attributes. `title`
  // defaults to the empty string. Rendered and parsed as an `<a>`
  // element.
  link: {
    attrs: {
      href: {},
      title: {default: null}
    },
    inclusive: false,
    parseDOM: [{tag: "a[href]", getAttrs(dom) {
      return {href: dom.getAttribute("href"), title: dom.getAttribute("title")}
    }}],
    toDOM(node) { let {href, title} = node.attrs; return ["a", {href, title}, 0] }
  },

  // :: MarkSpec An emphasis mark. Rendered as an `<em>` element.
  // Has parse rules that also match `<i>` and `font-style: italic`.
  em: {
    parseDOM: [{tag: "i"}, {tag: "em"}, {style: "font-style=italic"}],
    toDOM() { return emDOM }
  },

  // :: MarkSpec A strong mark. Rendered as `<strong>`, parse rules
  // also match `<b>` and `font-weight: bold`.
  strong: {
    parseDOM: [{tag: "strong"},
               // This works around a Google Docs misbehavior where
               // pasted content will be inexplicably wrapped in `<b>`
               // tags with a font-weight normal.
               {tag: "b", getAttrs: node => node.style.fontWeight != "normal" && null},
               {style: "font-weight", getAttrs: value => /^(bold(er)?|[5-9]\d{2,})$/.test(value) && null}],
    toDOM() { return strongDOM }
  },
  
  //------------------------
  //test
  //------------------------
  // an attempt at text color, with style
  color: {
    attrs: {
      color: {default: "black"}
    },
    parseDOM: [{tag: "span", style: "color"}],
    toDOM(node) { return ["span", {"style":"color:"+node.attrs["color"]+";"}, 0] }
  },
  
  highlight: {
    attrs: {
      highlightcolor: {default: "white"}
    },
    parseDOM: [{tag: "span", style: "background-color"}],
    toDOM(node) { return ["span", {"style":"background-color:"+node.attrs["highlightcolor"]+";"}, 0] }
  },

  
//  colorblue: {
//    parseDOM: [{tag: "span", {style: "color=blue"}],
//    toDOM() { return emDOM }
//  },
  
  //------------------------
  //end test
  //------------------------

  // :: MarkSpec Code font mark. Represented as a `<code>` element.
  code: {
    parseDOM: [{tag: "code"}],
    toDOM() { return codeDOM }
  }
}

// :: Schema
// This schema rougly corresponds to the document schema used by
// [CommonMark](http://commonmark.org/), minus the list elements,
// which are defined in the [`prosemirror-schema-list`](#schema-list)
// module.
//
// To reuse elements from this schema, extend or read from its
// `spec.nodes` and `spec.marks` [properties](#model.Schema.spec).
const schema = new Schema({nodes, marks})

//===================================
// Menu Items
// Our menu plugn lets us toggle marks, set block type and wrap in (which I won't use for starters)
//===================================

const {toggleMark, setBlockType, wrapIn} = require("prosemirror-commands")

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

function colorItem(color) {
    return {
        command: toggleMark(schema.marks.color, {color}),
        dom: icon("Text: " + color, "color")
    }
}

function highlightItem(highlightcolor) {
    return {
        command: toggleMark(schema.marks.highlight, {highlightcolor}),
        dom: icon("Highlight: " + highlightcolor, "highlight")
    }
}

let menu = menuPlugin([
    {command: toggleMark(schema.marks.strong), dom: icon("B", "strong")},
    {command: toggleMark(schema.marks.em), dom: icon("i", "em")},
    colorItem("blue"),colorItem("red"),colorItem("green"),
    highlightItem("yellow"),highlightItem("cyan"),highlightItem("lightblue"),
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


