import DataDisplay from "/apogeeview/datadisplay/DataDisplay.js";
import UiCommandMessenger from "/apogeeapp/commands/UiCommandMessenger.js";
import apogeeui from "/apogeeui/apogeeui.js";

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
 * 
 * The admin object includes the following functions on it:
 * getMessenger()
 * startEditMode()
 * endEditMode()
 */

/** This is the display/editor for the custom control output. */
export default class HtmlJsDataDisplay extends DataDisplay {
    constructor(app,displayContainer,dataSource) {
        
        super(displayContainer,dataSource);
        
        this.app = app;
        
        this.isLoaded = false;
        this.cachedData = undefined;

        this.outputElement = apogeeui.createElement("div",null,{
            "position":"relative"
        });

        this._constructDisplay();
    }

    getContent() {
        return this.outputElement;
    }

    /** This method implements the methods needed for the display interface from the data source */
    _constructDisplay() {

        let dataSource = this.getDataSource();
        let html = dataSource.getHtml();
        let resource = dataSource.getResource();
        let member = dataSource.getContextMember();

        //content
        if(html) {
            this.outputElement.innerHTML = html;
        }
        
        //this gives the ui code access to some data display functions
        var admin = {
            getMessenger: () => new UiCommandMessenger(this.app,member),
            startEditMode: () => this.startEditMode(),
            endEditMode: () => this.endEditMode()
        }

        if(resource.onLoad) {
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
                    
                    alert("Error in " + member.getFullName() + " onLoad function: " + error.message);
                }
            };
        }
        else {
            this.isLoaded = true;
        }

        if(resource.onUnload) {   
            this.onUnload = () => {
                try {
                    
                    this.isLoaded = false;
                    this.cachedData = undefined;
                    
                    resource.onUnload.call(resource,this.outputElement,admin);
                }
                catch(error) {
                    if(error.stack) console.error(error.stack);
                    
                    alert("Error in " + member.getFullName()+ " onUnload function: " + error.message);
                }
            }
        }

        this.setData = (data) => {
            try {
                if(resource.setData) {
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
                
                alert("Error in " + member.getFullName() + " setData function: " + error.message);
            }
        }
        
        if(resource.getData) {
            this.getData = () => {
                try {
                    return resource.getData.call(resource,this.outputElement,admin);
                }
                catch(error) {
                    if(error.stack) console.error(error.stack);
                    
                    alert("Error in " + member.getFullName() + " getData function: " + error.message);
                }
            }
        }
        else {
            //we must include a function here
            //WHY RETURN A DUMMY OBJECT? WHY NOT NULL? OR INVALID?
            this.getData = () => {};
        }


        if(resource.isCloseOk) {     
            this.isCloseOk = () => {
                try {
                    return resource.isCloseOk.call(resource,this.outputElement,admin);
                }
                catch(error) {
                    if(error.stack) console.error(error.stack);
                    
                    alert("Error in " + member.getFullName() + " isCloseOk function: " + error.message);
                }
            }
        }

        if(resource.destroy) {
            this.destroy = () => {
                try {
                    resource.destroy.call(resource,this.outputElement,admin);
                }
                catch(error) {
                    if(error.stack) console.error(error.stack);
                    
                    alert("Error in " + member.getFullName() + " destroy function: " + error.message);
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
                
                alert("Error in " + member.getFullName() + " init function: " + error.message);
            }
        }
    }
}






