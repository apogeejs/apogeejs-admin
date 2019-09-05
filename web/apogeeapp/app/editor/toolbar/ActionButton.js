//This is a radio-type item that will highlight when the associated state is active.
export default class ActionButton {
    constructor(commandFunction, isActiveFunction, labelText, textStyleClass, tooltip) {
        this.commandFunction = commandFunction;
        this.isActiveFunction = isActiveFunction;
        this.labelText = labelText;
        this.textStyleClass = textStyleClass;

        this.element = document.createElement("span");
        this.element.title = tooltip;
        this.element.textContent = labelText;

        this.element.onclick = () => {
            this.editorView.focus();
            if (!this.isActive) {
                this.commandFunction(this.editorView.state, this.editorView.dispatch);
            }
        }

        this._setElementIsActive(true);
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
        var elementIsActive = this.isActiveFunction ? this.isActiveFunction(selectionInfo) : true;

        this._setElementIsActive(elementIsActive);
    }

    //=========================
    // internal
    //=========================

    /** This sets the toggle state and the display class. */
    _setElementIsActive(isActive) {
        if(this.elementIsActive != isActive) {
            this.elementIsActive = isActive;
            if (isActive) {
                this.element.className = "atb_actionButton atb_actionOnClass " + this.textStyleClass;
            }
            else {
                this.element.className = "atb_actionButton atb_actionOffClass " + this.textStyleClass;
            }
        }
    }

}

