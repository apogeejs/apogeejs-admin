/** This replaces ApogeeView when running a client web application. */
import {Apogee} from "/apogeeapp/apogeeAppLib.js";
import WebComponentDisplay from "/apogeeview/componentdisplay/webpage/WebComponentDisplay.js";
import {getComponentViewClass,ERROR_COMPONENT_VIEW_CLASS} from "/apogeeview/componentViewInfo.js";
import WebAppConfigManager from "/applications/webclientlib/WebAppConfigManager.js";

export default class ApogeeWebView {

    /** This creates the app view, which in turn creates the contained app.
     * - containerId - This is the DOM element ID in which the app view should be created. If this is set
     * to null (or other false value) the UI will not be created.
     * - appConfigManager - This is the app config managerm which defines some needed functionality. 
     */
    constructor() {
        this.app = new Apogee(new WebAppConfigManager());

        this.componentByNameMap = {};
        this.componentByIdMap = {};

        this.app.addListener("component_created",component => this._onComponentCreated(component));
        this.app.addListener("component_updated",component => this._onComponentUpdated(component));
        this.app.addListener("component_deleted",component => this._onComponentDeleted(component));

        //resize monitoring
        window.addEventListener("resize",() => this.onWindowResize());
    }

    getApp() {
        return this.app;
    }

    /** This method should be called to open the workspace once the display info has been initialized. */
    openWorkspace(url) {
        var openWorkspace = workspaceText => {
            let workspaceJson = JSON.parse(workspaceText);

            //open workspace
            var commandData = {};
            commandData.type = "openWorkspace";
            commandData.workspaceJson = workspaceJson;

            this.app.executeCommand(commandData);
        };

        apogeeutil.textRequest(url).then(openWorkspace);
    }

    //=======================================
    // View Management
    //=======================================

    
    /** This method attaches the apgee output display to the dom element. See the 
     * documentation for CSS requirements for the host element.
     * 
     * @param {type} memberName - The full name of the member to add to the web page (including the top level folder name)
     * @param {type} parentElementId - This is the DOM element ID into which the display should be added.
     * @param {type} isShowing - If the element is currently showing, this flag should be set to true. Otherwise, it 
     * should be set to false and the isShowing event used when the element becomes visible
     * @param {type} optionalViewType - For this component, the name of the data view can optionally be specified. Otherwise the default is used.
     * @returns {undefined} There is no return value
     */ 
    addDisplay(memberName,parentElementId,parentIsShowing,viewName) {

        let componentInfo = this.componentByNameMap[memberName];
        if(!componentInfo) {
            componentInfo = {};
            componentInfo.memberName = memberName;
            componentInfo.displayViews = [];
            componentInfo.listeners = [];
            //this will be filled in later
            componentInfo.componentView = null;
            componentInfo.id = null;

            this.componentByNameMap[memberName] = componentInfo;
        }
        
        let displayViewInfo = {};
        displayViewInfo.parentElementId = parentElementId;
        displayViewInfo.parentIsShowing = parentIsShowing;
        displayViewInfo.viewName = viewName;

        //this will be filled in later.
        //displayViewInfo.displayContainer = null;
        //displayViewInfo.dataDisplay = null;
        //WE NEED TO FIX THIS - CURRENTLY ONLY ONE DISPLAY SUPPORTED!!
        displayViewInfo.componentDisplay = null;

        componentInfo.displayViews.push(displayViewInfo);
    }

    /** This method allows the user to add a listener for a component. Note that a listener can only be added
     * either before the workspace is loaded or, if after the workspace is loaded, for a component that had
     * a display or listener set before the workspace was loaded. 
     * The callback will be a called when the component is created or updated. It will pass a component
     * abject as the single argument. */
    addComponentListener(memberName,callback) {
        let componentInfo = this.componentByNameMap[memberName];
        if(!componentInfo) {
            componentInfo = {};
            componentInfo.memberName = memberName;
            componentInfo.displayViews = [];
            componentInfo.listeners = [];
            //this will be filled in later
            componentInfo.componentView = null;
            componentInfo.id = null;

            this.componentByNameMap[memberName] = componentInfo;
        }

        componentInfo.listeners.push(callback);
    }

    /** This method removes a listener that had been added for a component. */
    removeComponentListener(memberName,callback) {
        let componentInfo = this.componentByNameMap[memberName];
        if(componentInfo) {
            componentInfo.listeners = componentInfo.listeners.filter(activeCallback => activeCallback != callback);
        }
    }

    /** If the DOM element is loaded or unloaded, this method should be called to update
     * the state. This state is available to all component displays and is used by some of them.
     */
    setIsShowing(memberName,viewName,parentIsShowing) {
        let displayViewInfo = this._lookupDisplayView(memberName,viewName);
        if(displayViewInfo) {
            displayViewInfo.parentIsShowing = parentIsShowing;
            if(displayViewInfo.componentDisplay) {
                displayViewInfo.componentDisplay.setIsShowing(parentIsShowing);
            }
        }
    }

    //This method is obsolete. However, we should have some way to tell a specific display that its width
    //has changed, if they care. Currently I think only the HandsonGridEditor cares(?). And now the only
    //way to notify it is to say all widths (the frame width) has changed.
    // /** If the DOM element is resized this method should be called. This information is available
    //  * to all component display and is used by some of them.
    //  */
    // onResize(memberName,viewName) {
    //     let displayViewInfo = this._lookupDisplayViewInfo(memberName,viewName);
    //     if((displayViewInfo)&&(displayViewInfo.componentDisplay)) {
    //         displayViewInfo.componentDisplay.onResize();
    //     }
    // }

