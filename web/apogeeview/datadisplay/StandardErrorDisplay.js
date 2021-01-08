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
            let errorInfoDiv = _createErrorInfoDiv();
            this.editorDiv.appendChild(errorInfoDiv);
            _processList(errorInfoDiv,json);
        }
    }
    
    onLoad() {
    }

    destroy() {
    }

}

//===================================
// Error Info Elements
//===================================

function _processList(errorInfoDiv,errorInfoList) {
    errorInfoList.forEach(errorInfo => {
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

            case "multiMember":
                _addMultiMemberError(errorInfoDiv,errorInfo);
                break;

            case "dependency":
                _addDependencyError(errorInfoDiv,errorInfo);
                break;
            

            default:
                //for now we will print other errors too
                _addOtherError(errorInfoDiv,errorInfo);
        }
    });
}

function _addEsprimseParseError(errorInfoDiv,errorInfo) {
    if(errorInfo.description) _addMainDescription(errorInfoDiv,errorInfo.description);
    if(errorInfo.errors) _addEsprimaErrorSection(errorInfoDiv,errorInfo.errors);
    if(errorInfo.code)  _addSimpleCodeSection(errorInfoDiv,"Parsed Code",errorInfo.code);
}

function _addJavascriptParseError(errorInfoDiv,errorInfo) {
    if(errorInfo.description) _addMainDescription(errorInfoDiv,errorInfo.description);
    if(errorInfo.stack) _addStackTraceSection(errorInfoDiv,errorInfo.stack);
    if(errorInfo.code) _addSimpleCodeSection(errorInfoDiv,"Parsed Code",errorInfo.code);
}

function _addRuntimeError(errorInfoDiv,errorInfo) {
    if(errorInfo.description) _addMainDescription(errorInfoDiv,errorInfo.description);
    if(errorInfo.stack) _addStackTraceSection(errorInfoDiv,errorInfo.stack);
    if(errorInfo.memberTrace) _addMemberCodeSection(errorInfoDiv,errorInfo.memberTrace);
}

function _addMultiMemberError(errorInfoDiv,errorInfo) {
    if(errorInfo.memberEntries) errorInfo.memberEntries.forEach( memberData => {
        _addMemberTitle(errorInfoDiv,memberData.name);
        _processList(errorInfoDiv,memberData.errorInfoList) 
    });
}

function _addDependencyError(errorInfoDiv,errorInfo) {
    if((errorInfo.dependsOnErrorList)&&(errorInfo.dependsOnErrorList.length > 0)) {
        let dependencyNameString = errorInfo.dependsOnErrorList.map( dependsOnEntry => dependsOnEntry.name).join(", "); 
        _addSectionHeading(errorInfoDiv,"Error in dependencies: " + dependencyNameString,1);
    }
}

function _addOtherError(errorInfoDiv,errorInfo) {
    //this is jsut for dev, for now at least
    //so we will use inline style parameters
    let headingDiv = document.createElement("div");
    headingDiv.innerHTML = "Error info:";
    errorInfoDiv.appendChild(headingDiv);
    let bodyDiv = document.createElement("div");
    bodyDiv.innerHTML = JSON.stringify(errorInfo);
    bodyDiv.style.color = "red";
    errorInfoDiv.appendChild(bodyDiv);
}

//===========================================
// These are combination elements 
//===========================================

function _addStackTraceSection(errorInfoDiv,stackTrace) {
    let sectionDiv = _createSectionDiv();
    errorInfoDiv.appendChild(sectionDiv);

    _addSectionHeading(sectionDiv,"Stack Trace",1);
    let containerDiv = document.createElement("div");
    containerDiv.innerHTML = stackTrace;
    containerDiv.className = "errorDisplay_stackTraceDiv";
    sectionDiv.appendChild(containerDiv);
}

function _addSimpleCodeSection(errorInfoDiv,title,code) {
    let sectionDiv = _createSectionDiv();
    errorInfoDiv.appendChild(sectionDiv);

    _addSectionHeading(sectionDiv,title,1);
    _addCode(sectionDiv,code);
}

