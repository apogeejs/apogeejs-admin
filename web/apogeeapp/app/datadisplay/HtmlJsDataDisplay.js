/** HtmlJsDataDisplay
 * This is the data display for a custom control where the display is generated from
 * HTML and javascript code. Is should be passed a 
 * resource (javascript object) which has the following methods optionally defined: 
 * 
 * constructorAddition(viewMode);
 * init(outputElement,viewMode);
 * setData(data,outputElement,viewMode);
 * isCloseOk(outputElement,viewMode);
 * destroy(outputElement,viewMode);
 * onLoad(outputElement,viewMode);
 * onUnload(outputElement,viewMode);
 * onResize(outputElement,viewMode);
 */

/** This is the display/editor for the custom control output. */
apogeeapp.app.HtmlJsDataDisplay = class extends apogeeapp.app.DataDisplay {
    constructor(viewMode,callbacks,member,html,resource) {
        
        super(viewMode,callbacks,apogeeapp.app.DataDisplay.NON_SCROLLING);
        
        this.resource = resource;
        this.member = member;
        
        this.isLoaded = false;
        this.cachedData = undefined;
    
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
        
        //this gives the ui code access to some data display functions
        var admin = {
            getMessenger: () => new apogee.action.Messenger(this.member),
            startEditMode: () => this.onTriggerEditMode()
        }

        //-------------------
        //constructor code
        //-------------------
        //I have this for legacy reasons
        if(resource.constructorAddition) {
            try {
                //custom code
                resource.constructorAddition.call(resource,admin);
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
                    resource.onLoad.call(resource,this.outputElement,admin);
                    this.isLoaded = true;
                    
                    //handle the case the data loaded before the html (which we don't want)
                    if(this.cachedData != undefined) {
                        this.setData(this.cachedData);
                        this.cachedData = undefined;
                    }
                }
                catch(error) {
                    alert("Error in " + this.member.getFullName() + " onLoad function: " + error.message);
                }
            };
        }

        if(this.resource.onUnload) {   
            this.onUnload = () => {
                try {
                    
                    this.isLoaded = false;
                    this.cachedData = undefined;
                    
                    if(this.resource.onHide) {
                        resource.onUnload.call(resource,this.outputElement,admin);
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
                    resource.onResize.call(resource,this.outputElement,admin);
                }
                catch(error) {
                    console.log("Error in " + this.member.getFullName() + " onResize function: " + error.message);
                }
            };
        }


        this.setData = (data) => {
            try {
                if(this.resource.setData) {
                    if(!this.isLoaded) {
                        this.cachedData = data;
                        return;
                    }
                    
                    resource.setData.call(resource,data,this.outputElement,admin);
                }
                else {
                     //we must include a function here
                     this.setData = () => {};
                }
            }
            catch(error) {
                alert("Error in " + this.member.getFullName() + " setData function: " + error.message);
            }
        }
        
        if(this.resource.getData) {
            this.getData = () => {
                try {
                    if(this.resource.getData) {
                        return this.resource.getData.call(resource,this.outputElement,admin);
                    }
                }
                catch(error) {
                    alert("Error in " + this.member.getFullName() + " setData function: " + error.message);
                }
            }
        }
        else {
            //we must include a function here
            this.setData = () => {};
        }


        if(this.resource.isCloseOk) {     
            this.isCloseOk = () => {
                try {
                    resource.isCloseOk.call(resource,this.outputElement,admin);
                }
                catch(error) {
                    alert("Error in " + this.member.getFullName() + " isCloseOk function: " + error.message);
                }
            }
        }

        if(this.resource.destroy) {
            this.destroy = () => {
                try {
                    resource.destroy.call(resource,this.outputElement,admin);
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
                resource.init.call(resource,this.outputElement,admin);
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






