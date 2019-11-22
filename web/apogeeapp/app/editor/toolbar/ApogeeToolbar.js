//============================================
// Menu Plugin
// This menu plugin comes from the custom menu example. I will use it to
// understand adding to/making the schema
//============================================

const MARK_INFO = {
  bold: true,
  italic: true,
  fontfamily: "fontfamily",
  fontsize: "fontsize",
  textcolor: "color",
  highlight: "color"
}

const EMPTY_MARK_DATA = {
  bold: false,
  italic: false,
  fontfamily: false,
  fontsize: false,
  textcolor: false,
  highlight: false
}

export default class ApogeeToolbar {
  constructor(items) {
    this.items = items
    
    this.dom = document.createElement("div")
    this.dom.className = "atb_toolbar"

    this.markSelectionGenerators = {};

    this.items.forEach(item => this._addToolbarItem(item))
    
  }

  setEditorView(editorView) {
    this.editorView = editorView;

    this.items.forEach(item => {
      item.registerEditorView(editorView);
    })
    this.update();
  }


  update() {
    var selectionInfo = this._getSelectionInfo();
    this.items.forEach(item => {
      item.update(selectionInfo);
    })
  }

  destroy() {
    //this.dom.remove()
  }

  _addToolbarItem(toolbarItem) {

    //this allows mark items to create custom information for themselves in a simple and efficient way
    //blocks are handled in standard way
    if(toolbarItem.getMarkSelectionGenerator) {
      this._registerMarkSelectionGenerator(toolbarItem.getMarkSelectionGenerator());
    }

    this.dom.appendChild(toolbarItem.getElement());
  }

  /** This function allows each mark to create information on selection to decide the item
   * status, such as if the press should turn the mark on or off */
  _registerMarkSelectionGenerator(selectionGenerator) {
    if(selectionGenerator.name) {
      this.markSelectionGenerators[selectionGenerator.name] = selectionGenerator;
    }
  }

  /** This function creates information on each selection event to update the status of the buttons */
  _getSelectionInfo() {

    let { $from, $to } = this.editorView.state.selection;
    let doc = this.editorView.state.doc;
    let schema = this.editorView.state.schema;

    //----------------------------
    //get block info
    //create a list of blocks present, along with the total number of blocks
    //-----------------------------
    let blockInfo = {};
    let startBlockIndex = $from.index(0);
    let endBlockIndex = $to.index(0);
    blockInfo.blockCount = endBlockIndex - startBlockIndex + 1;

    let blockMap = {};
    blockInfo.blockTypes = [];
    for(let index = startBlockIndex; index <= endBlockIndex; index++) {
      let childNode = doc.child(index);
      if(!blockMap[childNode.type.name]) {
        blockMap[childNode.type.name] = true;
        blockInfo.blockTypes.push(childNode.type);
      }
    }

    //-------------------
    //get mark info
    //toolbar buttons register a function to create their own mark info entry
    //-------------------
    //initialize mark info
    let markInfo = {};
    for(let markName in this.markSelectionGenerators) {
      let initEntryFunction = this.markSelectionGenerators[markName].getEmptyInfo;
      markInfo[markName] = initEntryFunction ? initEntryFunction() : {};
    }

    //process marks for text nodes.
    let textNodeNumber = 0;
    let setMarkInfo = node => {
      if(node.isText) {
        node.marks.forEach( mark => {
          let markInfoUpdater = this.markSelectionGenerators[mark.type.name].updateInfo;
          if(markInfoUpdater) {
            let markInfoEntry = markInfo[mark.type.name];
            markInfoUpdater(mark,markInfoEntry,textNodeNumber);
          }
        });
        textNodeNumber++;
      }
    }

    doc.nodesBetween($from.pos,$to.pos,setMarkInfo);

    //call final update, if needed
    for(let markName in this.markSelectionGenerators) {
      let onCompleteFunction = this.markSelectionGenerators[markName].onComplete;
      let markInfoEntry = markInfo[markName];
      if(onCompleteFunction) onCompleteFunction(markInfoEntry,textNodeNumber);
    }
    
    //return selection info
    let selectionInfo = {};
    selectionInfo.blocks = blockInfo;
    selectionInfo.marks = markInfo;
    return selectionInfo;
  }

  _getEmptyMarkMap() {
    return Object.assign({}, EMPTY_MARK_DATA);
  }

  /** This adds a value to a list if it is not there. */
  _addToListOnce(list, value) {
    if (list.indexOf(value) < 0) list.push(value);
  }

  /** This updates the passed in mark state, adding any mark values from the
   * mark list (including the value false for missing marks) */
  _updateMarkStateFromMarkList(markState, markList) {
    let markListMarks = this._getEmptyMarkMap();

    markList.forEach(mark => {
      let markType = mark.type.name;
      let markInfo = MARK_INFO[markType];

      if (markInfo === true) {
        //no-attribute mark
        markListMarks[markType] = true;
      }
      else {
        //attribute mark
        var attribute = mark.attrs[markInfo];
        markListMarks[markType] = attribute;
      }
    });

    for (var markName in markState) {
      this._addToListOnce(markState[markName], markListMarks[markName]);
    }
  }
}