    ///////////////////////////////////////////////////////////////////////////////////
    // OOPS - this is here because for now componet views think this is the model view.
    //I need to find out what problems this causes. One is that the ui messenger uses it
    //to find the model manager. I am sure there are more.
    getModelManager() {
        return this.app.getWorkspaceManager().getModelManager();
    }
    /////////////////////////////////////////////////////////////////////////////////////

    //---------------------------------
    // Width resize events - for tab frame and tree frame
    //---------------------------------

    onWindowResize() {
        this.triggerResizeWait();
    }

    triggerResizeWait() {
        //only do the slow resizde timer if we have listeners
        if(!this.app.hasListeners("frameWidthResize")) return;

        //create a new timer if we don't already have one
        if(!this.resizeWaitTimer) {
            this.resizeWaitTimer =  setTimeout(() => this.resizeTimerExpired(),RESIZE_TIMER_PERIOD_MS);
        }
    }

    resizeTimerExpired() {
        this.resizeWaitTimer = null;
        this.app.dispatchEvent("frameWidthResize",null);
    }


    //========================================
    // Private Functions
    //========================================
    
    //--------------------------------
    // Event handlers
    //--------------------------------


    /** This is called on component created events. We only 
     * want to respond to the root folder event here.
     */
    _onComponentCreated(component) {
        try {
            //lookup the component info
            let modelManager = this.app.getWorkspaceManager().getModelManager();
            let memberName = component.getFullName(modelManager);
            let componentInfo = this.componentByNameMap[memberName];
            if(!componentInfo) return;

            //register the id
            let id = component.getId();
            componentInfo.id = id;
            //add this to the map indexed by id
            this.componentByIdMap[id] = componentInfo;

            //create the component view
            let componentViewClass = getComponentViewClass(component.constructor.uniqueName);
            let componentView;
            if(componentViewClass) {
                componentView = new componentViewClass(this,component);
            }

            if(!componentView) {
                componentView = new ERROR_COMPONENT_VIEW_CLASS(this,component);
            }

            componentInfo.componentView = componentView;

            //initialize the display views
            componentInfo.displayViews.forEach( displayViewInfo => {
                this._createComponentDisplay(componentInfo,displayViewInfo);
            })

            //--------------------------------------------
            //leave out? TBD
            //do view state initialization
            //componentView.loadViewStateFromComponent();

            //callback any listeners from the user
            if(componentInfo.listeners.length > 0) {
                try {
                    componentInfo.listeners.forEach(callback => callback(component));
                }
                catch(error) {
                    console.error("Error calling users listener " + error.toString());
                    if(error.stack) console.error(error.stack);
                }
            }
        }
        catch(error) {
            if(error.stack) console.error(error.stack);

            apogeeUserAlert("Error updating display for created component: " + error.toString());
        }
    }

    _onComponentUpdated(component) {
        try {
            let componentInfo = this.componentByIdMap[component.getId()];
            if(componentInfo) { 

                //update the component views, if applicable
                if(componentInfo.componentView) componentInfo.componentView.componentUpdated(component);

                //callback any listeners from the user
                if(componentInfo.listeners.length > 0) {
                    try {
                        componentInfo.listeners.forEach(callback => callback(component));
                    }
                    catch(error) {
                        console.error("Error calling users listener " + error.toString());
                        if(error.stack) console.error(error.stack);
                    }
                }
            }
        }
        catch(error) {
            if(error.stack) console.error(error.stack);

            apogeeUserAlert("Error updating display for component: " + error.toString());
        }
    }

    _onComponentDeleted(component) {
        try {
            let componentInfo = this.componentByIdMap[component.getId()];
            if(componentInfo) {
                if(componentInfo.componentView) componentInfo.componentView.onDelete();

                delete this.componentByIdMap[componentInfo.id];
                delete this.componentByNameMap[componentInfo.memberName];
            }
        }
        catch(error) {
            if(error.stack) console.error(error.stack);

            apogeeUserAlert("Error updating display for delete component: " + error.toString());
        }
    }

    //--------------------------------
    // Other functions
    //--------------------------------

    /** This method returns a WebComponentDisplay object which contains the component display object. 
    * If the optionalViewType is not set, the default view (which is typically the desired one) will be used.*/
    _createComponentDisplay(componentInfo,displayViewInfo) {
        let componentDisplay = new WebComponentDisplay(componentInfo.componentView, displayViewInfo.viewName);
        componentInfo.componentView.setComponentDisplay(componentDisplay);
        displayViewInfo.componentDisplay = componentDisplay;

        //look up the parent element 
        let parentElement = document.getElementById(displayViewInfo.parentElementId);
        if(!parentElement) {
            console.error("DOM Element not found:" + displayViewInfo.parentElementId);
            return;
        }
        displayViewInfo.parentElement = parentElement;

        //add to the page
        var displayElement = componentDisplay.getElement();
        parentElement.appendChild(displayElement);

        if(displayViewInfo.parentIsShowing) {
            componentDisplay.setIsShowing(true);
        }
    }

    _lookupDisplayView(memberName,viewName) {
        var componentInfo = this.componentByNameMap[memberName];
        if(!componentInfo) {
            console.error("Workspace member not found not found:" + memberName);
            return null;
        }

        let displayViewInfo = componentInfo.displayViews.find( displayViewInfo => (displayViewInfo.viewName == viewName));
        
        if(displayViewInfo) {
            return displayViewInfo;
        }
        else {
            console.error("Display view not registered: " + memberName + " - " + viewName);
        }
    }

}

let componentClassMap = {};
