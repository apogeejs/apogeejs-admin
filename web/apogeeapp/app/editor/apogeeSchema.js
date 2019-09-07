
//===================================
// Apogee Schema
//===================================

import { Schema }  from "/prosemirror/lib/prosemirror-model/src/index.js";

// :: Object
// [Specs](#model.NodeSpec) for the nodes defined in this schema.
const nodes = {
  // :: NodeSpec The top level document node.
  doc: {
    content: "(block | list | workerParent | apogeeComponent)+"
  },

  // :: NodeSpec A plain paragraph textblock. Represented in the DOM
  // as a `<p>` element.
  paragraph: {
    content: "inline*",
    group: "block",
    parseDOM: [{ tag: "p" }],
    toDOM() { return ["p", 0] }
  },

  // :: NodeSpec A heading textblock, with a `level` attribute that
  // should hold the number 1 to 6. Parsed and serialized as `<h1>` to
  // `<h6>` elements.
  heading1: {
    content: "inline*",
    group: "block",
    defining: true,
    parseDOM: [{ tag: "h1" }],
    toDOM(node) { return ["h1", 0] }
  },

  heading2: {
    content: "inline*",
    group: "block",
    defining: true,
    parseDOM: [{ tag: "h2" }],
    toDOM(node) { return ["h2", 0] }
  },

  heading3: {
    content: "inline*",
    group: "block",
    defining: true,
    parseDOM: [{ tag: "h3" }],
    toDOM(node) { return ["h3", 0] }
  },

  heading4: {
    content: "inline*",
    group: "block",
    defining: true,
    parseDOM: [{ tag: "h4" }],
    toDOM(node) { return ["h4", 0] }
  },

  bulletList: {
    content: "(listItem | list)+",
    group: "list",
    defining: true,
    parseDOM: [{ tag: "ul" }],
    toDOM(node) { return ["ul", 0] }
  },

  numberedList: {
    content: "(listItem | list)+",
    group: "list",
    defining: true,
    parseDOM: [{ tag: "ol" }],
    toDOM(node) { return ["ol", 0] }
  },

  listItem: {
    content: "inline*",
    parseDOM: [{ tag: "li" }],
    toDOM() { return ["li", 0] }
  },

  //this is used only to legally transition between states.
  //there is probably a better way of doing this...
  workerParent: {
    content: "(block | listItem | list | apogeeComponent )+",
    parseDOM: [{ tag: "w-p" }],
    toDOM(node) { return ["w-p", 0] }
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
      alt: { default: null },
      title: { default: null }
    },
    group: "inline",
    draggable: true,
    parseDOM: [{
      tag: "img[src]", getAttrs(dom) {
        return {
          src: dom.getAttribute("src"),
          title: dom.getAttribute("title"),
          alt: dom.getAttribute("alt")
        }
      }
    }],
    toDOM(node) { let { src, alt, title } = node.attrs; return ["img", { src, alt, title }] }
  },

  apogeeComponent: {
    marks: "",
    atom: true,
    defining: true,
    isolating: true,

    attrs: { "state": { default: "" } },
    toDOM: node => ["div", { "data-state": JSON.stringify(node.attrs.state) }],
    parseDOM: [{
      tag: "div[data-state]",
      getAttrs: (dom) => {
        let stateText = dom.getAttribute("data-state");
        let state;
        if (stateText !== undefined) {
          state = JSON.parse(stateText);
        }
        else {
          state = ""
        }
        return { state };
      }
    }]
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
      title: { default: null }
    },
    inclusive: false,
    parseDOM: [{
      tag: "a[href]", getAttrs(dom) {
        return { href: dom.getAttribute("href"), title: dom.getAttribute("title") }
      }
    }],
    toDOM(node) { let { href, title } = node.attrs; return ["a", { href, title }, 0] }
  },

  // :: MarkSpec An emphasis mark. Rendered as an `<em>` element.
  // Has parse rules that also match `<i>` and `font-style: italic`.
  italic: {
    parseDOM: [{ tag: "i" }, { tag: "em" }, { style: "font-style=italic" }],
    toDOM() { return ["em", 0] }
  },

  // :: MarkSpec A strong mark. Rendered as `<b>`, parse rules
  // also match `<strong>` and `font-weight: bold`.
  bold: {
    parseDOM: [{ tag: "strong" },
    // This works around a Google Docs misbehavior where
    // pasted content will be inexplicably wrapped in `<b>`
    // tags with a font-weight normal.
    { tag: "b", getAttrs: node => node.style.fontWeight != "normal" && null },
    { style: "font-weight", getAttrs: value => /^(bold(er)?|[5-9]\d{2,})$/.test(value) && null }],
    toDOM() { return ["b", 0] }
  },

  textcolor: {
    attrs: {
      color: { default: "black" }
    },
    parseDOM: [{
      tag: "clr-tag", style: "color", getAttrs(dom) {
        return { color: dom.style.color };
      }
    }],
    toDOM(node) { return ["clr-tag", { "style": "color:" + node.attrs["color"] + ";" }, 0] }
  },

  fontsize: {
    attrs: {
      fontsize: { default: "" }
    },
    parseDOM: [{
      tag: "fntsz-tag", style: "font-size", getAttrs(dom) {
        return { fontsize: dom.style["font-size"] };
      }
    }],
    toDOM(node) { return ["fntsz-tag", { "style": "font-size:" + node.attrs["fontsize"] + ";" }, 0] }
  },

  fontfamily: {
    attrs: {
      fontfamily: { default: "Sans-serif" }
    },
    parseDOM: [{
      tag: "fntfam-tag", style: "font-family", getAttrs(dom) {
        return { fontsize: dom.style["font-family"] };
      }
    }],
    toDOM(node) { return ["fntfam-tag", { "style": "font-family:" + node.attrs.fontfamily + ";" }, 0] }
  },

  highlight: {
    attrs: {
      color: { default: "white" }
    },
    parseDOM: [{
      tag: "bgd-tag", style: "background-color", getAttrs(dom) {
        return { "color": dom.style["background-color"] };
      }
    }],
    toDOM(node) { return ["bgd-tag", { "style": "background-color:" + node.attrs["color"] + ";" }, 0] }
  }

}

// :: Schema
// This the schema for the apogee page editor
export function createSchema() {
    return new Schema({ nodes, marks })
}