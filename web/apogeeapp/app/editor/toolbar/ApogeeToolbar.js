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
  constructor(items, editorView) {
    this.items = items
    
    this.dom = document.createElement("div")
    this.dom.className = "atb_toolbar"

    this.items.forEach(item => {
      this.dom.appendChild(item.getElement());
    })
    
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

  _getSelectionInfo() {

    let { $from, $to } = this.editorView.state.selection;
    let doc = this.editorView.state.doc;
    let schema = this.editorView.state.schema;

    //get block info
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

    //get mark info
    let markInfo = {};
    for(let markName in schema.marks) {
      markInfo[markName] = {mark: schema.marks[markName], present: false, missing:false};
    }

    let setMarkInfo = node => {
      if(node.isText) {
        for(let markName in markInfo) {
          let markEntry = markInfo[markName];
          //this conditional is wrong - it is an array of mark info objects, not marks
          if(node.marks.indexOf(markEntry.mark) >= 0) {
            markEntry.present = true;
          }
          else {
            markEntry.missing = true;
          }
        }
        return false;
      }
      else {
        return true;
      }
    }

    doc.nodesBetween($from.pos,$to.pos,setMarkInfo);
    
    //return selection info
    let selectionInfo = {};
    selectionInfo.blocks = blockInfo;
    selectionInfo.marks = markInfo;
    return selectionInfo;

    ////////////////////////////////////////

    // //get a list of blocks and a list for each mark type
    // var blocks = [];
    // var markState = this._getEmptyMarkMap();
    // for (let key in markState) {
    //   markState[key] = [];
    // }

    // if (empty) {
    //   if ($cursor) {
    //     //get the closest ancestor block node
    //     let parentBlock;
    //     let ancestor;
    //     for (let i = 0; (ancestor = $cursor.node(i)); i++) {
    //       if (ancestor.type.isBlock) {
    //         parentBlock = ancestor;
    //       }
    //     }
    //     if (parentBlock) {
    //       blocks.push(parentBlock.type.name);
    //     }

    //     //populate marks for the cursor
    //     this._updateMarkStateFromMarkList(markState, $cursor.marks());
    //   }
    //   else {
    //     //no cursor for empty selection
    //     //keep blocks and marks are empty
    //   }
    // }
    // else {
    //   //there is a selection

    //   //the model below assumes a single level of block
    //   //with text nodes insides with the above specified marks available.
    //   //---------------------------------------------------------------------
    //   //DOH! - The logic I put in for reading the parent block node is not good,
    //   //but it should work in the special schema that only allows one block node deep
    //   //----------------------------------------------------------------------
    //   for (let rangeIndex = 0; rangeIndex < ranges.length; rangeIndex++) {
    //     let { $from, $to } = ranges[rangeIndex]
    //     let previousBlockName = null;
    //     doc.nodesBetween($from.pos, $to.pos, node => {

    //       if (node.type.name == "text") {
    //         //populate marks for this text node
    //         this._updateMarkStateFromMarkList(markState, node.marks);

    //         //store the main block type
    //         //validate this better
    //         if (previousBlockName) {
    //           this._addToListOnce(blocks, previousBlockName);
    //         }
    //         else {
    //           //figure out a better way to handle this.
    //           throw new Error("No block node found for this text node!");
    //         }
    //       }
    //       else {
    //         //store latest block  - will be a block for the given text node.
    //         if (node.type.isBlock) {
    //           previousBlockName = node.type.name;
    //         }
    //       }
    //     })
    //   }
    // }

    // //get the selection state for the blocks and marks 
    // return {
    //   blocks: blocks,
    //   marks: markState
    // }
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
