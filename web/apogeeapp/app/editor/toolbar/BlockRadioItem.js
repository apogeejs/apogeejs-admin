//This is a radio-type item that will highlight when the associated state is active.
export default class BlockRadioItem {
    constructor(blockState, commandFunction, labelText, textStyleClass, tooltip) {
        this.blockState = blockState;
        this.commandFunction = commandFunction;
        this.labelText = labelText;
        this.textStyleClass = textStyleClass;

        this.element = document.createElement("span");
        this.element.title = tooltip;
        this.element.textContent = labelText;

        this.element.onclick = () => {
            this.editorView.focus();
            if (!this.elementState) {
                this.commandFunction(this.editorView.state, this.editorView.dispatch);
            }
        }

        this._setElementIsSelected(false);
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
        let isSelected;

        if ((blocks.length > 0) && (blocks[0] == this.blockState)) {
            //only set state active if this is the only type in the list (not mixed)
            isSelected = true;
        }
        else {
            isSelected = false;
        }

        this._setElementIsSelected(isSelected);
    }

    //=========================
    // internal
    //=========================

    /** This sets the toggle state and the display class. */
    _setElementIsSelected(isSelected) {
        if(this.elementIsActive != isSelected) {
            this.elementIsActive = isSelected;
            if (isSelected) {
                this.element.className = "atb_radioButton atb_radioOnClass " + this.textStyleClass;
            }
            else {
                this.element.className = "atb_radioButton atb_radioOffClass " + this.textStyleClass;
            }
        }
    }

}

