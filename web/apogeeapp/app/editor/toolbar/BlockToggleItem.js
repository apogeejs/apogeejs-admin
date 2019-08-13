const { setBlockType } = require("prosemirror-commands")

//This is a toggle button for blocks with either no attribute or fixed attributes


export default class BlockToggleItem {
    constructor(blockType, labelText, textStyleClass, tooltip, clearBlockBlockType) {
        this.blockType = blockType;
        this.labelText = labelText;
        this.textStyleClass = textStyleClass;

        this.element = document.createElement("span");
        this.element.title = tooltip;
        this.element.textContent = labelText;

        var clearBlockCommand = setBlockType(clearBlockBlockType);
        var setBlockCommand = setBlockType(blockType);

        this.element.onclick = () => {
            this.editorView.focus();
            if (this.elementState) {
                clearBlockCommand(this.editorView.state, this.editorView.dispatch);
            }
            else {
                setBlockCommand(this.editorView.state, this.editorView.dispatch);
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
        let blocks = selectionInfo.blocks;

        if ((blocks.length === 1) && (blocks[0] == this.blockType.name)) {
            //only set state active if this is the only type in the list (not mixed)
            this._setElementState(true);
        }
        else {
            this._setElementState(false);
        }
    }

    //=========================
    // internal
    //=========================

    /** This sets the toggle state and the display class. */
    _setElementState(state) {
        if (this.elementState != state) {
            this.elementState = state;
            if (state) {
                this.element.className = "atb_toggleButton atb_toggleOnClass " + this.textStyleClass;
            }
            else {
                this.element.className = "atb_toggleButton atb_toggleOffClass " + this.textStyleClass;
            }
        }
    }

}

