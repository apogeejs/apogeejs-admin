
//================================================================================
// Apogee component
//================================================================================

export default class ApogeeComponentView {
    constructor(node, view, getPos, folderComponent, folderMember) {
      // We'll need these later
      this.node = node
      this.view = view
      this.getPos = getPos
      this.folderComponent = folderComponent;
      this.folderMember = folderMember;
  
      // The node's representation in the editor
      this.dom = document.createElement("div");
      this.dom.className = "page-apogee-comp";
  
      this.contentDiv = document.createElement("div");
      this.contentDiv.className = "page-apogee-comp-container"
      this.dom.appendChild(this.contentDiv);
  
      this.setViewDataFromNode();
  
    }
  
    selectNode() {
      this.dom.classList.add("ProseMirror-selectednode")
      //if (!this.innerView) this.open()
    }
  
    deselectNode() {
      this.dom.classList.remove("ProseMirror-selectednode")
      //if (this.innerView) this.close()
    }
  
    setViewDataFromNode() {
      let name = this.node.attrs["name"];
      let memberId = this.node.attrs["memberId"];
  
      //temporary solution to a problem: we will hold an ID during a name
      //change so we don't lose track of an object.
      //we will not display data in this time.
      if(!memberId) {
        //lookup component
        var member = this.folderMember.lookupChild(name);
        
        //WE SHOULD MAKE SURE THE MEMBER BELONGS TO THIS PARENT!!!??
        if (member) {
          var workspaceUI = this.folderComponent.getWorkspaceUI();
          var component = workspaceUI.getComponent(member);
          var componentDisplay = component.getComponentDisplay();
          if (!componentDisplay) {
            //CLUDGE ALERT - fix this when I reorganize the code
            var tabDisplay = this.folderComponent.getTabDisplay();
            tabDisplay.addChildComponent(component);
            componentDisplay = component.getComponentDisplay();
          }
          var displayElement = componentDisplay.getElement();
          this.contentDiv.appendChild(displayElement);
        }
        else {
          this.contentDiv.innerHTML = "Component not found: " + name;
        }
      }
  
    }
  
    //===========================================================
    //figrue out what I want here
    getJsonData() {
      //get the attribute!!!! - this is just a string
      var name = this.node.attrs["name"];
      if (name) stateJson = {name};
      else stateJson = {};
      return stateJson;
    }
  
    getTextData() {
      //get the json data and make to text
      var data = this.getJsonData();
      var textData;
      if (data == null) textData = "";
      else textData = JSON.stringify(data);
      return textData;
    }
    //end simplified
    //============================================================

    update(node) {
      if (!node.sameMarkup(this.node)) return false
      this.node = node;
      this.setViewDataFromNode();
      return true
    }
  
    destroy() {
      //    if (this.innerView) this.close()
    }
  
    stopEvent(event) {
      return true;
    }
  
    ignoreMutation() { return true }
  }
  
  