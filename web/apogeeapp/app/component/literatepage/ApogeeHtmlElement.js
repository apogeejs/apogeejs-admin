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
        dnhCssElement.href = "/apogeeapp/ui/displayandheader/DisplayAndHeader.css";
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
        
//		container.style.backgroundColor = "lightgray";
//		container.style.outline = "1px solid gray";
//		
//		container.appendChild(document.createTextNode("Hello there:"));
//		
//		var attachedButtonAction = () => {
//			alert("It worked! Index = " + index);
//		};
//		
//		var saveAction = () => {
//			var data = inTextarea.value;
//			outTextarea.value = data;
//			saveData(index,{"text":data});
//		}
//		
//		var cancelAction = () => {
//			var oldValue = getData(index);
//			inTextarea.value = oldValue.text;
//		}
//		
//		var saveButton = document.createElement("button");
//		saveButton.onclick = saveAction;
//		saveButton.innerHTML = "Save";
//		container.appendChild(saveButton);
//		
//		var cancelButton = document.createElement("button");
//		cancelButton.onclick = cancelAction;
//		cancelButton.innerHTML = "cancel";
//		container.appendChild(cancelButton);
//		
//		container.appendChild(document.createElement("br"));
//		
//		var inTextarea = document.createElement("textarea");
//		inTextarea.rows = 5;
//		inTextarea.cols = 20;
//		container.appendChild(inTextarea);
//		
//		var outTextarea = document.createElement("textarea");
//		outTextarea.rows = 5;
//		outTextarea.cols = 20;
//		outTextarea.disabled = true;
//		container.appendChild(outTextarea);
//		
//		var savedData = getData(index);
//		if(savedData) {
//			inTextarea.value = savedData.text;
//			outTextarea.value = savedData.text;
//		}
		
		
	}
    
    setComponentDisplay(componentDisplay) {
        apogeeapp.ui.removeAllChildren(this.container);
        this.componentDisplay = componentDisplay;
        if(componentDisplay) {
            this.container.appendChild(componentDisplay.getElement());
            componentDisplay.componentShown();
        }
    }
}

customElements.define('apogee-element',ApogeeHtmlElement);
