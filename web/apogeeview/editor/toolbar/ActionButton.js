/** This is a toolbar item button. Arguments:
 * - commandFunction - this is the action taken when the button is pressed when enabled.
 * - isHighlightedFunction - This function is called with selectionInfo on selection change to determine if the 
 * button should be in the highlighted state. This does not change the action. If the function is not provided
 * the button is never highlighted.
 * - isEnabled - This function is called with the selectionInfo on selection change to determine if the
 * button shoudl be enabled. The button only acts when enabled. If this function is not provided, the button is
 * always enabled.
 * - labelText - This is the text that appears on the label. 
 * - textStyleClass - This is the CSS class name for the text. Note that the background and text color are controlled
 * by the button to show enabled,disabled and highlighted.
 * - toolTip - This is the tooltip text for the button.
 */
export default class ActionButton {
    constructor(commandFunction, isHighlightedFunction, isEnabledFunction, labelText, textStyleClass, tooltip) {
        this.commandFunction = commandFunction;
        this.labelText = labelText;
        this.textStyleClass = textStyleClass;

        this.element = document.createElement("span");
        this.element.title = tooltip;
        this.element.textContent = labelText;

        this.element.onclick = () => {
            this.editorView.focus();
            if(this.isEnabled) {
                this.commandFunction(this.editorView.state, this.editorView.dispatch);
            }
        }

        this.isHighlightedFunction = isHighlightedFunction;
        this.isEnabledFunction = isEnabledFunction;

        this.isEnabled;
        this._setState(true,false);
    }

    registerEditorView(editorView) {
        this.editorView = editorView;
    }

    getElement() {
        return this.element;
    }

    /** This gets the selection info and sets whether the toggle should be on or off. */
    update(selectionInfo) {

        //call function to decide if button is enabled if function defined. Otherwise just keep it on. 
        var isHighlighted = this.isHighlightedFunction ? this.isHighlightedFunction(selectionInfo) : false;
        var isEnabled = this.isEnabledFunction ? this.isEnabledFunction(selectionInfo) : true;

        this._setState(isEnabled,isHighlighted);
    }

    //=========================
    // internal
    //=========================

    /** This sets the toggle state and the display class. */
    _setState(isEnabled,isHighlighted) {
        let className = "atb_actionButton " + this.textStyleClass;

        if (isEnabled) {
            if (isHighlighted) {
                className += " atb_actionHighlightedClass";
            }
            else {
                className += " atb_actionEnabledClass";
            }
        }
        else {
            className += " atb_actionDisabledClass";
        }

        if(className != this.element.classname) {
            this.element.className = className;
        }

        this.isEnabled = isEnabled;
        
    }

}

