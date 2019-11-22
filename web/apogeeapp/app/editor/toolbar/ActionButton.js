//This is a radio-type item that will highlight when the associated state is active.
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

