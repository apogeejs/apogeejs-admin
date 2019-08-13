import {setMark,clearMark} from "./menuUtils.js";

//This is a toggle button for marks with either no attribute or fixed attributes
export default class MarkToggleItem {
    constructor(markType, attr, labelText, styleClass, tooltip) {
        this.markType = markType;
        this.attr = attr;
        this.labelText = labelText;
        this.styleClass = styleClass;

        this.element = document.createElement("span");
        this.element.title = tooltip;
        this.element.textContent = labelText;

        this.element.onclick = () => {
            this.editorView.focus();
            if (this.elementState) {
                clearMark(this.markType, this.editorView.state, this.editorView.dispatch);
            }
            else {
                setMark(this.markType, this.attr, this.editorView.state, this.editorView.dispatch);
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

        switch (markValues.length) {
            case 0:
                //no marks
                //we should make ti so this doesn't happen!!!
                this._setElementState(false);
                break;

            case 1:
                if (markValues[0] === false) {
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
                markValues.forEach(value => {
                    if (value == false) hasFalse = true;
                    else if (singleValue !== undefined) singleValue = value;
                    else hasMultivalue = true;
                });

                //set state
                if ((hasMultivalue) || (hasFalse)) {
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
        if (this.elementState != state) {
            this.elementState = state;
            if (state) {
                this.element.className = "atb_toggleButton atb_toggleOnClass " + this.styleClass;
            }
            else {
                this.element.className = "atb_toggleButton atb_toggleOffClass " + this.styleClass;
            }
        }
    }

}