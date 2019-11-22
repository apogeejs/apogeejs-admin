import {setMark,clearMark} from "./menuUtils.js";

//This is a menu element for a mark with multiple attribute values
//use "false" as the input values to shoe no mark
export default class MarkDropdownItem {
    constructor(markType, attrName, attrValueList) {
        this.markType = markType;
        this.attrValueList = attrValueList;

        this.element = document.createElement("select");
        attrValueList.forEach(attrValueEntry => {
            let option = document.createElement("option");
            option.value = attrValueEntry[1];
            option.text = attrValueEntry[0];
            this.element.add(option);
        });

        this.element.onchange = () => {
            this.editorView.focus();
            //allow string or boolean value (I think it turns to string even if boolean is set)
            if ((this.element.value === false)||(this.element.value == "false")) {
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

    /** This gets the selection info and sets whether the toggle should be on or off. */
    update(selectionInfo) {
        let markValues = selectionInfo.marks[this.markType.name];
        return;

        // switch (markValues.length) {
        //     case 0:
        //         //add better validation/recovery
        //         //we should make it so this doesn't happen
        //         this._setElementValue(false);
        //         break;

        //     case 1:
        //         if (markValues[0] === false) {
        //             //mark is off
        //             this._setElementValue(false);
        //         }
        //         else {
        //             //mark is on
        //             this._setElementValue(markValues[0]);
        //         }
        //         break;

        //     default:
        //         let hasFalse = false;
        //         let hasMultivalue = false;
        //         let singleValue = undefined;
        //         markValues.forEach(value => {
        //             if (value == false) hasFalse = true;
        //             else if (singleValue !== undefined) singleValue = value;
        //             else hasMultivalue = true;
        //         });

        //         //set state
        //         if (hasMultivalue) {
        //             this._setElementValue(null);
        //         }
        //         else if (hasFalse) {
        //             this._setElementValue(false);
        //         }
        //         else {
        //             this._setElementValue(singleValue);
        //         }
        //         break;
        // }
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