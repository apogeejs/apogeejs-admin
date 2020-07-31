import ConfigurableElement from "/apogeeui/configurablepanel/ConfigurableElement.js";

/** This is an text field element configurable element.
 * 
 * @class 
 */
export default class SpacerElement extends ConfigurableElement {
    constructor(form,elementInitData) {
        //we will hide this element by setting display none. Someone can go ahead 
        //and show it, in which case they will get an empty element with margins.
        //maybe we should have a way to not create the element in the first place.
        super(form,elementInitData);
        
        var containerElement = this.getElement();
        //udpate padding and margin to 0
        containerElement.style.margin = ConfigurableElement.ELEMENT_MARGIN_NONE;
        containerElement.style.padding = ConfigurableElement.ELEMENT_PADDING_NONE;
        
        this.spacerElement = document.createElement("div");
        var spacerHeight;
        if(elementInitData.height !== undefined) {
            spacerHeight = elementInitData.height;
        }
        else {
            spacerHeight = SpacerElement.DEFAULT_HEIGHT;
        }
        //this.spacerElement.style.display = "table";
        this.spacerElement.style.height = spacerHeight + "px";
        
        containerElement.appendChild(this.spacerElement);
        
        this._postInstantiateInit(elementInitData);
    }
}

//adding this includes the extra space of two margins rather than one,
//so just one pixel has a large effect
SpacerElement.DEFAULT_HEIGHT = 15;

SpacerElement.TYPE_NAME = "spacer";
