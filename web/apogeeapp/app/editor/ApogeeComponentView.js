
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
      var jsonData = this.getJsonData();
      var name = jsonData;
  
      //lookup component
      var member = this.folderMember.lookupChild(name);
  
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
  
    getJsonData() {
      //get the attribute!!!!
      var stateJson = this.node.attrs["state"];
      if (stateJson === undefined) stateJson = "";
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
  
  