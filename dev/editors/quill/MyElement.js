//=================
//custom element
//=================
class MyElement extends HTMLElement {
    
    // Specify observed attributes so that
    // attributeChangedCallback will work
    static get observedAttributes() {
        return ['data-value'];
    }
  
	constructor() {
		super();
		
		//get shadow element
		var shadow = this.attachShadow({mode: 'open'});
        
        
        //read attributes
		this.data = this.getAttribute("data-value");
        if((this.data === undefined)||(this.data === null)) this.data = "";
		
		//add content
		var container = document.createElement("div");
		container.style.backgroundColor = "lightgray";
		container.style.outline = "1px solid gray";
		
		container.appendChild(document.createTextNode("Hello there:"));
		
		var attachedButtonAction = () => {
			alert("It worked! Index = " + index);
		};
		
		var saveAction = () => {
			this.data = this.inTextarea.value;
			this.outTextarea.value = this.data;
			this.setAttribute("data-value",this.data);
		}
		
		var cancelAction = () => {
			this.inTextarea.value = this.data;
		}
		
		var saveButton = document.createElement("button");
		saveButton.onclick = saveAction;
		saveButton.innerHTML = "Save";
		container.appendChild(saveButton);
		
		var cancelButton = document.createElement("button");
		cancelButton.onclick = cancelAction;
		cancelButton.innerHTML = "Cancel";
		container.appendChild(cancelButton);
		
		container.appendChild(document.createElement("br"));
		
		this.inTextarea = document.createElement("textarea");
		this.inTextarea.rows = 5;
		this.inTextarea.cols = 20;
		container.appendChild(this.inTextarea);
		
		this.outTextarea = document.createElement("textarea");
		this.outTextarea.rows = 5;
		this.outTextarea.cols = 20;
		this.outTextarea.disabled = true;
		container.appendChild(this.outTextarea);
		
        this.inTextarea.value = this.data;
		this.outTextarea.value = this.data;
		
		shadow.appendChild(container);
        
	}
    
    connectedCallback() {
        console.log('My Element added to page!');
    }

    disconnectedCallback() {
        console.log('MY Element removed from page!');
    }

    adoptedCallback() {
        console.log('My element moved to a new page!');
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if(newValue == this.data) {
    		console.log('attribute changed, but it matches the data.')
    	}
    	else {
        	console.log('attribute changed: ' + name + "; was: " + oldValue + "; is: " + newValue);
            this.data = newValue;
            this.inTextarea.value = this.data;
            this.outTextarea.value = this.data;
    	}    
    }
}

customElements.define('my-element',MyElement);