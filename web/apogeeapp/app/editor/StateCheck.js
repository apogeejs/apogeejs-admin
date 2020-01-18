//============================
// StateCheck plugin
//============================

//This is a test to measure the state of the editor. I want to use this to 
//configure my menu bar (as to what is active)
export default class StateCheck {
    constructor(editorView) {
      this.editorView = editorView
    }
  
    update() {
      this._showSelectionInfo();
    }
  
  
    _showSelectionInfo() {
  
      var { empty, $cursor, ranges } = this.editorView.state.selection;
      var doc = this.editorView.state.doc;
      /////////////////////////////////////////////
      //temp printout to examine selection
      console.log("================");
      if(empty) console.log(empty);
      if($cursor) {
        this._printResolvedPosition("$cursor",$cursor);
      }
      else {
        this._printResolvedPosition("$from",ranges[0].$from);
        this._printResolvedPosition("$to",ranges[0].$to);
      }
      console.log("================");
      return;
      //////////////////////////////////////////
  
      var nodeTypes = [];
      var markTypes = [];
  
      console.log("================");
  
      console.log("Empty: " + empty);
  
      //cursor
      if ($cursor) {
        if ($cursor.parent) {
          console.log("Cursor Parent: " + $cursor.parent.type.name);
        }
  
        let ancestor;
        for (let i = 0; (ancestor = $cursor.node(i)); i++) {
          console.log("Cursor ancestor " + i + ": " + ancestor.type.name);
        }
        let cursorMarks = $cursor.marks().map(mark => mark.type.name);
        console.log("Cursor Marks: " + cursorMarks)
      }
  
      //selection
      for (let rangeIndex = 0; rangeIndex < ranges.length; rangeIndex++) {
        let { $from, $to } = ranges[rangeIndex];

        console.log("Selection range " + rangeIndex + " start path: " + this._getNodePathString($from.path));
        console.log("Selection range " + rangeIndex + " end path: " + this._getNodePathString($to.path));

        doc.nodesBetween($from.pos, $to.pos, node => {
  
          //get the base node and mark info
          nodeTypes.push(node.type.name);
  
          let nodeMarks = [];
          node.marks.forEach(mark => {
            nodeMarks.push(mark.type.name);
          });
          markTypes.push(nodeMarks);
        })
      }
  
      console.log("Nodes: " + JSON.stringify(nodeTypes));
      console.log("Marks: " + JSON.stringify(markTypes));
  
      console.log("================");
    }

    _getNodePathString(path) {
      let simplifiedPath = path.map( element => {
        if(typeof element == "object") {
          return element.type.name;
        }
        else {
          return element;
        }
      })

      return JSON.stringify(simplifiedPath);
    }

    _printResolvedPosition(name,$pos) {
      console.log(name);
      console.log("pos: " + $pos.pos);
      console.log("parentDepth: " + $pos.depth);
      console.log("parentType: " + $pos.parent.type.name);
      console.log("parentOffset: " + $pos.parentOffset);
    }
  }