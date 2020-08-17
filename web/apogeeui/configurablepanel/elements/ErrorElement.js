import ConfigurableElement from "/apogeeui/configurablepanel/ConfigurableElement.js";

/** This is a heading element configurable element.
 * 
 * @class 
 */
export default class ErrorElement extends ConfigurableElement {

    constructor(form,elementInitData,error) {
        super(form,DUMMY_INIT);
        
        var containerElement = this.getElement();
        
        let errorMsg = error.toString();
        let initData;
        try {
            initData = elementInitData ? JSON.stringify(elementInitData,null,"\t") : NO_INIT_DATA_MSG;
        }
        catch {
            initData = NO_INIT_DATA_MSG;
        }

        containerElement.style.color = "red";
        containerElement.style.border = "1px dashed red";
        containerElement.style.fontSize = ".8em";
        containerElement.innerHTML = `<b>Error<b>: ${errorMsg}<br><pre>${initData}</pre>`;
    }

}

let DUMMY_INIT = {
    type: "error"
}

const NO_INIT_DATA_MSG = "-- init data not available --"

ErrorElement.TYPE_NAME = "error";