import DataDisplay from "/apogeeview/datadisplay/DataDisplay.js";
import UiCommandMessenger from "/apogeeview/commandseq/UiCommandMessenger.js";
import {uiutil} from "/apogeeui/apogeeUiLib.js";
import DATA_DISPLAY_CONSTANTS from "/apogeeview/datadisplay/dataDisplayConstants.js";

/** HtmlJsDataDisplay
 * This is the data display for a custom control where the display is generated from
 * HTML and javascript code. The datasrouce for this data display has some additional 
 * fields defined for it: 
 * 
 * - html = dataSource.getHtml(); REQUIRED - This retrieves the HTML for the display
 * - resource = dataSource.getResource(); REQUIRED - This retrieves the "resource" object to run the display (This is similar to
 *              getDisplayData listed below in that it is used during the construction of the display, however this returns an 
 *              object generated at the app layer for constructing the UI.)
 * - member = dataSource.getContextMember(); REQUIRED - This retrieves a member to use as a context reference
 * - displayData = dataSource.getDisplayData(); OPTIONAL - This returns model data to _construct_ the form
 *              whereas the standard getData() method returns data to _populate_ the form. If the display data is
 *              not valid then the value INVALID_VALUE should be passed.
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
    constructor(displayContainer,dataSource) {
        
        super(displayContainer,dataSource);
        
        this.isLoaded = false;
        this.cachedData = undefined;

        this.outputElement = uiutil.createElement("div",null,{
            "position":"relative"
        });

        this._constructDisplay(displayContainer,dataSource);
    }

    getContent() {
        return this.outputElement;
    }

    /** This method implements the methods needed for the display interface from the data source */
    _constructDisplay() {
        let displayContainer = this.getDisplayContainer();
        let dataSource = this.getDataSource();

        let displayValid;
        try {
            let componentView = this.getComponentView();
            let contextMember = dataSource.getContextMember ? dataSource.getContextMember() : componentView.getComponent().getMember();
            let contextMemberId = contextMember.getId();

            //get html
            let html = dataSource.getHtml ? dataSource.getHtml() : "";
            
            //get resource and handle invalid resource
            let resource = dataSource.getResource();
            if(resource.displayInvalid) {
                let messageType = (resource.messageType !== undefined) ? resource.messageType : DATA_DISPLAY_CONSTANTS.MESSAGE_TYPE_ERROR;
                let message = (resource.message !== undefined) ? resource.message : "Display unavailable";
                this.displayContainer.setHideDisplay(true);
                this.displayContainer.setMessage(messageType,message);
                this.setDisplayValid(false);
                return;
            }

            //get display data and handle invalid display data
            let displayData;
            if(dataSource.getDisplayData) {
                let dataResult = DATA_DISPLAY_CONSTANTS.readWrappedDisplayData(dataSource.getDisplayData,"Error loading display input data: ");
                if(dataResult.displayInvalid) {
                    //display invalid! hide display and show message
                    this.displayContainer.setHideDisplay(dataResult.hideDisplay);
                    this.displayContainer.setMessage(dataResult.messageType,dataResult.message);
                    this.setDisplayValid(false);
                    return
                }
                else {
                    //display display valid
                    displayData = dataResult.data;
                    this.setDisplayValid(true);
                }
            }

            //content
            if(html) {
                this.outputElement.innerHTML = html;
            }
            
            //this gives the ui code access to some data display functions
            var admin = {
                getCommandMessenger: () => new UiCommandMessenger(componentView,contextMemberId),
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
                        }
                        
                        //handle the case the data loaded before the html (which we don't want)
                        if(this.cachedData != undefined) {
                            this.setData(this.cachedData);
                            this.cachedData = undefined;
                        }
                    }
                    catch(error) {
                        //hide dispay and show error message
                        let errorMsg = "Error in onload of display: " + error.toString();
                        displayContainer.setHideDisplay(true);
                        displayContainer.setMessage(DATA_DISPLAY_CONSTANTS.MESSAGE_TYPE_ERROR,errorMsg);
                        //set display invalid because this is part of creating the display
                        this.setDisplayValid(false);

                        if(error.stack) console.error(error.stack);
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
                        
                        //display message for user
                        let member = componentView.getComponent().getMember();
                        apogeeUserAlert("Error in '" + member.getName() + "' onUnload function: " + error.message);
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
                    //hide dispay and show error message
                    let errorMsg = "Error set data in display: " + error.toString();
                    displayContainer.setHideDisplay(true);
                    displayContainer.setMessage(DATA_DISPLAY_CONSTANTS.MESSAGE_TYPE_ERROR,errorMsg);
                    //note - do not set display invalid here because this is part of data loading, not display loading

                    if(error.stack) console.error(error.stack);
                }
            }
            
            if(resource.getData) {
                this.getData = () => {
                    //here we let data display handle any failure to get data.
                    return resource.getData.call(resource,this.outputElement,admin);
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
                        //allow close if we have an error
                        if(error.stack) console.error(error.stack);

                        let member = componentView.getComponent().getMember();
                        apogeeUserAlert("Error in '" + member.getName()+ "' isCloseOk function: " + error.message);
                        return true;
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
                        
                        //display message for user
                        let member = componentView.getComponent().getMember();
                        apogeeUserAlert("Error in '" + member.getName() + "' destroy function: " + error.message);
                    }
                }
            }

            //-------------------
            //initialization
            //-------------------

            if(resource.init) {
                resource.init.call(resource,this.outputElement,admin);
            }

            displayValid = true;
        }
        catch(error) {
            let errorMsg = "Error loading display: " + error.toString();
            displayContainer.setHideDisplay(true);
            displayContainer.setMessage(DATA_DISPLAY_CONSTANTS.MESSAGE_TYPE_ERROR,errorMsg);

            if(error.stack) console.error(error.stack);

            displayValid = false;
        }

        this.setDisplayValid(displayValid);
    }
}






