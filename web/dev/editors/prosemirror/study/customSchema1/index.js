//============================================
// Menu Plugin
// This menu plugin comes from the custom menu example. I will use it to
// understand adding to/making the schema
//============================================

class MenuView {
    constructor(elements, editorView) {
        this.elements = elements
        this.editorView = editorView

        this.dom = document.createElement("div")
        this.dom.className = "menubar"
        elements.forEach(element => { 
                //I am registering the editor view since it is needed for the command
                //here I attach the command to the item rather than as they do it below
                element.registerEditorView(editorView);
                this.dom.appendChild(element)
            })
//        this.update()

//        this.dom.addEventListener("mousedown", e => {
//            e.preventDefault()
//            editorView.focus()
//            elements.forEach(({command, dom}) => {
//                if(dom.contains(e.target))
//                    command(editorView.state, editorView.dispatch, editorView)
//            })
//        })
    }

    update() {
//reinsert this!!!
//        this.elements.forEach(({command, dom}) => {
//            let active = command(this.editorView.state, null, this.editorView)
//            dom.style.display = active ? "" : "none"
//        })
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
// State check plugin
//===================================

const MARK_INFO = {
    strong: true,
    em: true,
    font: "fontfamily",
    fontsize: "fontsize",
    color: "color",
    highlight: "highlightcolor"
}

const EMPTY_MARK_DATA = {
    strong: [],
    em: [],
    font: [],
    fontsize: [],
    color: [],
    highlight: []
}

//This is a test to measure the state of the editor. I want to use this to 
//configure my menu bar (as to what is active)
class StateCheck {
    constructor(editorView) {
        this.editorView = editorView
    }

    update() {
        this.showActiveState();
    }
    
    //THis is a ttest function to measure the state
    showActiveState() {

        var selection = this.editorView.state.selection;
        var ranges = selection.ranges;
        var doc = this.editorView.state.doc;

        var block;
        //simple deep copy
        var data = JSON.parse(JSON.stringify(EMPTY_MARK_DATA));
        
        var nodeTypes = [];
        var markTypes = [];
        
        //the model below assumes a single level of block
        //with text nodes insides with the above specified marks available.

        for (let rangeIndex = 0; rangeIndex < ranges.length; rangeIndex++) {
            let {$from, $to} = ranges[rangeIndex]
            doc.nodesBetween($from.pos, $to.pos, node => {
                
                if(node.type.name == "text") {
                    //populate marks for this text node
                    let nodeMarkList = [];
                    node.marks.forEach(mark => {
                        var markType = mark.type.name;
                        var markInfo = MARK_INFO[markType];
                        
                        if(markInfo === true) {
                            //no-attribute mark
                            data[markType].push(true);
                        }
                        else {
                            //attribute mark
                            var attribute = mark.attrs[markInfo];
                            data[markType].push(attribute);
                        }
                    });
                    
                    //add a "false" value for any mark not added.
                    for(var markType in data) {
                        if(data[markType].length == rangeIndex) {
                            data[markType].push(false);
                        }
                    }
                }
                else {
                    //store the main block type
                    //validate this better
//                    if(state.block) {
//                        throw new Error("There are multiple blocks!");
//                    }
                    
                    block = node.type.name;
                }
                
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
        console.log("Block: " + block);
        console.log("Mark data: " + JSON.stringify(data));
    }
}

function stateCheckPlugin() {
    return new Plugin({
        view(editorView) {
            let stateCheck = new StateCheck(editorView)
            return stateCheck
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
  //I SHOULD FORMALLY DEFINE THE CUSTOM TAGS!
 
  
  color: {
    attrs: {
      color: {default: "black"}
    },
    parseDOM: [{tag: "clr-tag", style: "color", getAttrs(dom) {
        return {color: dom.style.color};
    }}],
    toDOM(node) { return ["clr-tag", {"style":"color:"+node.attrs["color"]+";"}, 0] }
  },
  
  fontsize: {
    attrs: {
      fontsize: {default: ""}
    },
    parseDOM: [{tag: "fntsz-tag", style: "font-size", getAttrs(dom) {
        return {fontsize: dom.style["font-size"]};
    }}],
    toDOM(node) { return ["fntsz-tag", {"style":"font-size:"+node.attrs["fontsize"]+";"}, 0] }
  },
  
  font: {
    attrs: {
      fontfamily: {default: "Sans-serif"}
    },
    parseDOM: [{tag: "fntfam-tag", style: "font-family", getAttrs(dom) {
        return {fontsize: dom.style["font-family"]};
    }}],
    toDOM(node) { return ["fntfam-tag", {"style":"font-family:"+node.attrs.fontfamily+";"}, 0] }
  },
  
  highlight: {
    attrs: {
      highlightcolor: {default: "white"}
    },
    parseDOM: [{tag: "bgd-tag", style: "background-color", getAttrs(dom) {
        return {"highlightcolor": dom.style["background-color"]};
    }}],
    toDOM(node) { return ["bgd-tag", {"style":"background-color:"+node.attrs["highlightcolor"]+";"}, 0] }
  },
  
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

function markApplies(doc, ranges, type) {
  for (let i = 0; i < ranges.length; i++) {
    let {$from, $to} = ranges[i]
    let can = $from.depth == 0 ? doc.type.allowsMarkType(type) : false
    doc.nodesBetween($from.pos, $to.pos, node => {
      if (can) return false
      can = node.inlineContent && node.type.allowsMarkType(type)
    })
    if (can) return true
  }
  return false
}



function wrapInMark(markType, attrs) {
    return function(state, dispatch) {
        let {empty, $cursor, ranges} = state.selection
        if ((empty && !$cursor) || !markApplies(state.doc, ranges, markType)) return false
        if (dispatch) {
            if ($cursor) {
                dispatch(state.tr.addStoredMark(markType.create(attrs)))
            } 
            else {
//                let has = false, tr = state.tr
//                for (let i = 0; !has && i < ranges.length; i++) {
//                  let {$from, $to} = ranges[i]
//                  has = state.doc.rangeHasMark($from.pos, $to.pos, markType)
//                }
                
                let tr = state.tr
                for (let i = 0; i < ranges.length; i++) {
                    let {$from, $to} = ranges[i]
                    tr.addMark($from.pos, $to.pos, markType.create(attrs))
                }
                dispatch(tr.scrollIntoView())
            }
        }
        return true
    }
}

// Helper function to create menu icons
function iconElement(text, name, command) {
    let span = document.createElement("span")
    span.className = "menuicon " + name
    span.title = name
    span.textContent = text
    
    //I need to plug in the editorView. They did it differently in their example that I changed. See above.
    span.registerEditorView = (editorView) => {
        span.onclick = () => command(editorView.state, editorView.dispatch, editorView);
    } 
    
    return span
}

function colorOption(colorValue, command) {
    let option = document.createElement("option")
    option.text = " ";
    option._command = command
    option.style.backgroundColor = colorValue;
    
    return option
}

function textOption(text,command) {
    let option = document.createElement("option")
    option.text = text;
    option._command = command
    return option
}

//THIS IS NOT GOOD. I THINK MAYBE I SHOULD JUST USE A MENU RATHER THAN A DROPDOWN
function dropdownElement(optionsList, name) {
    let dropdown = document.createElement("select");
    dropdown.className = "menuDropdown";
    optionsList.forEach(option => dropdown.add(option));
    
    dropdown.registerEditorView = editorView => {
        dropdown.onchange = e => {
            var activeOption = optionsList[dropdown.selectedIndex];
            activeOption._command(editorView.state, editorView.dispatch, editorView);
        }
    } 
    
    return dropdown;
}

// Create an icon for a heading at the given level
function heading(level) {
    return {
        command: setBlockType(schema.nodes.heading, {level}),
        dom: icon("H" + level, "heading")
    }
}

function textColorOption(color) {
    return colorOption(color,wrapInMark(schema.marks.color, {color}))
}

function highlightOption(highlightcolor) {
     return colorOption(highlightcolor,wrapInMark(schema.marks.highlight, {highlightcolor}))
}

function fontSizeOption(fontsize) {
    return textOption(fontsize,wrapInMark(schema.marks.fontsize, {fontsize}))
}

function fontOption(fontfamily) {
    return textOption(fontfamily,wrapInMark(schema.marks.font, {fontfamily}))
}

function textColorDropdown() {
    var options = [];
    options.push(textColorOption("blue"));
    options.push(textColorOption("red"));
    options.push(textColorOption("green"));
    return dropdownElement(options, "Text Color");
}

function highlightDropdown() {
    var options = [];
    options.push(highlightOption("yellow"));
    options.push(highlightOption("cyan"));
    options.push(highlightOption("gray"));
    return dropdownElement(options, "Highlight Color");
}

function fontDropdown() {
    var options = [];
    options.push(fontOption("Sans-serif"));
    options.push(fontOption("Serif"));
    options.push(fontOption("Monospace"));
    return dropdownElement(options, "Font");
}

function fontSizeDropdown() {
    var options = [];
    options.push(fontSizeOption(".75em"));
    options.push(fontSizeOption("1em"));
    options.push(fontSizeOption("1.5em"));
    return dropdownElement(options, "Font Size");
}

let menu = menuPlugin([
    iconElement("B","strong",toggleMark(schema.marks.strong)),
    iconElement("i", "em",toggleMark(schema.marks.em)),
    fontDropdown(),
    fontSizeDropdown(),
    textColorDropdown(),
    highlightDropdown()
//    colorItem("blue"),colorItem("red"),colorItem("green"),
//    highlightItem("yellow"),highlightItem("cyan"),highlightItem("lightblue"),
//    fontSizeItem(".75em"),fontSizeItem("1em"),fontSizeItem("2em"),
//    fontItem("Sans-serif"),fontItem("Serif"),fontItem("Monospace"),
//    {command: setBlockType(schema.nodes.paragraph), dom: icon("p", "paragraph")},
//    heading(1), heading(2), heading(3),
//    {command: wrapIn(schema.nodes.blockquote), dom: icon(">", "blockquote")}
])

let stateCheck = stateCheckPlugin();
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
    menu,
    stateCheck
  ]
})
let view = new EditorView(element, {state});