function _addMemberCodeSection(errorInfoDiv,memberTrace) {
    if(Array.isArray(memberTrace)) {
        let sectionDiv = _createSectionDiv();
        errorInfoDiv.appendChild(sectionDiv);

        _addSectionHeading(sectionDiv,"Member Code",1)
        memberTrace.forEach(memberEntry => _addMemberCodeEntry(sectionDiv,memberEntry));
    }
}

function _addMemberCodeEntry(sectionDiv,memberCodeEntry) {
    if(memberCodeEntry.name) _addSectionHeading(sectionDiv,memberCodeEntry.name,2);
    _addCode(sectionDiv,memberCodeEntry.code);
}

function _addEsprimaErrorSection(errorInfoDiv,esprimaErrorArray) {
    if(Array.isArray(esprimaErrorArray)) {
        let sectionDiv = _createSectionDiv();
        errorInfoDiv.appendChild(sectionDiv);

        _addSectionHeading(sectionDiv,"Parse Errors",1)
        esprimaErrorArray.forEach(esprimaError => _addEsprimaError(sectionDiv,esprimaError));
    }
}

function _addEsprimaError(sectionDiv,esprimaError) {

    if(esprimaError.description) _addSectionHeading(sectionDiv,esprimaError.description,2);

    if(esprimaError.lineNumber) {
        _addSectionLabelLine(sectionDiv,"Line Number: ",esprimaError.lineNumber);
    }
    if(esprimaError.column) {
        _addSectionLabelLine(sectionDiv,"Column: ",esprimaError.column);
    }
    if(esprimaError.index) {
        _addSectionLabelLine(sectionDiv,"Index: ",esprimaError.index);
    }
}


//===========================================
// These are standard individual elements 
//===========================================

/** This is a wrapper for a single error info object */
function _createErrorInfoDiv() {
    let errorInfoDiv = document.createElement("div");
    errorInfoDiv.className = "errorDisplay_errorInfoDiv";
    return errorInfoDiv;
}

function _addMemberTitle(errorInfoDiv,memberName) {
    let containerDiv = document.createElement("div");
    containerDiv.innerHTML = memberName + ":";
    containerDiv.className = "errorDisplay_memberTitleDiv";
    errorInfoDiv.appendChild(containerDiv);
}

/** This is the main description for a error info. It should be 
 * placed directly in the error info div, at the top. */
function _addMainDescription(errorInfoDiv,description) {
    let containerDiv = document.createElement("div");
    containerDiv.innerHTML = description;
    containerDiv.className = "errorDisplay_descriptionSectionDiv";
    errorInfoDiv.appendChild(containerDiv);
}

/** This is a wrapper for a section within an error info */
function _createSectionDiv() {
    let sectionDiv = document.createElement("div");
    sectionDiv.className = "errorDisplay_sectionDiv";
    return sectionDiv;
}

/** This adds a heading line to a section. See supported levels below. */
function _addSectionHeading(sectionDiv,text,level) {
    let headingDiv = document.createElement("div");
    headingDiv.className = HEAD_CLASS_LEVEL_MAP[level];
    headingDiv.innerHTML = text;
    sectionDiv.appendChild(headingDiv);
}

const HEAD_CLASS_LEVEL_MAP = {
    1: "errorDisplay_sectionHeadingDiv1",
    2: "errorDisplay_sectionHeadingDiv2",
    3: "errorDisplay_sectionHeadingDiv3",
}

/** This adds single line with a label and text to an entry. 
 * If should be placed in a section. */
function _addSectionLabelLine(sectionDiv,label,text) {
    let lineDiv = document.createElement("div");
    lineDiv.className = "errorDisplay_sectionLabelLineDiv";
    let labelSpan = document.createElement("span");
    labelSpan.className = "errorDisplay_sectionLineLabelSpan";
    labelSpan.innerHTML = label;
    lineDiv.appendChild(labelSpan);
    let textSpan = document.createElement("span");
    textSpan.classname = "errorDisplay_sectionLineTextSpan";
    textSpan.innerHTML = text;
    lineDiv.appendChild(textSpan);
    sectionDiv.appendChild(lineDiv);
}

/** This is code. It should be placed in a section. */
function _addCode(sectionDiv,code) {
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
    sectionDiv.appendChild(container);
}




