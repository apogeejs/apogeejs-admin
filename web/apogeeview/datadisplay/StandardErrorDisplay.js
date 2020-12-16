import DataDisplay from "/apogeeview/datadisplay/DataDisplay.js";
import {uiutil} from "/apogeeui/apogeeUiLib.js";

/** Standard Error display.
 * 
 * @param {type} displayContainer - the display container
 * @param {type} dataSource - {updateComponent,getData,getEditOk,setData}; format for data is text
 */
export default class StandardErrorDisplay extends DataDisplay {
    
    constructor(displayContainer,dataSource) {
        super(displayContainer,dataSource);

        this.destroyed = false;

        this.editorDiv = document.createElement("div");
        this.editorDiv.className = "errorDisplay_main";
    }
    
    getContent() {
        return this.editorDiv;
    }

    setData(json) {
        uiutil.removeAllChildren(this.editorDiv);

        if(Array.isArray(json)) {
            json.forEach(errorInfo => {
                let errorInfoDiv = _createErrorInfoDiv();
                this.editorDiv.appendChild(errorInfoDiv);
                switch(errorInfo.type) {
                    case "esprimaParseError":
                        _addEsprimseParseError(errorInfoDiv,errorInfo);
                        break;

                    case "javascriptParseError":
                        _addJavascriptParseError(errorInfoDiv,errorInfo);
                        break;

                    case "runtimeError":
                        _addRuntimeError(errorInfoDiv,errorInfo);
                        break;

                    default:
                        //for now we will print other errors too
                        _addOtherError(errorInfoDiv,errorInfo);
                }
            });
    
            //this.editorDiv.innerHTML = JSON.stringify(json);
        }
    }
    
    onLoad() {
    }

    destroy() {
    }

}

function _addEsprimseParseError(div,errorInfo) {
    if(errorInfo.description) _addDescription(div,errorInfo.description);
    if(errorInfo.errors) _addEsprimaErrorArray(div,errorInfo.errors);
    if(errorInfo.code)  _addCode(div,errorInfo.code);
}

function _addJavascriptParseError(div,errorInfo) {
    if(errorInfo.description) _addDescription(div,errorInfo.description);
    if(errorInfo.stack) _addStackTrace(div,errorInfo.stack);
    if(errorInfo.code) _addCode(div,errorInfo.code);
}

function _addRuntimeError(div,errorInfo) {
    if(errorInfo.description) _addDescription(div,errorInfo.description);
    if(errorInfo.stack) _addStackTrace(div,errorInfo.stack);
    if((errorInfo.memberTrace)&&(Array.isArray(errorInfo.memberTrace))) {
        errorInfo.memberTrace.forEach(memberEntry => _addMemberCodeEntry(div,memberEntry));
    }
}

function _addOtherError(div,errorInfo) {
    //this is jsut for dev, for now at least
    //so we will use inline style parameters
    let headingDiv = document.createElement("div");
    headingDiv.innerHTML = "Error info:";
    div.appendChild(headingDiv);
    let bodyDiv = document.createElement("div");
    bodyDiv.innerHTML = JSON.stringify(errorInfo);
    bodyDiv.style.color = "red";
    div.appendChild(bodyDiv);
}

//===========================================
// These are standard individual display elements in the display 
//===========================================

function _createErrorInfoDiv() {
    let errorInfoDiv = document.createElement("div");
    errorInfoDiv.className = "errorDisplay_errorInfoDiv";
    return errorInfoDiv;
}

function _addDescription(div,description) {
    let containerDiv = document.createElement("div");
    containerDiv.innerHTML = description;
    containerDiv.className = "errorDisplay_descriptionDiv";
    div.appendChild(containerDiv);
}

function _addStackTrace(div,stackTrace) {
    let containerDiv = document.createElement("div");
    containerDiv.innerHTML = stackTrace;
    containerDiv.className = "errorDisplay_stackTraceDiv";
    div.appendChild(containerDiv);
}

function _addMemberCodeEntry(div,memberCodeEntry) {
    let memberHeading = memberCodeEntry.name ? memberCodeEntry.name + " Code:" : "Code:"
    let headingDiv = document.createElement("div");
    headingDiv.innerHTML = memberHeading;
    headingDiv.className = "errorDisplay_memberHeadingDiv";
    div.appendChild(headingDiv);
    _addCode(div,memberCodeEntry.code);
}

function _addCode(div,code) {
    let container = document.createElement("pre");
    container.className = "errorDisplay_codeSection";
    //split code into lines, each will be numbered
    let lineArray = code.split("\n");
    lineArray.forEach(line => {
        let codeLine = document.createElement("code");
        codeLine.innerHTML = line + "\n";
        container.appendChild(codeLine);
    })
    //-------------------
    //this is a clumsy way of adjusting the number line gutter for longer code
    //but I am not sure how I should do this.
    //if the code is longer then 10000 then they have to deal with the line numbers going outside the gutter for now.
    if((lineArray.length > 99)&&(lineArray.length < 1000)) {
        container.classList.add("errorDisplay_longCode");
    }
    else if(lineArray.length > 1000) {
        container.classList.add("errorDisplay_veryLongCode");
    }
    //-------------------
    div.appendChild(container);
}

function _addEsprimaErrorArray(div,esprimaErrorArray) {
    if(Array.isArray(esprimaErrorArray)) {
        let headingDiv = document.createElement("div");
        headingDiv.innerHTML = "Parse Errors:";
        headingDiv.className = "errorDisplay_esprimaHeadingDiv";
        div.appendChild(headingDiv);
        esprimaErrorArray.forEach(esprimaError => _addEsprimaError(div,esprimaError));
    }
}

function _addEsprimaError(div,esprimaError) {
    let containerDiv = _createSimpleEntry()
    let heading = esprimaError.description ? esprimaError.description : "Error"
    _addSimpleEntryHeading(containerDiv,heading);

    if(esprimaError.lineNumber) {
        _addSimpleEntryLine(containerDiv,"Line Number: ",esprimaError.lineNumber);
    }
    if(esprimaError.column) {
        _addSimpleEntryLine(containerDiv,"Column: ",esprimaError.column);
    }
    if(esprimaError.index) {
        _addSimpleEntryLine(containerDiv,"Index: ",esprimaError.index);
    }
    
    div.appendChild(containerDiv);
}

/** This makes an entry that consists of lines with a label and text */
function _createSimpleEntry() {
    let containerDiv = document.createElement("div");
    containerDiv.className = "errorDisplay_simpleEntryDiv";
    return containerDiv;
}

/** This adds a heading line to a simple entry */
function _addSimpleEntryHeading(div,text) {
    let headingDiv = document.createElement("div");
    headingDiv.className = "errorDisplay_simpleEntryHeadingDiv";
    headingDiv.innerHTML = text;
    div.appendChild(headingDiv);
}

/** This adds an entry to a give. The entry is a single line with a label and text. */
function _addSimpleEntryLine(div,label,text) {
    let lineDiv = document.createElement("div");
    lineDiv.className = "errorDisplay_simpleEntryLineDiv";
    let labelSpan = document.createElement("span");
    labelSpan.classname = "errorDisplay_simpleEntryLabelSpan";
    labelSpan.innerHTML = label;
    lineDiv.appendChild(labelSpan);
    let textSpan = document.createElement("span");
    textSpan.classname = "errorDisplay_simpleEntryTextSpan";
    textSpan.innerHTML = text;
    lineDiv.appendChild(textSpan);
    div.appendChild(lineDiv);
}



