import DataDisplay from "/apogeeapp/app/datadisplay/DataDisplay.js";
import UiCommandMessenger from "/apogeeapp/app/commands/UiCommandMessenger.js";
import apogeeui from "/apogeeapp/ui/apogeeui.js";

/** HtmlJsDataDisplay
 * This is the data display for a custom control where the display is generated from
 * HTML and javascript code. Is should be passed a 
 * resource (javascript object) which has the following methods optionally defined: 
 * 
 * init(outputElement,admin)
 * setData(data,outputElement,admin)
 * getData(outputElement,admin)
 * isCloseOk(outputElement,admin)
 * destroy(outputElement,admin)
 * onLoad(outputElement,admin)
 * onUnload(outputElement,admin)
 * onResize(outputElement,admin)
 * 
 * constructorAddition(admin) DEPRECATED!
 * 
 * The admin object includes the following functions on it:
 * getMessenger()
 * startEditMode()
 * endEditMode()
 */

/** This is the display/editor for the custom control output. */
export default class HtmlJsDataDisplay extends DataDisplay {
    constructor(app,displayContainer,callbacks,member,html,resource) {
        
        super(displayContainer,callbacks);
        
        this.app = app;
        this.resource = resource;
        this.member = member;
        
        this.isLoaded = false;
        this.cachedData = undefined;
    
        // this.outputElement = apogeeui.createElement("div",null,{
        //     "position":"absolute",
        //     "top":"0px",
        //     "left":"0px",
        //     "bottom":"0px",
        //     "right":"0px",
        //     "overflow":"auto"
        // });
        this.outputElement = apogeeui.createElement("div",null,{
            "position":"relative"
        });

        //content
        if(html) {
            this.outputElement.innerHTML = html;
        }
        
        //this gives the ui code access to some data display functions
        var admin = {
            getMessenger: () => new UiCommandMessenger(this.app,this.member),
            startEditMode: () => this.startEditMode(),
            endEditMode: () => this.endEditMode()
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
                if(error.stack) console.error(error.stack);
                
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
                    if(error.stack) console.error(error.stack);
                    
                    alert("Error in " + this.member.getFullName() + " onLoad function: " + error.message);
                }
            };
        }
        else {
            this.isLoaded = true;
        }

        if(this.resource.onUnload) {   
            this.onUnload = () => {
                try {
                    
                    this.isLoaded = false;
                    this.cachedData = undefined;
                    
                    resource.onUnload.call(resource,this.outputElement,admin);
                }
                catch(error) {
                    if(error.stack) console.error(error.stack);
                    
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
                    if(error.stack) console.error(error.stack);
                    
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
                if(error.stack) console.error(error.stack);
                
                alert("Error in " + this.member.getFullName() + " setData function: " + error.message);
            }
        }
        
        if(this.resource.getData) {
            this.getData = () => {
                try {
                    return this.resource.getData.call(resource,this.outputElement,admin);
                }
                catch(error) {
                    if(error.stack) console.error(error.stack);
                    
                    alert("Error in " + this.member.getFullName() + " getData function: " + error.message);
                }
            }
        }
        else {
            //we must include a function here
            //WHY RETURN A DUMMY OBJECT? WHY NOT NULL? OR INVALID?
            this.getData = () => {};
        }


        if(this.resource.isCloseOk) {     
            this.isCloseOk = () => {
                try {
                    return resource.isCloseOk.call(resource,this.outputElement,admin);
                }
                catch(error) {
                    if(error.stack) console.error(error.stack);
                    
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
                    if(error.stack) console.error(error.stack);
                    
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
                if(error.stack) console.error(error.stack);
                
                alert("Error in " + this.member.getFullName() + " init function: " + error.message);
            }
        }
    }
    
    getContent() {
        return this.outputElement;
    }
}






