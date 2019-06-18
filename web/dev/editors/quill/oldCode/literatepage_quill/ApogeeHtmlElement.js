//=================
//custom element
//=================
class ApogeeHtmlElement extends HTMLElement {
	constructor() {
		super();
		
		//get shadow element
		var shadow = this.attachShadow({mode: 'open'});
        
        var dnhCssElement = document.createElement("link");
        dnhCssElement.rel = "stylesheet";
        dnhCssElement.type = "text/css";
        dnhCssElement.href = "/apogeeapp/ui/menu/Menu.css";
        shadow.appendChild(dnhCssElement);
        
        var literatePageCssElement = document.createElement("link");
        literatePageCssElement.rel = "stylesheet";
        literatePageCssElement.type = "text/css";
        literatePageCssElement.href = "/apogeeapp/app/component/literatepage/LiteratePage.css";
        shadow.appendChild(literatePageCssElement);
        
        
        var gridCssElement = document.createElement("link");
        gridCssElement.rel = "stylesheet";
        gridCssElement.type = "text/css";
        gridCssElement.href = "https://cdnjs.cloudflare.com/ajax/libs/handsontable/6.2.0/handsontable.full.min.css";
        shadow.appendChild(gridCssElement);
		
		//read attributes
		var componentPath = this.getAttribute("path");
        
        //populate here
		
		//add content
		this.container = document.createElement("div");
        this.container.style.position = "relative";
        shadow.appendChild(this.container);	
		
	}
    
    /** This sets the component associated with this element. */
    setComponentDisplay(componentDisplay) {
        apogeeapp.ui.removeAllChildren(this.container);
        
        this.componentDisplay = componentDisplay;
        if(componentDisplay) {
            this.container.appendChild(componentDisplay.getElement());
            componentDisplay.setIsComponentOnPage(true);
        }
    }
    
    getComponentDisplay() {
        return this.componentDisplay;
    }
}

customElements.define('apogee-element',ApogeeHtmlElement);
