import {setMark,clearMark} from "/apogeeappview/editor/apogeeCommands.js";

/** This is a toolbar element for marks which have a single attribute key and multple attribute values. Arguments:
 * - markType - this is the schema mark type object.
 * - attrName - this is the name or the single attribute for the marks. 
 * - attrValueList - This is a list of values for the attribute. Each value should have a two element array, the first 
 * being the display label and the second beint the internal value represented.
 * - defaultValue - This is the value for the list which corresponds to no mark present. For example in the font
 * case, this should be the font that is showing when no mark is present.
 */
//This is a menu element for a mark with multiple attribute values, for a single attribute name
//the default value should be the selection option for no mark present.
export default class MarkDropdownItem {
    constructor(markType, attrName, attrValueList, defaultValue, tooltip) {
        this.markType = markType;
        this.attrValueList = attrValueList;
        this.defaultValue = defaultValue;

        this.selectionGenerator = createSelectionGenerator(markType, attrName);

        this.element = document.createElement("select");
        this.element.title = tooltip;
        attrValueList.forEach(attrValueEntry => {
            let option = document.createElement("option");
            option.value = attrValueEntry[1];
            option.text = attrValueEntry[0];
            this.element.add(option);
        });

        this.element.value = this.defaultValue;

        this.element.onchange = () => {
            this.editorView.focus();
            //allow string or boolean value (I think it turns to string even if boolean is set)
            if(this.element.value == defaultValue) {
                //remove mark
                clearMark(this.markType, this.editorView.state, this.editorView.dispatch);
            }
            else {
                //set the mark with the current value
                var attr = {};
                attr[attrName] = this.element.value;
                setMark(this.markType, attr, this.editorView.state, this.editorView.dispatch);
            }
        }
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

    /** This gets the selection info and sets whether the toggle should be on or off. */
    update(selectionInfo) {
        let markInfo = selectionInfo.marks[this.markType.name];

        if((markInfo.values.length === 1)&&(!markInfo.missing)) {
            //mark present on all text nodes - display this as the current value
            this._setElementValue(markInfo.values[0]);
        }
        else if(markInfo.values.length === 0) {
            //mark not present. This is the default.
            this._setElementValue(this.defaultValue);
        }
        else {
            //multiple values present - display no current value
            this._setElementValue(null);
        }

        return;
    }

    
    //=========================
    // internal
    //=========================

    
    /** This sets the toggle state and the display class. */
    _setElementValue(value) {
        if (this.element.value !== value) {
            this.element.value = value;
        }
    }

}

function createSelectionGenerator(markType,attrName) {
    let selectionGenerator = {};
    selectionGenerator.name = markType.name;
    selectionGenerator.getEmptyInfo = () => { return { last: -1, missing: false, values: [] }; }
    selectionGenerator.updateInfo = (mark,markInfoEntry,textNodeNumber) => {
        //record if there are any text nodes with this mark missing
        if(textNodeNumber - markInfoEntry.last > 1) {
            markInfoEntry.missing = true;
        }
        markInfoEntry.last = textNodeNumber;

        //recorc that this mark is present
        let attrValue = mark.attrs[attrName];
        if(markInfoEntry.values.indexOf(attrValue) < 0) markInfoEntry.values.push(attrValue);
    }
    selectionGenerator.onComplete = (markInfoEntry,nodeCount) => {
        if(nodeCount - markInfoEntry.last > 1) {
            markInfoEntry.missing = true;
        }
    }

    return selectionGenerator;
}