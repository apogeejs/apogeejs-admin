//============================================
// Menu Plugin
// This menu plugin comes from the custom menu example. I will use it to
// understand adding to/making the schema
//============================================

const MARK_INFO = {
    bold: true,
    italic: true,
    fontfamily: "fontfamily",
    fontsize: "fontsize",
    textcolor: "color",
    highlight: "color"
}

const EMPTY_MARK_DATA = {
    bold: false,
    italic: false,
    fontfamily: false,
    fontsize: false,
    textcolor: false,
    highlight: false
}

function addToListOnce(list,value) {
    if(list.indexOf(value) < 0) list.push(value);
}

class ToolbarView {
    constructor(items, editorView) {
        this.items = items
        this.editorView = editorView

        this.dom = document.createElement("div")
        this.dom.className = "toolbar"
        items.forEach(item => { 
                item.registerEditorView(editorView);
                this.dom.appendChild(item.getElement());
            })
        this.update();
    }

    
    update() {
        var selectionInfo = this._getSelectionInfo();
        this.items.forEach( item => {
            item.update(selectionInfo);
        })
    }
    
    destroy() { 
        this.dom.remove() 
    }
    
    _getSelectionInfo() {

        var selection = this.editorView.state.selection;
        var ranges = selection.ranges;
        var doc = this.editorView.state.doc;

        //get a list of blocks and a list for each mark type
        var blocks = [];
        var marks = Object.assign({},EMPTY_MARK_DATA);
        for(let key in marks) {
            marks[key] = [];
        }

        //for debugging
        var nodeTypes = [];
        var markTypes = [];
        
        //the model below assumes a single level of block
        //with text nodes insides with the above specified marks available.

        for (let rangeIndex = 0; rangeIndex < ranges.length; rangeIndex++) {
            let {$from, $to} = ranges[rangeIndex]
            doc.nodesBetween($from.pos, $to.pos, node => {
                
                if(node.type.name == "text") {
                    let nodeMarks = Object.assign({},EMPTY_MARK_DATA);
                    //populate marks for this text node
                    let nodeMarkList = [];
                    
                    node.marks.forEach(mark => {
                        let markType = mark.type.name;
                        let markInfo = MARK_INFO[markType];
                        
                        if(markInfo === true) {
                            //no-attribute mark
                            nodeMarks[markType] = true;
                        }
                        else {
                            //attribute mark
                            var attribute = mark.attrs[markInfo];
                            nodeMarks[markType] = attribute;
                        }
                    });
                    
                    //add these to the overall list for each mark
                    for(var markName in marks) {
                        addToListOnce(marks[markName],nodeMarks[markName]);
                    }
                }
                else {
                    //store the main block type
                    //validate this better
                    addToListOnce(blocks,node.type.name);
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
        console.log("Blocks: " + JSON.stringify(blocks));
        console.log("Marks: " + JSON.stringify(marks));
        
        //get the selection state for the blocks and marks 
        return {
            blocks: blocks,
            marks: marks
        }
    }
}

const {Plugin} = require("prosemirror-state")

function toolbarPlugin(items) {
    return new Plugin({
        view(editorView) {
            let toolbarView = new ToolbarView(items, editorView)
            editorView.dom.parentNode.insertBefore(toolbarView.dom, editorView.dom)
            return toolbarView;
        }
    })
}

//===================================
// Custom Schema
//===================================

const {Schema} = require("prosemirror-model")

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
    toDOM() { return ["p", 0] }
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
  }
}

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
  italic: {
    parseDOM: [{tag: "i"}, {tag: "em"}, {style: "font-style=italic"}],
    toDOM() { return ["em",0] }
  },

  // :: MarkSpec A strong mark. Rendered as `<b>`, parse rules
  // also match `<strong>` and `font-weight: bold`.
 bold: {
    parseDOM: [{tag: "strong"},
               // This works around a Google Docs misbehavior where
               // pasted content will be inexplicably wrapped in `<b>`
               // tags with a font-weight normal.
               {tag: "b", getAttrs: node => node.style.fontWeight != "normal" && null},
               {style: "font-weight", getAttrs: value => /^(bold(er)?|[5-9]\d{2,})$/.test(value) && null}],
    toDOM() { return ["b", 0] }
  },
  
  textcolor: {
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
  
  fontfamily: {
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
      color: {default: "white"}
    },
    parseDOM: [{tag: "bgd-tag", style: "background-color", getAttrs(dom) {
        return {"color": dom.style["background-color"]};
    }}],
    toDOM(node) { return ["bgd-tag", {"style":"background-color:"+node.attrs["color"]+";"}, 0] }
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


function setMark(markType, attrs, state, dispatch) {
    let {empty, $cursor, ranges} = state.selection
    if ((empty && !$cursor) || !markApplies(state.doc, ranges, markType)) return false
    if (dispatch) {
        if ($cursor) {
            dispatch(state.tr.addStoredMark(markType.create(attrs)))
        } 
        else {
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


function clearMark(markType, state, dispatch) {
    let {empty, $cursor, ranges} = state.selection
    if ((empty && !$cursor) || !markApplies(state.doc, ranges, markType)) return false
    if (dispatch) {
        if ($cursor) {
            dispatch(state.tr.removeStoredMark(markType))
        } 
        else {
            let tr = state.tr
            for (let i = 0; i < ranges.length; i++) {
                let {$from, $to} = ranges[i]
                tr.removeMark($from.pos, $to.pos, markType)
            }
            dispatch(tr.scrollIntoView())
        }
    }
    return true
}



//This is a toggle button for marks with either no attribute or fixed attributes
class MarkToggleElement {
    constructor(markType,attr,labelText) {
        this.markType = markType;
        this.attr = attr;
        this.labelText = labelText;
        
        this.element = document.createElement("span");      
        this.element.title = labelText;
        this.element.textContent = labelText;

        this.element.onclick = () => {
            if(this.state) {
                clearMark(this.markType,this.editorView.state,this.editorView.dispatch);
            }
            else {
                setMark(this.markType,this.attr,this.editorView.state,this.editorView.dispatch);
            }
        }
        
        this._setElementState(false);
    }
    
    registerEditorView(editorView) {
        this.editorView = editorView;
    }
    
    getElement() {
        return this.element;
    }
    
    /** This gets the selection info and sets whether the toggle should be on or off. */
    update(selectionInfo) {
        let markValues = selectionInfo.marks[this.markType.name];
        
        switch(markValues.length) {
            case 0:
                //no marks
                //we should make ti so this doesn't happen!!!
                this._setElementState(false);
                break;
                
            case 1:
                if(markValues[0] === false) {
                    //mark is off
                    this._setElementState(false);
                }
                else {
                    //mark is on
                    this._setElementState(true);
                }
                break;
                
            default:
                let hasFalse = false;
                let hasMultivalue = false;
                let singleValue = undefined;
                markValues.forEach( value => {
                    if(value == false) hasFalse = true;
                    else if(singleValue !== undefined) singleValue = value;
                    else hasMultivalue = true;
                });
                
                //set state
                if((hasMultivalue)||(hasFalse)) {
                    this._setElementState(false);
                }
                else {
                    this._setElementState(true);
                }
        }
    }
        
        //=========================
        // internal
        //=========================
        
    /** This sets the toggle state and the display class. */
    _setElementState(state) {
        if(this.elementState != state) {
            this.elementState = state;
            if(state) {
                this.element.className = "toggleButton toggleOffClass";
            }
            else {
                this.element.className = "toggleButton toggleOnClass";
            }
        }
    }
    
}


//This is a menu element for a mark with multiple attribute values
//use "false" as the input values to shoe no mark
class MarkDropdownElement {
    constructor(markType,attrName,attrValueList) {
        this.markType = markType;
        this.attrValueList = attrValueList;
        
        this.element = document.createElement("select");      
        attrValueList.forEach( value => {
            let option = document.createElement("option");
            option.value = value;
            option.text = value;
            this.element.add(option);
        });

        this.element.onchange = () => {
            if(this.element.value === false) {
                //remove mark
                clearMark(this.markType,this.editorView.state,this.editorView.dispatch);
            }
            else {
                //set the mark with the current value
                var attr = {};
                attr[attrName] = this.element.value;
                setMark(this.markType,attr,this.editorView.state,this.editorView.dispatch);
            }
        }
    }
    
    registerEditorView(editorView) {
        this.editorView = editorView;
    }
    
    getElement() {
        return this.element;
    }
    
    /** This gets the selection info and sets whether the toggle should be on or off. */
    update(selectionInfo) {
        let markValues = selectionInfo.marks[this.markType.name];
        
        switch(markValues.length) {
            case 0:
                //add better validation/recovery
                //we should make it so this doesn't happen
                this._setElementValue(false);
                break;
                
            case 1:
                if(markValues[0] === false) {
                    //mark is off
                    this._setElementValue(false);
                }
                else {
                    //mark is on
                    this._setElementValue(markValues[0]);
                }
                break;
                
            default:
                let hasFalse = false;
                let hasMultivalue = false;
                let singleValue = undefined;
                markValues.forEach( value => {
                    if(value == false) hasFalse = true;
                    else if(singleValue !== undefined) singleValue = value;
                    else hasMultivalue = true;
                });
                
                //set state
                if(hasMultivalue) {
                    this._setElementValue(null);
                }
                else if(hasFalse) {
                    this._setElementValue(false);
                }
                else {
                    this._setElementValue(singleValue);
                }
                break;
        }
    }
        
        //=========================
        // internal
        //=========================
        
    /** This sets the toggle state and the display class. */
    _setElementValue(value) {
        if(this.element.value !== value) {
            console.log("Value: " + value);
            this.element.value = value;
        }
    }
}


let toolbar = toolbarPlugin([
    new MarkToggleElement(schema.marks.bold,null,"Bold"),
    new MarkToggleElement(schema.marks.italic,null,"Italic"),
    new MarkDropdownElement(schema.marks.fontfamily,"fontfamily",[false,"Sans-serif","Serif","Monospace"]),
    new MarkDropdownElement(schema.marks.fontsize,"fontsize",[".75em",false,"1.5em","2em"]),
    new MarkDropdownElement(schema.marks.textcolor,"color",[false,"blue","red","green","yellow","#202020","#505050","#808080"]),
    new MarkDropdownElement(schema.marks.highlight,"color",[false,"yellow","cyan","pink","green","orange","red","#a0a0a0"])
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
    toolbar
  ]
})
let view = new EditorView(element, {state});




