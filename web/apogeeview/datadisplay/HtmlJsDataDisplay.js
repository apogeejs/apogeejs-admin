import DataDisplay from "/apogeeview/datadisplay/DataDisplay.js";
import UiCommandMessenger from "/apogeeapp/commands/UiCommandMessenger.js";
import apogeeui from "/apogeeui/apogeeui.js";

/** HtmlJsDataDisplay
 * This is the data display for a custom control where the display is generated from
 * HTML and javascript code. The datasrouce for this data display has some additional 
 * fields defined for it: 
 * 
 * - html = dataSource.getHtml(); REQUIRED - This retrieves the HTML for the display
 * - resource = dataSource.getResource(); REQUIRED - This retrieves the "resource" object to run the display
 * - member = dataSource.getContextMember(); REQUIRED - This retrieves a member to use as a context reference
 * - displayData = dataSource.getDisplayData(); OPTIONAL - This returns model data to _construct_ the form
 *               whereas the standard getData() method returns data to _populate_ the form.
 * 
 * The resource object can have the following methods. All of these are optional. The areguments include the outputElement
 * whcih is the DOM element for the window and the "admin" object, which is provides some facilities to these methods. The admin
 * is described below.
 * 
 * - init(outputElement,admin) - This is called when the data display is first created.
 * - setData(data,outputElement,admin) - This is called to set model data in the display, whenever the model data
 *                is updated. This will be called _after_ the onLoad method below.
 * - getData(outputElement,admin) - This is called to retrieve data from the display, during a save in edit mode.
 * - isCloseOk(outputElement,admin) - This is called before the data display is closed. Returning false will cancel the close, at
 *                the users option.
 * - destroy(outputElement,admin) - This is called after the display is closed.
 * - onLoad(outputElement,admin) - This is called when the HTML of the data display is loaded.
 * - onUnload(outputElement,admin) - This is called after the HTML for the data display is unloaded from the window.
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

        let displayData = dataSource.getDisplayData ? dataSource.getDisplayData() : undefined;

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

                    //set the display data if we have any
                    if((displayData !== undefined)&&(resource.setDisplayData)) {
                        resource.setDisplayData(displayData);
                        displayData = undefined;
                    }
                    
                    //handle the case the data loaded before the html (which we don't want)
                    if(this.cachedData != undefined) {
                        this.setData(this.cachedData);
                        this.cachedData = undefined;
                    }
                }
                catch(error) {
                    if(error.stack) console.error(error.stack);
                    
                    alert("Error in " + member.getName() + " onLoad function: " + error.message);
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
                    
                    alert("Error in " + member.getName()+ " onUnload function: " + error.message);
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
                
                alert("Error in " + member.getName() + " setData function: " + error.message);
            }
        }
        
        if(resource.getData) {
            this.getData = () => {
                try {
                    return resource.getData.call(resource,this.outputElement,admin);
                }
                catch(error) {
                    if(error.stack) console.error(error.stack);
                    
                    alert("Error in " + member.getName() + " getData function: " + error.message);
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
                    
                    alert("Error in " + member.getName() + " isCloseOk function: " + error.message);
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
                    
                    alert("Error in " + member.getName() + " destroy function: " + error.message);
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
                
                alert("Error in " + member.getName() + " init function: " + error.message);
            }
        }
    }
}






