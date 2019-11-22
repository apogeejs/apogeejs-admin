import {setMark,clearMark} from "./menuUtils.js";

//This is a toggle button for marks with either no attribute or fixed attributes
export default class MarkToggleItem {
    constructor(markType, attr, labelText, styleClass, tooltip) {
        this.markType = markType;
        this.attr = attr;
        this.labelText = labelText;
        this.styleClass = styleClass;

        this.selectionGenerator = createSelectionGenerator(markType);

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

    getMarkSelectionGenerator() {
        return this.selectionGenerator;
    }

    /** This gets the selection info and sets whether the toggle should be on or off. 
     * Mark is considered "on" if it is present on all text nodes in the selection.
    */
    update(selectionInfo) {
        let markInfo = selectionInfo.marks[this.markType.name];
        let isSelected = (markInfo)&&(markInfo.present === true)&&(markInfo.missing === false);
        this._setElementIsSelected(isSelected);
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

function createSelectionGenerator(markType) {
    let selectionGenerator = {};
    selectionGenerator.name = markType.name;
    selectionGenerator.getEmptyInfo = () => { return { last: -1, missing: false}; }
    selectionGenerator.updateInfo = (mark,markInfoEntry,textNodeNumber) => {
        //record if there are any text nodes with this mark missing
        if(textNodeNumber - markInfoEntry.last > 1) {
            markInfoEntry.missing = true;
        }
        markInfoEntry.last = textNodeNumber;

        //record that this mark is present
        markInfoEntry.present = true;
    }
    selectionGenerator.onComplete = (markInfoEntry,nodeCount) => {
        if(nodeCount - markInfoEntry.last > 1) {
            markInfoEntry.missing = true;
        }
    }

    return selectionGenerator;
}