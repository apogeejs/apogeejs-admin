/** HtmlJsDataEditor2
 * This is the data display for a custom control where the display is generated from
 * HTML and javascript code. Is should be passed a 
 * resource (javascript object) which has the following methods optionally defined: 
 * 
 * constructorAddition(viewMode);
 * init(outputElement,viewMode);
 * setData(data,outputElement,viewMode);
 * getData(outputElement,viewMode);
 * isCloseOk(outputElement,viewMode);
 * destroy(outputElement,viewMode);
 * onLoad(outputElement,viewMode);
 * onUnload(outputElement,viewMode);
 * onResize(outputElement,viewMode);
 */

/** This is the display/editor for the custom control output. */
apogeeapp.app.HtmlJsDataEditor2 = class extends apogeeapp.app.EditorDataDisplay {
    constructor(viewMode,callbacks,member,html,resource) {
        super(viewMode,callbacks,apogeeapp.app.EditorDataDisplay.NON_SCROLLING);
        
        this.resource = resource;
        this.member = member;
        
//test
if(resource.setStartEditMode) {
    resource.setStartEditMode( () => this.onTriggerEditMode());
}
    
        this.outputElement = apogeeapp.ui.createElement("div",null,{
            "position":"absolute",
            "top":"0px",
            "left":"0px",
            "bottom":"0px",
            "right":"0px",
            "overflow":"auto"
        });

        //content
        if(html) {
            this.outputElement.innerHTML = html;
        }
        
        //TEMP - I used to pass the view mode, now I just want to pass something else.
        var mode = {
            getMessenger: () => new apogee.action.Messenger(this.member)
        }

        //-------------------
        //constructor code
        //-------------------

        if(resource.constructorAddition) {
            try {
                //custom code
                resource.constructorAddition.call(resource,mode);
            }
            catch(error) {
                alert("Error in " + this.member.getFullName() + " init function: " + error.message);
            }
        }

        //------------------------
        //add resize/load listener if needed
        //------------------------

        

        if(this.resource.onLoad) {
            this.onLoad = () => {
                try {
                    resource.onLoad.call(resource,this.outputElement,mode);
                }
                catch(error) {
                    alert("Error in " + this.member.getFullName() + " onLoad function: " + error.message);
                }
            };
        }

        if(this.resource.onUnload) {   
            this.onUnload = () => {
                try {
                    if(this.resource.onHide) {
                        resource.onUnload.call(resource,this.outputElement,mode);
                    }
                }
                catch(error) {
                    alert("Error in " + this.member.getFullName()+ " onUnload function: " + error.message);
                }
            }
        }

        if(this.resource.onResize) {
            this.onResize = () => {
                try {
                    resource.onResize.call(resource,this.outputElement,mode);
                }
                catch(error) {
                    console.log("Error in " + this.member.getFullName() + " onResize function: " + error.message);
                }
            };
        }
        
//        if(this.resource.setData) {
//            this.showData = () => {
//                try {
//                    if(this.resource.setData) {
//                        //set data, but only if the member does not have and error and is not pending
//                        if((!this.member.hasError())&&(!this.member.getResultPending())) {
//                            var data = this.member.getData();
//                            resource.setData.call(resource,data,this.outputElement,mode);
//                        }
//                    }
//                }
//                catch(error) {
//                    alert("Error in " + this.member.getFullName() + " setData function: " + error.message);
//                }
//            }
//        }
//        else {
//            //we must include a function here
//            this.showData = () => {};
//        }

        if(this.resource.setData) {
            this.setEditorData = (data) => {
                try {
                    if(this.resource.setData) {
                        if((!this.member.hasError())&&(!this.member.getResultPending())) {
                            resource.setData.call(resource,data,this.outputElement,mode);
                        }
                    }
                }
                catch(error) {
                    alert("Error in " + this.member.getFullName() + " setData function: " + error.message);
                }
            }
        }
        else {
            //we must include a function here
            this.setEditorData = () => {};
        }
        
        if(this.resource.getData) {
            this.getEditorData = () => {
                try {
                    if(this.resource.getData) {
                        return this.resource.getData.call(resource,this.outputElement,viewMode);
                    }
                }
                catch(error) {
                    alert("Error in " + this.member.getFullName() + " setData function: " + error.message);
                }
            }
        }
        else {
            //we must include a function here
            this.setEditorData = () => {};
        }

        if(this.resource.isCloseOk) {     
            this.isCloseOk = () => {
                try {
                    resource.isCloseOk.call(resource,this.outputElement,mode);
                }
                catch(error) {
                    alert("Error in " + this.member.getFullName() + " isCloseOk function: " + error.message);
                }
            }
        }

        if(this.resource.destroy) {
            this.destroy = () => {
                try {
                    resource.destroy.call(resource,this.outputElement,mode);
                }
                catch(error) {
                    alert("Error in " + this.member.getFullName() + " destroy function: " + error.message);
                }
            }
        }

        //-------------------
        //initialization
        //-------------------

        if(resource.init) {
            try {
                resource.init.call(resource,this.outputElement,mode);
            }
            catch(error) {
                alert("Error in " + this.member.getFullName() + " init function: " + error.message);
            }
        }
    }
    
    getContent() {
        return this.outputElement;
    }
    
    getContentType() {
        return apogeeapp.ui.RESIZABLE;
    }
   
}






