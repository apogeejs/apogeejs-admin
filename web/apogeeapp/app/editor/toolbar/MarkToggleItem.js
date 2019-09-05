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
            if (this.elementIsSelected) {
                clearMark(this.markType, this.editorView.state, this.editorView.dispatch);
            }
            else {
                setMark(this.markType, this.attr, this.editorView.state, this.editorView.dispatch);
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
        let markValues = selectionInfo.marks[this.markType.name];

        switch (markValues.length) {
            case 0:
                //no marks
                //we should make ti so this doesn't happen!!!
                this._setElementIsSelected(false);
                break;

            case 1:
                if (markValues[0] === false) {
                    //mark is off
                    this._setElementIsSelected(false);
                }
                else {
                    //mark is on
                    this._setElementIsSelected(true);
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
                    this._setElementIsSelected(false);
                }
                else {
                    this._setElementIsSelected(true);
                }
        }
    }

    //=========================
    // internal
    //=========================

    /** This sets the toggle state and the display class. */
    _setElementIsSelected(isSelected) {
        if (this.elementIsSelected != isSelected) {
            this.elementIsSelected = isSelected;
            if (isSelected) {
                this.element.className = "atb_toggleButton atb_toggleOnClass " + this.styleClass;
            }
            else {
                this.element.className = "atb_toggleButton atb_toggleOffClass " + this.styleClass;
            }
        }
    }

}