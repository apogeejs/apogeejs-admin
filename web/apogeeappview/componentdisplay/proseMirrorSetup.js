//===========================
//create the schema
//===========================

import ApogeeToolbar from "/apogeeappview/editor/toolbar/ApogeeToolbar.js";
import MarkToggleItem from "/apogeeappview/editor/toolbar/MarkToggleItem.js";
import MarkDropdownItem from "/apogeeappview/editor/toolbar/MarkDropdownItem.js";
import ActionButton from "/apogeeappview/editor/toolbar/ActionButton.js";


import StateCheck from "/apogeeappview/editor/StateCheck.js";
import { getInteractiveNodePlugin } from "/apogeeappview/editor/InteractiveNodeKeyHandler.js";

import { baseKeymap } from "/apogeeappview/editor/apogeeCommands.js";

import { Plugin } from "/prosemirror/dist/prosemirror-state.es.js";
import { EditorView } from "/prosemirror/dist/prosemirror-view.es.js";
import { keymap } from "/prosemirror/dist/prosemirror-keymap.es.js";
//import { gapCursor } from "/prosemirror/dist/prosemirror-gapcursor.es.js";
import { apogeeSelectionPlugin } from "/apogeeappview/editor/selection/ApogeeSelectionPlugin.js";

import ApogeeComponentView from "/apogeeappview/editor/ApogeeComponentView.js";

import { setBlockType } from "/apogeeappview/editor/apogeeCommands.js";

export function createProseMirrorManager(app, schema) {

    //this is the function return object - the editor manager
    let proseMirror = {};

    //===========================
    //create the toolbar
    //===========================
    let convertToParagraphCommand = (state, dispatch) => setBlockType(schema.nodes.paragraph, state, dispatch);
    let convertToH1Command = (state, dispatch) => setBlockType(schema.nodes.heading1, state, dispatch);
    let convertToH2Command = (state, dispatch) => setBlockType(schema.nodes.heading2, state, dispatch);
    let convertToH3Command = (state, dispatch) => setBlockType(schema.nodes.heading3, state, dispatch);
    let convertToH4Command = (state, dispatch) => setBlockType(schema.nodes.heading4, state, dispatch);
    let convertToBulletCommand = (state, dispatch) => setBlockType(schema.nodes.bulletList, state, dispatch);
    let convertToNumberedCommand = (state, dispatch) => setBlockType(schema.nodes.numberedList, state, dispatch);

    //this function determines if the block button is highlighted
    let getBlockIsHighlightedFunction = (nodeType) => {
        return (selectionInfo) => {
            let blockTypes = selectionInfo.blocks.blockTypes;
            return ((blockTypes.length === 1) && (blockTypes[0] == nodeType));
        }
    }

    let toolbarItems = [
        new ActionButton(convertToParagraphCommand, getBlockIsHighlightedFunction(schema.nodes.paragraph), null, "Normal", "atb_normal_style", "Normal Paragraph Text"),
        new ActionButton(convertToH1Command, getBlockIsHighlightedFunction(schema.nodes.heading1), null, "H1", "atb_h1_style", "Heading 1"),
        new ActionButton(convertToH2Command, getBlockIsHighlightedFunction(schema.nodes.heading2), null, "H2", "atb_h2_style", "Heading 2"),
        new ActionButton(convertToH3Command, getBlockIsHighlightedFunction(schema.nodes.heading3), null, "H3", "atb_h3_style", "Heading 3"),
        new ActionButton(convertToH4Command, getBlockIsHighlightedFunction(schema.nodes.heading4), null, "H4", "atb_h4_style", "Heading 4"),
        new ActionButton(convertToBulletCommand, getBlockIsHighlightedFunction(schema.nodes.bulletList), null, '\u2022', "atb_ul_style", "Bullet List"),
        new ActionButton(convertToNumberedCommand, getBlockIsHighlightedFunction(schema.nodes.numberedList), null, "1.", "atb_ol_style", "Nubmered List"),
        new MarkToggleItem(schema.marks.bold, null, "B", "atb_bold_style", "Bold"),
        new MarkToggleItem(schema.marks.italic, null, "I", "atb_italic_style", "Italic"),
        new MarkDropdownItem(schema.marks.fontfamily, "fontfamily", [["Sans-serif", "Sans-serif"], ["Serif", "Serif"], ["Monospace", "Monospace"]], "Sans-serif", "Font"),
        new MarkDropdownItem(schema.marks.fontsize, "fontsize", [["75%", ".75em"], ["100%", "1em"], ["150%", "1.5em"], ["200%", "2em"]], "1em", "Font Size"),
        new MarkDropdownItem(schema.marks.textcolor, "color", [["Black", "black"], ["Blue", "blue"], ["Red", "red"], ["Green", "green"], ["Yellow", "yellow"], ["Dark Gray", "#202020"],
        ["Gray", "#505050"], ["light gray", "#808080"]], "black","Font Color"),
        new MarkDropdownItem(schema.marks.highlight, "color", [["None", "none"], ["Yellow", "yellow"], ["Cyan", "cyan"], ["Pink", "pink"], ["Green", "green"],
        ['Orange', "orange"], ["Red", "red"], ["Gray", "#a0a0a0"]], "none","Highlight"),

    ];

    //===========================
    //state debug plugin
    //===========================

    let stateCheckPlugin = new Plugin({
        view(editorView) {
            let stateCheck = new StateCheck(editorView);
            return stateCheck;
        },

        props: {
            createSelectionBetween(_view, $anchor, $head) {
                console.log("XXX Create Selection between: " + $anchor.pos + " - " + $head.pos);
                return false;
              },
        }
    })

    //==============================
    // Create the editor
    //==============================

    function undo() {
        let commandManager = app.getCommandManager();
        let commandHistory = commandManager.getCommandHistory();
        commandHistory.undo();
    }

    function redo() {
        let commandManager = app.getCommandManager();
        let commandHistory = commandManager.getCommandHistory();
        commandHistory.redo();
    }

    //===============================
    //set up the export functions
    //===============================

    proseMirror.getPlugins = () => plugins;

    proseMirror.createEditorView = function (containerElement, pageDisplay, editorData) {

        //create the toolbar instance
        let toolbarView = new ApogeeToolbar(toolbarItems);
        proseMirror.editorToolbarElement = toolbarView.dom;

        //create the toolbar plugin - we will reuse the toolbar element here
        let toolbarPlugin = new Plugin({
            view(editorView) {
                toolbarView.setEditorView(editorView);
                return toolbarView;
            }
        })

        let plugins = [
            getInteractiveNodePlugin(),
            keymap({ "Mod-z": undo, "Mod-y": redo }),
            keymap(baseKeymap),
            apogeeSelectionPlugin(),
            toolbarPlugin,
            stateCheckPlugin
        ];

        var nodeViews = {};
        nodeViews.apogeeComponent = (node, view, getPos) => new ApogeeComponentView(node, view, getPos, pageDisplay);

        let pageComponentView = pageDisplay.getComponentView();

        var dispatchTransaction = transaction => pageComponentView.applyTransaction(transaction);

        var editorView = new EditorView(containerElement, {
            state: editorData,
            dispatchTransaction: dispatchTransaction,
            nodeViews: nodeViews
        })

        return { editorView, toolbarView, plugins };
    }



    return proseMirror;

}

