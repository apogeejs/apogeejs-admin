/** This is an text field element configurable element.
 * 
 * @class 
 */
apogeeapp.ui.SpacerElement = class extends apogeeapp.ui.ConfigurableElement {
    constructor(form,elementInitData) {
        //we will hide this element by setting display none. Someone can go ahead 
        //and show it, in which case they will get an empty element with margins.
        //maybe we should have a way to not create the element in the first place.
        super(form,elementInitData,apogeeapp.ui.ConfigurableElement.CONTAINER_CLASS_NO_MARGIN);
        
        var containerElement = this.getElement();
        
        this.spacerElement = document.createElement("div");
        var spacerHeight;
        if(elementInitData.height !== undefined) {
            spacerHeight = elementInitData.height;
        }
        else {
            spacerHeight = apogeeapp.ui.SpacerElement.DEFAULT_HEIGHT;
        }
        //this.spacerElement.style.display = "table";
        this.spacerElement.style.height = spacerHeight + "px";
        
        containerElement.appendChild(this.spacerElement);
        
        this._postInstantiateInit(elementInitData);
    }
}

//adding this includes the extra space of two margins rather than one,
//so just one pixel has a large effect
apogeeapp.ui.SpacerElement.DEFAULT_HEIGHT = 15;

apogeeapp.ui.SpacerElement.TYPE_NAME = "spacer";

apogeeapp.ui.ConfigurablePanel.addConfigurableElement(apogeeapp.ui.SpacerElement);